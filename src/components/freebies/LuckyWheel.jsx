import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Gift, Clock, RefreshCw, Key, Tag, Star, ArrowRight, Check, Copy, AlertCircle, LogIn, Award } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSound } from '@/context/SoundContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import { dispenseLicenseKey } from '@/utils/keyDispenser';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Wheel Segments Config with exact user weight distributions
const WHEEL_SEGMENTS = [
  { id: 0, label: '10% OFF', sublabel: 'PROMO CODE', type: 'promo', value: 10, color: '#06b6d4', weight: 4, icon: '🎟️' },
  { id: 1, label: '+50 PTS', sublabel: 'LOYALTY', type: 'points', value: 50, color: '#f59e0b', weight: 10, icon: '⭐' },
  { id: 2, label: 'NO LUCK', sublabel: 'TRY AGAIN', type: 'none', value: 0, color: '#334155', weight: 30, icon: '😢' },
  { id: 3, label: '20% OFF', sublabel: 'PROMO CODE', type: 'promo', value: 20, color: '#3b82f6', weight: 4, icon: '🎟️' },
  { id: 4, label: 'SPIN AGAIN', sublabel: 'FREE BONUS', type: 'respin', value: 0, color: '#10b981', weight: 10, icon: '🔄' },
  { id: 5, label: '1-WEEK VIP', sublabel: 'VIP KEY', type: 'key', value: '1week', color: '#ec4899', weight: 1, icon: '🔑' },
  { id: 6, label: '+100 PTS', sublabel: 'LOYALTY', type: 'points', value: 100, color: '#eab308', weight: 7, icon: '⭐' },
  { id: 7, label: 'NO LUCK', sublabel: 'TRY TOMORROW', type: 'none', value: 0, color: '#1e293b', weight: 29, icon: '😢' },
  { id: 8, label: '30% MEGA', sublabel: 'PROMO CODE', type: 'promo', value: 30, color: '#8b5cf6', weight: 2, icon: '🎟️' },
  { id: 9, label: '+200 PTS', sublabel: 'LOYALTY', type: 'points', value: 200, color: '#f97316', weight: 3, icon: '⭐' },
];

const TOTAL_WEIGHT = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);

// Pick winning index according to weighted probabilities
function pickWeightedSegment() {
  let rand = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    if (rand < WHEEL_SEGMENTS[i].weight) {
      return i;
    }
    rand -= WHEEL_SEGMENTS[i].weight;
  }
  return 2; // fallback to 'none'
}

export default function LuckyWheel() {
  const { user, isAuthenticated } = useAuth();
  const { playSuccess, playClick } = useSound();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [canSpin, setCanSpin] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [prizeDetails, setPrizeDetails] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Safe unique user ID helper
  const getUserId = () => {
    if (!user) return null;
    const raw = user.email || user.uid || user.displayName || 'guest';
    return String(raw).toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_');
  };

  // Load User Spin History & Points from Firestore + LocalStorage
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCanSpin(false);
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    // Check localStorage cache first for instant UI response
    const cachedTimestamp = localStorage.getItem(`prrx_spin_${userId}`);
    if (cachedTimestamp) {
      const parsed = parseInt(cachedTimestamp, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setLastSpinTime(parsed);
      }
    }

    // Sync with Firestore database for 100% permanent anti-bypass record
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists() && isMounted) {
          const data = userSnap.data();
          setLoyaltyPoints(data.loyalty_points || 0);

          if (data.last_spin_time) {
            const dbTime = new Date(data.last_spin_time).getTime();
            if (!isNaN(dbTime)) {
              setLastSpinTime(prev => Math.max(prev || 0, dbTime));
              localStorage.setItem(`prrx_spin_${userId}`, dbTime.toString());
            }
          }
        }
      } catch (err) {
        console.warn('Error syncing spin data from Firestore:', err);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, [isAuthenticated, user?.uid, user?.email]);

  // 24-Hour Strict Countdown Timer (Calculates exact real-time hours, minutes, seconds)
  useEffect(() => {
    if (!lastSpinTime) {
      setCanSpin(true);
      setTimeRemaining('');
      return;
    }

    const checkCooldown = () => {
      const now = Date.now();
      const elapsed = now - lastSpinTime;
      const cooldownMs = 24 * 60 * 60 * 1000; // Exactly 24 Hours

      if (elapsed >= cooldownMs) {
        setCanSpin(true);
        setTimeRemaining('');
      } else {
        setCanSpin(false);
        const remainingMs = cooldownMs - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  // Draw High-Resolution Canvas Wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSegments = WHEEL_SEGMENTS.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    WHEEL_SEGMENTS.forEach((seg, i) => {
      const angle = i * arcSize;

      // Draw Slice
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 6, angle, angle + arcSize);
      ctx.lineTo(radius, radius);
      ctx.fill();

      // Outer border on slice
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Text & Icon
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle + arcSize / 2);

      // Label & Icon
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 13px "Outfit", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${seg.icon} ${seg.label}`, radius - 18, 4);

      ctx.restore();
    });

    // Center Core Hub
    ctx.beginPath();
    ctx.arc(radius, radius, 34, 0, 2 * Math.PI);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center Logo
    ctx.fillStyle = '#06b6d4';
    ctx.font = '900 14px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PRRX', radius, radius);

  }, []);

  // Spin Wheel Action with Guaranteed CSS & Framer Motion Physics
  const handleSpin = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to spin the Lucky Wheel!');
      navigate('/login?redirect=/freebies');
      return;
    }

    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);
    setPrizeDetails(null);

    const userId = getUserId();
    const spinStartTime = Date.now();

    // Lock spin in localStorage & Firestore immediately so user cannot refresh to bypass cooldown
    localStorage.setItem(`prrx_spin_${userId}`, spinStartTime.toString());
    setLastSpinTime(spinStartTime);

    const userDocRef = doc(db, 'users', userId);
    setDoc(userDocRef, {
      last_spin_time: new Date(spinStartTime).toISOString()
    }, { merge: true }).catch(err => console.warn('Could not record spin timestamp:', err));

    // 1. Pick winner index
    const winIndex = pickWeightedSegment();
    const winningSeg = WHEEL_SEGMENTS[winIndex];

    // 2. Calculate exact target rotation
    // Canvas slices: Slice i spans [i * 36, (i + 1) * 36] degrees (measured from 3 o'clock / East).
    // Midpoint of slice winIndex: midAngle = winIndex * 36 + 18.
    // Pointer is at the TOP (12 o'clock / 270 degrees from 3 o'clock).
    // To align slice midpoint with pointer: (midAngle + targetRotation) % 360 = 270 => targetRotation = (270 - midAngle) % 360.
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const midAngle = winIndex * segmentAngle + segmentAngle / 2;
    const targetAngleMod = (270 - midAngle + 360) % 360;

    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (targetAngleMod - currentMod + 360) % 360;
    const fullSpins = (6 + Math.floor(Math.random() * 2)) * 360;
    const finalRotation = rotation + fullSpins + (delta === 0 ? 360 : delta);

    setRotation(finalRotation);

    // 3. Complete spin animation after 5.5 seconds
    setTimeout(async () => {
      setIsSpinning(false);
      setWonPrize(winningSeg);

      try {
        const now = new Date();

        // If Free Spin Bonus won, clear the cooldown so user can spin again immediately!
        if (winningSeg.type === 'respin') {
          toast.success('🎉 BONUS! You won a FREE RE-SPIN! Spin again now!');
          localStorage.removeItem(`prrx_spin_${userId}`);
          setLastSpinTime(null);
          setCanSpin(true);
          await updateDoc(userDocRef, { last_spin_time: null }).catch(() => {});
          return;
        }

        // 1-Week VIP Key Won! (1% chance)
        if (winningSeg.type === 'key') {
          confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
          const keyResult = await dispenseLicenseKey({
            productType: 'both',
            duration: '1week',
            customerEmail: user.email || user.username || 'VIP Customer',
            transactionId: `LUCKY-SPIN-${Date.now().toString().slice(-6)}`
          });

          const keyDelivered = keyResult.licenseKey || 'PRRX-LUCKY-WINNER-KEY-PENDING';
          setPrizeDetails({ licenseKey: keyDelivered });

          await updateDoc(userDocRef, {
            won_keys: arrayUnion({ key: keyDelivered, won_at: now.toISOString(), prize: '1-Week VIP' })
          });

          toast.success('👑 JACKPOT! You won a 1-Week VIP License Key!');
        }

        // Promo Code Won! (10% chance) - 48 Hours Expiry & Multi-Panel Compatible
        else if (winningSeg.type === 'promo') {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          const promoCode = `SPIN${winningSeg.value}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          // Valid for exactly 48 Hours
          const expiresAtDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

          await setDoc(doc(db, 'discounts', promoCode), {
            promo_code: promoCode,
            discount_type: 'percentage',
            discount_value: winningSeg.value,
            badge_text: `${winningSeg.value}% OFF LUCKY SPIN`,
            panel_type: 'both',
            active: true,
            is_personal: true, // Prevents showing globally as a flash sale for everyone
            created_date: now.toISOString(),
            expires_at: expiresAtDate.toISOString()
          });

          setPrizeDetails({ promoCode, discountPercent: winningSeg.value, expiresAt: expiresAtDate.toISOString() });
          toast.success(`🎟️ You won a ${winningSeg.value}% OFF Promo Code (Valid for 48 Hours)!`);
        }

        // VIP Points Won! (20% chance)
        else if (winningSeg.type === 'points') {
          await updateDoc(userDocRef, {
            loyalty_points: increment(winningSeg.value)
          });
          setLoyaltyPoints(prev => prev + winningSeg.value);
          toast.success(`⭐ +${winningSeg.value} VIP Loyalty Points added to your account!`);
        }

      } catch (err) {
        console.error('Error handling spin win:', err);
      }
    }, 5500);
  };

  const handleCopyCode = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl space-y-6 text-left relative overflow-hidden font-inter">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
              <Gift className="w-3 h-3 text-cyan-400" /> DAILY REWARD WHEEL
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              1 FREE SPIN PER 24 HOURS
            </span>
          </div>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-[var(--text-heading)] tracking-tight">
            PRRX LUCKY REWARD WHEEL
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Spin the wheel once every 24 hours to win 1-Week VIP Keys, instant promo codes up to 30% OFF, or VIP loyalty points!
          </p>
        </div>

        {/* User Points Badge */}
        {isAuthenticated && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 shrink-0 shadow-sm">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">YOUR LOYALTY POINTS</span>
              <span className="font-outfit font-black text-base text-white">{loyaltyPoints} PTS</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Wheel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT: INTERACTIVE SPIN WHEEL (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative py-4">
          
          {/* Wheel Pointer Needle (Top Center) */}
          <div className="relative z-30 mb-[-18px] flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-pulse" />
          </div>

          {/* Rotating Wheel Container with Dual Smooth Transform Easing */}
          <div className="relative p-2.5 rounded-full bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-slate-900 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
              }}
              className="relative rounded-full overflow-hidden flex items-center justify-center"
            >
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="rounded-full shadow-2xl max-w-[300px] max-h-[300px] sm:max-w-[360px] sm:max-h-[360px]"
              />
            </div>
          </div>

          {/* Spin Button / 24-Hour Cooldown Timer */}
          <div className="mt-6 w-full max-w-sm">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate('/login?redirect=/freebies')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-outfit font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN TO CLAIM FREE SPIN</span>
              </button>
            ) : canSpin ? (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-outfit font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>{isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN FREE WHEEL NOW'}</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-1.5 shadow-inner">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>NEXT FREE SPIN IN:</span>
                </div>
                <div className="font-mono font-black text-2xl text-cyan-300 tracking-wider">
                  {timeRemaining}
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  🔒 Locked for 24 hours from your last spin
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PRIZES BREAKDOWN & REWARD REVEAL (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* WINNER REVEAL CARD */}
          <AnimatePresence>
            {wonPrize && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/80 to-purple-950/80 border border-cyan-400 shadow-2xl space-y-3.5 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> SPIN RESULT
                  </span>
                  <span className="text-xl">{wonPrize.icon}</span>
                </div>

                <div>
                  <h3 className="font-outfit font-black text-2xl text-white">
                    {wonPrize.label}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {wonPrize.type === 'key' && '🎉 Congratulations! You unlocked a 1-Week VIP Cheat Key!'}
                    {wonPrize.type === 'promo' && `🎉 You unlocked an instant ${wonPrize.value}% OFF store discount!`}
                    {wonPrize.type === 'points' && `⭐ Added ${wonPrize.value} loyalty points to your balance!`}
                    {wonPrize.type === 'respin' && '🔄 Lucky you! Hit the Spin button to spin one more time!'}
                    {wonPrize.type === 'none' && 'Better luck on your next spin tomorrow! Come back in 24 hours.'}
                  </p>
                </div>

                {/* Key Reveal Box */}
                {prizeDetails?.licenseKey && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-pink-500/40 space-y-2">
                    <span className="text-[10px] text-pink-400 font-bold uppercase block">Your 1-Week License Key:</span>
                    <div className="flex items-center justify-between font-mono font-bold text-xs text-pink-200 bg-slate-900 p-2 rounded-xl">
                      <span className="truncate">{prizeDetails.licenseKey}</span>
                      <button
                        onClick={() => handleCopyCode(prizeDetails.licenseKey)}
                        className="p-1 text-pink-400 hover:text-white"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Promo Code Box */}
                {prizeDetails?.promoCode && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-cyan-400">Single-Use Promo Code:</span>
                      <span className="text-amber-400 font-mono">⏱️ Valid 48 Hours</span>
                    </div>
                    <div className="flex items-center justify-between font-mono font-bold text-xs text-cyan-200 bg-slate-900 p-2 rounded-xl border border-cyan-500/20">
                      <span className="select-all tracking-wider text-cyan-300 font-black">{prizeDetails.promoCode}</span>
                      <button
                        onClick={() => handleCopyCode(prizeDetails.promoCode)}
                        className="p-1 text-cyan-400 hover:text-white"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => navigate('/prices', { state: { promoCode: prizeDetails.promoCode } })}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-outfit font-black text-xs transition-all flex items-center justify-center gap-1.5 mt-1 shadow-md hover:scale-[1.02]"
                    >
                      <span>USE AT CHECKOUT NOW</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PRIZES LIST TABLE */}
          <div className="p-4 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3 shadow-inner">
            <span className="text-xs font-outfit font-black text-[var(--text-heading)] uppercase tracking-wider block">
              🏆 WHEEL PRIZE POOL & WIN RATES:
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-pink-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-pink-300">
                  <span>🔑</span>
                  <span>1-Week VIP License Key</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                  1% RATE (JACKPOT)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <span>🎟️</span>
                  <span>10% – 30% OFF Promo Codes</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  10% RATE
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span>⭐</span>
                  <span>+50 to +200 VIP Loyalty Points</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  20% RATE
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <span>🔄</span>
                  <span>Free Re-Spin Bonus</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  10% RATE
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
