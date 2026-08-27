import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileImage, Loader2, CheckCircle, AlertCircle, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';
import { getPricePlans, buildDurationOptions, getExpectedPrice } from '@/utils/pricePlans';
import { sendReceiptVerificationNotification } from '@/utils/discordNotifier';
import { verifyBeneficiaryAccount } from '@/utils/beneficiaryVerifier';
import { supabase } from '@/lib/supabase';
import { scanReceipt } from '@/utils/ocrService';

const PRODUCT_OPTIONS = [
  { value: 'external', label: '⚡ External Panel' },
  { value: 'internal', label: '🔥 Internal Panel' },
  { value: 'both', label: '✨ Both Panels' },
];

export default function ReceiptUpload({ account }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [productType, setProductType] = useState('external');
  const [duration, setDuration] = useState('30_days');
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [result, setResult] = useState(null);
  const [pricePlans, setPricePlans] = useState([]);

  useEffect(() => { getPricePlans().then(setPricePlans); }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('idle');
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (!customerEmail) {
      toast.error('Please enter the customer email address.');
      return;
    }
    
    setStatus('uploading');

    try {
      // 1. Upload image to Supabase Storage
      const slipPath = `receipts/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadErr } = await supabase.storage.from('receipt_slips').upload(slipPath, file, { upsert: true });
      if (uploadErr) console.warn('Supabase storage upload notice:', uploadErr);
      const file_url = supabase.storage.from('receipt_slips').getPublicUrl(slipPath).data?.publicUrl || '';
      setStatus('processing');

      // 2. Enhanced OCR via Gemini API
      let ocr = null;
      try {
        ocr = await scanReceipt(file);
      } catch (err) {
        toast.error('AI scanning failed. Please try again or contact support.');
        setStatus('error');
        return;
      }

      const notifBase = {
        resellerName: account.display_name || account.email,
        resellerUsername: account.email,
        productType, duration, ocrData: ocr, receiptImageUrl: file_url,
      };

      // Amount validation: must match expected price (allow up to 50 more)
      const expected = getExpectedPrice(pricePlans, productType, duration);
      if (expected && ocr.amount < expected) {
        const reason = `Amount LKR ${ocr.amount} is less than required LKR ${expected}.`;
        setResult({ ocr, amountError: reason, expectedAmount: expected });
        setStatus('error');
        toast.error('Receipt rejected — amount too low.');
        sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
        return;
      }
      if (expected && ocr.amount > expected + 50) {
        const reason = `Amount LKR ${ocr.amount} exceeds the allowed range (LKR ${expected}–${expected + 50}).`;
        setResult({ ocr, amountError: reason, expectedAmount: expected });
        setStatus('error');
        toast.error('Receipt rejected — amount too high.');
        sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
        return;
      }

      // Beneficiary account verification
      const beneficiaryCheck = await verifyBeneficiaryAccount(ocr.beneficiary_account_number);
      if (!beneficiaryCheck.verified) {
        const reason = beneficiaryCheck.reason;
        setResult({ ocr, amountError: reason, expectedAmount: expected });
        setStatus('error');
        toast.error('Receipt rejected — beneficiary account not recognized.');
        sendReceiptVerificationNotification({ ...notifBase, verified: false, expectedAmount: expected, reason });
        return;
      }

      // 3. Duplicate detection
      let isDuplicate = false;
      let dupReceipt = null;

      if (ocr.transaction_number) {
        const { data: dupsByRef } = await supabase
          .from('reseller_receipts')
          .select('*')
          .eq('extracted_reference', ocr.transaction_number);

        if (dupsByRef && dupsByRef.length > 0) {
          isDuplicate = true;
          dupReceipt = dupsByRef[0];
        }
      }

      // Secondary duplicate check
      if (!isDuplicate && ocr.amount && ocr.date) {
        const { data: allReceipts } = await supabase
          .from('reseller_receipts')
          .select('*')
          .eq('reseller_email', account.email);

        const sameDayAmount = (allReceipts || []).filter(r =>
          r.extracted_amount === ocr.amount &&
          r.extracted_date === ocr.date &&
          r.status !== 'rejected'
        );
        if (sameDayAmount.length > 0) {
          isDuplicate = true;
          dupReceipt = sameDayAmount[0];
        }
      }

      const amountValid = ocr.amount && ocr.amount > 0;
      const autoApproved = amountValid && !isDuplicate;

      // 4. Save receipt
      const receiptData = {
        reseller_uid: account.uid || account.id,
        reseller_email: account.email,
        reseller_display_name: account.display_name || account.email,
        customer_email: customerEmail.toLowerCase(),
        receipt_image_url: file_url,
        extracted_amount: ocr.amount || null,
        extracted_date: ocr.date || null,
        extracted_reference: ocr.transaction_number || null,
        raw_ocr_text: `Bank: ${ocr.bank_name || 'N/A'} | ${ocr.raw_text || ''}`,
        product_type: productType,
        duration,
        status: isDuplicate ? 'pending' : autoApproved ? 'approved' : 'pending',
        auto_verified: autoApproved,
        created_at: new Date().toISOString()
      };
      
      await supabase.from('reseller_receipts').insert(receiptData);

      setResult({ autoApproved, isDuplicate, dupReceipt, ocr, expectedAmount: expected });
      setStatus('done');
      sendReceiptVerificationNotification({
        ...notifBase, verified: true, expectedAmount: expected,
        reason: `Amount LKR ${ocr.amount} matches expected LKR ${expected} (within ±50 range).`,
      });
      toast.success(isDuplicate ? 'Duplicate detected — pending admin review' : autoApproved ? 'Receipt auto-approved!' : 'Receipt submitted — pending admin review');
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error('An error occurred during submission.');
    }
  };

  return (
    <div className="rounded-2xl p-6 space-y-6" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <p className="font-orbitron text-xs text-primary tracking-wider">SUBMIT PAYMENT RECEIPT</p>

      {status === 'done' && result ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: result.isDuplicate ? 'rgba(255,80,80,0.06)' : result.autoApproved ? 'rgba(0,255,100,0.06)' : 'rgba(255,170,0,0.06)',
              border: `1px solid ${result.isDuplicate ? 'rgba(255,80,80,0.2)' : result.autoApproved ? 'rgba(0,255,100,0.2)' : 'rgba(255,170,0,0.2)'}`,
            }}>
            {result.isDuplicate
              ? <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              : result.autoApproved
              ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="font-orbitron font-bold text-sm" style={{ color: result.isDuplicate ? '#ff6060' : result.autoApproved ? '#00ff64' : '#ffaa00' }}>
                {result.isDuplicate ? 'DUPLICATE DETECTED' : result.autoApproved ? 'AUTO APPROVED' : 'PENDING REVIEW'}
              </p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">
                {result.isDuplicate
                  ? `This transaction appears to already be in our system. An admin will review it.`
                  : result.autoApproved
                  ? 'Your receipt passed automatic verification. The subscription has been granted.'
                  : 'Admin will verify and approve shortly.'}
              </p>
            </div>
          </div>

          {result.ocr && (
            <div>
              <p className="font-orbitron text-xs text-muted-foreground tracking-wider mb-2">EXTRACTED DATA</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Amount', val: result.ocr.amount ? `LKR ${result.ocr.amount}` : '—' },
                  { label: 'Bank', val: result.ocr.bank_name || '—' },
                  { label: 'Transaction #', val: result.ocr.transaction_number || '—' },
                  { label: 'Date', val: result.ocr.date || '—' },
                  { label: 'Beneficiary', val: result.ocr.beneficiary_account_number || '—' },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <p className="font-inter text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-orbitron font-bold text-xs text-primary break-all">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
             <p className="font-inter text-xs text-muted-foreground mb-1">Target Customer</p>
             <p className="font-orbitron font-bold text-sm text-white">{customerEmail}</p>
          </div>

          <button onClick={() => { setStatus('idle'); setFile(null); setPreview(null); setResult(null); setCustomerEmail(''); }}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            SUBMIT ANOTHER
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer transition-all"
            style={{ border: `2px dashed ${preview ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.15)'}`, background: preview ? 'rgba(0,212,255,0.04)' : 'transparent' }}>
            {preview ? (
              <img src={preview} className="max-h-48 rounded-xl object-contain" alt="Receipt" />
            ) : (
              <>
                <FileImage className="w-10 h-10 text-muted-foreground" />
                <p className="font-inter text-sm text-muted-foreground">Click to upload receipt image</p>
                <p className="font-inter text-xs text-muted-foreground/50">PNG, JPG, JPEG — AI will extract Amount, Bank & Transaction #</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          <div className="space-y-2">
             <label className="font-orbitron text-xs text-muted-foreground tracking-wider">CUSTOMER EMAIL</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm bg-transparent outline-none transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  placeholder="customer@email.com" />
             </div>
             <p className="font-inter text-xs text-muted-foreground">The subscription will be granted directly to this user.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-orbitron text-xs text-muted-foreground mb-2 tracking-wider">PRODUCT TYPE</p>
              <div className="space-y-2">
                {PRODUCT_OPTIONS.map(o => (
                  <button type="button" key={o.value} onClick={() => setProductType(o.value)}
                    className="w-full text-left py-2 px-3 rounded-lg font-inter text-xs transition-all"
                    style={{
                      background: productType === o.value ? 'rgba(0,212,255,0.12)' : 'rgba(0,15,35,0.5)',
                      border: `1px solid ${productType === o.value ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.08)'}`,
                      color: productType === o.value ? '#00d4ff' : 'rgba(180,200,220,0.6)',
                    }}>{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-orbitron text-xs text-muted-foreground mb-2 tracking-wider">DURATION</p>
              <div className="space-y-2">
                {buildDurationOptions(pricePlans, productType).map(o => (
                  <button type="button" key={o.value} onClick={() => setDuration(o.value)}
                    className="w-full text-left py-2 px-3 rounded-lg font-inter text-xs transition-all flex items-center justify-between"
                    style={{
                      background: duration === o.value ? 'rgba(0,212,255,0.12)' : 'rgba(0,15,35,0.5)',
                      border: `1px solid ${duration === o.value ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.08)'}`,
                      color: duration === o.value ? '#00d4ff' : 'rgba(180,200,220,0.6)',
                    }}>
                    <span>{o.label}</span>
                    {o.price != null && <span className="font-orbitron font-bold text-xs" style={{ color: duration === o.value ? '#00d4ff' : 'rgba(180,200,220,0.4)' }}>LKR {o.price.toLocaleString()}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {status === 'error' && result?.amountError && (
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-orbitron text-xs font-bold text-red-400 mb-1">AMOUNT MISMATCH</p>
                <p className="font-inter text-xs text-red-400">{result.amountError}</p>
                <p className="font-inter text-xs text-muted-foreground mt-1">Please upload a receipt with the correct amount for your selected plan.</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-inter text-xs text-muted-foreground">AI will automatically extract Amount, Bank Name and Transaction Number. Amount must match your selected plan price.</p>
          </div>

          {status === 'error' && result?.amountError ? (
            <button type="button" onClick={() => { setStatus('idle'); setResult(null); }}
              className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
              TRY AGAIN
            </button>
          ) : (
            <button type="submit" disabled={!file || !customerEmail || status !== 'idle'}
              className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0070aa)', color: '#020810', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
              {status === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> :
               status === 'processing' ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning Receipt...</> :
               <><Upload className="w-4 h-4" /> SUBMIT RECEIPT</>}
            </button>
          )}
        </form>
      )}
    </div>
  );
}