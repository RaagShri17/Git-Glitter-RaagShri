import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Exams() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [exams, setExams] = useState([
    { id: 1, name: 'Vector Calculus Midterm', date: '2026-04-15', time: '10:00 AM', subject: 'Vector Calculus' },
    { id: 2, name: 'Thermodynamics Final Exam', date: '2026-04-22', time: '02:00 PM', subject: 'Thermodynamics' },
    { id: 3, name: 'Cloud Computing & IAM Certification', date: '2026-05-05', time: '11:00 AM', subject: 'Cloud Computing' },
  ]);

  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('Vector Calculus');

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) return;

    const newEntry = {
      id: Date.now(),
      name: newExamName.trim(),
      date: newExamDate,
      time: '10:00 AM',
      subject: newExamSubject,
    };

    setExams([...exams, newEntry]);
    setNewExamName('');
    setNewExamDate('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Exam Countdown & Tracker</h2>
        <p className="text-slate-500 text-sm mt-1">Keep track of your upcoming test dates and automatically align your study milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Exam Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Schedule New Exam</h3>
          </div>

          <form onSubmit={handleAddExam} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Exam Title</label>
              <input
                type="text"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                placeholder="e.g., Data Structures Final"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</label>
              <select
                value={newExamSubject}
                onChange={(e) => setNewExamSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none"
              >
                <option>Vector Calculus</option>
                <option>Thermodynamics</option>
                <option>Data Structures & Algorithms</option>
                <option>Cloud Computing & IAM</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Exam Date</label>
              <input
                type="date"
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 ${theme.primaryBg}`}
            >
              <Plus className="w-4 h-4" /> Add Exam Deadline
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Exam List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Upcoming Deadlines
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme.accentLight}`}>
              {exams.length} Active Exams
            </span>
          </div>

          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{exam.subject}</span>
                  <h4 className="text-sm font-bold text-slate-800">{exam.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">{exam.date}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{exam.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
