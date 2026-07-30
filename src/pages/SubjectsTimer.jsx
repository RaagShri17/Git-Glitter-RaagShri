import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, BookOpen, Sliders, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SubjectsTimer() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  // Subjects & Difficulty Sliders State
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Vector Calculus', difficulty: 4 },
    { id: 2, name: 'Thermodynamics', difficulty: 3 },
    { id: 3, name: 'Data Structures & Algorithms', difficulty: 5 },
    { id: 4, name: 'Cloud Computing & IAM', difficulty: 2 },
  ]);

  // Focus Timer State (25 mins default)
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Vector Calculus');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDifficultyChange = (id, newDiff) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, difficulty: Number(newDiff) } : s));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Subjects & Focus Timer</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your course difficulty levels and run your deep work pomodoro timer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Subject Difficulty Builders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Subject Difficulty Tuning</h3>
          </div>
          <p className="text-slate-500 text-sm">Adjust difficulty scores (1-5) to let Flora recalibrate your study schedule weightings.</p>

          <div className="space-y-4">
            {subjects.map((subj) => (
              <div key={subj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700 text-sm">{subj.name}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${theme.accentLight}`}>
                    Level {subj.difficulty}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={subj.difficulty}
                  onChange={(e) => handleDifficultyChange(subj.id, e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pomodoro Focus Timer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800">Deep Work Timer</h3>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-extrabold text-slate-800 tracking-wider mb-2 font-mono">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-slate-400 font-medium">Currently focusing on: <span className="text-slate-700 font-semibold">{selectedSubject}</span></p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 ${theme.primaryBg}`}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Focus</>}
            </button>
            <button
              onClick={() => { setIsRunning(false); setTimeLeft(1500); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
