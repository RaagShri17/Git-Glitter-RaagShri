import React, { useState } from 'react';
import { BookOpen, CheckCircle, Plus, FileText, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Syllabus() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [syllabusList, setSyllabusList] = useState([
    { id: 1, subject: 'Vector Calculus', topic: 'Double and Triple Integrals', status: 'Completed' },
    { id: 2, subject: 'Vector Calculus', topic: 'Stokes and Divergence Theorem', status: 'In Progress' },
    { id: 3, subject: 'Thermodynamics', topic: 'First and Second Law Cycles', status: 'In Progress' },
    { id: 4, subject: 'Cloud Computing', topic: 'IAM Roles, Policies, and Security', status: 'Pending' },
  ]);

  const [newSubject, setNewSubject] = useState('Vector Calculus');
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const entry = {
      id: Date.now(),
      subject: newSubject,
      topic: newTopic.trim(),
      status: 'Pending',
    };

    setSyllabusList([...syllabusList, entry]);
    setNewTopic('');
  };

  const toggleStatus = (id) => {
    setSyllabusList(syllabusList.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Pending' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Syllabus Tracker</h2>
        <p className="text-slate-500 text-sm mt-1">Break down your coursework and track mastery across every core subject.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Syllabus Item */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Add Syllabus Topic</h3>
          </div>

          <form onSubmit={handleAddTopic} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none"
              >
                <option>Vector Calculus</option>
                <option>Thermodynamics</option>
                <option>Data Structures & Algorithms</option>
                <option>Cloud Computing & IAM</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Topic Name</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g., Green's Theorem"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 ${theme.primaryBg}`}
            >
              <Plus className="w-4 h-4" /> Add to Syllabus
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Syllabus Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Curriculum Roadmap
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme.accentLight}`}>
              {syllabusList.filter(s => s.status === 'Completed').length} / {syllabusList.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {syllabusList.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.subject}</span>
                  <h4 className="text-sm font-bold text-slate-800">{item.topic}</h4>
                </div>

                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    item.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
