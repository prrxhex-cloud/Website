import React, { useRef, useEffect } from 'react';

// Liquid Glass ambient light that follows mouse
export default function LiquidGlass() {
  const blobRef = useRef(null);
  const blob2Ref = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.06;
      current.current.y += (pos.current.y - current.current.y) * 0.06;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${current.current.x - 150}px, ${current.current.y - 150}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main liquid blob */}
      <div
        ref={blobRef}
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, rgba(0,100,200,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      {/* Small inner glow */}
      <div
        ref={blob2Ref}
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(170,68,255,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}