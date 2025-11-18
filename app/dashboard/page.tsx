'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch the user's pet here
    // For now, show a demo
    setLoading(false);
  }, []);

  const handleFeed = async () => {
    // Demo action
    alert('👻 Your ghost has been fed! +10 XP');
  };

  const handlePlay = async () => {
    // Demo action
    alert('🎮 You played with your ghost! +5 XP');
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatLoading(true);
    setChatMessages([...chatMessages, { sender: 'user', text: message }]);
    setMessage('');

    try {
      // Demo response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          sender: 'ghost', 
          text: '👻 Boo! That\'s a spooky question! *floats around mysteriously*' 
        }]);
        setChatLoading(false);
      }, 1000);
    } catch (error) {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="glass-dark border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl">👻</span>
            <h1 className="text-2xl font-bold text-gradient">Ghostagotchi</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Home
            </Link>
            <Link href="/leaderboard" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Pet Display */}
          <div className="md:col-span-2">
            <div className="glass-dark p-8 rounded-xl border border-orange-500/20">
              <h2 className="text-3xl font-bold text-gradient mb-8">Your Ghost Pet</h2>
              
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin text-6xl mb-4">👻</div>
                  <p className="text-gray-400">Loading your ghost...</p>
                </div>
              ) : (
                <>
                  {/* Pet Stats */}
                  <div className="mb-8">
                    <div className="text-center mb-8">
                      <div className="text-8xl animate-float mb-4">👻</div>
                      <h3 className="text-3xl font-bold text-orange-300 mb-2">Casper</h3>
                      <p className="text-gray-400">Your friendly ghost companion</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="glass p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Level</p>
                        <p className="text-3xl font-bold text-orange-300">5</p>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Experience</p>
                        <p className="text-3xl font-bold text-purple-300">450 XP</p>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Hunger</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">75%</p>
                      </div>
                      <div className="glass p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Mood</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">90%</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleFeed}
                      className="px-6 py-3 rounded-lg gradient text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      🍖 Feed
                    </button>
                    <button
                      onClick={handlePlay}
                      className="px-6 py-3 rounded-lg gradient text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      🎮 Play
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="glass-dark p-6 rounded-xl border border-orange-500/20 flex flex-col h-fit">
            <h3 className="text-xl font-bold text-gradient mb-4">💬 Chat</h3>
            
            {/* Chat Messages */}
            <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Start chatting with your ghost!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'gradient text-white' 
                        : 'glass text-gray-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="animate-pulse">👻 typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChat} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 px-3 py-2 rounded-lg glass text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="px-4 py-2 rounded-lg gradient text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
