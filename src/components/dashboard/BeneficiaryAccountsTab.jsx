import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Trash2, Check, X, RefreshCw, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { clearBeneficiaryCache } from '@/utils/beneficiaryVerifier';

export default function BeneficiaryAccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.BeneficiaryAccount.list('-created_date', 100);
      setAccounts(data);
      clearBeneficiaryCache();
    } catch (e) {
      toast.error('Failed to load beneficiary accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await base44.entities.BeneficiaryAccount.update(form.id, {
          account_number: form.account_number,
          bank_name: form.bank_name,
          owner_name: form.owner_name,
          owner_type: form.owner_type,
          active: form.active,
        });
        toast.success('Account updated');
      } else {
        await base44.entities.BeneficiaryAccount.create({
          account_number: form.account_number,
          bank_name: form.bank_name || '',
          owner_name: form.owner_name || '',
          owner_type: form.owner_type || 'team',
          active: true,
        });
        toast.success('Beneficiary account added');
      }
      setForm(null);
      load();
    } catch (e) {
      toast.error('Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.BeneficiaryAccount.delete(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    clearBeneficiaryCache();
    toast.success('Account removed');
  };

  const toggleActive = async (acc) => {
    await base44.entities.BeneficiaryAccount.update(acc.id, { active: !acc.active });
    toast.success(`Account ${!acc.active ? 'activated' : 'deactivated'}`);
    load();
  };

  const typeColor = (t) => t === 'team' ? '#00d4ff' : '#aa44ff';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">BENEFICIARY ACCOUNTS ({accounts.length})</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setForm({ account_number: '', bank_name: '', owner_name: '', owner_type: 'team', active: true })}
            className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        </div>
      </div>

      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <CreditCard className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
        <p className="font-inter text-xs text-muted-foreground">These account numbers are used by the AI to verify the beneficiary account on payment receipts. Add your team and reseller bank account numbers here.</p>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">{form.id ? 'EDIT' : 'NEW'} BENEFICIARY</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.account_number} onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
              placeholder="Account Number *"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.bank_name} onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))}
              placeholder="Bank Name (e.g. BOC)"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))}
              placeholder="Account Holder Name"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <select value={form.owner_type} onChange={e => setForm(p => ({ ...p, owner_type: e.target.value }))}
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <option value="team">Team</option>
              <option value="reseller">Reseller</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.account_number}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              {saving ? <><div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Saving...</> : <><Check className="w-3.5 h-3.5" /> Save</>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {accounts.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${typeColor(a.owner_type)}18` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${typeColor(a.owner_type)}10`, border: `1px solid ${typeColor(a.owner_type)}30` }}>
                {a.owner_type === 'team' ? <Users className="w-3.5 h-3.5" style={{ color: typeColor(a.owner_type) }} /> : <User className="w-3.5 h-3.5" style={{ color: typeColor(a.owner_type) }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-xs" style={{ color: typeColor(a.owner_type) }}>{a.account_number}</p>
                <p className="font-inter text-xs text-muted-foreground truncate">
                  {a.owner_name || '—'} · {a.bank_name || '—'} · <span className="capitalize">{a.owner_type}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: a.active ? 'rgba(0,255,100,0.1)' : 'rgba(255,80,80,0.1)', color: a.active ? '#00ff64' : '#ff4444', border: `1px solid ${a.active ? 'rgba(0,255,100,0.25)' : 'rgba(255,80,80,0.25)'}` }}>
                  {a.active ? 'active' : 'inactive'}
                </span>
                <button onClick={() => setForm({ ...a })} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                  <CreditCard className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleActive(a)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors">
                  {a.active ? <X className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                </button>
                <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-6">No beneficiary accounts added yet.</p>}
        </div>
      )}
    </div>
  );
}