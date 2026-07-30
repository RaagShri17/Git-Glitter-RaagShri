import React, { useState } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { chatbotAPI } from '../api/client';

export default function FloraChat() {
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme] || themes.blue;

  const [messages, setMessages] = useState([
    { sender: 'flora', text: "Hello Shruti! I'm Flora, your AI study collaborator. What would you like to dive into today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Attempt backend API call
      const res = await chatbotAPI.askFlora(userMessage);
      const reply = res.data?.response || res.data?.reply || "I'm here to help you stay focused and master your subjects!";
      setMessages(prev => [...prev, { sender: 'flora', text: reply }]);
    } catch (err) {
      // Fallback intelligent responses tailored contextually
      setTimeout(() => {
        let fallbackReply = "That's a great concept to explore! Keep breaking it down step by step.";
        const lower = userMessage.toLowerCase();
        if (lower.includes('calculus') || lower.includes('integral')) {
          fallbackReply = "Remember to double-check your limits of integration when setting up your double and triple integrals!";
        } else if (lower.includes('thermodynamics')) {
          fallbackReply = "For thermodynamic cycles, keeping track of work and heat signs is key to getting the correct net efficiency.";
        } else if (lower.includes('code') || lower.includes('python')) {
          fallbackReply = "Make sure your Pandas dataframes are properly cleaned and indexed before plotting with Matplotlib!";
        }
        setMessages(prev => [...prev, { sender: 'flora', text: fallbackReply }]);
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-130px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-500" /> Flora AI Chat
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Your personal AI collaborator for study troubleshooting and concept explanations.</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-800 text-white' : `${theme.primaryBg}`
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme.primaryBg}`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-sm rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Flora anything about your subjects or schedule..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`p-3 rounded-xl font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme.primaryBg}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
