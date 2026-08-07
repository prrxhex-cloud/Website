import React from 'react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-20">

        {/* Block 1: Left image, Right text */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="clean-card p-3 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md"
          >
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80"
                alt="PRRX Login Panel"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-left"
          >
            <div className="sub-heading">PERFORMANCE FIRST</div>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
              Engineered for <span className="text-[#06b6d4]">maximum speed</span>
            </h2>
            <p className="font-inter text-[var(--text-muted)] leading-relaxed text-sm">
              Built with an optimized UI structure, lightweight assets, and efficient workflows to ensure maximum speed, stability, and usability. Modern interface engineered for fast response and smooth navigation.
            </p>
            <p className="font-inter text-[var(--text-muted)] leading-relaxed text-xs opacity-80">
              Every feature is crafted to respond instantly — from key verification to in-game activation. Zero lag, zero delay.
            </p>
          </motion.div>
        </div>

        {/* Block 2: Left text, Right image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1 space-y-4 text-left"
          >
            <div className="sub-heading">COMPLETE CONTROL</div>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
              Designed for speed. <span className="text-violet-400">Built for total control.</span>
            </h2>
            <p className="font-inter text-[var(--text-muted)] leading-relaxed text-sm">
              The optimized system design reduces visual clutter, improves performance, and delivers a reliable, high-speed experience across all devices.
            </p>
            <p className="font-inter text-[var(--text-muted)] leading-relaxed text-xs opacity-80">
              From Aimbot to ESP, every toggle works instantly. Trusted by thousands of Free Fire players worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 clean-card p-3 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md"
          >
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                alt="PRRX App Panel"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}