import React, { useState } from 'react';
import { Calendar, Zap, Battery, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AIPlanner() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [energyLevel, setEnergyLevel] = useState(80);
  const [focusWindow, setFocusWindow] = useState('Morning (9 AM - 12 PM)');
  const [generatedSchedule, setGeneratedSchedule] = useState(false);

  const handleGenerate = () => {
    setGeneratedSchedule(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Planner & Schedule Optimizer</h2>
        <p className="text-slate-500 text-sm mt-1">Let Flora build an intelligent study roadmap calibrated to your daily energy peaks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Preferences & Sliders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">Flora's Optimizer</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Battery className="w-4 h-4 text-emerald-500" /> Today's Energy Level</span>
                <span className={`${theme.accentLight} px-2.5 py-0.5 rounded-full text-xs font-bold`}>{energyLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Peak Focus Window
              </label>
              <select
                value={focusWindow}
                onChange={(e) => setFocusWindow(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none"
              >
                <option>Morning (9 AM - 12 PM)</option>
                <option>Afternoon (2 PM - 5 PM)</option>
                <option>Evening (7 PM - 10 PM)</option>
                <option>Night Owl (10 PM - 1 AM)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className={`w-full py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 ${theme.primaryBg}`}
          >
            Generate AI Schedule
          </button>
        </div>

        {/* Right 2 Cols: Schedule Output */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800">Optimized Daily Roadmap</h3>
              </div>
              {generatedSchedule && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tailored successfully
                </span>
              )}
            </div>

            {generatedSchedule ? (
              <div className="space-y-3 mt-4">
                {[
                  { time: '09:00 AM - 10:30 AM', task: 'Vector Calculus: Double & Triple Integrals', type: 'High Focus' },
                  { time: '10:45 AM - 11:45 AM', task: 'Thermodynamics: First Law Cycle Analysis', type: 'Problem Solving' },
                  { time: '02:00 PM - 03:15 PM', task: 'Cloud Computing: IAM Roles & Policies Quiz', type: 'Active Recall' },
                  { time: '04:00 PM - 05:00 PM', task: 'Data Structures: Graph Traversal Review', type: 'Light Revision' },
                ].map((slot, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">{slot.time}</span>
                      <h4 className="text-sm font-bold text-slate-800">{slot.task}</h4>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${theme.accentLight}`}>
                      {slot.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-slate-50 text-slate-300 mb-3">
                  <Calendar className="w-10 h-10" />
                </div>
                <h4 className="text-slate-700 font-bold mb-1">No schedule generated yet</h4>
                <p className="text-slate-400 text-sm max-w-sm">Adjust your energy levels and click "Generate AI Schedule" to let Flora plan your study day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
