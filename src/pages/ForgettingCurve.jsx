import React, { useState } from 'react';
import { TrendingDown, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ForgettingCurve() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [retentionItems, setRetentionItems] = useState([
    { id: 1, topic: 'Vector Calculus: Stokes Theorem', retention: '45%', status: 'Review Due', interval: '2 Days' },
    { id: 2, topic: 'Thermodynamics: Entropy Cycles', retention: '70%', status: 'Stable', interval: '5 Days' },
    { id: 3, topic: 'Cloud Computing: IAM Policies', retention: '30%', status: 'Critical', interval: 'Today' },
  ]);

  const [optimizing, setOptimizing] = useState(false);

  const handleOptimizeSchedules = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setRetentionItems(prev => prev.map(item => ({ ...item, retention: '92%', status: 'Optimized', interval: '7 Days' })));
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ebbinghaus Forgetting Curve & Spaced Repetition</h2>
          <p className="text-slate-500 text-sm mt-1">Flora monitors your memory decay and schedules optimal revision windows.</p>
        </div>
        <button
          onClick={handleOptimizeSchedules}
          disabled={optimizing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-50 ${theme.primaryBg}`}
        >
          <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
          {optimizing ? 'Recalibrating Curves...' : 'Optimize Spaced Intervals'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">Spaced Repetition Engine</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Memory retention drops exponentially over time unless reinforced at calculated intervals. Flora automatically re-triggers revision sessions right before your retention dips below critical thresholds.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Algorithm</span>
            <p className="text-xs font-semibold text-slate-700">Modified SuperMemo SM-2 with Dynamic Difficulty Weighting</p>
          </div>
        </div>

        {/* Right 2 Cols: Retention Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-slate-400" /> Topic Retention Status
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme.accentLight}`}>
              {retentionItems.length} Monitored Items
            </span>
          </div>

          <div className="space-y-3">
            {retentionItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next Review: {item.interval}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Critical' ? 'bg-rose-50 text-rose-600' :
                      item.status === 'Optimized' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{item.topic}</h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Retention</span>
                    <span className="text-sm font-bold text-slate-800">{item.retention}</span>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-transform active:scale-95 ${theme.primaryBg}`}>
                    Review Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
