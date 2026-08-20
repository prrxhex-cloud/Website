import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle, Tag, Check, Sparkles, AlertCircle, LogIn, Building, Copy, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_BENEFICIARIES } from '@/components/dashboard/BeneficiaryAccountsTab';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '94761386077';

export default function BuyModal({ plan, panelType = 'external', isOpen, onClose, discounts = [], initialPromoCode = '' }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedGateway, setSelectedGateway] = useState('whatsapp');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Load Beneficiary Accounts / Payment Gateways from Firestore
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
          // Fallback to default beneficiaries
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

  // Pre-fill initial promo code if passed from banner and valid
  useEffect(() => {
    if (initialPromoCode && isOpen) {
      setPromoInput(initialPromoCode);
      applyCoupon(initialPromoCode);
    } else if (!isOpen) {
      setAppliedPromo(null);
      setPromoInput('');
      setPromoError('');
    }
  }, [initialPromoCode, isOpen]);

  const applyCoupon = (codeToApply) => {
    const rawCode = (codeToApply || promoInput || '').trim().toUpperCase();
    setPromoError('');

    if (!rawCode) {
      setPromoError('Please enter a valid promo code.');
      return;
    }

    // Check dynamic Firestore discounts
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

  // Calculate final discounted price based on plan discount OR applied promo coupon
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

  const handleGetLicenseKey = () => {
    if (selectedGateway !== 'whatsapp') return;

    let discountDetailsText = '';
    if (activeDiscountInfo && savingsPrices) {
      discountDetailsText = `\n🏷️ Applied Promo: ${activeDiscountInfo.promo_code || 'SEASONAL SALE'} (${activeDiscountInfo.discount_value}${activeDiscountInfo.discount_type === 'percentage' ? '%' : ' LKR'} OFF)\n💵 Original Price: ${originalPrices?.usd} (LKR ${originalPrices?.lkr})\n🎉 Total Saved: ${savingsPrices.usd} (LKR ${savingsPrices.lkr})\n`;
    }

    const userDetailsText = user ? `\n👤 VIP Member Account: ${user.email} (${user.displayName || 'VIP Member'})\n` : '';

    const bankDetailsText = currentBeneficiary ? `\n🏦 Payment Gateway: ${currentBeneficiary.gateway_label || 'Direct Bank Transfer'}\n🏢 Bank: ${currentBeneficiary.bank_name}\n👤 Account Name: ${currentBeneficiary.owner_name}\n💳 Account No: ${currentBeneficiary.account_number}\n📍 Branch: ${currentBeneficiary.branch_name || 'Main Branch'}\n` : '';

    const message = `Hello PRRX HEX Admin! I want to buy a VIP License Key.
${userDetailsText}
🛒 Selected Item: ${itemName}
💻 Platform Support: ${platform}
⏱️ License Duration: ${plan?.days || plan?.label || 'Access'}${discountDetailsText}
💰 Final Amount: ${prices.usd} (LKR ${prices.lkr})
${bankDetailsText}
I have transferred to your bank account and attached the bank deposit slip photo below. Please verify and send my VIP Key!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const paymentGateways = [
    {
      id: 'whatsapp',
      name: 'Direct Bank Slip Upload to WhatsApp',
      icon: MessageCircle,
      tag: 'INSTANT PROCESSING',
      tagColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      available: true,
    },
    {
      id: 'crypto',
      name: 'Crypto (USDT/BTC/LTC)',
      icon: Coins,
      tag: 'Coming Soon',
      tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      available: false,
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      icon: CreditCard,
      tag: 'Coming Soon',
      tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      available: false,
    },
    {
      id: 'upi',
      name: 'UPI / GPay / Paytm',
      icon: QrCode,
      tag: 'Coming Soon',
      tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      available: false,
    },
  ];

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
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden max-h-[92vh] flex flex-col justify-between"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5 overflow-y-auto pr-1">
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
                Instant Key Delivery & 24/7 VIP Support Guaranteed
              </p>
            </div>

            {/* Selected Item Summary Box */}
            <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs font-inter">
                <span className="text-[var(--text-muted)] font-medium">Selected Item:</span>
                <span className="font-outfit font-bold text-[var(--text-heading)] text-right">{itemName}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-inter">
                <span className="text-[var(--text-muted)] font-medium">Platform Support:</span>
                <span className="font-outfit font-bold px-2.5 py-0.5 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4]">
                  {platform}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-inter">
                <span className="text-[var(--text-muted)] font-medium">License Duration:</span>
                <span className="font-outfit font-bold text-[var(--text-heading)]">{plan?.days || plan?.label}</span>
              </div>

              {/* Price & Savings Breakdown */}
              <div className="border-t border-[var(--border-color)] pt-3 flex items-baseline justify-between">
                <div>
                  <span className="font-outfit font-extrabold text-sm text-[var(--text-heading)] block">Total Amount:</span>
                  {savingsPrices && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> You Saved {savingsPrices.usd} (LKR {savingsPrices.lkr})
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-outfit font-black text-2xl sm:text-3xl text-[#06b6d4]">
                    {prices.usd}
                  </span>
                  <div className="font-inter text-xs text-[var(--text-muted)] font-bold">
                    LKR {prices.lkr}
                  </div>
                  {originalPrices && (
                    <div className="font-inter text-[11px] line-through text-rose-400 font-semibold mt-0.5">
                      {originalPrices.usd} (LKR {originalPrices.lkr})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Promo Code Input Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[var(--bg-subtle)] to-purple-950/40 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-outfit font-bold text-[var(--text-heading)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" /> Have a Promo Code?
                </span>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login?redirect=/prices')}
                    className="text-[11px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <LogIn className="w-3 h-3" /> Sign in for VIP discounts
                  </button>
                )}
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Coupon "{appliedPromo.code}" Applied: {appliedPromo.desc}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-2 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. VIP DISCOUNT CODE"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon(promoInput)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-outfit font-extrabold text-xs shadow-md transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {promoError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Select Payment Gateway Options */}
            <div className="space-y-3">
              <label className="text-xs font-outfit font-bold text-[var(--text-heading)] block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {paymentGateways.map((gw) => {
                  const Icon = gw.icon;
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <div
                      key={gw.id}
                      onClick={() => gw.available && setSelectedGateway(gw.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        !gw.available 
                          ? 'opacity-60 bg-[var(--bg-subtle)] border-[var(--border-color)] cursor-not-allowed' 
                          : isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-outfit font-bold text-xs text-[var(--text-heading)]">
                            {gw.name}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${gw.tagColor}`}>
                        {gw.tag}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* PAYMENT GATEWAY DROPDOWN & ADMIN'S BANK DETAILS BOX */}
              {selectedGateway === 'whatsapp' && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-cyan-500/40 shadow-xl space-y-3.5 animate-fadeIn">
                  
                  {/* Dropdown Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-outfit font-bold text-cyan-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-cyan-400" /> Choose Payment Gateway (Bank Account):
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal font-mono">
                        {beneficiaries.length} Accounts Available
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

                  {/* Copyable Bank Details Box */}
                  {currentBeneficiary && (
                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-outfit font-extrabold text-[11px] text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ADMIN BENEFICIARY DETAILS
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {currentBeneficiary.gateway_type || 'Bank Transfer'}
                        </span>
                      </div>

                      {/* Bank Name */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400 font-medium">Bank Name:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-right">{currentBeneficiary.bank_name}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentBeneficiary.bank_name, 'bank')}
                            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                            title="Copy Bank Name"
                          >
                            {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Account Holder Name */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400 font-medium">Name:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-right">{currentBeneficiary.owner_name}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentBeneficiary.owner_name, 'name')}
                            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                            title="Copy Account Holder Name"
                          >
                            {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Account Number (Highlight Box) */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40">
                        <span className="text-cyan-300 font-bold">Acc No.:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-cyan-300 tracking-wider">
                            {currentBeneficiary.account_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentBeneficiary.account_number, 'acc')}
                            className="p-1 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 transition-all flex items-center gap-1 text-[11px] font-bold px-2 py-0.5"
                            title="Copy Account Number"
                          >
                            {copiedField === 'acc' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Branch */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400 font-medium">Branch:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-right">{currentBeneficiary.branch_name || 'Main Branch'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentBeneficiary.branch_name, 'branch')}
                            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                            title="Copy Branch Name"
                          >
                            {copiedField === 'branch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Copy Full Bank Details Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const fullDetails = `Bank Name: ${currentBeneficiary.bank_name}\nAccount Name: ${currentBeneficiary.owner_name}\nAccount Number: ${currentBeneficiary.account_number}\nBranch: ${currentBeneficiary.branch_name || 'Main Branch'}\nAmount: Rs. ${prices.lkr}`;
                          handleCopyText(fullDetails, 'full');
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-outfit font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {copiedField === 'full' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Full Bank Details Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-cyan-400" />
                            <span>Copy Full Bank Details</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    💡 Transfer <strong className="text-cyan-300">Rs. {prices.lkr}</strong> to the account above, then click below to send your slip photo on WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Checkout CTA */}
          <div className="pt-4 border-t border-[var(--border-color)] mt-4">
            <button
              onClick={handleGetLicenseKey}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-outfit font-extrabold text-sm tracking-wide text-center flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>CONTINUE TO WHATSAPP TO GET KEY</span>
            </button>
            <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
              🔒 Safe & Verified • Key Delivery in 1–5 Minutes via WhatsApp Slip Confirmation
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
