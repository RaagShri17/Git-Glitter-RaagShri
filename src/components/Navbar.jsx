import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Studiora
          </h1>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            with <Sparkles className="w-3 h-3 text-pink-400 inline" /> Flora
          </p>
        </div>
      </div>

      {/* Color theme selectors matching the header circles in the UI screenshots */}
      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
        {Object.entries(themes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`w-5 h-5 rounded-full transition-transform ${t.dotClass} ${
              currentTheme === key ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            title={`Switch to ${key} theme`}
          />
        ))}
      </div>
    </header>
  );
}
