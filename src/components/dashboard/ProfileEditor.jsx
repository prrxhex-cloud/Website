import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Camera, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfileEditor({ currentUser, onUpdate }) {
  const [form, setForm] = useState({
    display_name: currentUser.display_name || currentUser.full_name || '',
    gender: currentUser.gender || '',
    bio: currentUser.bio || '',
    avatar_url: currentUser.avatar_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, avatar_url: file_url }));
    } catch {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      toast.success('Profile updated!');
      onUpdate?.({ ...currentUser, ...form });
    } catch {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  const avatar = form.avatar_url;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">EDIT PROFILE</h2>
        <p className="font-inter text-xs text-muted-foreground mt-0.5">Update your display info</p>
      </div>
      <div className="p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.08)', border: '2px solid rgba(0,212,255,0.2)' }}>
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary opacity-50" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
              style={{ background: '#00d4ff' }}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 text-background animate-spin" /> : <Camera className="w-3.5 h-3.5 text-background" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-orbitron font-bold text-sm text-foreground">{currentUser.full_name}</p>
            <p className="font-inter text-xs text-muted-foreground">{currentUser.email}</p>
            <p className="font-inter text-xs text-primary mt-1">{currentUser.role}</p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Display Name</label>
          <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
            placeholder="How others see you..."
            className="w-full px-4 py-2.5 rounded-xl font-inter text-sm text-foreground outline-none transition-all"
            style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
        </div>

        {/* Gender */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(g => (
              <button key={g.value} onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                className="px-3 py-1.5 rounded-lg font-inter text-xs font-medium transition-all"
                style={{
                  background: form.gender === g.value ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.gender === g.value ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: form.gender === g.value ? '#00d4ff' : '#888'
                }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Bio / Status</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2}
            placeholder="A short bio or status..."
            className="w-full px-4 py-2.5 rounded-xl font-inter text-sm text-foreground outline-none transition-all resize-none"
            style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}