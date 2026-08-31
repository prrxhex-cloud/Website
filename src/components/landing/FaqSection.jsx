import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ShieldCheck, Zap, Monitor, Lock, RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'Is PRRX HEX 100% safe from Garena anti-cheat bans?',
    a: 'Yes. PRRX HEX incorporates dynamic binary polymorphism and kernel-level memory cloaking. Our hooks operate outside of Garena\'s userland memory scanner space. Furthermore, our Live Anti-Cheat Radar Sentinel continuously probes Garena game patches every 30 seconds to guarantee safety before you launch the panel.',
    icon: ShieldCheck,
    tag: 'Security & Anti-Ban'
  },
  {
    q: 'Which Windows versions and emulators are supported?',
    a: 'PRRX HEX is engineered exclusively for 64-bit Windows 10 and Windows 11. It supports all leading Free Fire emulators including SmartGaaga 1.1 / 3.2, LDPlayer 9 / 4, Bluestacks 5 / 4 (Pie 64 & Nougat 32), and MSI App Player running Free Fire v7a 32-bit APK.',
    icon: Monitor,
    tag: 'Platform & Compatibility'
  },
  {
    q: 'How fast is license key delivery after bank or slip payment?',
    a: 'Key dispensing is fully automated via our sub-second Supabase cryptographic key dispenser. Once your payment receipt is verified through our AI OCR scanner, your license key is unlocked and delivered on your screen in under 10 seconds.',
    icon: Zap,
    tag: 'Automated Delivery'
  },
  {
    q: 'What is the difference between the External and Internal Panel?',
    a: 'The External Panel operates as an undetected floating Windows overlay without modifying original game files, ideal for safe ranked climbing. The Internal Panel executes direct memory bytecode injection with silent aimbot, instant magic bullet, and customizable memory offsets for aggressive competitive gameplay.',
    icon: Lock,
    tag: 'Panel Architecture'
  },
  {
    q: 'How do I receive updates when a new Free Fire game patch drops?',
    a: 'Updates are 100% automated and cloud-synced. When Garena releases an OB update (e.g. OB46 / OB47), our team patches the memory offsets within 1-2 hours. Your panel automatically checks our cloud server upon launch and downloads the newest build without requiring manual re-installation.',
    icon: RefreshCw,
    tag: 'Auto Cloud Updates'
  },
  {
    q: 'Where can I get help if I encounter an emulator configuration issue?',
    a: 'You have access to 24/7 dedicated support via our AI Support Assistant (available in the bottom-right corner of our website) and our 15,000+ member official Discord server with 1-on-1 staff ticketing.',
    icon: MessageSquare,
    tag: 'Customer Support'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-outfit font-extrabold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>KNOWLEDGE BASE & SUPPORT</span>
          </div>

          <h2 className="font-outfit font-black text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight uppercase">
            FREQUENTLY ASKED <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">QUESTIONS</span>
          </h2>

          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about PRRX HEX bypass technology, emulator compatibility, key activation, and account security.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const IconComp = faq.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-[var(--bg-card)] border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                    : 'bg-[var(--bg-subtle)]/60 border-[var(--border-color)] hover:border-cyan-500/20'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 outline-none select-none group"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none transition-colors ${
                      isOpen 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] group-hover:text-cyan-400'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-outfit font-extrabold uppercase tracking-wider text-cyan-400 block">
                        {faq.tag}
                      </span>
                      <h3 className="font-outfit font-bold text-sm sm:text-base text-[var(--text-heading)] group-hover:text-cyan-400 transition-colors">
                        {faq.q}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-none transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-cyan-500/20 text-cyan-400' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-color)]/50 mt-1 font-inter">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-outfit font-bold text-sm text-[var(--text-heading)]">Still have questions before purchasing?</h4>
            <p className="text-xs text-[var(--text-muted)]">Our support engineers and AI assistant are active 24/7 on Discord and WhatsApp.</p>
          </div>
          <div className="flex items-center gap-3 flex-none">
            <Link
              to="/prices"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-outfit font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105"
            >
              Browse Plans
            </Link>
            <a
              href="https://discord.gg/D2nCuvyE4t"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-outfit font-bold text-xs transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
