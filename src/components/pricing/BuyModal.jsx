import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Coins, CreditCard, QrCode, MessageCircle } from 'lucide-react';
import { getFormattedPrices } from '@/lib/currency';

const WHATSAPP_NUMBER = '94761386077';

export default function BuyModal({ plan, panelType, isOpen, onClose }) {
  const [selectedGateway, setSelectedGateway] = useState('whatsapp');

  if (!isOpen || !plan) return null;

  const prices = getFormattedPrices(plan.lkr);
  const originalPrices = plan.originalLkr ? getFormattedPrices(plan.originalLkr) : null;
  const platform = panelType === 'internal' ? 'Android APK / Windows 10/11' : 'Windows 10/11';
  const itemName = `PRRX ${panelType === 'internal' ? 'Internal' : 'External'} Panel — ${plan.label}`;

  const handleGetLicenseKey = () => {
    if (selectedGateway !== 'whatsapp') return;

    const message = `Hello PRRX HEX Admin! I want to buy a VIP License Key.

🛒 Selected Item: ${itemName}
💻 Platform Support: ${platform}
⏱️ License Duration: ${plan.days || plan.label}
💵 Total Amount: ${prices.usd} (LKR ${prices.lkr})
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

        {/* Modal Window matching screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden max-h-[90vh] flex flex-col justify-between"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6 overflow-y-auto pr-1">
            {/* Header */}
            <div>
              <h2 className="font-outfit font-black text-2xl sm:text-3xl text-[var(--text-heading)] tracking-tight">
                {itemName}
              </h2>
              <p className="font-inter text-xs text-[#06b6d4] font-bold mt-1">
                Instant Key Delivery Guaranteed
              </p>
            </div>

            {/* Selected Item Box (Matching Screenshot) */}
            <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3.5 shadow-inner">
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

              <div className="border-t border-[var(--border-color)] pt-3 flex items-baseline justify-between">
                <span className="font-outfit font-extrabold text-sm text-[var(--text-heading)]">Total Amount:</span>
                <div className="text-right">
                  <div className="font-outfit font-black text-3xl text-[#06b6d4]">
                    {prices.usd}
                  </div>
                  <div className="font-inter text-xs font-bold text-[var(--text-muted)]">
                    (LKR {prices.lkr})
                  </div>
                  {originalPrices && (
                    <div className="font-inter text-[11px] line-through text-rose-400 mt-0.5">
                      {originalPrices.usd} (LKR {originalPrices.lkr})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Select Payment Gateway Options (Matching Screenshot) */}
            <div className="space-y-3">
              <label className="block font-outfit font-extrabold text-sm text-[var(--text-heading)]">
                Select Payment Gateway:
              </label>

              <div className="space-y-2.5">
                {paymentGateways.map((gw) => {
                  const Icon = gw.icon;
                  const isSelected = selectedGateway === gw.id;

                  return (
                    <div
                      key={gw.id}
                      onClick={() => gw.available && setSelectedGateway(gw.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
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
                        <Icon className="w-5 h-5 text-[#06b6d4]" />
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

          {/* CTA Action Button (GET LICENSE KEY NOW) */}
          <div className="pt-6 border-t border-[var(--border-color)] mt-6">
            <button
              onClick={handleGetLicenseKey}
              className="btn-primary-cyan btn-glow w-full py-4 rounded-2xl font-inter font-bold text-sm flex items-center justify-center gap-3 shadow-lg"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>GET LICENSE KEY NOW</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
