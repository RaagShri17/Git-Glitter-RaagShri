import React, { useState } from 'react';
import { Award, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MockTest() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [testStarted, setTestStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const questions = [
    {
      id: 1,
      question: "What is the curl of a conservative vector field?",
      options: ["Zero vector", "Unit vector", "Gradient of scalar function", "Undefined"],
      correct: 0
    },
    {
      id: 2,
      question: "In an adiabatic process, which of the following remains constant?",
      options: ["Temperature", "Pressure", "Entropy", "Volume"],
      correct: 2
    },
    {
      id: 3,
      question: "Which AWS IAM component defines permissions without attaching directly to a user?",
      options: ["Access Key", "IAM Role", "Security Group", "Policy Tag"],
      correct: 1
    }
  ];

  const handleStartTest = () => {
    setTestStarted(true);
    setScore(null);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
  };

  const handleAnswerSelect = (idx) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    const q = questions[currentQuestionIdx];
    const isCorrect = selectedOption === q.correct;
    
    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setScore(isCorrect ? 100 : 66); // Simulated scoring
      setTestStarted(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Adaptive Mock Test</h2>
        <p className="text-slate-500 text-sm mt-1">Test your conceptual knowledge with Flora's dynamically calibrated questions.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto">
        {testStarted ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme.accentLight}`}>
                Active Quiz
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">
                {questions[currentQuestionIdx].question}
              </h3>

              <div className="space-y-2.5">
                {questions[currentQuestionIdx].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                      selectedOption === idx
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className={`px-6 py-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-50 ${theme.primaryBg}`}
              >
                {currentQuestionIdx + 1 === questions.length ? 'Finish Test' : 'Next Question'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Ready to test your readiness?</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              This adaptive mock test covers Vector Calculus, Thermodynamics, and Cloud Computing concepts.
            </p>
            {score !== null && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-semibold text-sm inline-block">
                Last Test Score: {score}% — Great job! Check diagnostics for details.
              </div>
            )}
            <div>
              <button
                onClick={handleStartTest}
                className={`mt-4 px-8 py-3.5 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-2 mx-auto ${theme.primaryBg}`}
              >
                <Play className="w-4 h-4" /> Start Mock Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
