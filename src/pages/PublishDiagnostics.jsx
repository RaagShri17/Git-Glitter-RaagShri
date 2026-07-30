import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PublishDiagnostics() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(true);

  const publicLink = "https://studiora.ai/diagnostics/shruti-vector-calc-2026";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Publish Diagnostics Report</h2>
        <p className="text-slate-500 text-sm mt-1">Share your conceptual mastery and diagnostic breakdown securely with mentors or study peers.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${theme.accentLight}`}>
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Public Shareable Link</h3>
            <p className="text-xs text-slate-500">Anyone with this link can view your verified diagnostic summary and retention metrics.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="text"
            readOnly
            value={publicLink}
            className="bg-transparent flex-1 text-sm text-slate-700 outline-none px-2 font-mono"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-transform active:scale-95 ${theme.primaryBg}`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-pink-500" /> Included in Public View:
          </div>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li>Vector Calculus & Thermodynamics accuracy breakdowns</li>
            <li>Ebbinghaus retention curve status</li>
            <li>Verified study streak & completed topics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
