import React from 'react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 liquid-bg relative overflow-hidden">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10"></div>
      <div className="absolute bottom-1/3 left-1/4 w-[25vw] h-[25vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10" style={{ animationDelay: '-3s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">

        {/* Block 1: Left image, Right text */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="liquid-card p-1"
          >
            <div className="w-full h-full rounded-[28px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80"
                alt="PRRX Login Panel"
                className="w-full h-auto hover:scale-110 transition-transform duration-700"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-6 tracking-wide">
              Engineered for <span className="text-[#00d4ff] glow-cyan">speed</span>
            </h2>
            <p className="font-inter text-gray-300 leading-relaxed text-base mb-4">
              Built with an optimized UI structure, lightweight assets, and efficient workflows to ensure maximum speed, stability, and usability. Modern liquid interface engineered for fast response and smooth navigation.
            </p>
            <p className="font-inter text-gray-400 leading-relaxed text-sm">
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
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-6 tracking-wide">
              Designed for speed. <span className="text-[#ff00ff] glow-magenta">Built for control.</span>
            </h2>
            <p className="font-inter text-gray-300 leading-relaxed text-base mb-4">
              The optimized system design reduces visual clutter, improves performance, and delivers a reliable, high-speed experience across all devices.
            </p>
            <p className="font-inter text-gray-400 leading-relaxed text-sm">
              From Aimbot to ESP, every toggle works instantly. Trusted by thousands of Free Fire players worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 liquid-card p-1"
          >
            <div className="w-full h-full rounded-[28px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                alt="PRRX App Panel"
                className="w-full h-auto hover:scale-110 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}