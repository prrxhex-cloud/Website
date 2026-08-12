import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
  // Only render if running in Electron
  if (!window.electronAPI) return null;

  return (
    <div 
      className="h-8 w-full flex items-center justify-between absolute top-0 left-0 right-0 z-50 px-3 bg-transparent select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex-1"></div>
      
      {/* Window Controls */}
      <div 
        className="flex items-center gap-2 h-full"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button 
          onClick={() => window.electronAPI.minimizeApp()}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={() => window.electronAPI.maximizeApp()}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Maximize/Restore"
        >
          <Square size={12} />
        </button>
        <button 
          onClick={() => window.electronAPI.quitApp()}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 rounded transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
