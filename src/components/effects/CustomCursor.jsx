import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    document.body.style.cursor = 'none';

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    const onEnterInteractive = () => {
      if (ringRef.current) ringRef.current.classList.add('cursor-expanded');
    };
    const onLeaveInteractive = () => {
      if (ringRef.current) ringRef.current.classList.remove('cursor-expanded');
    };

    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(animate);

    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .cursor-dot {
          position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none;
          width: 8px; height: 8px; border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff;
          transition: opacity 0.2s;
        }
        .cursor-ring {
          position: fixed; top: 0; left: 0; z-index: 99998; pointer-events: none;
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid rgba(0,212,255,0.6);
          box-shadow: 0 0 10px rgba(0,212,255,0.2);
          transition: width 0.2s, height 0.2s, border-color 0.2s;
        }
        .cursor-ring.cursor-expanded {
          width: 56px; height: 56px;
          border-color: rgba(0,212,255,1);
          box-shadow: 0 0 20px rgba(0,212,255,0.4);
        }
      `}</style>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}