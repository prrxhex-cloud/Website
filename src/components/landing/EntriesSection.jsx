import React from 'react';
import ScrollReveal from '@/components/effects/ScrollReveal';

const entries = [
  {
    img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80',
    title: 'Login & Verification System',
    desc: 'Secure HWID encrypted login system that protects user license keys while delivering instant authorization.',
  },
  {
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    title: 'Control Center Interface',
    desc: 'Designed with clean modern UI controls, ensuring fast navigation, smooth sliders, and zero input lag.',
  },
  {
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    title: 'Functions Panel Hub',
    desc: 'Everything you need to manage, play, and stay undetected — all in one fast, minimal, user-friendly interface.',
  },
];

export default function EntriesSection() {
  return (
    <section id="entries" className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fadeDown" className="text-center mb-12 space-y-2">
          <div className="sub-heading">KEY MODULES</div>
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
            CORE SYSTEM ENTRIES
          </h2>
          <p className="font-inter text-[var(--text-muted)] text-sm max-w-xl mx-auto">
            Manage access, stay active, and control everything from one place.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6">
          {entries.map((entry, i) => (
            <ScrollReveal key={entry.title} variant="fadeUp" delay={i * 0.15}>
              <div className="clean-card bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden h-full flex flex-col group shadow-md text-left">
                <div className="overflow-hidden aspect-video bg-slate-950">
                  <img
                    src={entry.img}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-2 flex-1 flex flex-col">
                  <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">{entry.title}</h3>
                  <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed flex-1">{entry.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}