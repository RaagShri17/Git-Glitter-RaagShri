import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Banner from './components/Banner';

// Pages
import Dashboard from './pages/Dashboard';
import SubjectsTimer from './pages/SubjectsTimer';
import AIPlanner from './pages/AIPlanner';
import FloraChat from './pages/FloraChat';
import Exams from './pages/Exams';
import Diagnose from './pages/Diagnose';
import MockTest from './pages/MockTest';
import KnowledgeMemory from './pages/KnowledgeMemory';
import ForgettingCurve from './pages/ForgettingCurve';
import Syllabus from './pages/Syllabus';
import PublishDiagnostics from './pages/PublishDiagnostics';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
          <Banner />
          <Navbar />
          <main className="flex-1 pb-12">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects-timer" element={<SubjectsTimer />} />
              <Route path="/ai-planner" element={<AIPlanner />} />
              <Route path="/flora-chat" element={<FloraChat />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/diagnose" element={<Diagnose />} />
              <Route path="/mock-test" element={<MockTest />} />
              <Route path="/knowledge-memory" element={<KnowledgeMemory />} />
              <Route path="/forgetting-curve" element={<ForgettingCurve />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/publish-diagnostics" element={<PublishDiagnostics />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}
