'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BOARD_INFO } from '@/lib/forum/constants';

interface Board {
  id: number;
  slug: string;
  title: string;
  about: string | null;
  _count: {
    threads: number;
  };
}

interface BoardListProps {
  boards: Board[];
  walletConnected?: boolean;
  onRefresh?: () => void;
}

export default function BoardList({ boards, walletConnected, onRefresh }: BoardListProps) {
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!slug.trim() || !title.trim()) {
      setError('Slug and title are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating board:', { slug, title, about });
      
      const res = await fetch('/api/forum/boards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Wallet-Address': walletConnected ? 'connected' : 'demo',
        },
        body: JSON.stringify({ slug, title, about }),
      });

      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        // Check if it's a database error
        if (data.error && (data.error.includes('database') || data.error.includes('connect') || data.error.includes('PrismaClient'))) {
          throw new Error('⚠️ Database not connected. The board UI works, but you need PostgreSQL to save boards. See FORUM_SETUP.md for setup instructions.');
        }
        throw new Error(data.error || 'Failed to create board');
      }

      // Reset form
      setSlug('');
      setTitle('');
      setAbout('');
      setShowForm(false);
      setError(null);

      alert(`✅ Board /${data.board.slug}/ created successfully!`);

      // Refresh boards list
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create board';
      setError(errorMessage);
      console.error('Create board error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center border-b border-[#800000] pb-2">
        <h2 className="text-xl font-bold text-[#800000]">Boards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] rounded px-3 py-1 text-sm font-semibold transition-colors"
        >
          ＋ Create Channel
        </button>
      </div>

      {/* Create Board Form */}
      {showForm && (
        <div className="border border-[#B7C5D9] bg-[#F0E0D6] p-4 rounded shadow-sm">
          <h3 className="text-sm font-bold mb-3 text-[#800000]">Create New Board</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Slug (URL name) *
              </label>
              <input
                type="text"
                placeholder="e.g., tech"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="w-full border border-[#B7C5D9] p-2 text-sm focus:border-[#800000] focus:outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-600 mt-1">
                Letters and numbers only, no spaces
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Technology"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[#B7C5D9] p-2 text-sm focus:border-[#800000] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Description (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Discussion about technology"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full border border-[#B7C5D9] p-2 text-sm focus:border-[#800000] focus:outline-none"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-100 border border-red-300 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] disabled:bg-gray-300 disabled:cursor-not-allowed rounded px-4 py-2 text-sm font-semibold transition-colors"
              >
                {loading ? 'Creating...' : 'Create Board'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                disabled={loading}
                className="bg-gray-200 border border-gray-400 hover:bg-gray-300 rounded px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boards Grid - 4chan Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {boards.map((board) => {
          const boardColor = BOARD_INFO[board.slug]?.color || '#800000';

          return (
            <Link
              key={board.id}
              href={`/forum/${board.slug}`}
              className="block p-3 border border-[#B7C5D9] bg-[#F0E0D6] hover:bg-[#EEDAC2] transition-colors text-center"
            >
              <div className="font-bold text-lg mb-1" style={{ color: boardColor }}>
                /{board.slug}/
              </div>
              <div className="text-xs font-semibold text-gray-800 mb-1">
                {board.title}
              </div>
              {board.about && (
                <div className="text-xs text-gray-600 line-clamp-2">
                  {board.about}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {board._count.threads} threads
              </div>
            </Link>
          );
        })}
      </div>

      {boards.length === 0 && (
        <div className="text-center py-12 bg-[#F0E0D6] border border-[#B7C5D9] rounded">
          <p className="text-gray-600">No boards yet. Create the first one!</p>
        </div>
      )}
    </div>
  );
}

