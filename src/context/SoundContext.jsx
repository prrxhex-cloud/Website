import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SoundContext = createContext();

export function useSound() {
  return useContext(SoundContext);
}

let audioCtx = null;

function initAudio() {
  if (typeof window !== 'undefined' && !audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playSound = (freq = 600, type = 'sine', duration = 0.08, forcePlay = false) => {
    if (!soundEnabledRef.current && !forcePlay) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context fallback safeguard
      console.warn("AudioContext playback failed", e);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newState = !prev;
      if (newState) {
        // Play activation sound, bypassing the ref since it hasn't updated yet
        playSound(800, 'sine', 0.1, true);
      }
      return newState;
    });
  };

  useEffect(() => {
    const handleMouseOver = (e) => {
      if (!soundEnabledRef.current) return;
      // Match interactive elements based on user's request
      const target = e.target.closest('button, a, .nav-link, .filter-btn, .dur-btn, [role="button"]');
      if (target) {
        playSound(400, 'sine', 0.03);
      }
    };

    const handleClick = (e) => {
      if (!soundEnabledRef.current) return;
      const target = e.target.closest('button, a, .nav-link, .filter-btn, .dur-btn, [role="button"]');
      // Don't play click sound for the sound toggle button itself as it plays its own sound
      if (target && !target.closest('#sound-toggle')) {
        playSound(700, 'triangle', 0.06);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}
