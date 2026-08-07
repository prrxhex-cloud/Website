import React from 'react';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { ExternalLink } from 'lucide-react';
import InteractiveCard from '@/components/effects/InteractiveCard';

const entries = [
  {
    img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80',
    title: 'Login System',
    desc: 'A secure and encrypted login system that protects user data while delivering fast and reliable access.',
  },
  {
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    title: 'Main Menu',
    desc: 'Designed with a modern dark UI, the control center ensures fast navigation, clarity, and reliability.',
  },
  {
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    title: 'Functions Panel',
    desc: 'Everything you need to manage, play, and stay connected — all in one fast, minimal, user-friendly interface.',
  },
];

export default function EntriesSection() {
  return (
    <section id="entries" className="py-24 sm:py-32" style={{ background: 'rgba(0,8,20,0.5)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <ScrollReveal variant="fadeDown" className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 tracking-wider">
            Entries
          </h2>
          <p className="font-inter text-muted-foreground max-w-xl mx-auto">
            Manage access, stay active, and control everything from one place.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6">
          {entries.map((entry, i) => (
            <ScrollReveal key={entry.title} variant="fadeUp" delay={i * 0.15}>
              <InteractiveCard
                className="rounded-2xl overflow-hidden h-full"
                style={{ background: 'rgba(0,20,40,0.7)', border: '1px solid rgba(0,212,255,0.1)' }}
              >
                <div className="overflow-hidden relative">
                  <img
                    src={entry.img}
                    alt={entry.title}
                    className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: 'brightness(0.9)' }}
                  />
                  {/* Image glow overlay */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,20,40,0.9) 100%)' }} />
                </div>
                <div className="p-6">
                  <h3 className="font-orbitron font-bold text-sm text-foreground mb-2 tracking-wide">{entry.title}</h3>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-4">{entry.desc}</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 font-inter text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    View More <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}