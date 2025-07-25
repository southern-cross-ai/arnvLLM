'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'llm'; text: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { from: 'user', text: trimmed }]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { from: 'user', text: trimmed }] }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { from: 'llm', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'llm', text: 'Error fetching response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow p-4 flex items-center">
        <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-semibold text-gray-800">LLM Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.from === 'llm' && <User className="w-6 h-6 text-gray-500 mr-2" />}
            <div
              className={`max-w-[70%] p-3 rounded-2xl ${
                msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
            {msg.from === 'user' && <User className="w-6 h-6 text-blue-600 ml-2 rotate-180" />}
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <footer className="bg-white p-4 flex items-center shadow-inner">
        <form onSubmit={handleSubmit} className="flex flex-1 items-center space-x-3">
          <textarea
            className="flex-1 p-2 border rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={1}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" className="opacity-75" />
              </svg>
            ) : (
              <Send className="w-5 h-5 rotate-90" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
