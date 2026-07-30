import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Diagnose() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [testResults, setTestResults] = useState([
    { id: 1, question: 'Evaluate line integral in conservative vector field', category: 'Vector Calculus', status: 'Mistake Detected', tip: 'Check potential function derivation constants.' },
    { id: 2, question: 'First Law of Thermodynamics adiabatic compression work', category: 'Thermodynamics', status: 'Correct', tip: 'Solid application of PV^gamma = C.' },
    { id: 3, question: 'Cloud IAM Role least privilege assignment', category: 'Cloud Computing', status: 'Hesitation Flag', tip: 'Review service account permission boundaries.' },
  ]);

  const [analyzing, setAnalyzing] = useState(false);

  const handleRunDiagnostics = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setTestResults(prev => prev.map(item => ({ ...item, status: item.status === 'Mistake Detected' ? 'Reviewed & Fixed' : item.status })));
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Post-Test Error Diagnostics</h2>
          <p className="text-slate-500 text-sm mt-1">Flora analyzes your mistakes and hesitation flags to isolate conceptual gaps.</p>
        </div>
        <button
          onClick={handleRunDiagnostics}
          disabled={analyzing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-50 ${theme.primaryBg}`}
        >
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">Mistake & Hesitation Breakdown</h3>
        </div>

        <div className="space-y-3">
          {testResults.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.category}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'Correct' ? 'bg-emerald-50 text-emerald-600' :
                    item.status === 'Reviewed & Fixed' ? 'bg-blue-50 text-blue-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{item.question}</h4>
                <p className="text-xs text-slate-500">Flora's Tip: {item.tip}</p>
              </div>

              <div className="flex items-center gap-2">
                {item.status === 'Correct' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
