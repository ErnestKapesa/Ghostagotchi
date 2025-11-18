'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.data?.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-dark border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👻</span>
            <h1 className="text-2xl font-bold text-gradient">Ghostagotchi</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-7xl animate-float">👻</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Welcome to Ghostagotchi
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Adopt your own AI-powered ghost pet. Feed it, play with it, chat with it, and watch it level up. Your spooky companion awaits!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard" className="px-8 py-3 rounded-lg gradient text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105">
              Get Started 🎃
            </Link>
            <Link href="/leaderboard" className="px-8 py-3 rounded-lg glass text-orange-300 font-semibold hover:bg-orange-500/20 transition-all duration-300">
              View Leaderboard 📊
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="glass-dark p-6 rounded-xl hover:bg-orange-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-orange-300 mb-2">AI Companion</h3>
            <p className="text-gray-300">Chat with your ghost using natural language. It responds with personality and spooky humor!</p>
          </div>
          <div className="glass-dark p-6 rounded-xl hover:bg-orange-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-orange-300 mb-2">Level Up</h3>
            <p className="text-gray-300">Feed and play with your ghost to gain experience. Climb the leaderboard and become a ghost master!</p>
          </div>
          <div className="glass-dark p-6 rounded-xl hover:bg-orange-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-orange-300 mb-2">Cross-Platform</h3>
            <p className="text-gray-300">Access your ghost on web and iOS. Real-time sync keeps your pet with you everywhere!</p>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="glass-dark p-8 rounded-xl border border-orange-500/20">
          <h3 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-2">
            <span>👑</span> Top Ghosts
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">
                <span className="text-4xl">👻</span>
              </div>
              <p className="text-gray-400 mt-4">Loading ghosts...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((ghost, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-orange-500/10 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-orange-400 w-8">{ghost.rank}</span>
                    <div>
                      <p className="font-bold text-white">{ghost.ghostName}</p>
                      <p className="text-sm text-gray-400">by {ghost.owner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-300">Level {ghost.level}</p>
                    <p className="text-sm text-gray-400">{ghost.experience} XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No ghosts yet. Be the first to adopt one!</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-orange-500/20 glass-dark mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>Built with Next.js, Supabase, and OpenAI 👻</p>
          <p className="text-sm mt-2">Ghostagotchi © 2025 - Your AI Ghost Pet Awaits</p>
        </div>
      </footer>
    </div>
  );
}
