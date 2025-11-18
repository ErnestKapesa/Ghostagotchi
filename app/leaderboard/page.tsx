'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Types
interface LeaderboardEntry {
  rank: number;
  ghostName: string;
  level: number;
  experience: number;
  owner: string;
  age: string;
}

interface LeaderboardResponse {
  data: {
    leaderboard: LeaderboardEntry[];
    total: number;
    lastUpdated: string;
  };
}

// Constants
const LEADERBOARD_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  SKELETON_ROWS: 5,
} as const;

// Utilities
const getMedalEmoji = (rank: number): string => {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return medals[rank] ?? '👻';
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/leaderboard');
      
      if (!res.ok) {
        throw new Error(`Failed to fetch leaderboard: ${res.status}`);
      }

      const data = (await res.json()) as LeaderboardResponse;
      
      if (!Array.isArray(data.data?.leaderboard)) {
        throw new Error('Invalid leaderboard response format');
      }

      setLeaderboard(data.data.leaderboard);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(message);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLeaderboard, LEADERBOARD_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="glass-dark border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl" aria-hidden="true">👻</span>
            <h1 className="text-2xl font-bold text-gradient">Ghostagotchi</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Home
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-all duration-300 text-orange-300 hover:text-orange-200">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gradient mb-4">👑 Leaderboard</h2>
          <p className="text-gray-300 text-lg">The most powerful ghosts in the realm</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 glass-dark p-4 rounded-xl border border-red-500/50 bg-red-500/5">
            <p className="text-red-300 font-semibold">Error loading leaderboard</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(LEADERBOARD_CONFIG.SKELETON_ROWS)].map((_, i) => (
              <div
                key={i}
                className="glass-dark p-6 rounded-xl border border-orange-500/20 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`glass-dark p-6 rounded-xl border transition-all duration-300 hover:scale-105 transform ${
                  entry.rank < 4
                    ? 'border-orange-500/50 bg-orange-500/5'
                    : 'border-orange-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div
                      className="text-4xl font-bold text-orange-400 w-12 text-center flex-shrink-0"
                      role="img"
                      aria-label={`Rank ${entry.rank}`}
                    >
                      {getMedalEmoji(entry.rank)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold text-white mb-1 truncate">
                        {entry.ghostName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        by <span className="text-orange-300">{entry.owner}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{entry.age}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="text-3xl font-bold text-gradient mb-2">
                      Level {entry.level}
                    </div>
                    <p className="text-lg font-semibold text-orange-300">
                      {entry.experience} XP
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((entry.experience % 100) / 100 * 100, 100)}%`,
                    }}
                    role="progressbar"
                    aria-valuenow={entry.experience % 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-dark p-12 rounded-xl text-center border border-orange-500/20">
            <p className="text-gray-400 text-lg mb-4">No ghosts on the leaderboard yet.</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 rounded-lg gradient text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
            >
              Adopt Your Ghost 👻
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-orange-500/20 glass-dark mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>Built with Next.js, Supabase, and OpenAI 👻</p>
          <p className="text-sm mt-2">Ghostagotchi © 2025 - Your AI Ghost Pet Awaits</p>
        </div>
      </footer>
    </div>
  );
}
