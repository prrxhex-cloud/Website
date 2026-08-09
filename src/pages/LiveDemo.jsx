import React, { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Crosshair, ShieldCheck, Zap, Radio, Sliders, Play, Eye, Trophy } from 'lucide-react';

export default function LiveDemo() {
  const canvasRef = useRef(null);

  // Toggle states
  const [aimbot, setAimbot] = useState(true);
  const [espBox, setEspBox] = useState(true);
  const [skeleton, setSkeleton] = useState(true);
  const [tracers, setTracers] = useState(true);
  const [radar, setRadar] = useState(true);

  // HUD stats
  const [kills, setKills] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [score, setScore] = useState(0);

  const stateRef = useRef({ aimbot: true, espBox: true, skeleton: true, tracers: true, radar: true });

  useEffect(() => {
    stateRef.current = { aimbot, espBox, skeleton, tracers, radar };
  }, [aimbot, espBox, skeleton, tracers, radar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 700;
        canvas.height = Math.max(480, Math.min(parent.clientWidth * 0.65, 540));
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simulated Player
    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2 + 50,
      radius: 14,
      color: '#06b6d4'
    };

    // Simulated Enemy Targets
    const enemies = [
      { id: 1, name: 'Enemy_Bot_01', x: 180, y: 120, vx: 1.2, vy: 0.5, hp: 100, maxHp: 100 },
      { id: 2, name: 'Rank_Player_X', x: 480, y: 150, vx: -1.0, vy: 0.8, hp: 85, maxHp: 100 },
      { id: 3, name: 'V_Badge_Pro', x: 340, y: 260, vx: 0.8, vy: -0.9, hp: 100, maxHp: 100 }
    ];

    let particles = [];
    let headshotBanners = [];
    let isFiring = false;
    const FOV_RADIUS = 140;

    // Enemy MUST be strictly inside the FOV circle around player crosshair to get headshot!
    const getTargetInFOV = () => {
      if (!stateRef.current.aimbot) return null;
      let closest = null;
      let minDistance = FOV_RADIUS;
      const crosshairX = player.x;
      const crosshairY = player.y - 60;

      enemies.forEach(e => {
        const enemyHeadX = e.x;
        const enemyHeadY = e.y - 20;
        const dist = Math.hypot(enemyHeadX - crosshairX, enemyHeadY - crosshairY);
        
        // Strict FOV Circle Collision Check
        if (dist <= minDistance) {
          minDistance = dist;
          closest = e;
        }
      });
      return closest;
    };

    window.triggerSimFire = () => {
      isFiring = true;
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: player.x,
          y: player.y - 15,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 6,
          life: 1.0,
          color: '#38bdf8'
        });
      }

      const target = getTargetInFOV();
      if (target) {
        target.hp = Math.max(0, target.hp - 35);
        setDamageDealt(d => d + 35);
        setScore(s => s + 150);

        if (target.hp <= 0) {
          target.hp = 100;
          setKills(k => k + 1);
          setScore(s => s + 500);
        }

        headshotBanners.push({
          x: target.x,
          y: target.y - 45,
          alpha: 1.0,
          text: '💥 HEADSHOT! +500 PTS'
        });

        for (let i = 0; i < 15; i++) {
          particles.push({
            x: target.x,
            y: target.y - 20,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1.0,
            color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b'
          });
        }
      } else {
        // Warning when firing outside FOV circle
        headshotBanners.push({
          x: player.x,
          y: player.y - 90,
          alpha: 1.0,
          text: '⚠️ NO TARGET IN FOV CIRCLE!'
        });
      }

      setTimeout(() => { isFiring = false; }, 250);
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawRadar = () => {
      const rSize = 100;
      const rX = canvas.width - rSize - 15;
      const rY = 15;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(rX + rSize / 2, rY + rSize / 2, rSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.beginPath();
      ctx.arc(rX + rSize / 2, rY + rSize / 2, rSize / 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(rX + rSize / 2, rY + rSize / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      enemies.forEach(e => {
        const relX = (e.x - player.x) * 0.15;
        const relY = (e.y - player.y) * 0.15;
        const dotX = rX + rSize / 2 + relX;
        const dotY = rY + rSize / 2 + relY;

        const distFromCenter = Math.hypot(dotX - (rX + rSize / 2), dotY - (rY + rSize / 2));
        if (distFromCenter < rSize / 2 - 2) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const render = () => {
      const currentControls = stateRef.current;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      player.x = canvas.width / 2;
      player.y = canvas.height / 2 + 50;

      drawGrid();

      enemies.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;

        if (e.x < 60 || e.x > canvas.width - 60) e.vx *= -1;
        if (e.y < 60 || e.y > canvas.height - 180) e.vy *= -1;
      });

      const activeTarget = getTargetInFOV();

      // Render FOV Circle (Glowing Cyan when enemy inside, Dashed white when scanning)
      if (currentControls.aimbot) {
        ctx.beginPath();
        ctx.arc(player.x, player.y - 60, FOV_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = activeTarget ? 'rgba(239, 68, 68, 0.8)' : 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = activeTarget ? 2.5 : 1.5;
        ctx.setLineDash(activeTarget ? [] : [6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (activeTarget) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
          ctx.fill();
        }
      }

      enemies.forEach(e => {
        const dist = Math.round(Math.hypot(e.x - player.x, e.y - player.y) / 5);

        if (currentControls.tracers) {
          ctx.beginPath();
          ctx.moveTo(player.x, player.y - 15);
          ctx.lineTo(e.x, e.y - 20);
          ctx.strokeStyle = e === activeTarget
            ? 'rgba(239, 68, 68, 0.9)' 
            : 'rgba(139, 92, 246, 0.5)';
          ctx.lineWidth = e === activeTarget ? 2 : 1.5;
          ctx.stroke();
        }

        if (currentControls.espBox) {
          const boxW = 34;
          const boxH = 65;
          ctx.strokeStyle = e === activeTarget ? '#ef4444' : '#06b6d4';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(e.x - boxW / 2, e.y - boxH + 10, boxW, boxH);

          ctx.fillStyle = e === activeTarget ? '#ef4444' : '#38bdf8';
          ctx.fillRect(e.x - boxW / 2 - 2, e.y - boxH + 10 - 2, 8, 2);
          ctx.fillRect(e.x - boxW / 2 - 2, e.y - boxH + 10 - 2, 2, 8);

          const hpPercent = e.hp / e.maxHp;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(e.x - boxW / 2, e.y - boxH - 2, boxW, 5);
          ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : '#ef4444';
          ctx.fillRect(e.x - boxW / 2, e.y - boxH - 2, boxW * hpPercent, 5);

          ctx.font = '700 10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${e.name}`, e.x - boxW / 2, e.y - boxH - 8);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`${dist}m | HP ${e.hp}%`, e.x - boxW / 2, e.y + 22);
        }

        if (currentControls.skeleton) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.arc(e.x, e.y - 20, 7, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(e.x, e.y - 13);
          ctx.lineTo(e.x, e.y + 5);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(e.x - 12, e.y - 5);
          ctx.lineTo(e.x + 12, e.y - 5);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 5);
          ctx.lineTo(e.x - 10, e.y + 18);
          ctx.moveTo(e.x, e.y + 5);
          ctx.lineTo(e.x + 10, e.y + 18);
          ctx.stroke();
        }

        ctx.fillStyle = e === activeTarget ? '#ef4444' : '#06b6d4';
        ctx.beginPath();
        ctx.arc(e.x, e.y - 20, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = isFiring ? '#ef4444' : '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.x - 12, player.y - 60);
      ctx.lineTo(player.x + 12, player.y - 60);
      ctx.moveTo(player.x, player.y - 72);
      ctx.lineTo(player.x, player.y - 48);
      ctx.stroke();

      if (currentControls.aimbot && activeTarget) {
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 60);
        ctx.lineTo(activeTarget.x, activeTarget.y - 20);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(activeTarget.x - 10, activeTarget.y - 30, 20, 20);

        ctx.font = '800 11px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('TARGET LOCKED [FOV OK]', activeTarget.x - 55, activeTarget.y - 35);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      for (let i = headshotBanners.length - 1; i >= 0; i--) {
        const b = headshotBanners[i];
        b.y -= 0.8;
        b.alpha -= 0.02;

        if (b.alpha <= 0) {
          headshotBanners.splice(i, 1);
          continue;
        }

        ctx.font = '800 13px sans-serif';
        ctx.fillStyle = `rgba(239, 68, 68, ${b.alpha})`;
        ctx.fillText(b.text, b.x - 50, b.y);
      }

      if (currentControls.radar) {
        drawRadar();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleFireClick = () => {
    if (window.triggerSimFire) {
      window.triggerSimFire();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-inter text-[var(--text-primary)] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 max-w-[1240px] mx-auto w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="sub-heading">INTERACTIVE SIMULATOR</div>
          <h1 className="font-outfit font-extrabold text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
            LIVE <span className="text-[#06b6d4]">CHEAT ENGINE DEMO</span>
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-sm max-w-xl mx-auto">
            Test the real 60 FPS Canvas cheat engine. Enemy MUST enter FOV Circle to trigger Headshot Lock!
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 clean-card p-6 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6 shadow-md">
            <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-color)]">
              <Sliders className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">ENGINE TOGGLES</h3>
            </div>

            <div className="space-y-4">
              {/* Aimbot Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-[#06b6d4] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Crosshair className="w-4 h-4 text-[#06b6d4]" />
                  <span className="font-outfit font-bold text-xs text-[var(--text-heading)]">Aimbot FOV Circle</span>
                </div>
                <input
                  type="checkbox"
                  checked={aimbot}
                  onChange={e => setAimbot(e.target.checked)}
                  className="w-4 h-4 accent-[#06b6d4] rounded"
                />
              </label>

              {/* ESP Box Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-[#06b6d4] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-cyan-500" />
                  <span className="font-outfit font-bold text-xs text-[var(--text-heading)]">3D ESP Bounding Box</span>
                </div>
                <input
                  type="checkbox"
                  checked={espBox}
                  onChange={e => setEspBox(e.target.checked)}
                  className="w-4 h-4 accent-[#06b6d4] rounded"
                />
              </label>

              {/* Skeleton Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-emerald-500 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="font-outfit font-bold text-xs text-[var(--text-heading)]">Skeleton Bone ESP</span>
                </div>
                <input
                  type="checkbox"
                  checked={skeleton}
                  onChange={e => setSkeleton(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              {/* Tracers Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-violet-500 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-violet-500" />
                  <span className="font-outfit font-bold text-xs text-[var(--text-heading)]">Snap Lines / Tracers</span>
                </div>
                <input
                  type="checkbox"
                  checked={tracers}
                  onChange={e => setTracers(e.target.checked)}
                  className="w-4 h-4 accent-violet-500 rounded"
                />
              </label>

              {/* Radar Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-amber-500 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span className="font-outfit font-bold text-xs text-[var(--text-heading)]">360 Tactical Radar</span>
                </div>
                <input
                  type="checkbox"
                  checked={radar}
                  onChange={e => setRadar(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            {/* Fire Action Button */}
            <div className="pt-2">
              <button
                onClick={handleFireClick}
                className="w-full btn-primary-cyan btn-glow py-3.5 px-4 rounded-xl font-outfit font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Crosshair className="w-4 h-4" /> SIMULATE FIRE BUTTON
              </button>
            </div>

            {/* Stats readout */}
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-muted)] flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Total Score:</span>
                <span className="text-amber-400 font-extrabold">{score.toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-muted)]">Damage Dealt:</span>
                <span className="text-rose-500">{damageDealt} HP</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-muted)]">Headshot Kills:</span>
                <span className="text-[#06b6d4]">{kills}</span>
              </div>
            </div>
          </div>

          {/* Simulator Canvas Viewport */}
          <div className="lg:col-span-3 clean-card p-4 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-4">
            
            {/* Viewport bar */}
            <div className="px-4 py-2.5 bg-slate-950 text-white rounded-xl flex items-center justify-between text-xs font-mono border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-[#06b6d4]">FF_ENGINE_SIMULATOR_60FPS</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="text-amber-400 font-bold">SCORE: {score}</span>
                <span>RES: 1080P</span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-2xl">
              <canvas ref={canvasRef} className="w-full block" />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-inter px-2">
              <span className="flex items-center gap-1 font-semibold text-emerald-500">
                <ShieldCheck className="w-4 h-4" /> FOV Collision Detection Active
              </span>
              <span>Enemy MUST enter FOV Circle for Headshot Lock!</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
