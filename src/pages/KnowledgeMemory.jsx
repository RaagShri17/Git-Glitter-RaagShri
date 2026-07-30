import React, { useState } from 'react';
import { Brain, Search, Plus, BookMarked, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function KnowledgeMemory() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [memories, setMemories] = useState([
    { id: 1, topic: 'Vector Calculus', summary: 'Curl of a conservative vector field is always zero. Line independence of path applies.', category: 'Math' },
    { id: 2, topic: 'Thermodynamics', summary: 'Adiabatic processes involve no heat transfer (Q = 0). PV^gamma = constant for reversible adiabatic.', category: 'Physics' },
    { id: 3, topic: 'Cloud Computing', summary: 'AWS IAM roles grant temporary permissions without attaching credentials directly to users.', category: 'Cloud' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newTopic.trim() || !newSummary.trim()) return;

    const entry = {
      id: Date.now(),
      topic: newTopic.trim(),
      summary: newSummary.trim(),
      category: 'General'
    };

    setMemories([entry, ...memories]);
    setNewTopic('');
    setNewSummary('');
  };

  const filteredMemories = memories.filter(m => 
    m.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Knowledge Memory</h2>
        <p className="text-slate-500 text-sm mt-1">Your long-term conceptual vault indexed and retrieved by Flora AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Knowledge Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Store New Insight</h3>
          </div>

          <form onSubmit={handleAddMemory} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Topic / Concept</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g., Stokes Theorem"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Concept Summary / Formula</label>
              <textarea
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                rows={3}
                placeholder="Write key takeaways or derivation steps..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 ${theme.primaryBg}`}
            >
              <Plus className="w-4 h-4" /> Save to Memory Vault
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Search & Memory Cards */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-slate-400" /> Stored Vault Items
            </h3>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search memories..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors w-full sm:w-64"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredMemories.length > 0 ? (
              filteredMemories.map((mem) => (
                <div key={mem.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{mem.topic}</h4>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.accentLight}`}>
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{mem.summary}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No matching memories found in your vault.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
