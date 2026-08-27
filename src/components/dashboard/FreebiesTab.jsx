import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, Calendar, User, Lock, Link2, Trash2 } from 'lucide-react';
import { sendFreePanelNotification } from '@/utils/discordNotifier';
import { toast } from 'sonner';

function PanelEditor({ panelType, label, color }) {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({ start_day: '', end_day: '', username: '', password: '', custom_message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('free_panels')
        .select('*')
        .eq('panel_type', panelType)
        .limit(1);

      if (data && data.length > 0) {
        setRecord(data[0]);
        setForm({
          start_day: data[0].start_day || '',
          end_day: data[0].end_day || '',
          username: data[0].username || '',
          password: data[0].password || '',
          custom_message: data[0].custom_message || '',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load panel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (record) {
        const { error } = await supabase.from('free_panels').update({ ...form, updated_at: new Date().toISOString() }).eq('id', record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('free_panels').insert({ panel_type: panelType, ...form, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      toast.success(`${label} saved — card is now ONLINE`);
      const allFilled = form.start_day && form.end_day && form.username && form.password;
      if (allFilled) {
        sendFreePanelNotification({
          panelType,
          startDay: form.start_day,
          endDay: form.end_day,
          username: form.username,
          password: form.password,
          customMessage: form.custom_message,
        });
      }
      load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    setSaving(true);
    try {
      if (record) {
        const { error } = await supabase.from('free_panels').update({ start_day: '', end_day: '', username: '', password: '', updated_at: new Date().toISOString() }).eq('id', record.id);
        if (error) throw error;
      }
      setForm(prev => ({ ...prev, start_day: '', end_day: '', username: '', password: '' }));
      toast.success(`${label} cleared — card is now OFFLINE`);
      load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to clear');
    }
    setSaving(false);
  };

  const fields = [
    { key: 'start_day', placeholder: 'Start Day (e.g. July 1)', icon: Calendar },
    { key: 'end_day', placeholder: 'End Day (e.g. July 7)', icon: Calendar },
    { key: 'username', placeholder: 'Username', icon: User },
    { key: 'password', placeholder: 'Password', icon: Lock },
  ];

  const allFilled = form.start_day && form.end_day && form.username && form.password;

  if (loading) return <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-wider" style={{ color }}>{label}</p>
        <span className="font-inter text-xs px-2 py-0.5 rounded-full"
          style={{
            background: allFilled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: allFilled ? '#22c55e' : '#ef4444',
            border: `1px solid ${allFilled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
          {allFilled ? '● ONLINE' : '● OFFLINE'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${color}15` }} />
            </div>
          );
        })}
      </div>

      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Discord Announcement Message</label>
        <textarea value={form.custom_message} onChange={e => setForm(prev => ({ ...prev, custom_message: e.target.value }))}
          placeholder="Custom message sent to Discord announcement channel (leave empty for default @everyone)"
          className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none resize-none h-16"
          style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${color}15` }} />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={clearAll} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
          style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}>
          <Check className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
}

function V7aApkEditor() {
  const [record, setRecord] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'v7a_apk_links'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        setRecord(data[0]);
        setUrl(data[0].url || '');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load V7a Apk link');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (record) {
        await updateDoc(doc(db, 'v7a_apk_links', record.id), { url });
      } else {
        await addDoc(collection(db, 'v7a_apk_links'), { url, active: true, created_date: Date.now() });
      }
      toast.success('V7a Apk download link saved');
      load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(170,68,255,0.2)' }}>
      <p className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#aa44ff' }}>V7a Apk Download Link</p>
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder="Download URL for V7a Apk"
          className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(170,68,255,0.15)' }} />
      </div>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving || !url}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
          style={{ background: 'rgba(170,68,255,0.15)', border: '1px solid rgba(170,68,255,0.4)', color: '#aa44ff' }}>
          <Check className="w-3.5 h-3.5" /> Save Link
        </button>
      </div>
    </div>
  );
}

export default function FreebiesTab() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-orbitron text-xs text-primary tracking-wider mb-1">FREE PANEL SECTION</p>
        <p className="font-inter text-xs text-muted-foreground mb-4">Fill all fields to show a card as ONLINE. Clear all to show OFFLINE.</p>
        <div className="space-y-3">
          <PanelEditor panelType="external" label="PRRX Premium External Panel" color="#00d4ff" />
          <PanelEditor panelType="internal" label="PRRX Premium Internal Panel" color="#aa44ff" />
        </div>
      </div>
      <div className="pt-4" style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
        <p className="font-orbitron text-xs text-primary tracking-wider mb-1">V7A APK DOWNLOAD LINK</p>
        <p className="font-inter text-xs text-muted-foreground mb-4">Set the download link shown on the V7a Apk card.</p>
        <V7aApkEditor />
      </div>
    </div>
  );
}