import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  fadeUp:    { hidden: { opacity: 0, y: 60, scale: 0.96 },   visible: { opacity: 1, y: 0, scale: 1 } },
  fadeDown:  { hidden: { opacity: 0, y: -50, scale: 0.96 },  visible: { opacity: 1, y: 0, scale: 1 } },
  fadeLeft:  { hidden: { opacity: 0, x: -80, scale: 0.95 },  visible: { opacity: 1, x: 0, scale: 1 } },
  fadeRight: { hidden: { opacity: 0, x: 80, scale: 0.95 },   visible: { opacity: 1, x: 0, scale: 1 } },
  zoomIn:    { hidden: { opacity: 0, scale: 0.8 },           visible: { opacity: 1, scale: 1 } },
  fadeIn:    { hidden: { opacity: 0 },                        visible: { opacity: 1 } },
};

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  once = false, // Set once to false so cool animations re-trigger when scrolling!
}) {
  const selectedVariant = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={selectedVariant}
      transition={{ 
        duration, 
        delay, 
        ease: [0.22, 1, 0.36, 1],
        type: 'spring',
        damping: 22,
        stiffness: 110
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}