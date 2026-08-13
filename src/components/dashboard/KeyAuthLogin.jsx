import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, User, Lock, Crown, Calendar, Clock, Copy, CheckCircle, Activity, Globe, Cpu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const APP_NAME = 'PRRX WEBSITE';
const OWNER_ID = '7P1GTjNd76';
const APP_VERSION = '1.0';
const BASE_URL = 'https://keyauth.win/api/1.2/';

function getBrowserHWID() {
  const raw = [
    navigator.userAgent, navigator.language, screen.colorDepth,
    screen.width + 'x' + screen.height, new Date().getTimezoneOffset(),
    navigator.cookieEnabled, navigator.hardwareConcurrency || '', navigator.platform || ''
  ].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(16).padStart(8, '0') + '-web-prrx';
}

async function keyauthRequest(params) {
  const url = new URL(BASE_URL);
  Object.entries({ ...params, name: APP_NAME, ownerid: OWNER_ID }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function keyauthLogin(username, password) {
  // Step 1: Init session
  const init = await keyauthRequest({ type: 'init', ver: APP_VERSION, hash: 'none' });
  if (!init.success) throw new Error(init.message || 'Init failed');

  // Step 2: Login
  const login = await keyauthRequest({
    type: 'login',
    username,
    pass: password,
    hwid: getBrowserHWID(),
    sessionid: init.sessionid,
  });
  return login;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-auto flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
      {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function InfoRow({ icon: Icon, label, value, accent = '#00d4ff', copyable = false, fullValue }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(0,15,35,0.6)', border: '1px solid rgba(0,212,255,0.08)' }}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
      <div className="min-w-0 flex-1">
        <p className="font-inter text-xs text-muted-foreground">{label}</p>
        <p className="font-inter text-sm font-semibold truncate" style={{ color: accent }}>{value}</p>
      </div>
      {copyable && <CopyButton text={fullValue || value} />}
    </div>
  );
}

function UserInfoCard({ info, onLogout }) {
  const sub = info?.subscriptions?.[0];
  const expireTs = sub?.expiry ? parseInt(sub.expiry) * 1000 : null;
  const expireDate = expireTs ? new Date(expireTs).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const createDate = info?.createdate ? new Date(parseInt(info.createdate) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const lastLogin = info?.lastlogin ? new Date(parseInt(info.lastlogin) * 1000).toLocaleString() : 'N/A';
  const isExpired = expireTs && expireTs < Date.now();
  const daysLeft = expireTs ? Math.max(0, Math.ceil((expireTs - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,80,160,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.3)' }}>
          <Crown className="w-7 h-7" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron font-black text-lg text-foreground tracking-wide">{info?.username}</p>
          <p className="font-inter text-xs text-primary mt-0.5">{sub?.subscription || 'Member'}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`font-inter text-xs px-2.5 py-0.5 rounded-full font-semibold ${isExpired ? 'text-red-400' : 'text-green-400'}`}
              style={{ background: isExpired ? 'rgba(255,80,80,0.1)' : 'rgba(0,255,100,0.1)', border: `1px solid ${isExpired ? 'rgba(255,80,80,0.3)' : 'rgba(0,255,100,0.3)'}` }}>
              {isExpired ? 'EXPIRED' : 'ACTIVE'}
            </span>
            {!isExpired && daysLeft !== null && (
              <span className="font-inter text-xs text-muted-foreground">{daysLeft} days left</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="px-4 py-2.5" style={{ background: 'rgba(0,212,255,0.05)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">SUBSCRIPTION</p>
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ background: 'rgba(0,15,35,0.6)' }}>
          <InfoRow icon={Crown} label="Plan" value={sub?.subscription || 'N/A'} accent="#ffaa00" />
          <InfoRow icon={Calendar} label="Expires" value={expireDate} accent={isExpired ? '#ff5050' : '#00ff64'} />
          <InfoRow icon={Activity} label="Status" value={isExpired ? 'Expired' : `${daysLeft} days remaining`} accent={isExpired ? '#ff5050' : '#00d4ff'} />
          <InfoRow icon={Clock} label="Registered" value={createDate} />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="px-4 py-2.5" style={{ background: 'rgba(0,212,255,0.05)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">ACCOUNT DETAILS</p>
        </div>
        <div className="p-3 space-y-2" style={{ background: 'rgba(0,15,35,0.6)' }}>
          <InfoRow icon={User} label="Username" value={info?.username || 'N/A'} copyable />
          <InfoRow icon={Clock} label="Last Login" value={lastLogin} />
          {info?.ip && <InfoRow icon={Globe} label="IP Address" value={info.ip} copyable />}
          {info?.hwid && <InfoRow icon={Cpu} label="HWID" value={info.hwid.slice(0, 24) + '...'} copyable fullValue={info.hwid} />}
        </div>
      </div>

      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-inter text-xs text-red-400 hover:text-red-300 transition-colors"
        style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
        <LogOut className="w-3.5 h-3.5" /> Sign Out
      </button>
    </motion.div>
  );
}

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await keyauthLogin(username, password);
      if (data?.success) {
        localStorage.setItem('prrx_keyauth_user', JSON.stringify(data.info));
        onSuccess(data.info);
      } else {
        setError(data?.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError(err.message?.includes('CORS') || err.message?.includes('fetch')
        ? 'Network error — KeyAuth API blocked by browser. Try the desktop app.'
        : (err.message || 'Connection error. Please try again.'));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
          className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full pl-10 pr-10 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
        <button type="button" onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="font-inter text-xs text-red-400 text-center px-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {loading ? 'Verifying...' : 'Login'}
      </button>
    </form>
  );
}

export default function KeyAuthLogin() {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('prrx_keyauth_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('prrx_keyauth_user');
    setUserInfo(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div>
          <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">PRRX Admin Portal</h2>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">Verify your KeyAuth license</p>
        </div>
        {userInfo && (
          <span className="font-inter text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff64' }}>
            ● Connected
          </span>
        )}
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {userInfo ? (
            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UserInfoCard info={userInfo} onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginForm onSuccess={setUserInfo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}