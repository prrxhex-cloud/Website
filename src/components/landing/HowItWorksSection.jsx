import React from 'react';
import { motion } from 'framer-motion';
import { Download, KeyRound, Gamepad2 } from 'lucide-react';

const steps = [
  {
    icon: Download,
    number: '01',
    title: 'DOWNLOAD PRRX',
    description: 'Download the PRRX HEX Premium installer. Lightweight, fast, and always up to date via built-in auto-updater.',
  },
  {
    icon: KeyRound,
    number: '02',
    title: 'ACTIVATE LICENSE KEY',
    description: 'Enter your license key in the login tab for instant access to all premium features and bypass modules.',
  },
  {
    icon: Gamepad2,
    number: '03',
    title: 'DOMINATE FREE FIRE',
    description: 'Enable Aimbot, Smooth Aim, ESP, Chams and more. Launch Free Fire and experience the true power of PRRX.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-2"
        >
          <div className="sub-heading">QUICK START</div>
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
            UP AND RUNNING IN <span className="text-[#06b6d4]">3 EASY STEPS</span>
          </h2>
          <p className="font-inter text-[var(--text-muted)] text-sm max-w-xl mx-auto">
            From zero to fully loaded in under 2 minutes. No complicated setup required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="clean-card p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl text-center space-y-4 relative shadow-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center mx-auto relative">
                <step.icon className="w-8 h-8" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#06b6d4] text-white font-outfit text-xs font-bold flex items-center justify-center shadow-sm">
                  {step.number}
                </span>
              </div>

              <h3 className="font-outfit font-extrabold text-lg text-[var(--text-heading)]">
                {step.title}
              </h3>
              <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}