import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle, Tag, Check, Sparkles, AlertCircle, LogIn, Building, Copy, ChevronDown, CheckCircle2, Upload, FileImage, Loader2, AlertTriangle, Key, Download, RefreshCw, Zap, Shield, Clock, Smartphone, Lock } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_BENEFICIARIES } from '@/components/dashboard/BeneficiaryAccountsTab';
import { verifySlipTransaction } from '@/utils/aiSlipVerifier';
import { dispenseLicenseKey } from '@/utils/keyDispenser';
import { hashLedger } from '@/utils/hashLedger';
import { sendInstantKeyDeliveredAlert } from '@/utils/discordNotifier';
import { enableAntiBypassGuard } from '@/utils/antiBypassGuard';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '94761386077';

const PAYMENT_METHODS = [
  {
    id: 'ai_upload',
    title: 'Upload Receipt & Get Instant Key',
    desc: '⚡ 2-Sec Instant AI Verification & Auto-Key Reveal',
    icon: Zap,
    badge: 'FASTEST / INSTANT',
    badgeColor: '#06b6d4',
    available: true,
  },
  {
    id: 'whatsapp',
    title: 'Order Via WhatsApp',
    desc: '💬 Select Bank Gateway & Chat with Admin on WhatsApp',
    icon: MessageCircle,
    badge: 'DIRECT SUPPORT',
    badgeColor: '#10b981',
    available: true,
  },
  {
    id: 'crypto',
    title: 'Crypto / Binance Pay (USDT)',
    desc: '🪙 USDT TRC20 / BEP20 Instant Blockchain Checkout',
    icon: Coins,
    badge: 'COMING SOON',
    badgeColor: '#a855f7',
    available: false,
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    desc: '💳 Visa, Mastercard & International Gateways',
    icon: CreditCard,
    badge: 'COMING SOON',
    badgeColor: '#f59e0b',
    available: false,
  },
  {
    id: 'wallet',
    title: 'Mobile Wallet (EzCash / mCash)',
    desc: '📱 Direct 1-Click Mobile Wallet Checkout',
    icon: Smartphone,
    badge: 'COMING SOON',
    badgeColor: '#ec4899',
    available: false,
  }
];

export default function BuyModal({ plan, panelType = 'external', isOpen, onClose, discounts = [], initialPromoCode = '' }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active Payment Method Tab
  const [selectedMethod, setSelectedMethod] = useState('ai_upload'); // 'ai_upload' | 'whatsapp' | 'crypto' | 'card' | 'wallet'

  // States
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
      // 1. Perform 100% Comprehensive AI Slip Verification via Gemini Vision (Instant: <1.5 seconds)
      const verification = await verifySlipTransaction({
        file: slipFile,
        expectedLkrAmount: finalLkr,
        planTitle: itemName,
        customerEmail: user?.email || 'Guest'
      });

      // Storage upload runs asynchronously in background so user doesn't wait
      let receiptImageUrl = '';
      uploadBytes(ref(storage, `receipts/${Date.now()}_${crypto.randomUUID()}.${slipFile.name.split('.').pop() || 'jpg'}`), slipFile)
        .then(snap => getDownloadURL(snap.ref))
        .then(url => { receiptImageUrl = url; })
        .catch(err => console.warn("Background storage upload notice:", err));

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

      // Cryptographic Hash-Chain Ledger Stamping
      hashLedger.sealTransactionBlock({
        transactionId: verification.transactionId,
        customerEmail: user?.email || 'VIP Member',
        amountPaid: finalLkr,
        planTitle: itemName,
        licenseKey: issuedKey
      });

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
        particleCount: 140,
        spread: 90,
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

  // WhatsApp Direct Order Trigger with Gateway Details
  const handleProceedWhatsAppOrder = () => {
    const message = `Hello PRRX HEX Admin! I want to order a VIP Key.

🛒 Selected Item: ${itemName}
💻 Platform: ${platform}
⏱️ Duration: ${plan?.days || plan?.label}
💰 Total Amount: Rs. ${finalLkr} LKR (${prices.usd})
🏦 Selected Bank Gateway: ${currentBeneficiary.gateway_label || currentBeneficiary.bank_name}
💳 Account Name: ${currentBeneficiary.owner_name}
🔢 Account Number: ${currentBeneficiary.account_number}
🏢 Branch: ${currentBeneficiary.branch_name || 'Main Branch'}

I am transferring the payment to this account and attaching my slip. Please confirm and dispatch my VIP Key!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto font-inter">
        {/* Full Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg"
        />

        {/* Wide Full-Featured Checkout Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-5xl bg-[var(--bg-card)] border border-cyan-500/30 rounded-[32px] p-5 sm:p-8 md:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.8)] z-10 text-left overflow-hidden max-h-[92vh] flex flex-col justify-between"
        >
          {/* Top Corner Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white flex items-center justify-center transition-all hover:scale-105 z-20 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* MAIN MODAL CONTENT */}
          <div className="overflow-y-auto pr-1">
            
            {/* SUCCESS KEY REVEAL SCREEN */}
            {verifyStatus === 'success' ? (
              <div className="space-y-6 py-6 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                  <Key className="w-10 h-10 animate-bounce" />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    PAYMENT 100% VERIFIED
                  </span>
                  <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white mt-3">
                    YOUR VIP LICENSE KEY
                  </h2>
                  <p className="text-sm text-slate-300 mt-1.5">
                    Thank you for your purchase! Copy your key below or download your official invoice.
                  </p>
                </div>

                {/* Key Reveal Card or Out-of-stock Notice */}
                {dispensedKey ? (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 to-slate-900/90 border border-cyan-500/40 space-y-4 shadow-2xl text-left">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                      License Key ({plan?.label} Access):
                    </span>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-cyan-500/30">
                      <span className="font-mono font-black text-base sm:text-lg text-cyan-300 tracking-wider select-all break-all">
                        {dispensedKey}
                      </span>
                      <button
                        onClick={() => handleCopyText(dispensedKey, 'dispensed-key')}
                        className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 ml-3"
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
                ) : (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 border border-amber-500/40 space-y-3 shadow-2xl text-left">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>Key Bank Stock Notice</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your payment of <strong>Rs. {finalLkr} LKR</strong> (Transaction ID: <code className="text-cyan-300 font-mono font-bold">{verifiedTxnData?.transaction_number}</code>) is <strong>100% verified and recorded</strong> in our database!
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Key Bank is currently awaiting manual key restocking for <strong>{plan?.label}</strong>. Please click the button below to message Admin on WhatsApp with your verified Transaction ID for priority key delivery!
                    </p>
                    <button
                      onClick={() => {
                        const msg = `Hello Admin! My bank transfer of Rs. ${finalLkr} for ${itemName} is 100% AI-Verified (Txn ID: ${verifiedTxnData?.transaction_number}). Key Bank was out of stock. Please dispatch my VIP Key!`;
                        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-outfit font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-950" />
                      <span>CLAIM VIP KEY VIA WHATSAPP (TXN: {verifiedTxnData?.transaction_number})</span>
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={handleDownloadPdfInvoice}
                    className="py-3.5 px-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Invoice (PDF)</span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-slate-950 font-outfit font-extrabold text-xs tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span>GO TO VIP DASHBOARD</span>
                  </button>
                </div>
              </div>
            ) : (
              
              /* 2-COLUMN PROFESSIONAL CHECKOUT LAYOUT */
              <div className="space-y-6">
                
                {/* PAYMENT METHOD SELECTOR TABS */}
                <div className="space-y-2">
                  <label className="text-xs font-outfit font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" /> SELECT PAYMENT / CHECKOUT METHOD:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      const isSelected = selectedMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.01]'
                              : 'bg-[var(--bg-subtle)] border-[var(--border-color)] hover:border-white/20'
                          } ${!m.available ? 'opacity-85' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-outfit font-bold text-xs text-white">
                                {m.title}
                              </span>
                            </div>

                            <span
                              className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border shrink-0"
                              style={{
                                backgroundColor: `${m.badgeColor}20`,
                                color: m.badgeColor,
                                borderColor: `${m.badgeColor}40`
                              }}
                            >
                              {m.badge}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2-COLUMN ORDER DETAILS & SELECTED FLOW */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2 border-t border-[var(--border-color)]">
                  
                  {/* LEFT COLUMN: ORDER SUMMARY & PROMO (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                          {panelType.toUpperCase()} VIP
                        </span>
                        {originalPrices && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3 h-3" /> DISCOUNT APPLIED
                          </span>
                        )}
                      </div>
                      <h2 className="font-outfit font-black text-2xl sm:text-3xl text-[var(--text-heading)] tracking-tight leading-tight">
                        {itemName}
                      </h2>
                    </div>

                    {/* Order Details Card */}
                    <div className="p-5 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-inter">
                        <span className="text-[var(--text-muted)] font-medium">Selected Item:</span>
                        <span className="font-outfit font-bold text-[var(--text-heading)] text-right">{itemName}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-inter">
                        <span className="text-[var(--text-muted)] font-medium">Platform:</span>
                        <span className="font-outfit font-bold px-2.5 py-0.5 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4]">
                          {platform}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-inter">
                        <span className="text-[var(--text-muted)] font-medium">License Duration:</span>
                        <span className="font-outfit font-bold text-[var(--text-heading)]">{plan?.days || plan?.label}</span>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-[var(--border-color)] pt-3 flex items-baseline justify-between">
                        <div>
                          <span className="font-outfit font-black text-sm text-[var(--text-heading)] block">Total Payable:</span>
                          {savingsPrices && (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3" /> Saved {savingsPrices.usd} (LKR {savingsPrices.lkr})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-outfit font-black text-2xl sm:text-3xl text-cyan-400">
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

                    {/* Promo Code Box */}
                    <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/20 via-[var(--bg-subtle)] to-purple-950/20 border border-cyan-500/20 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-outfit font-bold text-[var(--text-heading)] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-400" /> Have a Promo Code?
                        </span>
                      </div>

                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
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
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 uppercase shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => applyCoupon(promoInput)}
                            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-outfit font-black text-xs shadow-md transition-colors shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {promoError && (
                        <p className="text-[11px] text-rose-400 font-medium">{promoError}</p>
                      )}
                    </div>

                    {/* Trust & Safety Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="text-left">
                          <span className="font-outfit font-bold text-[11px] text-white block">100% Anti-Ban</span>
                          <span className="text-[9px] text-slate-400 block">Tested & Safe</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="text-left">
                          <span className="font-outfit font-bold text-[11px] text-white block">24/7 Support</span>
                          <span className="text-[9px] text-slate-400 block">Discord & WhatsApp</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: DYNAMIC ACCORDING TO SELECTED PAYMENT METHOD (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* FLOW A: UPLOAD RECEIPT & GET INSTANT KEY */}
                    {selectedMethod === 'ai_upload' && (
                      <div className="space-y-4">
                        {/* Gateway / Bank Selector */}
                        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-3.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-outfit font-bold text-cyan-300 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-cyan-400" /> 1. Select Payment Gateway / Bank:
                              </span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                                {currentBeneficiary.gateway_type || 'Bank Transfer'}
                              </span>
                            </label>

                            <div className="relative">
                              <select
                                value={selectedBeneficiaryId}
                                onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                                className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-950 border border-cyan-500/40 text-xs font-outfit font-bold text-cyan-200 outline-none focus:border-cyan-400 cursor-pointer pr-10 shadow-inner"
                              >
                                {beneficiaries.map((b, idx) => (
                                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                    {b.gateway_label || `Payment Gateway ${idx + 1} (${b.bank_name})`}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Copyable Bank Details Grid */}
                          {currentBeneficiary && (
                            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">Bank Name</span>
                                    <span className="font-bold text-white text-xs">{currentBeneficiary.bank_name}</span>
                                  </div>
                                  <button type="button" onClick={() => handleCopyText(currentBeneficiary.bank_name, 'bank')} className="p-1 text-slate-400 hover:text-cyan-400">
                                    {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">Account Name</span>
                                    <span className="font-bold text-slate-200 text-xs truncate max-w-[140px] block">{currentBeneficiary.owner_name}</span>
                                  </div>
                                  <button type="button" onClick={() => handleCopyText(currentBeneficiary.owner_name, 'name')} className="p-1 text-slate-400 hover:text-cyan-400">
                                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40">
                                <div>
                                  <span className="text-[10px] text-cyan-300 font-bold uppercase block">Account Number</span>
                                  <span className="font-mono font-black text-base text-cyan-300">{currentBeneficiary.account_number}</span>
                                </div>
                                <button type="button" onClick={() => handleCopyText(currentBeneficiary.account_number, 'acc')} className="px-3 py-1.5 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 text-xs font-bold transition-colors">
                                  {copiedField === 'acc' ? 'Copied ✔' : 'Copy Acc No'}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const fullDetails = `Bank Name: ${currentBeneficiary.bank_name}\nAccount Name: ${currentBeneficiary.owner_name}\nAccount Number: ${currentBeneficiary.account_number}\nBranch: ${currentBeneficiary.branch_name || 'Main Branch'}\nAmount: Rs. ${prices.lkr}`;
                                  handleCopyText(fullDetails, 'full');
                                }}
                                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-outfit font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                              >
                                {copiedField === 'full' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                                <span>{copiedField === 'full' ? 'Full Bank Details Copied!' : 'Copy Full Bank Details (1-Click)'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Slip Upload & Automated AI Delivery */}
                        <div className="p-5 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3.5 shadow-inner">
                          <label className="text-xs font-outfit font-bold text-[var(--text-heading)] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Upload className="w-4 h-4 text-cyan-400" /> 2. Upload Deposit Slip / Screenshot:
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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
                              className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/15 hover:bg-cyan-950/25 text-center cursor-pointer transition-all space-y-2 group"
                            >
                              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="font-outfit font-bold text-xs text-white">
                                  Click or Drag to Upload Bank Slip Photo
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Supports ComBank Q+, BOC SmartPay, CDM slips, and Camera photos
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3">
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
                                <div className="relative rounded-xl overflow-hidden max-h-48 border border-white/10 bg-slate-950 flex items-center justify-center">
                                  <img src={slipPreview} alt="Slip Preview" className="max-h-48 object-contain" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Scanning Animation */}
                          {(verifyStatus === 'scanning' || verifyStatus === 'dispensing') && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border border-cyan-400 shadow-2xl space-y-2.5 text-center animate-pulse">
                              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
                              <div className="font-outfit font-black text-xs text-cyan-300 uppercase tracking-wider">
                                {verifyStatus === 'scanning' ? 'Scanning Slip with Gemini Vision AI...' : 'Verifying & Dispensing VIP License Key...'}
                              </div>
                              <div className="text-[11px] text-slate-300">
                                Matching amount (Rs. {finalLkr}), bank name, and reference ID...
                              </div>
                            </div>
                          )}

                          {/* Verification Error Box */}
                          {verifyStatus === 'failed' && (
                            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-left space-y-2">
                              <div className="flex items-start gap-2 text-rose-300 text-xs font-bold">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span>{verifyError}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <button
                            onClick={handleVerifySlipAndDeliver}
                            disabled={!slipFile || verifyStatus === 'scanning' || verifyStatus === 'dispensing'}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-outfit font-black text-sm tracking-wide text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-5 h-5 text-slate-950" />
                            <span>⚡ VERIFY SLIP & GET INSTANT VIP KEY</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FLOW B: ORDER VIA WHATSAPP */}
                    {selectedMethod === 'whatsapp' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-outfit font-bold text-emerald-300 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-emerald-400" /> Select Admin Payment Gateway:
                              </span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                                WHATSAPP ORDER
                              </span>
                            </label>

                            <div className="relative">
                              <select
                                value={selectedBeneficiaryId}
                                onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                                className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs font-outfit font-bold text-emerald-200 outline-none focus:border-emerald-400 cursor-pointer pr-10 shadow-inner"
                              >
                                {beneficiaries.map((b, idx) => (
                                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                    {b.gateway_label || `Payment Gateway ${idx + 1} (${b.bank_name})`}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Bank Details */}
                          {currentBeneficiary && (
                            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">Bank Name</span>
                                    <span className="font-bold text-white text-xs">{currentBeneficiary.bank_name}</span>
                                  </div>
                                  <button type="button" onClick={() => handleCopyText(currentBeneficiary.bank_name, 'bank')} className="p-1 text-slate-400 hover:text-emerald-400">
                                    {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">Account Name</span>
                                    <span className="font-bold text-slate-200 text-xs truncate max-w-[140px] block">{currentBeneficiary.owner_name}</span>
                                  </div>
                                  <button type="button" onClick={() => handleCopyText(currentBeneficiary.owner_name, 'name')} className="p-1 text-slate-400 hover:text-emerald-400">
                                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
                                <div>
                                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Account Number</span>
                                  <span className="font-mono font-black text-base text-emerald-300">{currentBeneficiary.account_number}</span>
                                </div>
                                <button type="button" onClick={() => handleCopyText(currentBeneficiary.account_number, 'acc')} className="px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 text-xs font-bold transition-colors">
                                  {copiedField === 'acc' ? 'Copied ✔' : 'Copy Acc No'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <button
                            onClick={handleProceedWhatsAppOrder}
                            type="button"
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-sm tracking-wide text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02] transition-all"
                          >
                            <MessageCircle className="w-5 h-5 text-slate-950" />
                            <span>💬 PROCEED TO WHATSAPP (+94 761 386 077)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FLOW C, D, E: COMING SOON PAYMENT METHODS */}
                    {(selectedMethod === 'crypto' || selectedMethod === 'card' || selectedMethod === 'wallet') && (
                      <div className="p-8 rounded-3xl bg-[var(--bg-subtle)] border border-purple-500/30 text-center space-y-4 shadow-xl animate-in fade-in duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                          <Lock className="w-8 h-8 animate-pulse" />
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            COMING SOON IN NEXT UPDATE
                          </span>
                          <h3 className="font-outfit font-black text-xl text-white mt-2">
                            Automated {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.title}
                          </h3>
                          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                            This automated gateway is currently in final testing. For instant key delivery, please use <strong>"Upload Receipt & Get Instant Key"</strong> or <strong>"Order Via WhatsApp"</strong>.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                          <button
                            onClick={() => setSelectedMethod('ai_upload')}
                            className="py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-outfit font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Use Instant AI Bank Slip</span>
                          </button>

                          <button
                            onClick={() => setSelectedMethod('whatsapp')}
                            className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-outfit font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Order Via WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
