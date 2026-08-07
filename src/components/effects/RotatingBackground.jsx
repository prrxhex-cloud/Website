import React, { useEffect, useRef } from 'react';

export default function RotatingBackground() {
  const ref = useRef(null);

  useEffect(() => {
    let frame;
    let angle = 0;
    const animate = () => {
      angle += 0.08;
      if (ref.current) {
        ref.current.style.transform = `rotateX(60deg) rotateZ(${angle}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ perspective: '800px' }}>
      <div
        ref={ref}
        className="absolute inset-[-50%]"
        style={{
          width: '200%',
          height: '200%',
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          animation: 'orb1 12s ease-in-out infinite',
        }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,80,200,0.08) 0%, transparent 70%)',
          animation: 'orb2 16s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.2); }
          66% { transform: translate(-40px, 60px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-80px, -60px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}