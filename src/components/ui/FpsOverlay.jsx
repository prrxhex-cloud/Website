import React, { useState, useEffect, useRef } from 'react';

export default function FpsOverlay() {
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('prrx_show_fps') === 'true';
  });

  const requestRef = useRef();
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

  useEffect(() => {
    // Listen for custom event to toggle visibility from other components
    const handleToggle = () => {
      const newVal = localStorage.getItem('prrx_show_fps') === 'true';
      setIsVisible(newVal);
    };
    
    window.addEventListener('prrx_toggle_fps', handleToggle);
    return () => window.removeEventListener('prrx_toggle_fps', handleToggle);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      cancelAnimationFrame(requestRef.current);
      return;
    }

    const calculateFps = () => {
      const now = performance.now();
      fpsRef.current.frames++;
      
      const delta = now - fpsRef.current.lastTime;
      if (delta >= 1000) {
        setFps(Math.round((fpsRef.current.frames * 1000) / delta));
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }
      
      requestRef.current = requestAnimationFrame(calculateFps);
    };

    requestRef.current = requestAnimationFrame(calculateFps);
    
    return () => cancelAnimationFrame(requestRef.current);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-[99999] bg-black/80 border border-white/10 px-2 py-1 rounded text-xs font-mono font-bold text-white pointer-events-none select-none shadow-lg"
      style={{ backdropFilter: 'none' }}
    >
      FPS: {fps}
    </div>
  );
}
