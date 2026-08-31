import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-subtle)]/60 border border-[var(--border-color)] backdrop-blur-md font-inter text-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
      <Link 
        to="/" 
        className="text-[var(--text-muted)] hover:text-cyan-400 flex items-center gap-1 font-semibold transition-colors flex-none"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.path || index}>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-60 flex-none" />
            {isLast ? (
              <span className="text-cyan-400 font-bold truncate max-w-[200px] flex-none">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.path} 
                className="text-[var(--text-muted)] hover:text-cyan-400 font-medium transition-colors flex-none"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
