import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Shield, Terminal, HelpCircle, MessageSquare, ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { askAiSupport } from '@/utils/aiSupportEngine';
import { useSound } from '@/context/SoundContext';

const QUICK_QUESTIONS = [
  "🛡️ How to whitelist panel in Windows Defender?",
  "⚡ Best BlueStacks 5 settings for 120 FPS?",
  "🔑 How does Instant Slip AI Key delivery work?",
  "📦 What runtimes are needed for External Panel?"
];

export default function AiSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hey VIP! I am **PRRX AI Support**.\nAsk me anything about panel setup, Defender bypass, emulator settings, or instant key delivery!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { playClick, playSuccess } = useSound();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    playClick();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiReplyText = await askAiSupport(query, messages);
      playSuccess();
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "⚠️ Connection timeout. Please ask again or contact Admin via WhatsApp!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { playClick(); setIsOpen(!isOpen); }}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] border-2 border-cyan-300 flex items-center justify-center group"
        title="24/7 PRRX AI Tech Support"
      >
        <Bot className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
      </motion.button>

      {/* CHAT MODAL POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-inter text-left"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-sm text-white flex items-center gap-1.5">
                    <span>PRRX AI TECH SUPPORT</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
                      24/7 ONLINE
                    </span>
                  </h3>
                  <p className="text-[10px] text-cyan-300/80 font-mono">Autonomous Triage Engine</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 border border-cyan-500/30 text-slate-200 rounded-tl-none shadow-inner whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-cyan-500/20 max-w-[120px]">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto custom-scrollbar">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 text-[10px] text-slate-300 shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-slate-950 border-t border-cyan-500/30 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything (e.g. Defender command)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-inter"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition-colors shrink-0 font-bold"
              >
                <Send className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
