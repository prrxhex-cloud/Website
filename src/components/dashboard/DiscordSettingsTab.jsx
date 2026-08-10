import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Bell, Check, Link2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clearDiscordConfigCache } from '@/utils/discordNotifier';

export default function DiscordSettingsTab() {
  const [record, setRecord] = useState(null);
  const [ticketUrl, setTicketUrl] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [discordInviteUrl, setDiscordInviteUrl] = useState('');
  const [botDashboardUrl, setBotDashboardUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'discord_webhooks'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        setRecord(data[0]);
        setTicketUrl(data[0].ticket_webhook_url || '');
        setFreebieUrl(data[0].freebie_webhook_url || '');
        setReceiptUrl(data[0].receipt_webhook_url || '');
        setDiscordInviteUrl(data[0].discord_invite_url || 'https://discord.com/users/prrx2021');
        setBotDashboardUrl(data[0].bot_dashboard_url || '');
      }
    } catch (e) {
      toast.error('Failed to load Discord settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { 
        ticket_webhook_url: ticketUrl, 
        freebie_webhook_url: freebieUrl, 
        receipt_webhook_url: receiptUrl,
        discord_invite_url: discordInviteUrl,
        bot_dashboard_url: botDashboardUrl
      };
      if (record) {
        await updateDoc(doc(db, 'discord_webhooks', record.id), payload);
      } else {
        await addDoc(collection(db, 'discord_webhooks'), payload);
      }
      toast.success('Discord settings & invite URL saved successfully');
      clearDiscordConfigCache();
      load();
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4 text-left">
      <div>
        <p className="font-outfit font-extrabold text-xs text-[#06b6d4] tracking-wider mb-1">DISCORD COMMUNITY & WEBHOOK SETTINGS</p>
        <p className="font-inter text-xs text-slate-400 mb-1">Set your official Discord server invite link and webhooks for notifications.</p>
      </div>

      <div className="rounded-2xl p-5 space-y-5 bg-slate-950 border border-slate-800">
        
        {/* Discord Invite URL Setting */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
          <label className="font-inter text-xs font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-indigo-400" />
            <span>Official Discord Server Invite Link (Shown on Community Banner)</span>
          </label>
          <p className="font-inter text-xs text-slate-400">
            This URL is opened when users click "Join Discord Server" across the site.
          </p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={discordInviteUrl} 
              onChange={e => setDiscordInviteUrl(e.target.value)}
              placeholder="https://discord.gg/your-server-code"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl font-inter text-sm text-white placeholder-slate-500 bg-slate-900 border border-indigo-500/30 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-white mb-1.5 block flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-green-400" /> Discord Bot Dashboard URL
          </label>
          <p className="font-inter text-xs text-slate-400 mb-2">The Render or localhost URL where the Bot is hosted (used for the Discord Bot Management tab).</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={botDashboardUrl} onChange={e => setBotDashboardUrl(e.target.value)}
              placeholder="https://prrx-discord-bot.onrender.com"
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-white placeholder-slate-500 bg-slate-900 border border-slate-800 outline-none" />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-white mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#06b6d4]" /> Moderator Channel — Ticket Notifications
          </label>
          <p className="font-inter text-xs text-slate-400 mb-2">Sends a notification when a customer creates a new support ticket.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-white placeholder-slate-500 bg-slate-900 border border-slate-800 outline-none" />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-white mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-violet-400" /> Announcement Channel — Free Panel Notifications
          </label>
          <p className="font-inter text-xs text-slate-400 mb-2">Sends an announcement with credentials when you publish a free panel.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={freebieUrl} onChange={e => setFreebieUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-white placeholder-slate-500 bg-slate-900 border border-slate-800 outline-none" />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-white mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" /> Receipt Verification — OCR Notifications
          </label>
          <p className="font-inter text-xs text-slate-400 mb-2">Sends a notification (pass/fail) when a reseller's receipt is scanned by AI OCR.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-white placeholder-slate-500 bg-slate-900 border border-slate-800 outline-none" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-outfit text-xs font-bold btn-primary-cyan disabled:opacity-50">
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />} Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}