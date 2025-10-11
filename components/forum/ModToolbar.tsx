'use client';

import { useState } from 'react';

interface ModToolbarProps {
  threadId: string;
  isSticky: boolean;
  isLocked: boolean;
  onAction?: () => void;
}

export default function ModToolbar({
  threadId,
  isSticky,
  isLocked,
  onAction,
}: ModToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const performAction = async (action: string, targetId?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/forum/mod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          targetId: targetId || threadId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setSuccess(data.message);

      if (onAction) {
        onAction();
      }

      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this thread? This cannot be undone.')) {
      performAction('deleteThread');
    }
  };

  const handleSticky = () => {
    performAction(isSticky ? 'unsticky' : 'sticky');
  };

  const handleLock = () => {
    performAction(isLocked ? 'unlock' : 'lock');
  };

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-red-400">Moderator Tools</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={handleSticky}
          disabled={loading}
          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
        >
          {isSticky ? 'Unsticky' : 'Sticky'}
        </button>

        <button
          onClick={handleLock}
          disabled={loading}
          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
        >
          Delete Thread
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-400">{success}</p>
      )}

      {loading && (
        <p className="text-sm text-gray-400">Processing...</p>
      )}
    </div>
  );
}

