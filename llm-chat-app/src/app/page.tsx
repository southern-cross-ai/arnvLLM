'use client';

import React, { useState, useRef, FormEvent } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'llm'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  // -----------------------------
  // Chat submit
  // -----------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { from: 'user', text: trimmed }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { from: 'llm', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'llm', text: 'Error fetching response.' }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // -----------------------------
  // URL submit
  // -----------------------------
  const handleSubmitUrl = async (e: FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      const resp = await fetch('http://localhost:8000/api/fetch_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { from: 'llm', text: data.message }]);
      setUrlInput('');
      scrollToBottom();
    } catch {
      setMessages(prev => [...prev, { from: 'llm', text: 'Failed to fetch URL.' }]);
    }
  };

  // -----------------------------
  // File upload
  // -----------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { from: 'llm', text: data.message }]);
      scrollToBottom();
    } catch {
      setMessages(prev => [...prev, { from: 'llm', text: 'Failed to upload file.' }]);
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
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'llm' && <User className="w-6 h-6 text-gray-500 mr-2" />}
            <div className={`max-w-[70%] p-3 rounded-2xl ${msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.text}
            </div>
            {msg.from === 'user' && <User className="w-6 h-6 text-blue-600 ml-2 rotate-180" />}
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <footer className="bg-white p-4 flex flex-col space-y-2 shadow-inner">
        {/* URL form */}
        <form onSubmit={handleSubmitUrl} className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter webpage URL"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-green-600 text-white px-3 rounded">Fetch</button>
        </form>

        {/* File upload */}
        <div className="flex items-center space-x-2">
          <label className="bg-black text-white px-3 py-2 rounded cursor-pointer">
            Upload File
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Chat form */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
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
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

