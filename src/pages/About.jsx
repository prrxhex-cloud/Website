import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { RefreshCw, DownloadCloud, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import appInfo from '../../desktop-app/package.json';

export default function About() {
  const currentVersion = appInfo.version;
  const [status, setStatus] = useState("idle"); // idle, checking, available, up-to-date, error, downloading
  const [updateInfo, setUpdateInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const checkForUpdates = async () => {
    setStatus("checking");
    setErrorMessage("");
    try {
      // Add a cache-buster to ensure we get the latest JSON
      const res = await fetch(`https://raw.githubusercontent.com/prrxhex-cloud/Website/main/version.json?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch update information.");
      
      const data = await res.json();
      
      // Basic version comparison (e.g. 1.0.1 > 1.0.0)
      if (data.version && data.version !== currentVersion) {
        setUpdateInfo(data);
        setStatus("available");
      } else {
        setStatus("up-to-date");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please try again later.");
    }
  };

  const handleUpdateNow = async () => {
    if (!updateInfo || !updateInfo.downloadUrl) return;
    setStatus("downloading");
    
    try {
      if (window.electronAPI && window.electronAPI.downloadAndInstallUpdate) {
        const result = await window.electronAPI.downloadAndInstallUpdate(updateInfo.downloadUrl);
        if (!result.success) {
          throw new Error(result.error || "Failed to initiate update process.");
        }
      } else {
        throw new Error("Desktop environment not detected. Cannot auto-update.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An error occurred while downloading the update.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-8 md:p-12 shadow-xl w-full text-center relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#06b6d4]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Logo & Branding */}
          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <ShieldCheck className="w-12 h-12 text-[#06b6d4]" />
            </div>
            <h1 className="font-outfit font-black text-3xl md:text-4xl text-[var(--text-heading)] tracking-wider">
              PRRX HEX Launcher
            </h1>
            <p className="font-inter text-sm text-[var(--text-muted)] mt-2 font-medium">
              Premium FF Cheatz
            </p>
          </div>

          {/* Version Info */}
          <div className="relative z-10 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] mb-10">
            <span className="font-inter text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Current Version</span>
            <span className="font-outfit font-black text-lg text-[#06b6d4]">v{currentVersion}</span>
          </div>

          {/* Update Section */}
          <div className="relative z-10 flex flex-col items-center gap-4 min-h-[160px]">
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <button 
                    onClick={checkForUpdates}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#06b6d4] text-black font-outfit font-bold text-sm tracking-widest hover:bg-[#06b6d4]/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-1"
                  >
                    <RefreshCw className="w-5 h-5" />
                    CHECK FOR UPDATES
                  </button>
                  <p className="font-inter text-xs text-[var(--text-muted)] mt-4">Keep your launcher secure and up to date.</p>
                </motion.div>
              )}

              {status === "checking" && (
                <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-8 h-8 text-[#06b6d4] animate-spin" />
                  <p className="font-inter text-sm text-[var(--text-muted)] font-medium">Checking for updates...</p>
                </motion.div>
              )}

              {status === "up-to-date" && (
                <motion.div key="up-to-date" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="font-outfit font-bold text-lg text-[var(--text-heading)]">You are running the latest version.</p>
                  <button onClick={() => setStatus("idle")} className="font-inter text-xs text-[var(--text-muted)] hover:text-[#06b6d4] transition-colors mt-2 underline underline-offset-4">Check again</button>
                </motion.div>
              )}

              {status === "available" && updateInfo && (
                <motion.div key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full max-w-sm">
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <p className="font-outfit font-bold text-amber-500 tracking-wide text-sm">UPDATE AVAILABLE: v{updateInfo.version}</p>
                    </div>
                    {updateInfo.changelog && (
                      <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-main)]/50 p-3 rounded-lg border border-[var(--border-color)]">
                        <span className="font-bold text-[var(--text-primary)] block mb-1">Changelog:</span>
                        {updateInfo.changelog}
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleUpdateNow}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 text-black font-outfit font-bold text-sm tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1"
                  >
                    <DownloadCloud className="w-5 h-5" />
                    UPDATE NOW
                  </button>
                </motion.div>
              )}

              {status === "downloading" && (
                <motion.div key="downloading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="font-inter text-sm text-[var(--text-heading)] font-bold">Downloading and installing update...</p>
                  <p className="font-inter text-xs text-[var(--text-muted)]">Please wait, the application will restart shortly.</p>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="font-outfit font-bold text-lg text-rose-500">Update Failed</p>
                  <p className="font-inter text-xs text-[var(--text-muted)] text-center max-w-xs">{errorMessage}</p>
                  <button onClick={() => setStatus("idle")} className="px-6 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-sm font-bold hover:bg-[var(--bg-hover)] transition-colors mt-4">
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Background Auto-Update Settings */}
          <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex items-center justify-between gap-4 max-w-sm mx-auto">
            <div className="text-left">
              <h3 className="font-outfit font-bold text-sm text-[var(--text-heading)]">Auto-Download Updates</h3>
              <p className="font-inter text-xs text-[var(--text-muted)] mt-1">Download updates in the background automatically</p>
            </div>
            <button
              onClick={() => {
                const isCurrentlyDisabled = localStorage.getItem('disableAutoUpdate') === 'true';
                localStorage.setItem('disableAutoUpdate', isCurrentlyDisabled ? 'false' : 'true');
                // Force state update to re-render UI toggle
                setStatus(status === 'idle' ? 'idle ' : 'idle'); 
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${localStorage.getItem('disableAutoUpdate') === 'true' ? 'bg-slate-700' : 'bg-[#06b6d4]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${localStorage.getItem('disableAutoUpdate') === 'true' ? 'left-1' : 'left-7'}`} />
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
