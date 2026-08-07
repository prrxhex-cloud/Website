import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'DarkWolf_FF',
    role: 'Grandmaster Player',
    text: 'PRRX is the real deal. Aimbot Head + Smooth Aim combo is unbeatable. My KD went from 1.8 to 5.2 in two weeks.',
    rating: 5,
    avatar: 'D',
  },
  {
    name: 'SnipeQueen',
    role: 'Content Creator',
    text: 'The Chams and ESP features are insane. Red Chams + ESP Fixed Mod = always knowing where enemies are. 10/10.',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'PhantomRush',
    role: 'Competitive Player',
    text: 'Anti Report V1 and Anti Cheats protection kept my account safe for months. PRRX team is always updating — best support ever.',
    rating: 5,
    avatar: 'P',
  },
  {
    name: 'BlazeFire99',
    role: 'Squad Leader',
    text: 'Got my whole squad licensed. FPS++ and Optimaiz made the game run perfectly on every device. PRRX is the only tool we trust.',
    rating: 5,
    avatar: 'B',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-sm font-semibold text-primary uppercase tracking-widest">
            Community
          </span>
          <h2 className="font-orbitron font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mt-4 mb-6 tracking-wider">
            PLAYERS <span className="text-primary">TRUST PRRX</span>
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
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
              className="bg-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="w-7 h-7 text-primary/20 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-inter text-foreground/90 leading-relaxed mb-6 text-sm">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="font-orbitron font-bold text-sm text-primary">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-orbitron font-bold text-sm text-foreground">{t.name}</div>
                  <div className="font-inter text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}