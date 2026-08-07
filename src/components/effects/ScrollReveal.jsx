import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  fadeUp:    { hidden: { opacity: 0, y: 50 },           visible: { opacity: 1, y: 0 } },
  fadeDown:  { hidden: { opacity: 0, y: -40 },          visible: { opacity: 1, y: 0 } },
  fadeLeft:  { hidden: { opacity: 0, x: -60 },          visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 60 },           visible: { opacity: 1, x: 0 } },
  zoomIn:    { hidden: { opacity: 0, scale: 0.85 },     visible: { opacity: 1, scale: 1 } },
  fadeIn:    { hidden: { opacity: 0 },                  visible: { opacity: 1 } },
};

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.65,
  className = '',
  once = true,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}