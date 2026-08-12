import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
  // Only render if running in Electron
  if (!window.electronAPI) return null;

  return (
    <div 
      className="h-8 w-full flex items-center justify-between relative z-50 px-3 bg-transparent select-none transition-colors duration-300"
      style={{ WebkitAppRegion: 'drag' }}
      onDoubleClick={() => window.electronAPI.maximizeApp()}
    >
      <div className="flex-1 text-xs text-slate-500 font-medium pl-2 tracking-widest opacity-0 hover:opacity-100 transition-opacity">
        PRRX HEX
      </div>
      
      {/* Window Controls */}
      <div 
        className="flex items-center gap-1 h-full py-1"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button 
          onClick={() => window.electronAPI.minimizeApp()}
          className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-md transition-all duration-200"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={() => window.electronAPI.maximizeApp()}
          className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-md transition-all duration-200"
          title="Maximize/Restore"
        >
          <Square size={12} />
        </button>
        <button 
          onClick={() => window.electronAPI.quitApp()}
          className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] rounded-md transition-all duration-200"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
