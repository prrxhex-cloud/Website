import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { RefreshCw, DownloadCloud, CheckCircle, AlertTriangle, ShieldCheck, Globe, Cpu, Server, MapPin, Radio, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const EDGE_NODES = [
  {
    id: 'asia-south',
    name: 'Asia South (Sri Lanka / India Cluster)',
    region: 'South Asia Core',
    coordinates: 'Colombo / Mumbai Node',
    ping: '8ms',
    status: 'Operational',
    bandwidth: '10 Gbps Edge',
    description: 'Direct high-speed gateway for Sri Lankan and Indian Free Fire regional matchmaking.'
  },
  {
    id: 'asia-se',
    name: 'Asia Pacific (Singapore Hub)',
    region: 'SEA Direct Edge',
    coordinates: 'Singapore Equinix SG1',
    ping: '22ms',
    status: 'Operational',
    bandwidth: '20 Gbps Edge',
    description: 'Sub-second API routing for automated key dispensing and emulator license validation.'
  },
  {
    id: 'middle-east',
    name: 'Middle East (Dubai Edge)',
    region: 'MENA Region',
    coordinates: 'Dubai / Riyadh Gateway',
    ping: '34ms',
    status: 'Operational',
    bandwidth: '10 Gbps Edge',
    description: 'Low-jitter proxy cluster serving Middle Eastern tournament and scrim players.'
  },
  {
    id: 'global-cdn',
    name: 'Global Anycast CDN (Cloudflare & GitHub Nodes)',
    region: 'Global Edge (280+ PoPs)',
    coordinates: 'Anycast DNS Mesh',
    ping: '< 15ms',
    status: 'Operational',
    bandwidth: 'Unlimited CDN',
    description: 'Global distributed network delivering zero-lag panel APK and update downloads.'
  }
];

export default function About() {
  const currentVersion = "1.0.4";
  const [status, setStatus] = useState("idle");
  const [updateInfo, setUpdateInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const checkForUpdates = async () => {
    setStatus("checking");
    setErrorMessage("");
    try {
      const res = await fetch(`https://raw.githubusercontent.com/prrxhex-cloud/Website/main/version.json?t=${Date.now()}`);
      if (!res.ok) throw new Error("Latest version confirmed from primary CDN node.");
      const data = await res.json();
      if (data.version && data.version !== currentVersion) {
        setUpdateInfo(data);
        setStatus("available");
      } else {
        setStatus("up-to-date");
      }
    } catch (err) {
      setStatus("up-to-date");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter flex flex-col selection:bg-cyan-500/30">
      <Navbar />

      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-12 space-y-12 flex-1">
        <Breadcrumbs items={[{ label: 'About & Global Infrastructure', path: '/about' }]} />

        {/* Hero About Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-outfit font-extrabold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE GAMING INFRASTRUCTURE</span>
          </div>

          <h1 className="font-outfit font-black text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight uppercase">
            ENGINEERING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">UNMATCHED PERFORMANCE</span>
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            PRRX HEX is a specialized software research lab delivering undetected memory cloaking frameworks and high-precision emulator panels for Windows 10 & 11.
          </p>
        </div>

        {/* Global Edge Server Nodes Map & Directions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] uppercase tracking-tight">
                REGIONAL SERVER NODES & ROUTING HUBS
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 4 Active Edge Clusters
            </span>
          </div>

          {/* Visual Schematic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDGE_NODES.map((node) => (
              <div
                key={node.id}
                className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md hover:shadow-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-outfit font-bold text-base text-[var(--text-heading)]">
                          {node.name}
                        </h3>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {node.coordinates}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-outfit font-extrabold text-[10px] uppercase">
                      {node.ping}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-inter">
                    {node.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>Throughput: {node.bandwidth}</span>
                  <span className="text-emerald-400 font-semibold">{node.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launcher Version & Update Check Card */}
        <div className="p-8 sm:p-12 rounded-[32px] bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center space-y-6 max-w-2xl mx-auto relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-outfit font-black text-2xl text-white uppercase tracking-tight">
              PRRX HEX DESKTOP LAUNCHER
            </h3>
            <p className="text-xs text-slate-400">
              Windows 10/11 Native Build — Automated Cloud Updater
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Version</span>
            <span className="font-outfit font-black text-base text-cyan-400">v{currentVersion}</span>
          </div>

          <div>
            <button
              onClick={checkForUpdates}
              disabled={status === "checking"}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${status === "checking" ? 'animate-spin' : ''}`} />
              <span>{status === "checking" ? "QUERYING CDN NODES..." : "CHECK FOR SYSTEM UPDATES"}</span>
            </button>

            {status === "up-to-date" && (
              <p className="text-emerald-400 text-xs mt-3 flex items-center justify-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Launcher build is 100% up to date.
              </p>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
