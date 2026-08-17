import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';

const WHATSAPP_NUMBER = '94761386077';

// Built-in standard promo codes for instant fallback validation
const STANDARD_PROMO_CODES = {
  'PRRX20': { type: 'percentage', value: 20, desc: '20% OFF Special VIP Promo' },
  'VIP10': { type: 'percentage', value: 10, desc: '10% OFF VIP Member Discount' },
  'HEX50': { type: 'percentage', value: 50, desc: '50% OFF Mega Flash Sale' },
  'SPECIAL30': { type: 'percentage', value: 30, desc: '30% OFF Limited Time Offer' },
  'WELCOME': { type: 'fixed', value: 300, desc: 'LKR 300 Welcome Bonus' }
};

export default function BuyModal({ plan, panelType, isOpen, onClose, discounts = [], initialPromoCode = '' }) {
  const [selectedGateway, setSelectedGateway] = useState('whatsapp');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Pre-fill initial promo code if passed from banner
  useEffect(() => {
    if (initialPromoCode) {
      setPromoInput(initialPromoCode);
      applyCoupon(initialPromoCode);
    } else {
      setAppliedPromo(null);
      setPromoInput('');
      setPromoError('');
    }
  }, [initialPromoCode, isOpen]);

  if (!isOpen || !plan) return null;

  // Base plan price before manual coupon
  const baseLkr = plan.originalLkr || plan.lkr || 0;
  
  // Calculate final discounted price based on plan discount OR applied promo coupon
  let finalLkr = plan.lkr || baseLkr;
  let activeDiscountInfo = plan.discount || null;

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
  const itemName = `PRRX ${panelType === 'internal' ? 'Internal' : 'External'} Panel — ${plan.label}`;

  const applyCoupon = (codeToApply) => {
    const rawCode = (codeToApply || promoInput).trim().toUpperCase();
    setPromoError('');

    if (!rawCode) {
      setPromoError('Please enter a valid promo code.');
      return;
    }

    // 1. Check in dynamic Firestore discounts
    const firestoreMatch = discounts.find(d => {
      if (!d.active) return false;
      if (d.expires_at && new Date(d.expires_at) < new Date()) return false;
      const codeMatch = d.promo_code && d.promo_code.toUpperCase() === rawCode;
      const panelMatch = d.panel_type === 'both' || d.panel_type === panelType;
      const labelMatch = !d.plan_label || d.plan_label.toLowerCase() === plan.label?.toLowerCase();
      return codeMatch && panelMatch && labelMatch;
    });

    if (firestoreMatch) {
      setAppliedPromo({
        code: rawCode,
        type: firestoreMatch.discount_type || 'percentage',
        value: Number(firestoreMatch.discount_value),
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

  const handleGetLicenseKey = () => {
    if (selectedGateway !== 'whatsapp') return;

    let discountDetailsText = '';
    if (activeDiscountInfo && savingsPrices) {
      discountDetailsText = `\n🏷️ Applied Promo: ${activeDiscountInfo.promo_code || 'SEASONAL SALE'} (${activeDiscountInfo.discount_value}${activeDiscountInfo.discount_type === 'percentage' ? '%' : ' LKR'} OFF)\n💵 Original Price: ${originalPrices?.usd} (LKR ${originalPrices?.lkr})\n🎉 Total Saved: ${savingsPrices.usd} (LKR ${savingsPrices.lkr})\n`;
    }

    const message = `Hello PRRX HEX Admin! I want to buy a VIP License Key.

🛒 Selected Item: ${itemName}
💻 Platform Support: ${platform}
⏱️ License Duration: ${plan.days || plan.label}${discountDetailsText}
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
                <span className="font-outfit font-bold text-[var(--text-heading)]">{plan.days || plan.label}</span>
              </div>

              {/* Price & Savings Breakdown */}
              <div className="border-t border-[var(--border-color)] pt-3 flex items-baseline justify-between">
                <div>
                  <span className="font-outfit font-extrabold text-sm text-[var(--text-heading)] block">Total Amount:</span>
                  {savingsPrices && (
                    <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                      🎉 You Save {savingsPrices.usd} (LKR {savingsPrices.lkr})
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-outfit font-black text-3xl text-[#06b6d4]">
                    {prices.usd}
                  </div>
                  <div className="font-inter text-xs font-bold text-[var(--text-muted)]">
                    (LKR {prices.lkr})
                  </div>
                  {originalPrices && (
                    <div className="font-inter text-[11px] line-through text-rose-400 mt-0.5 font-semibold">
                      {originalPrices.usd} (LKR {originalPrices.lkr})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Promo Code / Coupon Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[var(--bg-subtle)] to-purple-950/20 border border-cyan-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-outfit font-bold text-xs text-[var(--text-heading)]">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HAVE A PROMO CODE / COUPON?</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">INSTANT DISCOUNT</span>
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="font-mono font-extrabold text-xs text-emerald-400">
                        {appliedPromo.code} APPLIED!
                      </div>
                      <div className="text-[10px] text-slate-300">
                        {appliedPromo.desc} ({appliedPromo.type === 'percentage' ? `${appliedPromo.value}% OFF` : `LKR ${appliedPromo.value} OFF`})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter promo code (e.g. PRRX20)"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => applyCoupon()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-outfit font-black text-xs transition-colors shadow-sm"
                  >
                    Apply Code
                  </button>
                </div>
              )}

              {promoError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>

            {/* Select Payment Gateway Options */}
            <div className="space-y-2.5">
              <label className="block font-outfit font-extrabold text-sm text-[var(--text-heading)]">
                Select Payment Gateway:
              </label>

              <div className="space-y-2">
                {paymentGateways.map((gw) => {
                  const Icon = gw.icon;
                  const isSelected = selectedGateway === gw.id;

                  return (
                    <div
                      key={gw.id}
                      onClick={() => gw.available && setSelectedGateway(gw.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        gw.available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      } ${
                        isSelected && gw.available
                          ? 'bg-[#06b6d4]/10 border-[#06b6d4] shadow-sm'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected && gw.available ? 'border-[#06b6d4] bg-[#06b6d4]' : 'border-[var(--border-color)]'
                          }`}
                        >
                          {isSelected && gw.available && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <Icon className="w-4 h-4 text-[#06b6d4]" />
                        <span className="font-inter font-bold text-xs text-[var(--text-heading)]">
                          {gw.name}
                        </span>
                      </div>

                      <span className={`text-[10px] font-outfit font-extrabold px-2.5 py-0.5 rounded-full border ${gw.tagColor}`}>
                        {gw.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="pt-4 border-t border-[var(--border-color)] mt-4">
            <button
              onClick={handleGetLicenseKey}
              className="btn-primary-cyan btn-glow w-full py-3.5 rounded-2xl font-inter font-black text-sm flex items-center justify-center gap-2.5 shadow-lg tracking-wide"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>GET LICENSE KEY NOW ({prices.usd})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
