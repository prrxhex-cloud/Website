import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, User, Lock, Eye, EyeOff, Send, Clock, CheckCircle, ArrowLeft, Package, Calendar, Upload, FileImage, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getPricePlans, buildDurationOptions, getExpectedPrice } from '@/utils/pricePlans';
import { sendReceiptVerificationNotification } from '@/utils/discordNotifier';
import { verifyBeneficiaryAccount } from '@/utils/beneficiaryVerifier';

const hasLetter = (str) => /[a-zA-Z]/.test(str);

const PRODUCT_OPTIONS = [
  { value: 'external', label: '⚡ External Panel', color: '#00d4ff' },
  { value: 'internal', label: '🔥 Internal Panel', color: '#aa44ff' },
  { value: 'both',     label: '✨ Both Panels',   color: '#ffaa00' },
];

// ── Default account view ──
function DefaultAccountPanel({ account, onConfirm }) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md mx-auto rounded-3xl p-8"
      style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-orbitron font-black text-lg tracking-widest" style={{ color: '#00d4ff' }}>DEFAULT ACCOUNT</h2>
        <p className="font-inter text-xs text-muted-foreground mt-1">Use your existing reseller credentials</p>
      </div>
      <div className="rounded-xl p-4 mb-6 space-y-2" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <div className="flex justify-between text-xs font-inter"><span className="text-muted-foreground">Username</span><span className="text-foreground font-medium">{account.username}</span></div>
        <div className="flex justify-between text-xs font-inter"><span className="text-muted-foreground">Display Name</span><span className="text-foreground font-medium">{account.display_name || account.username}</span></div>
        <div className="flex justify-between text-xs font-inter"><span className="text-muted-foreground">Status</span><span className="text-green-400 font-bold">ACTIVE ✅</span></div>
      </div>
      <button onClick={onConfirm}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,150,255,0.12))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
        <Zap className="w-4 h-4" /> ENTER PORTAL
      </button>
    </motion.div>
  );
}

// ── Custom account flow ──
function CustomAccountPanel({ account, onBack }) {
  // Receipt + OCR state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [ocrData, setOcrData] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [productType, setProductType] = useState('external');
  const [duration, setDuration] = useState('30_days');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricePlans, setPricePlans] = useState([]);

  // Request state
  const [request, setRequest] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getPricePlans().then(setPricePlans);
    base44.entities.ResellerAccountRequest.filter({ requested_by: account.username })
      .then(reqs => {
        const active = reqs.find(r => r.status === 'pending' || r.status === 'claimed' || r.status === 'created');
        if (active) setRequest(active);
      })
      .finally(() => setChecking(false));

    // Realtime subscription for immediate status updates when admin acts on the request
    const unsub = base44.entities.ResellerAccountRequest.subscribe((event) => {
      if (event.data?.requested_by !== account.username) return;
      if (event.type === 'update') {
        setRequest(prev => prev?.id === event.id ? event.data : prev);
      }
      if (event.type === 'create') {
        setRequest(event.data);
      }
    });
    return () => unsub();
  }, [account.username]);

  useEffect(() => {
    if (!request || request.status === 'created' || request.status === 'rejected') return;
    const id = setInterval(async () => {
      const reqs = await base44.entities.ResellerAccountRequest.filter({ requested_by: account.username });
      const updated = reqs.find(r => r.id === request.id);
      if (updated && updated.status !== request.status) setRequest(updated);
    }, 5000);
    return () => clearInterval(id);
  }, [request, account.username]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOcrStatus('idle');
    setOcrData(null);
  };

  // Step 1: Upload + OCR
  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) return;
    setOcrStatus('uploading');
    setError('');

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setReceiptUrl(file_url);
    setOcrStatus('processing');

    const ocr = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a precision OCR engine for bank payment receipts. Extract the following fields from this payment receipt image:
- amount: the total paid amount as a number (just digits, no currency symbols)
- date: the date of the transaction as shown on the receipt (original string)
- date_iso: the same transaction date normalized to YYYY-MM-DD format. If only a partial date is visible, return null.
- transaction_number: the transaction ID, reference number, or receipt number (any unique identifier)
- beneficiary_account_number: the beneficiary account number (the account number that received the payment)
- raw_text: a brief summary of all visible text

Be extremely precise. If a field is not visible or unclear, return null for it. Do not guess.`,
      file_urls: [file_url],
      model: 'claude_opus_4_8',
      response_json_schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          date: { type: 'string' },
          date_iso: { type: 'string' },
          transaction_number: { type: 'string' },
          beneficiary_account_number: { type: 'string' },
          raw_text: { type: 'string' },
        },
      },
    });

    setOcrData(ocr);

    const notifBase = {
      resellerName: account.display_name || account.username,
      resellerUsername: account.username,
      productType, duration, ocrData: ocr, receiptImageUrl: file_url,
    };

    // Validation: amount must be present and > 0
    if (!ocr.amount || ocr.amount <= 0) {
      setOcrStatus('error');
      const reason = 'Could not extract a valid amount from the receipt.';
      setError(reason + ' Please upload a clearer image.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, reason });
      return;
    }

    // Validation: receipt must be from today
    const today = new Date().toISOString().split('T')[0];
    if (!ocr.date_iso) {
      setOcrStatus('error');
      const reason = 'Could not verify the transaction date.';
      setError(reason + ' Please upload a clearer receipt showing the full date.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, reason });
      return;
    }
    if (ocr.date_iso !== today) {
      setOcrStatus('error');
      const reason = `Transaction date (${ocr.date_iso}) is not today (${today}). Only same-day receipts are accepted.`;
      setError(`❌ Receipt rejected: ${reason}`);
      toast.error('Receipt rejected — not a same-day transaction.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, reason });
      return;
    }

    // Validation: amount must match selected plan price (allow up to 50 more)
    const expected = getExpectedPrice(pricePlans, productType, duration);
    if (expected && ocr.amount < expected) {
      setOcrStatus('error');
      const reason = `Amount LKR ${ocr.amount} is less than required LKR ${expected}.`;
      setError(`❌ Amount mismatch: ${reason} Please upload a receipt with the correct amount.`);
      toast.error('Receipt rejected — amount too low.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
      return;
    }
    if (expected && ocr.amount > expected + 50) {
      setOcrStatus('error');
      const reason = `Amount LKR ${ocr.amount} exceeds the allowed range (LKR ${expected}–${expected + 50}).`;
      setError(`❌ Amount mismatch: ${reason}`);
      toast.error('Receipt rejected — amount too high.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
      return;
    }

    // Beneficiary account verification
    const beneficiaryCheck = await verifyBeneficiaryAccount(ocr.beneficiary_account_number);
    if (!beneficiaryCheck.verified) {
      setOcrStatus('error');
      const reason = beneficiaryCheck.reason;
      setError(`❌ ${reason}`);
      toast.error('Receipt rejected — beneficiary account not recognized.');
      sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
      return;
    }

    setOcrStatus('done');
    toast.success('Receipt verified! Amount, date and beneficiary confirmed. Fill in the account details below.');
    sendReceiptVerificationNotification({
      ...notifBase, verified: true, expectedAmount: expected,
      reason: `Amount LKR ${ocr.amount} matches expected LKR ${expected} (within ±50 range). Same-day confirmed. Beneficiary: ${beneficiaryCheck.reason}`,
    });
  };

  const validate = () => {
    if (!hasLetter(username)) { setError('Username must contain at least one letter.'); return false; }
    if (!hasLetter(password)) { setError('Password must contain at least one letter.'); return false; }
    return true;
  };

  // Step 2: Submit the account request with receipt data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    await base44.entities.ResellerAccountRequest.create({
      requested_by: account.username,
      requested_username: username.trim(),
      requested_password: password,
      product_type: productType,
      duration,
      status: 'pending',
    });

    // Also save the receipt for admin records
    await base44.entities.ResellerReceipt.create({
      reseller_username: account.username,
      reseller_display_name: account.display_name || account.username,
      receipt_image_url: receiptUrl,
      extracted_amount: ocrData?.amount || null,
      extracted_date: ocrData?.date || null,
      extracted_reference: ocrData?.transaction_number || null,
      raw_ocr_text: ocrData?.raw_text || '',
      product_type: productType,
      duration,
      status: 'pending',
      auto_verified: false,
    });

    // Refresh request state
    const reqs = await base44.entities.ResellerAccountRequest.filter({ requested_by: account.username });
    const active = reqs.find(r => r.status === 'pending' || r.status === 'claimed' || r.status === 'created');
    if (active) setRequest(active);
    setLoading(false);
  };

  if (checking) {
    return <div className="w-full max-w-md mx-auto flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  // ── Created ──
  if (request?.status === 'created') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto rounded-3xl p-8 text-center"
        style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: '1px solid rgba(0,255,100,0.3)', boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)' }}>
          <CheckCircle className="w-8 h-8" style={{ color: '#00ff64' }} />
        </div>
        <h2 className="font-orbitron font-black text-xl tracking-widest mb-1" style={{ color: '#00ff64' }}>✅ ACCOUNT CREATED!</h2>
        <p className="font-inter text-sm text-muted-foreground mb-6">Your custom account has been created by admin.</p>
        <div className="rounded-xl p-5 mb-4 text-left space-y-3" style={{ background: 'rgba(0,255,100,0.05)', border: '1px solid rgba(0,255,100,0.2)' }}>
          <div className="flex justify-between text-sm font-inter"><span className="text-muted-foreground">Username</span><span className="font-bold text-foreground font-orbitron">{request.requested_username}</span></div>
          <div className="flex justify-between text-sm font-inter"><span className="text-muted-foreground">Password</span><span className="font-bold text-foreground font-orbitron">{request.requested_password}</span></div>
          <div className="flex justify-between text-sm font-inter"><span className="text-muted-foreground">Product</span><span className="font-bold capitalize" style={{ color: '#00d4ff' }}>{request.product_type}</span></div>
          <div className="flex justify-between text-sm font-inter"><span className="text-muted-foreground">Duration</span><span className="font-bold text-foreground">{request.duration?.replace('_', ' ')}</span></div>
        </div>
        <p className="font-inter text-xs text-muted-foreground">🎉 Share these credentials with your customer!</p>
      </motion.div>
    );
  }

  // ── Pending / Claimed ──
  if (request) {
    const isClaimed = request.status === 'claimed';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto rounded-3xl p-8 text-center"
        style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: `1px solid ${isClaimed ? 'rgba(0,212,255,0.3)' : 'rgba(255,170,0,0.25)'}`, boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: isClaimed ? 'rgba(0,212,255,0.1)' : 'rgba(255,170,0,0.1)', border: `1px solid ${isClaimed ? 'rgba(0,212,255,0.3)' : 'rgba(255,170,0,0.3)'}` }}>
          <Clock className="w-8 h-8" style={{ color: isClaimed ? '#00d4ff' : '#ffaa00' }} />
        </div>
        <h2 className="font-orbitron font-black text-lg tracking-widest mb-2" style={{ color: isClaimed ? '#00d4ff' : '#ffaa00' }}>
          {isClaimed ? '🔧 BEING CREATED...' : '⏳ REQUEST SUBMITTED'}
        </h2>
        <p className="font-inter text-sm text-muted-foreground mb-5">
          {isClaimed ? `Admin ${request.claimed_by} is creating your account right now.` : 'Waiting for an admin to claim and create your account.'}
        </p>
        <div className="rounded-xl p-4 mb-5 text-left space-y-2" style={{ background: isClaimed ? 'rgba(0,212,255,0.05)' : 'rgba(255,170,0,0.05)', border: `1px solid ${isClaimed ? 'rgba(0,212,255,0.15)' : 'rgba(255,170,0,0.15)'}` }}>
          {[
            { label: 'Username', value: request.requested_username },
            { label: 'Password', value: request.requested_password },
            { label: 'Product', value: request.product_type },
            { label: 'Duration', value: request.duration?.replace('_', ' ') },
            { label: 'Status', value: isClaimed ? `Claimed by ${request.claimed_by}` : 'Pending Admin', color: isClaimed ? '#00d4ff' : '#ffaa00' },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-xs font-inter">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium" style={item.color ? { color: item.color } : { color: 'var(--foreground)' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-inter text-muted-foreground">
          <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Checking for updates every 5 seconds...
        </div>
      </motion.div>
    );
  }

  // ── Form (receipt scan + account details) ──
  const ocrVerified = ocrStatus === 'done' && ocrData?.amount > 0;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md mx-auto rounded-3xl p-8"
      style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: '1px solid rgba(170,68,255,0.2)', boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs font-inter mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)' }}>
          <Settings className="w-7 h-7" style={{ color: '#aa44ff' }} />
        </div>
        <h2 className="font-orbitron font-black text-lg tracking-widest" style={{ color: '#aa44ff' }}>CUSTOM ACCOUNT</h2>
        <p className="font-inter text-xs text-muted-foreground mt-1">Upload receipt → verify → enter details</p>
      </div>

      {/* ── PLAN SELECTION (before receipt upload) ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            SELECT PLAN
          </span>
          <p className="font-inter text-xs text-muted-foreground">Choose product & duration</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2"><Package className="w-3.5 h-3.5 text-muted-foreground" /><p className="font-inter text-xs text-muted-foreground tracking-wider">PRODUCT TYPE</p></div>
          <div className="space-y-2">
            {PRODUCT_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => { setProductType(opt.value); setError(''); setOcrStatus('idle'); setOcrData(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-inter text-sm"
                style={{ background: productType === opt.value ? `${opt.color}18` : 'rgba(0,15,35,0.6)', border: `1px solid ${productType === opt.value ? opt.color + '60' : 'rgba(255,255,255,0.06)'}`, color: productType === opt.value ? opt.color : 'rgba(180,200,220,0.6)' }}>
                <span className="flex-1">{opt.label}</span>
                {productType === opt.value && <span className="w-2 h-2 rounded-full" style={{ background: opt.color }} />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><p className="font-inter text-xs text-muted-foreground tracking-wider">DURATION</p></div>
          <div className="grid grid-cols-2 gap-2">
            {buildDurationOptions(pricePlans, productType).map(opt => (
              <button key={opt.value} type="button" onClick={() => { setDuration(opt.value); setError(''); setOcrStatus('idle'); setOcrData(null); }}
                className="px-3 py-2.5 rounded-xl text-sm font-inter transition-all flex items-center justify-between"
                style={{ background: duration === opt.value ? 'rgba(0,212,255,0.18)' : 'rgba(0,15,35,0.6)', border: `1px solid ${duration === opt.value ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.06)'}`, color: duration === opt.value ? '#00d4ff' : 'rgba(180,200,220,0.6)' }}>
                <span>{opt.label}</span>
                {opt.price != null && <span className="font-orbitron text-xs font-bold" style={{ color: duration === opt.value ? '#00d4ff' : 'rgba(180,200,220,0.4)' }}>LKR {opt.price.toLocaleString()}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STEP 1: Receipt upload + OCR ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: ocrVerified ? 'rgba(0,255,100,0.1)' : 'rgba(170,68,255,0.1)', border: `1px solid ${ocrVerified ? 'rgba(0,255,100,0.3)' : 'rgba(170,68,255,0.3)'}`, color: ocrVerified ? '#00ff64' : '#aa44ff' }}>
            STEP 1
          </span>
          <p className="font-inter text-xs text-muted-foreground">Receipt Verification</p>
          {ocrVerified && <CheckCircle className="w-4 h-4 ml-auto" style={{ color: '#00ff64' }} />}
        </div>

        <form onSubmit={handleScan} className="space-y-3">
          <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl cursor-pointer transition-all"
            style={{ border: `2px dashed ${preview ? 'rgba(0,212,255,0.4)' : 'rgba(170,68,255,0.2)'}`, background: preview ? 'rgba(0,212,255,0.03)' : 'transparent' }}>
            {preview ? (
              <img src={preview} className="max-h-32 rounded-xl object-contain" alt="Receipt" />
            ) : (
              <>
                <FileImage className="w-8 h-8 text-muted-foreground" />
                <p className="font-inter text-xs text-muted-foreground">Click to upload payment receipt</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          {ocrStatus === 'done' && ocrData && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3" style={{ background: 'rgba(0,255,100,0.06)', border: '1px solid rgba(0,255,100,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-3.5 h-3.5" style={{ color: '#00ff64' }} />
                <p className="font-orbitron text-xs font-bold" style={{ color: '#00ff64' }}>RECEIPT VERIFIED</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center"><p className="text-xs text-muted-foreground">Amount</p><p className="font-orbitron font-bold text-xs text-primary">LKR {ocrData.amount}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Date</p><p className="font-orbitron font-bold text-xs text-primary">{ocrData.date || '—'}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Ref</p><p className="font-orbitron font-bold text-xs text-primary truncate">{ocrData.transaction_number || '—'}</p></div>
              </div>
            </motion.div>
          )}

          {ocrStatus === 'error' && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p className="font-inter text-xs text-red-400">{error}</p>
            </div>
          )}

          {file && !ocrVerified && (
            <button type="submit" disabled={ocrStatus === 'uploading' || ocrStatus === 'processing'}
              className="w-full py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              {ocrStatus === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> :
               ocrStatus === 'processing' ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Scanning...</> :
               <><Upload className="w-3.5 h-3.5" /> SCAN RECEIPT</>}
            </button>
          )}
        </form>
      </div>

      {/* ── STEP 2: Account details (locked until receipt verified) ── */}
      <div style={{ opacity: ocrVerified ? 1 : 0.4, pointerEvents: ocrVerified ? 'auto' : 'none' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)', color: '#aa44ff' }}>
            STEP 2
          </span>
          <p className="font-inter text-xs text-muted-foreground">Account Details</p>
          {!ocrVerified && <Lock className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Customer Username (must include a letter)" value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }} required
              className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(170,68,255,0.2)', caretColor: '#aa44ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(170,68,255,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(170,68,255,0.2)'} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={showPass ? 'text' : 'password'} placeholder="Customer Password (must include a letter)" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }} required
              className="w-full pl-10 pr-10 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(170,68,255,0.2)', caretColor: '#aa44ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(170,68,255,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(170,68,255,0.2)'} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <p className="font-inter text-xs text-red-400">⚠️ {error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(170,68,255,0.2), rgba(100,0,200,0.12))', border: '1px solid rgba(170,68,255,0.5)', color: '#aa44ff', boxShadow: '0 0 20px rgba(170,68,255,0.15)' }}>
            {loading ? <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> SEND REQUEST</>}
          </button>
        </form>
      </div>

      {!ocrVerified && (
        <div className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(170,68,255,0.04)', border: '1px solid rgba(170,68,255,0.12)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#aa44ff' }} />
          <p className="font-inter text-xs text-muted-foreground">Upload and scan your receipt first. AI will extract the amount, date, and reference. Once verified, the account form unlocks.</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Main selector ──
export default function AccountTypeSelector({ account, onDefaultConfirm }) {
  const [view, setView] = useState('select');

  if (view === 'default') return <DefaultAccountPanel account={account} onConfirm={onDefaultConfirm} />;
  if (view === 'custom')  return <CustomAccountPanel  account={account} onBack={() => setView('select')} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-orbitron font-black text-xl tracking-widest" style={{ color: '#00d4ff' }}>SELECT ACCOUNT TYPE</h2>
        <p className="font-inter text-xs text-muted-foreground mt-2">
          Welcome, <span className="text-primary font-medium">{account.display_name || account.username}</span>. Choose how to proceed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(0,212,255,0.25)' }} whileTap={{ scale: 0.97 }}
          onClick={() => setView('default')}
          className="rounded-3xl p-6 text-left transition-all"
          style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <p className="font-orbitron font-black text-sm tracking-widest mb-1" style={{ color: '#00d4ff' }}>DEFAULT ACCOUNT</p>
          <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block" style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff88' }}>⚡ FAST</span>
          <p className="font-inter text-xs text-muted-foreground mt-2 leading-relaxed">Use your admin-assigned credentials. Instant access.</p>
        </motion.button>

        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(170,68,255,0.25)' }} whileTap={{ scale: 0.97 }}
          onClick={() => setView('custom')}
          className="rounded-3xl p-6 text-left transition-all"
          style={{ background: 'rgba(0,8,28,0.85)', backdropFilter: 'blur(40px)', border: '1px solid rgba(170,68,255,0.25)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)' }}>
            <Settings className="w-6 h-6" style={{ color: '#aa44ff' }} />
          </div>
          <p className="font-orbitron font-black text-sm tracking-widest mb-1" style={{ color: '#aa44ff' }}>CUSTOM ACCOUNT</p>
          <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block" style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>🕐 REQUIRES ADMIN</span>
          <p className="font-inter text-xs text-muted-foreground mt-2 leading-relaxed">Upload receipt, verify via AI OCR, then request custom credentials for your customer.</p>
        </motion.button>
      </div>
    </motion.div>
  );
}