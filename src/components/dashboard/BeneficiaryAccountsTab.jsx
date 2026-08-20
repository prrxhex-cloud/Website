import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreditCard, Plus, Trash2, Check, X, RefreshCw, User, Users, Building, Copy, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const DEFAULT_BENEFICIARIES = [
  {
    gateway_label: 'Payment Gateway 1 (Commercial Bank)',
    bank_name: 'Commercial Bank of Ceylon',
    owner_name: 'Sayuru Senavirathna',
    account_number: '8012345678',
    branch_name: 'Colombo Main Branch',
    gateway_type: 'Bank Transfer',
    active: true,
    sort_order: 0
  },
  {
    gateway_label: 'Payment Gateway 2 (Bank of Ceylon)',
    bank_name: 'Bank of Ceylon (BOC)',
    owner_name: 'Sayuru Senavirathna',
    account_number: '7098765432',
    branch_name: 'Piliyandala Branch',
    gateway_type: 'Bank Transfer',
    active: true,
    sort_order: 1
  },
  {
    gateway_label: 'Payment Gateway 3 (Sampath Bank)',
    bank_name: 'Sampath Bank PLC',
    owner_name: 'Sayuru Senavirathna',
    account_number: '1029384756',
    branch_name: 'Kandy City Branch',
    gateway_type: 'Bank Transfer',
    active: true,
    sort_order: 2
  }
];

export default function BeneficiaryAccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'beneficiary_accounts'), orderBy('sort_order', 'asc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        // Seed initial defaults if empty
        const initial = DEFAULT_BENEFICIARIES.map((b, i) => ({ id: `default-${i}`, ...b }));
        setAccounts(initial);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setAccounts(DEFAULT_BENEFICIARIES.map((b, i) => ({ id: `default-${i}`, ...b })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        gateway_label: form.gateway_label || `Payment Gateway ${accounts.length + 1}`,
        bank_name: form.bank_name || '',
        owner_name: form.owner_name || '',
        account_number: form.account_number || '',
        branch_name: form.branch_name || '',
        gateway_type: form.gateway_type || 'Bank Transfer',
        notes: form.notes || '',
        active: form.active !== undefined ? form.active : true,
        sort_order: Number(form.sort_order || 0),
        updated_date: new Date().toISOString()
      };

      if (form.id && !form.id.startsWith('default-')) {
        await updateDoc(doc(db, 'beneficiary_accounts', form.id), payload);
        toast.success('Payment Gateway bank details updated!');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'beneficiary_accounts', newId), {
          ...payload,
          created_date: new Date().toISOString()
        });
        toast.success('New Payment Gateway added!');
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      if (!id.startsWith('default-')) {
        await deleteDoc(doc(db, 'beneficiary_accounts', id));
      }
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('Payment Gateway removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete gateway');
    }
  };

  const toggleActive = async (acc) => {
    const newStatus = !acc.active;
    try {
      if (!acc.id.startsWith('default-')) {
        await updateDoc(doc(db, 'beneficiary_accounts', acc.id), { active: newStatus });
      }
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, active: newStatus } : a));
      toast.success(`Gateway ${newStatus ? 'Activated' : 'Deactivated'}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to toggle status');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            PAYMENT GATEWAYS & ADMIN BANK DETAILS
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Configure bank accounts shown in the <strong className="text-cyan-400">Checkout Modal Dropdown</strong> when users pay via Direct Bank Transfer.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
            title="Refresh Gateways"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setForm({
              gateway_label: `Payment Gateway ${accounts.length + 1} (Bank Name)`,
              bank_name: '',
              owner_name: '',
              account_number: '',
              branch_name: '',
              gateway_type: 'Bank Transfer',
              notes: '',
              active: true,
              sort_order: accounts.length
            })}
            className="flex items-center gap-1.5 font-outfit font-extrabold text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Payment Gateway
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          When customers click <strong>"Direct Bank Slip Upload"</strong> in the checkout window, they will select one of these gateways from a dropdown to see your exact <strong>Bank Name, Account Number, Name, and Branch</strong> with one-click copy buttons!
        </span>
      </div>

      {/* Form Modal */}
      {form && (
        <div className="rounded-3xl p-6 space-y-4 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-outfit font-black text-sm text-cyan-400 uppercase">
              {form.id ? 'EDIT PAYMENT GATEWAY' : 'NEW PAYMENT GATEWAY'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gateway Label */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Dropdown Gateway Label (e.g. Payment Gateway 1 - Commercial Bank)
              </label>
              <input
                value={form.gateway_label}
                onChange={e => setForm(p => ({ ...p, gateway_label: e.target.value }))}
                placeholder="Payment Gateway 1 (Commercial Bank)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Bank Name (e.g. Commercial Bank of Ceylon)
              </label>
              <input
                value={form.bank_name}
                onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))}
                placeholder="Commercial Bank PLC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Account Holder Name
              </label>
              <input
                value={form.owner_name}
                onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))}
                placeholder="Sayuru Senavirathna"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs font-bold text-cyan-400 block mb-1">
                Account Number (Copyable in Checkout)
              </label>
              <input
                value={form.account_number}
                onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
                placeholder="8012345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Branch Name */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Branch Name
              </label>
              <input
                value={form.branch_name}
                onChange={e => setForm(p => ({ ...p, branch_name: e.target.value }))}
                placeholder="Piliyandala Branch / Colombo Fort"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            {/* Gateway Type */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Payment Type
              </label>
              <select
                value={form.gateway_type}
                onChange={e => setForm(p => ({ ...p, gateway_type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              >
                <option value="Bank Transfer">Bank Transfer / Cash Deposit</option>
                <option value="EzCash / mCash">EzCash / mCash</option>
                <option value="Crypto USDT (TRC20)">Crypto USDT (TRC20)</option>
                <option value="Binance Pay">Binance Pay ID</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-xl text-xs font-outfit font-bold text-[var(--text-muted)] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !form.account_number || !form.bank_name}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Save Gateway Details
            </button>
          </div>
        </div>
      )}

      {/* Active Gateways List Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, idx) => (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl bg-[var(--bg-card)] border transition-all shadow-md flex flex-col justify-between space-y-4 ${
                acc.active !== false ? 'border-[var(--border-color)] hover:border-cyan-500/40' : 'border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    {acc.gateway_label || `Payment Gateway ${idx + 1}`}
                  </span>
                  <button
                    onClick={() => toggleActive(acc)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      acc.active !== false
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {acc.active !== false ? '● ACTIVE' : '○ DISABLED'}
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {/* Bank Name */}
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 font-medium">Bank Name:</span>
                    <span className="font-bold text-white text-right">{acc.bank_name}</span>
                  </div>

                  {/* Account Name */}
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 font-medium">Name:</span>
                    <span className="font-bold text-slate-200 text-right">{acc.owner_name}</span>
                  </div>

                  {/* Acc Number with Copy Button */}
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 font-medium">Acc No.:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-400">
                      <span>{acc.account_number}</span>
                      <button
                        onClick={() => handleCopy(acc.account_number, `${acc.id}-num`)}
                        className="p-1 rounded hover:bg-cyan-500/20 text-cyan-300"
                        title="Copy Account Number"
                      >
                        {copiedId === `${acc.id}-num` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Branch:</span>
                    <span className="font-bold text-slate-200 text-right">{acc.branch_name || 'Main Branch'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  {acc.gateway_type || 'Bank Transfer'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setForm(acc)}
                    className="px-3 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-bold text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => remove(acc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Gateway"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
