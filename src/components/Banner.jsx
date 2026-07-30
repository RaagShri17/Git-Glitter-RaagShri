import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Banner() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  return (
    <div className={`mx-6 mt-6 rounded-2xl p-5 ${theme.bannerBg} border ${theme.bannerBorder} shadow-sm flex items-start gap-3 transition-colors duration-300`}>
      <div className={`p-2 rounded-xl bg-white/80 shadow-sm ${theme.textColor} mt-0.5`}>
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
          A Note From Flora
        </span>
        <p className="text-slate-700 font-medium text-sm md:text-base">
          Discipline is a love letter to your future.
        </p>
      </div>
    </div>
  );
}
