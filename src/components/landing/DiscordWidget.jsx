import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SERVER_ID = '1421133721935024240';
const INVITE_LINK = 'https://discord.gg/EuwhvXXfJC';

export default function DiscordWidget() {
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(88,101,242,1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-inter font-bold tracking-widest"
            style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.35)', color: '#5865f2' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            JOIN OUR COMMUNITY
          </div>
          <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-foreground mb-3 tracking-wide"
            style={{ textShadow: '0 0 30px rgba(88,101,242,0.4)' }}>
            PRRX <span style={{ color: '#5865f2' }}>DISCORD</span>
          </h2>
          <p className="font-inter text-muted-foreground text-sm max-w-md mx-auto">
            Join the community for live support, updates, and connect with other PRRX users.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Discord Embed Widget */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(0,8,24,0.65)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(88,101,242,0.2)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="px-5 py-4 border-b flex items-center gap-3"
              style={{ borderColor: 'rgba(88,101,242,0.15)' }}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: '#5865f2' }}>LIVE SERVER</span>
            </div>
            {!widgetLoaded && (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={`https://discord.com/widget?id=${SERVER_ID}&theme=dark`}
              width="350"
              height="500"
              allowTransparency="true"
              frameBorder="0"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              onLoad={() => setWidgetLoaded(true)}
              style={{ display: widgetLoaded ? 'block' : 'none', maxWidth: '100%' }}
              title="PRRX Discord Server"
            />
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {[
              { emoji: '🎧', title: 'Live Support', desc: 'Get instant help from our team and community members 24/7.', color: '#00d4ff' },
              { emoji: '📢', title: 'Latest Updates', desc: 'Be the first to know about new versions, features, and patches.', color: '#5865f2' },
              { emoji: '🛡️', title: 'Safe Community', desc: 'Private server with verified PRRX users only.', color: '#00ff88' },
            ].map((item) => (
              <div key={item.title}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: 'rgba(0,8,24,0.6)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: `1px solid rgba(${item.color === '#00d4ff' ? '0,212,255' : item.color === '#5865f2' ? '88,101,242' : '0,255,136'},0.15)`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}>
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-orbitron font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</p>
                  <p className="font-inter text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* Join button */}
            <motion.a
              href={INVITE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(88,101,242,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 w-full font-orbitron font-bold text-sm tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #5865f2, #4752c4)',
                boxShadow: '0 0 24px rgba(88,101,242,0.35)',
                color: '#fff',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              JOIN DISCORD SERVER
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}