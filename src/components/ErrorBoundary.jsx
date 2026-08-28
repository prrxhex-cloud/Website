import React from 'react';
import { ShieldAlert, RefreshCw, Home, Settings } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL CLIENT RENDER ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('prrx_maintenance_config');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-inter">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.2)] space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-outfit font-black text-2xl tracking-tight text-white uppercase">
                SYSTEM RECOVERY PROTOCOL
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                A client rendering exception was intercepted. The interface was protected from crashing.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/20 text-left overflow-x-auto max-h-36 custom-scrollbar">
                <p className="text-xs font-mono text-rose-300 font-semibold">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RELOAD & CLEAR CACHE</span>
              </button>

              <button
                onClick={() => { window.location.hash = '#/admin'; window.location.reload(); }}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-outfit font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>ADMIN</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
