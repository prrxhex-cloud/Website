import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle, Tag, Check, Sparkles, AlertCircle, LogIn, UserCheck } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const WHATSAPP_NUMBER = '94761386077';

// Built-in standard promo codes for instant fallback validation
const STANDARD_PROMO_CODES = {
  'PRRX20': { type: 'percentage', value: 20, desc: '20% OFF Special VIP Promo' },
  'VIP10': { type: 'percentage', value: 10, desc: '10% OFF VIP Member Discount' },
  'HEX50': { type: 'percentage', value: 50, desc: '50% OFF Mega Flash Sale' },
  'SPECIAL30': { type: 'percentage', value: 30, desc: '30% OFF Limited Time Offer' },
  'WELCOME': { type: 'fixed', value: 300, desc: 'LKR 300 Welcome Bonus' }
};

export default function BuyModal({ plan, panelType = 'external', isOpen, onClose, discounts = [], initialPromoCode = '' }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedGateway, setSelectedGateway] = useState('whatsapp');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Pre-fill initial promo code if passed from banner
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

    // 1. Check in dynamic Firestore discounts
    const discList = Array.isArray(discounts) ? discounts : [];
    const firestoreMatch = discList.find(d => {
      if (!d || !d.active) return false;
      if (d.expires_at && new Date(d.expires_at) < new Date()) return false;
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

    // 2. Check in standard fallback promo codes
    if (STANDARD_PROMO_CODES[rawCode]) {
      const match = STANDARD_PROMO_CODES[rawCode];
      setAppliedPromo({
        code: rawCode,
        type: match.type,
        value: match.value,
        desc: match.desc
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

  // Base plan price before manual coupon
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
  const itemName = `PRRX ${panelType === 'internal' ? 'Internal' : 'External'} Panel — ${plan?.label || 'VIP Plan'}`;

  const handleGetLicenseKey = () => {
    if (selectedGateway !== 'whatsapp') return;

    let discountDetailsText = '';
    if (activeDiscountInfo && savingsPrices) {
      discountDetailsText = `\n🏷️ Applied Promo: ${activeDiscountInfo.promo_code || 'SEASONAL SALE'} (${activeDiscountInfo.discount_value}${activeDiscountInfo.discount_type === 'percentage' ? '%' : ' LKR'} OFF)\n💵 Original Price: ${originalPrices?.usd} (LKR ${originalPrices?.lkr})\n🎉 Total Saved: ${savingsPrices.usd} (LKR ${savingsPrices.lkr})\n`;
    }

    const userDetailsText = user ? `\n👤 VIP Member Account: ${user.email} (${user.displayName || 'VIP Member'})\n` : '';

    const message = `Hello PRRX HEX Admin! I want to buy a VIP License Key.
${userDetailsText}
🛒 Selected Item: ${itemName}
💻 Platform Support: ${platform}
⏱️ License Duration: ${plan?.days || plan?.label || 'Access'}${discountDetailsText}
💰 Final Amount: ${prices.usd} (LKR ${prices.lkr})
💳 Payment Gateway: Direct Bank Slip Upload to WhatsApp

Please provide bank transfer details & process my key order!`;

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
                      placeholder="e.g. PRRX20, VIP10"
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

            {/* Select Payment Gateway */}
            <div className="space-y-2">
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
