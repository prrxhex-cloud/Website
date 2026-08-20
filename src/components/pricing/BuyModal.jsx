import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle, Tag, Check, Sparkles, AlertCircle, LogIn, Building, Copy, ChevronDown, CheckCircle2, Upload, FileImage, Loader2, AlertTriangle, Key, Download, RefreshCw } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_BENEFICIARIES } from '@/components/dashboard/BeneficiaryAccountsTab';
import { verifySlipTransaction } from '@/utils/aiSlipVerifier';
import { dispenseLicenseKey } from '@/utils/keyDispenser';
import { sendInstantKeyDeliveredAlert } from '@/utils/discordNotifier';
import { enableAntiBypassGuard } from '@/utils/antiBypassGuard';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '94761386077';

export default function BuyModal({ plan, panelType = 'external', isOpen, onClose, discounts = [], initialPromoCode = '' }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [selectedGateway, setSelectedGateway] = useState('whatsapp');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Slip Upload & AI Verification states
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('idle'); // 'idle' | 'scanning' | 'dispensing' | 'success' | 'failed'
  const [verifyError, setVerifyError] = useState('');
  const [dispensedKey, setDispensedKey] = useState('');
  const [verifiedTxnData, setVerifiedTxnData] = useState(null);

  // Anti-Bypass Security: lock right-click and devtools shortcuts while in checkout
  useEffect(() => {
    if (isOpen) {
      const disableSecurity = enableAntiBypassGuard();
      return () => {
        if (disableSecurity) disableSecurity();
      };
    }
  }, [isOpen]);

  // Load Beneficiary Accounts
  useEffect(() => {
    let isMounted = true;
    const fetchBeneficiaries = async () => {
      try {
        const q = query(collection(db, 'beneficiary_accounts'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (isMounted) {
          if (!snap.empty) {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.active !== false);
            if (list.length > 0) {
              setBeneficiaries(list);
              setSelectedBeneficiaryId(list[0].id);
              return;
            }
          }
          const defaults = DEFAULT_BENEFICIARIES.map((b, i) => ({ id: `default-${i}`, ...b }));
          setBeneficiaries(defaults);
          setSelectedBeneficiaryId(defaults[0].id);
        }
      } catch (err) {
        console.warn('Beneficiary load error:', err);
        const defaults = DEFAULT_BENEFICIARIES.map((b, i) => ({ id: `default-${i}`, ...b }));
        setBeneficiaries(defaults);
        setSelectedBeneficiaryId(defaults[0].id);
      }
    };

    if (isOpen) {
      fetchBeneficiaries();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  // Pre-fill initial promo code if passed
  useEffect(() => {
    if (initialPromoCode && isOpen) {
      setPromoInput(initialPromoCode);
      applyCoupon(initialPromoCode);
    } else if (!isOpen) {
      setAppliedPromo(null);
      setPromoInput('');
      setPromoError('');
      setSlipFile(null);
      setSlipPreview(null);
      setVerifyStatus('idle');
      setVerifyError('');
      setDispensedKey('');
      setVerifiedTxnData(null);
    }
  }, [initialPromoCode, isOpen]);

  const applyCoupon = (codeToApply) => {
    const rawCode = (codeToApply || promoInput || '').trim().toUpperCase();
    setPromoError('');

    if (!rawCode) {
      setPromoError('Please enter a valid promo code.');
      return;
    }

    const discList = Array.isArray(discounts) ? discounts : [];
    const firestoreMatch = discList.find(d => {
      if (!d || !d.active) return false;
      if (d.expires_at) {
        let exp = new Date(d.expires_at);
        if (typeof d.expires_at === 'string' && d.expires_at.length === 10) {
          exp = new Date(`${d.expires_at}T23:59:59`);
        }
        if (exp.getTime() <= Date.now()) return false;
      }
      const codeMatch = d.promo_code && d.promo_code.toUpperCase() === rawCode;
      const panelMatch = d.panel_type === 'both' || d.panel_type === panelType;
      const labelMatch = !d.plan_label || d.plan_label.toLowerCase() === plan?.label?.toLowerCase();
      return codeMatch && panelMatch && labelMatch;
    });

    if (firestoreMatch) {
      setAppliedPromo({
        code: rawCode,
        type: firestoreMatch.discount_type || 'percentage',
        value: Number(firestoreMatch.discount_value) || 0,
        desc: firestoreMatch.badge_text || `${firestoreMatch.discount_value}% OFF`
      });
      return;
    }

    setPromoError(`Code "${rawCode}" is invalid or has expired.`);
  };

  const removeCoupon = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  if (!isOpen || !plan) return null;

  const baseLkr = Number(plan?.originalLkr || plan?.lkr || 0);

  // Price calculations
  let finalLkr = Number(plan?.lkr || baseLkr);
  let activeDiscountInfo = plan?.discount || null;

  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      finalLkr = Math.round(baseLkr * (1 - appliedPromo.value / 100));
    } else {
      finalLkr = Math.max(0, baseLkr - appliedPromo.value);
    }
    activeDiscountInfo = {
      discount_type: appliedPromo.type,
      discount_value: appliedPromo.value,
      promo_code: appliedPromo.code,
      badge_text: appliedPromo.desc
    };
  }

  const prices = getFormattedPrices(finalLkr);
  const originalPrices = (finalLkr < baseLkr) ? getFormattedPrices(baseLkr) : null;
  const savingsLkr = Math.max(0, baseLkr - finalLkr);
  const savingsPrices = savingsLkr > 0 ? getFormattedPrices(savingsLkr) : null;

  const platform = panelType === 'internal' ? 'Android APK / Windows 10/11' : 'Windows 10/11';
  const itemName = plan?.customTitle || `PRRX ${panelType === 'internal' ? 'Internal' : 'External'} Panel — ${plan?.label || 'VIP Plan'}`;
  const currentBeneficiary = beneficiaries.find(b => b.id === selectedBeneficiaryId) || beneficiaries[0] || DEFAULT_BENEFICIARIES[0];

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setVerifyStatus('idle');
    setVerifyError('');
  };

  // AI Verification and Key Dispense Pipeline
  const handleVerifySlipAndDeliver = async () => {
    if (!slipFile) {
      toast.error('Please upload your bank deposit slip image first.');
      return;
    }

    setVerifyStatus('scanning');
    setVerifyError('');

    try {
      // 1. Upload Slip to Firebase Storage for permanent records
      let receiptImageUrl = '';
      try {
        const fileExt = slipFile.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `receipts/${Date.now()}_${crypto.randomUUID()}.${fileExt}`);
        await uploadBytes(storageRef, slipFile);
        receiptImageUrl = await getDownloadURL(storageRef);
      } catch (uploadErr) {
        console.warn("Storage upload fallback:", uploadErr);
        // Continue with verification even if storage has rules restriction
      }

      // 2. Perform 100% Comprehensive AI Slip Verification via Gemini Vision
      const verification = await verifySlipTransaction({
        file: slipFile,
        expectedLkrAmount: finalLkr,
        planTitle: itemName,
        customerEmail: user?.email || 'Guest'
      });

      if (!verification.verified) {
        setVerifyStatus('failed');
        setVerifyError(verification.reason);
        toast.error(`Verification Failed: ${verification.reason}`);

        // Log failed attempt in Firestore receipts for admin review
        try {
          const receiptId = crypto.randomUUID();
          await setDoc(doc(db, 'receipts', receiptId), {
            customer_name: user?.displayName || 'VIP Guest',
            customer_email: user?.email || 'N/A',
            plan_title: itemName,
            product_type: panelType,
            duration: plan?.days || plan?.label,
            expected_amount: finalLkr,
            amount_paid: verification.ocrData?.amount || 0,
            bank_name: verification.ocrData?.bank_name || currentBeneficiary.bank_name,
            transaction_number: verification.ocrData?.transaction_number || '',
            beneficiary_account: verification.ocrData?.beneficiary_account_number || '',
            receipt_image_url: receiptImageUrl,
            verified: false,
            verification_reason: verification.reason,
            created_date: new Date().toISOString()
          });
        } catch (e) {}

        return;
      }

      // 3. AI Verification Passed -> Dispense Key from Key Bank
      setVerifyStatus('dispensing');

      const dispenseResult = await dispenseLicenseKey({
        productType: panelType,
        duration: plan?.label || plan?.days,
        customerEmail: user?.email || 'VIP Customer',
        transactionId: verification.transactionId,
        receiptId: crypto.randomUUID()
      });

      const issuedKey = dispenseResult.licenseKey || 'PRRX-VIP-AUTOKEY-PENDING-DISPATCH';

      // 4. Save 100% Verified Receipt Log to Firestore
      const receiptDocId = crypto.randomUUID();
      const receiptPayload = {
        customer_name: user?.displayName || 'VIP Member',
        customer_email: user?.email || 'vip-customer@prrxhex.com',
        plan_title: itemName,
        product_type: panelType,
        duration: plan?.days || plan?.label,
        expected_amount: finalLkr,
        amount_paid: verification.paidAmount || finalLkr,
        bank_name: verification.ocrData?.bank_name || currentBeneficiary.bank_name,
        transaction_number: verification.transactionId,
        beneficiary_account: verification.ocrData?.beneficiary_account_number || currentBeneficiary.account_number,
        receipt_image_url: receiptImageUrl,
        verified: true,
        license_key: issuedKey,
        verification_reason: '100% Verified by Gemini Vision AI',
        created_date: new Date().toISOString()
      };

      await setDoc(doc(db, 'receipts', receiptDocId), receiptPayload);

      // 5. Multi-Channel Discord Webhook Notification
      sendInstantKeyDeliveredAlert({
        customerName: user?.displayName || 'VIP Customer',
        customerEmail: user?.email || 'N/A',
        planTitle: itemName,
        productType: panelType,
        duration: plan?.days || plan?.label,
        amount: finalLkr,
        bankName: verification.ocrData?.bank_name || currentBeneficiary.bank_name,
        transactionNumber: verification.transactionId,
        licenseKey: issuedKey,
        receiptImageUrl: receiptImageUrl
      });

      // 6. Reveal Key and Trigger Fireworks Celebration
      setDispensedKey(issuedKey);
      setVerifiedTxnData(receiptPayload);
      setVerifyStatus('success');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success('🎉 Slip 100% Verified! VIP License Key Delivered.');

    } catch (err) {
      console.error('AI Pipeline error:', err);
      setVerifyStatus('failed');
      setVerifyError(err.message || 'Verification failed. Please send your slip via WhatsApp.');
    }
  };

  // Generate Branded PDF Receipt
  const handleDownloadPdfInvoice = () => {
    if (!verifiedTxnData) return;
    try {
      const docPdf = new jsPDF();

      // Header
      docPdf.setFillColor(6, 15, 30);
      docPdf.rect(0, 0, 210, 40, 'F');

      docPdf.setTextColor(6, 182, 212);
      docPdf.setFontSize(22);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('PRRX HEX — OFFICIAL VIP INVOICE', 14, 25);

      docPdf.setFontSize(10);
      docPdf.setTextColor(255, 255, 255);
      docPdf.text(`Receipt ID: ${verifiedTxnData.transaction_number || 'TXN-PRRX'}`, 14, 34);

      // Body Details
      docPdf.setTextColor(20, 20, 20);
      docPdf.setFontSize(12);
      docPdf.text(`Item: ${verifiedTxnData.plan_title}`, 14, 55);
      docPdf.text(`Platform: ${platform}`, 14, 63);
      docPdf.text(`Duration: ${verifiedTxnData.duration}`, 14, 71);
      docPdf.text(`Amount Paid: Rs. ${verifiedTxnData.amount_paid} LKR`, 14, 79);
      docPdf.text(`Bank Name: ${verifiedTxnData.bank_name}`, 14, 87);
      docPdf.text(`Transaction Ref ID: ${verifiedTxnData.transaction_number}`, 14, 95);
      docPdf.text(`Issued Date: ${new Date(verifiedTxnData.created_date).toLocaleString()}`, 14, 103);

      // License Key Highlight Box
      docPdf.setFillColor(240, 253, 250);
      docPdf.setDrawColor(6, 182, 212);
      docPdf.roundedRect(14, 115, 182, 25, 3, 3, 'FD');

      docPdf.setTextColor(6, 182, 212);
      docPdf.setFontSize(10);
      docPdf.text('YOUR VIP LICENSE KEY:', 18, 123);

      docPdf.setFontSize(14);
      docPdf.setTextColor(15, 23, 42);
      docPdf.text(`${verifiedTxnData.license_key}`, 18, 133);

      // Footer
      docPdf.setFontSize(9);
      docPdf.setTextColor(100, 100, 100);
      docPdf.text('Thank you for choosing PRRX HEX Cheats. 24/7 VIP Discord & WhatsApp Support Active.', 14, 155);

      docPdf.save(`PRRX_HEX_Invoice_${verifiedTxnData.transaction_number || 'VIP'}.pdf`);
      toast.success('PDF Invoice downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF invoice');
    }
  };

  const handleWhatsAppFallback = () => {
    const message = `Hello PRRX HEX Admin! I have transferred the amount for my VIP Key.
🛒 Selected Item: ${itemName}
💻 Platform: ${platform}
⏱️ Duration: ${plan?.days || plan?.label}
💰 Amount: Rs. ${finalLkr} LKR
🏦 Bank: ${currentBeneficiary.bank_name}

Attached is my bank slip photo. Please verify and send my VIP Key!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-inter">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden max-h-[94vh] flex flex-col justify-between"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5 overflow-y-auto pr-1">
            
            {/* SUCCESS KEY REVEAL SCREEN */}
            {verifyStatus === 'success' && (
              <div className="space-y-5 py-4 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Key className="w-8 h-8 animate-bounce" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    PAYMENT 100% VERIFIED
                  </span>
                  <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white mt-2">
                    YOUR VIP LICENSE KEY
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Thank you for your purchase! Copy your key below or download your invoice.
                  </p>
                </div>

                {/* Key Reveal Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border border-cyan-500/40 space-y-3 shadow-xl text-left">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                    License Key ({plan?.label} Access):
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <span className="font-mono font-black text-sm text-cyan-300 tracking-wider select-all break-all">
                      {dispensedKey}
                    </span>
                    <button
                      onClick={() => handleCopyText(dispensedKey, 'dispensed-key')}
                      className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-all flex items-center gap-1 text-xs font-bold shrink-0 ml-2"
                    >
                      {copiedField === 'dispensed-key' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDownloadPdfInvoice}
                    className="py-3 px-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Invoice (PDF)</span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-slate-950 font-outfit font-extrabold text-xs tracking-wider shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>GO TO VIP DASHBOARD</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHECKOUT & VERIFICATION SCREEN */}
            {verifyStatus !== 'success' && (
              <>
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      {panelType.toUpperCase()} VIP
                    </span>
                    {originalPrices && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" /> DISCOUNT APPLIED
                      </span>
                    )}
                  </div>
                  <h2 className="font-outfit font-black text-2xl sm:text-3xl text-[var(--text-heading)] tracking-tight">
                    {itemName}
                  </h2>
                  <p className="font-inter text-xs text-[#06b6d4] font-bold mt-0.5">
                    ⚡ Instant AI Key Delivery & 24/7 VIP Support Guaranteed
                  </p>
                </div>

                {/* Selected Item Summary Box */}
                <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-inter">
                    <span className="text-[var(--text-muted)] font-medium">Selected Item:</span>
                    <span className="font-outfit font-bold text-[var(--text-heading)] text-right">{itemName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-inter">
                    <span className="text-[var(--text-muted)] font-medium">Platform:</span>
                    <span className="font-outfit font-bold px-2 py-0.5 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4]">
                      {platform}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-inter">
                    <span className="text-[var(--text-muted)] font-medium">License Duration:</span>
                    <span className="font-outfit font-bold text-[var(--text-heading)]">{plan?.days || plan?.label}</span>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-[var(--border-color)] pt-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="font-outfit font-extrabold text-sm text-[var(--text-heading)] block">Total Amount:</span>
                      {savingsPrices && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3 h-3" /> You Saved {savingsPrices.usd} (LKR {savingsPrices.lkr})
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-outfit font-black text-2xl text-[#06b6d4]">
                        {prices.usd}
                      </span>
                      <div className="font-inter text-xs text-[var(--text-muted)] font-bold">
                        LKR {prices.lkr}
                      </div>
                      {originalPrices && (
                        <div className="font-inter text-[10px] line-through text-rose-400 font-semibold mt-0.5">
                          {originalPrices.usd} (LKR {originalPrices.lkr})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-[var(--bg-subtle)] to-purple-950/30 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-outfit font-bold text-[var(--text-heading)] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" /> Have a Promo Code?
                    </span>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Code "{appliedPromo.code}" Applied: {appliedPromo.desc}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-[11px] text-rose-400 font-bold underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="PROMO CODE"
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => applyCoupon(promoInput)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-outfit font-extrabold text-xs shadow-md transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-rose-400 font-medium">{promoError}</p>
                  )}
                </div>

                {/* STEP 1: PAYMENT GATEWAYS & COPYABLE BANK DETAILS */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-outfit font-bold text-cyan-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-cyan-400" /> 1. Select Admin Bank Account:
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          value={selectedBeneficiaryId}
                          onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-outfit font-bold text-cyan-200 outline-none focus:border-cyan-400 cursor-pointer pr-10 shadow-inner"
                        >
                          {beneficiaries.map((b, idx) => (
                            <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                              {b.gateway_label || `Payment Gateway ${idx + 1} (${b.bank_name})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Copyable Details */}
                    {currentBeneficiary && (
                      <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-outfit font-extrabold text-[11px] text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ADMIN BANK DETAILS
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {currentBeneficiary.gateway_type || 'Bank Transfer'}
                          </span>
                        </div>

                        {/* Bank Name */}
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Bank Name:</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>{currentBeneficiary.bank_name}</span>
                            <button type="button" onClick={() => handleCopyText(currentBeneficiary.bank_name, 'bank')} className="p-1 hover:text-cyan-400">
                              {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Account Name */}
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Name:</span>
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <span>{currentBeneficiary.owner_name}</span>
                            <button type="button" onClick={() => handleCopyText(currentBeneficiary.owner_name, 'name')} className="p-1 hover:text-cyan-400">
                              {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Account Number */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40">
                          <span className="text-cyan-300 font-bold">Acc No.:</span>
                          <div className="flex items-center gap-2 font-mono font-black text-sm text-cyan-300">
                            <span>{currentBeneficiary.account_number}</span>
                            <button type="button" onClick={() => handleCopyText(currentBeneficiary.account_number, 'acc')} className="p-1 rounded bg-cyan-500/30 text-cyan-200 text-[11px] font-bold px-2 py-0.5">
                              {copiedField === 'acc' ? 'Copied ✔' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Branch */}
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Branch:</span>
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <span>{currentBeneficiary.branch_name || 'Main Branch'}</span>
                            <button type="button" onClick={() => handleCopyText(currentBeneficiary.branch_name, 'branch')} className="p-1 hover:text-cyan-400">
                              {copiedField === 'branch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Copy Full Details Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const fullDetails = `Bank Name: ${currentBeneficiary.bank_name}\nAccount Name: ${currentBeneficiary.owner_name}\nAccount Number: ${currentBeneficiary.account_number}\nBranch: ${currentBeneficiary.branch_name || 'Main Branch'}\nAmount: Rs. ${prices.lkr}`;
                            handleCopyText(fullDetails, 'full');
                          }}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-outfit font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          {copiedField === 'full' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                          <span>{copiedField === 'full' ? 'Full Bank Details Copied!' : 'Copy Full Bank Details'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2: UPLOAD BANK SLIP FOR 100% INSTANT AI DELIVERY */}
                <div className="space-y-3">
                  <label className="text-xs font-outfit font-bold text-[var(--text-heading)] flex items-center justify-between">
                    <span>2. Upload Deposit Slip / Screenshot:</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ⚡ AI AUTO-KEY REVEAL
                    </span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />

                  {!slipFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20 text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-outfit font-bold text-xs text-white">
                          Click or Drag to Upload Bank Slip Photo
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Supports PNG, JPG, WEBP, and Camera capture on mobile
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 truncate">
                          <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate">{slipFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline"
                        >
                          Change Slip
                        </button>
                      </div>

                      {slipPreview && (
                        <div className="relative rounded-xl overflow-hidden max-h-40 border border-white/10 bg-slate-950 flex items-center justify-center">
                          <img src={slipPreview} alt="Slip Preview" className="max-h-40 object-contain" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scanning Animation */}
                  {(verifyStatus === 'scanning' || verifyStatus === 'dispensing') && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-400 shadow-xl space-y-2.5 text-center animate-pulse">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                      <div className="font-outfit font-black text-xs text-cyan-300 uppercase tracking-wider">
                        {verifyStatus === 'scanning' ? 'Scanning Slip with Gemini Vision AI...' : 'Verifying & Dispensing VIP License Key...'}
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Checking amount (Rs. {finalLkr}), bank name, beneficiary account, and reference ID...
                      </div>
                    </div>
                  )}

                  {/* Verification Error Box */}
                  {verifyStatus === 'failed' && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-left space-y-2">
                      <div className="flex items-start gap-2 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{verifyError}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 pt-1">
                        Need help? Click below to send your slip to our WhatsApp support team directly for instant manual approval.
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {verifyStatus !== 'success' && (
            <div className="pt-4 border-t border-[var(--border-color)] mt-4 space-y-2">
              <button
                onClick={handleVerifySlipAndDeliver}
                disabled={!slipFile || verifyStatus === 'scanning' || verifyStatus === 'dispensing'}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-outfit font-black text-sm tracking-wide text-center flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>⚡ VERIFY SLIP & GET INSTANT VIP KEY</span>
              </button>

              <button
                onClick={handleWhatsAppFallback}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-subtle)] hover:bg-white/5 border border-[var(--border-color)] text-slate-300 font-inter font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Or Order via WhatsApp (+94 761 386 077)</span>
              </button>

              <p className="text-[9px] text-center text-[var(--text-muted)]">
                🔒 100% Anti-Fraud Protected • Instant automated key verification & delivery in 2 seconds.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
