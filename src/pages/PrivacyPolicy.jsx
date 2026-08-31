import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Shield, Lock, Eye, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter selection:bg-cyan-500/30">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12 space-y-10">
        <Breadcrumbs items={[{ label: 'Privacy Policy & Terms', path: '/privacy' }]} />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-outfit font-extrabold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEGAL & COMPLIANCE</span>
          </div>

          <h1 className="font-outfit font-black text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight uppercase">
            PRIVACY POLICY & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">TERMS OF SERVICE</span>
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto">
            Last Updated: August 31, 2026. Review our commitment to customer privacy, zero-log infrastructure, and software license usage.
          </p>
        </div>

        {/* Policy Document Content Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-8 text-sm leading-relaxed text-[var(--text-muted)] font-inter">
          
          {/* Section 1: Overview & Zero-Log Architecture */}
          <div className="space-y-3">
            <h2 className="font-outfit font-black text-lg sm:text-xl text-[var(--text-heading)] flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>1. Information Collection & Zero-Log Policy</span>
            </h2>
            <p>
              At PRRX HEX, user anonymity and digital privacy are fundamental engineering priorities. We adhere to a strict minimal-data protocol:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Order Processing:</strong> We collect email addresses and transaction reference identifiers solely for the automated verification and dispensing of software license keys.</li>
              <li><strong>Hardware Identifiers (HWID):</strong> An encrypted cryptographic hash of your system identifier is stored to bind your VIP license to your emulator instance. We do not store personal hardware serials in plaintext.</li>
              <li><strong>Zero In-Game Activity Logs:</strong> PRRX HEX software does not record, log, or transmit gameplay video feeds, personal files, or user keystrokes.</li>
            </ul>
          </div>

          {/* Section 2: Cookies & Local Storage */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <h2 className="font-outfit font-black text-lg sm:text-xl text-[var(--text-heading)] flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>2. Cookies & Client-Side Storage</span>
            </h2>
            <p>
              Our website uses browser <code className="text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded">localStorage</code> and temporary session cookies exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Persist your visual UI preferences (Dark / Light Cyberpunk theme).</li>
              <li>Maintain sound effects toggles (Audio On / Off).</li>
              <li>Securely preserve your active login session token between page visits.</li>
            </ul>
          </div>

          {/* Section 3: Software License Agreement */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <h2 className="font-outfit font-black text-lg sm:text-xl text-[var(--text-heading)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>3. End-User License Agreement (EULA)</span>
            </h2>
            <p>
              By purchasing or utilizing PRRX HEX software panels, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>License keys are non-transferable and assigned for personal use on 1 bound device/emulator instance at a time.</li>
              <li>Attempting to reverse engineer, decompile, patch, or publicly leak PRRX binary modules will result in immediate termination of the license key without refund.</li>
              <li>Automated key dispensing is final upon successful cryptographic verification of the transaction receipt.</li>
            </ul>
          </div>

          {/* Section 4: Educational & Research Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-outfit font-black text-sm uppercase">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-none" />
              <span>4. Software Research & Fair Use Disclaimer</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-200/90 font-inter">
              PRRX HEX panels and memory cloaking utilities are designed for Windows 10/11 emulation research, graphics optimization, and software development sandbox environments. Users are solely responsible for ensuring compliance with third-party application terms of service.
            </p>
          </div>

          {/* Section 5: Support & Inquiries */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <h2 className="font-outfit font-black text-lg sm:text-xl text-[var(--text-heading)]">
              5. Contact & Privacy Inquiries
            </h2>
            <p className="text-xs sm:text-sm">
              If you have any questions regarding this Privacy Policy or wish to request the deletion of your account record, please contact our support team via:
            </p>
            <p className="font-mono text-xs text-cyan-400">
              Email: support@prrxhex.com | Discord: discord.gg/D2nCuvyE4t
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
