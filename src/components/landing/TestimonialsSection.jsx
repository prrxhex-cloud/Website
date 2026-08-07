import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import InteractiveCard from '@/components/effects/InteractiveCard';

const testimonials = [
  {
    name: 'DarkWolf_FF',
    role: 'Grandmaster Player',
    text: 'PRRX is the real deal. Aimbot Head + Smooth Aim combo is unbeatable. My KD went from 1.8 to 5.2 in two weeks.',
    rating: 5,
    avatar: 'D',
    color: '#00d4ff'
  },
  {
    name: 'SnipeQueen',
    role: 'Content Creator',
    text: 'The Chams and ESP features are insane. Red Chams + ESP Fixed Mod = always knowing where enemies are. 10/10.',
    rating: 5,
    avatar: 'S',
    color: '#ff00ff'
  },
  {
    name: 'PhantomRush',
    role: 'Competitive Player',
    text: 'Anti Report V1 and Anti Cheats protection kept my account safe for months. PRRX team is always updating — best support ever.',
    rating: 5,
    avatar: 'P',
    color: '#00d4ff'
  },
  {
    name: 'BlazeFire99',
    role: 'Squad Leader',
    text: 'Got my whole squad licensed. FPS++ and Optimaiz made the game run perfectly on every device. PRRX is the only tool we trust.',
    rating: 5,
    avatar: 'B',
    color: '#ff00ff'
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 liquid-bg overflow-hidden">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-1/3 w-[40vw] h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10"></div>
      <div className="absolute bottom-0 right-1/3 w-[35vw] h-[35vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10" style={{ animationDelay: '-1s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-sm font-semibold text-[#00d4ff] uppercase tracking-widest glow-cyan">
            Community
          </span>
          <h2 className="font-orbitron font-bold text-3xl sm:text-4xl lg:text-5xl text-white mt-4 mb-6 tracking-wider">
            PLAYERS <span className="text-[#ff00ff] glow-magenta">TRUST PRRX</span>
          </h2>
          <p className="font-inter text-lg text-gray-400 max-w-2xl mx-auto">
            Thousands of Free Fire players have already upgraded their game with PRRX HEX Premium.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InteractiveCard
                className="liquid-glass rounded-3xl p-8"
                style={{ border: `1px solid ${t.color}40` }}
              >
                <Quote className="w-7 h-7 mb-4 opacity-50" style={{ color: t.color }} />
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: t.color }} />
                  ))}
                </div>
                <p className="font-inter text-gray-200 leading-relaxed mb-6 text-sm">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center liquid-glass" style={{ border: `1px solid ${t.color}60` }}>
                    <span className="font-orbitron font-bold text-sm text-white" style={{ textShadow: `0 0 10px ${t.color}` }}>{t.avatar}</span>
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-sm text-white">{t.name}</div>
                    <div className="font-inter text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}