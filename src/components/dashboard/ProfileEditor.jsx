import React, { useState } from 'react';
import { auth, storage, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
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
    display_name: currentUser.displayName || currentUser.full_name || '',
    gender: currentUser.gender || '',
    bio: currentUser.bio || '',
    avatar_url: currentUser.photoURL || currentUser.avatar_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const file_url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, avatar_url: file_url }));
    } catch {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: form.display_name,
          photoURL: form.avatar_url
        });
      }
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        display_name: form.display_name,
        gender: form.gender,
        bio: form.bio,
        avatar_url: form.avatar_url
      }, { merge: true });

      toast.success('Profile updated!');
      if (typeof onUpdate === 'function') {
        onUpdate({ ...currentUser, ...form, displayName: form.display_name, photoURL: form.avatar_url });
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  const avatar = form.avatar_url;

  return (
    <div className="rounded-[32px] overflow-hidden liquid-glass border border-white/10 relative"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="px-8 py-6 border-b relative z-10" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h2 className="font-orbitron font-black text-xl text-white tracking-widest uppercase glow-cyan">EDIT PROFILE</h2>
        <p className="font-inter text-sm text-gray-400 mt-1">Update your display info and identity</p>
      </div>

      <div className="p-8 space-y-8 relative z-10">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center flex-shrink-0 relative transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#00d4ff] opacity-50" />
              )}
              <div className="absolute inset-0 bg-[#00d4ff] blur-xl opacity-10"></div>
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0088ff)' }}>
              {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <p className="font-orbitron font-black text-2xl text-white glow-cyan tracking-wider">{currentUser.displayName || currentUser.full_name || 'User'}</p>
            <p className="font-inter text-sm text-gray-400 mt-1">{currentUser.email}</p>
            <div className="inline-block mt-3 px-4 py-1.5 rounded-full font-orbitron text-xs font-bold tracking-widest text-[#00d4ff]"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              {currentUser.role?.toUpperCase() || 'MEMBER'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="font-orbitron text-xs font-bold text-[#00d4ff] mb-2 block tracking-widest uppercase">Display Name</label>
            <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="How others see you..."
              className="w-full px-5 py-4 rounded-2xl font-inter text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.2), inset 0 2px 10px rgba(0,0,0,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; }} />
          </div>

          {/* Gender */}
          <div>
            <label className="font-orbitron text-xs font-bold text-[#00d4ff] mb-3 block tracking-widest uppercase">Gender</label>
            <div className="flex flex-wrap gap-3">
              {GENDERS.map(g => (
                <button key={g.value} onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                  className="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all duration-300"
                  style={{
                    background: form.gender === g.value ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.4)',
                    border: `1px solid ${form.gender === g.value ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: form.gender === g.value ? '#00d4ff' : '#aaa',
                    boxShadow: form.gender === g.value ? '0 0 15px rgba(0,212,255,0.2)' : 'none'
                  }}>
                  {g.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="font-orbitron text-xs font-bold text-[#00d4ff] mb-2 block tracking-widest uppercase">Bio / Status</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
              placeholder="Tell the world something cool..."
              className="w-full px-5 py-4 rounded-2xl font-inter text-sm text-white outline-none transition-all resize-none"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.2), inset 0 2px 10px rgba(0,0,0,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; }} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,136,255,0.2))', border: '1px solid rgba(0,212,255,0.5)', color: '#fff', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
          <div className="absolute inset-0 bg-[#00d4ff]/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <div className="relative z-10 flex items-center gap-3">
            {saving ? <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /> : <Check className="w-5 h-5 text-[#00d4ff]" />}
            <span className="glow-cyan">{saving ? 'SAVING NEURAL DATA...' : 'SAVE PROFILE'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}