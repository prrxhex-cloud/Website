import React from 'react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Block 1: Left image, Right text */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden border border-primary/20"
            style={{ boxShadow: '0 0 40px rgba(0,212,255,0.07)' }}
          >
            <img
              src="https://media.base44.com/images/public/69bd74c0973937068f242843/8dc2dc44d_Screenshot464.png"
              alt="PRRX Login Panel"
              className="w-full h-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-6 tracking-wide">
              Engineered for <span className="text-primary" style={{ textShadow: '0 0 20px rgba(0,212,255,0.4)' }}>speed</span>
            </h2>
            <p className="font-inter text-muted-foreground leading-relaxed text-base mb-4">
              Built with an optimized UI structure, lightweight assets, and efficient workflows to ensure maximum speed, stability, and usability. Modern dark interface engineered for fast response and smooth navigation.
            </p>
            <p className="font-inter text-muted-foreground leading-relaxed text-sm">
              Every feature is crafted to respond instantly — from login to in-game activation. No lag, no delays.
            </p>
          </motion.div>
        </div>

        {/* Block 2: Left text, Right image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-6 tracking-wide">
              Designed for speed. <span className="text-primary" style={{ textShadow: '0 0 20px rgba(0,212,255,0.4)' }}>Built for control.</span>
            </h2>
            <p className="font-inter text-muted-foreground leading-relaxed text-base mb-4">
              The optimized system design reduces visual clutter, improves performance, and delivers a reliable, high-speed experience across all devices.
            </p>
            <p className="font-inter text-muted-foreground leading-relaxed text-sm">
              From Aimbot to ESP, every toggle works instantly. Trusted by thousands of Free Fire players worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 rounded-2xl overflow-hidden border border-primary/20"
            style={{ boxShadow: '0 0 40px rgba(0,212,255,0.07)' }}
          >
            <img
              src="https://media.base44.com/images/public/69bd74c0973937068f242843/8c61623a7_Screenshot465.png"
              alt="PRRX App Panel"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}