import React, { useRef } from 'react';

export default function InteractiveCard({ children, className = '', style = {} }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,212,255,0.12) 0%, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (card) card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    if (glow) glow.style.background = 'transparent';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-100 ${className}`}
      style={{ willChange: 'transform', ...style }}
    >
      <div ref={glowRef} className="absolute inset-0 pointer-events-none rounded-xl z-10 transition-all duration-200" />
      {children}
    </div>
  );
}