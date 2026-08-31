import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, TrendingUp, Users, Star, ArrowUpRight, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const CASE_STUDIES = [
  {
    id: 'grandmaster-rush',
    title: 'Rank Rush: Bronze to Grandmaster in 48 Hours',
    author: 'Kavindu "Shadow" R. (Verified VIP)',
    badge: 'Competitive Ranked',
    stats: [
      { label: 'Rank Climb', value: 'Heroic 3 ➔ GM #14' },
      { label: 'Headshot Rate', value: '98.4%' },
      { label: 'Ban Status', value: '0 Warnings' },
    ],
    summary: 'Utilized PRRX External Panel streamproof ESP and 25% smooth aimbot on Windows 11 LDPlayer 9 to reach Grandmaster leaderboards without triggering manual spectator reports.',
    tags: ['Windows 11', 'LDPlayer 9', 'External Overlay']
  },
  {
    id: 'reseller-growth',
    title: 'Reseller Network: Scaling \$1,800/mo Wholesale Business',
    author: 'Dinesh M. (Official Tier-3 Reseller)',
    badge: 'Reseller Enterprise',
    stats: [
      { label: 'Monthly Volume', value: '420+ Keys' },
      { label: 'Automated Delivery', value: '< 8 Seconds' },
      { label: 'Profit Margin', value: '38.5%' },
    ],
    summary: 'Automated digital wholesale key distribution using the PRRX Reseller Portal. Leveraged sub-second Supabase key dispenser RPC for instant customer satisfaction across WhatsApp community.',
    tags: ['Wholesale Keys', 'Instant Dispense', 'Sub-Accounts']
  },
  {
    id: 'tournament-security',
    title: 'Esports Scrims: 6-Month 0% Ban Record on Main ID',
    author: 'ApexSquad FF (Tournament Team)',
    badge: 'Competitive Scrims',
    stats: [
      { label: 'Tournaments Won', value: '14 Custom Rooms' },
      { label: 'Security Uptime', value: '100% Undetected' },
      { label: 'Patch Transitions', value: 'OB44 ➔ OB47' },
    ],
    summary: 'Maintained account security across 3 major Garena Free Fire game patches using PRRX Internal Panel kernel cloaking and automated kill-switch sentinels.',
    tags: ['SmartGaaga', 'V7a 32-Bit', 'Kernel Cloak']
  }
];

export default function CaseStudiesSection() {
  return (
    <section className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] relative overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-outfit font-extrabold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>PROVEN VERIFIED OUTCOMES</span>
          </div>

          <h2 className="font-outfit font-black text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight uppercase">
            PLAYER & RESELLER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">CASE STUDIES</span>
          </h2>

          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            Real competitive players and wholesale partners who rely on PRRX HEX for unmatched performance, account security, and fast automated delivery.
          </p>
        </div>

        {/* Case Study Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((study, idx) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md hover:shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-6 group relative overflow-hidden"
            >
              {/* Top Accent */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-outfit font-extrabold uppercase tracking-wider">
                    {study.badge}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <h3 className="font-outfit font-black text-lg text-[var(--text-heading)] tracking-tight group-hover:text-cyan-400 transition-colors leading-snug">
                  {study.title}
                </h3>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {study.summary}
                </p>
              </div>

              {/* Stats Box */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] grid grid-cols-3 gap-2 text-center">
                  {study.stats.map((stat, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block tracking-wider">
                        {stat.label}
                      </span>
                      <span className="font-outfit font-extrabold text-xs text-cyan-400 block truncate">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Tag & Author */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-[11px] font-semibold">
                    {study.author}
                  </span>
                  <Link
                    to="/prices"
                    className="text-cyan-400 hover:text-cyan-300 font-outfit font-bold text-xs flex items-center gap-0.5 transition-colors"
                  >
                    <span>View Plans</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
