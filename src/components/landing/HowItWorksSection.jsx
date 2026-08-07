import React from 'react';
import { motion } from 'framer-motion';
import { Download, KeyRound, Gamepad2 } from 'lucide-react';

const steps = [
  {
    icon: Download,
    number: '01',
    title: 'DOWNLOAD PRRX',
    description: 'Download the PRRX HEX Premium installer. Lightweight, fast, and always up to date via the built-in auto-updater.',
  },
  {
    icon: KeyRound,
    number: '02',
    title: 'LOGIN & LICENSE',
    description: 'Enter your Username, Password, and License key. Use Licence Login for instant access to all premium features.',
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
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-card/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-sm font-semibold text-primary uppercase tracking-widest">
            Get Started
          </span>
          <h2 className="font-orbitron font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mt-4 mb-6 tracking-wider">
            UP AND RUNNING IN <span className="text-primary">3 STEPS</span>
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to fully loaded in under 2 minutes. No complicated setup required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center group"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-xl bg-secondary border border-primary/20 mb-8 group-hover:border-primary/60 transition-colors">
                <step.icon className="w-10 h-10 text-primary" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-orbitron font-bold text-xs text-primary-foreground">{step.number}</span>
                </div>
              </div>

              <h3 className="font-orbitron font-bold text-base text-foreground mb-3 tracking-wider">
                {step.title}
              </h3>
              <p className="font-inter text-muted-foreground leading-relaxed max-w-xs mx-auto text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}