import React from 'react';
import { BookOpen, Clock, Target, CheckCircle2, TrendingUp, Award, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Here is your daily pulse, study progress, and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Flora AI Active
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${theme.accentLight}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Focus Time Today</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">3.5 hrs</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics Mastered</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">24 / 38</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Retention Rate</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">88%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Streak</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">5 Days</h3>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Progress & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" /> Subject Progress Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Vector Calculus', progress: 75, color: 'bg-blue-600' },
                { name: 'Thermodynamics', progress: 60, color: 'bg-emerald-500' },
                { name: 'Data Structures & Algorithms', progress: 90, color: 'bg-purple-600' },
                { name: 'Cloud Computing & IAM', progress: 40, color: 'bg-amber-500' }
              ].map((subj, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{subj.name}</span>
                    <span className="text-slate-400 font-medium">{subj.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${subj.color} rounded-full transition-all duration-500`} style={{ width: `${subj.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Flora's Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-slate-800">Flora's Action Plan</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">Based on your forgetting curves and recent activity, here is what you should focus on next:</p>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center mt-0.5">1</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Review Vector Calculus</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Retention is dropping below 80% threshold.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">2</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Mock Test Practice</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Take a quick 15-min test on thermodynamics.</p>
                </div>
              </div>
            </div>
          </div>

          <button className={`w-full mt-6 py-3 rounded-xl font-semibold shadow-sm transition-colors ${theme.primaryBg}`}>
            Start Focus Session
          </button>
        </div>
      </div>
    </div>
  );
}
