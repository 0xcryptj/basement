'use client';

import { useState, useEffect } from 'react';
import BoardList from '@/components/forum/BoardList';

interface Board {
  id: number;
  slug: string;
  title: string;
  about: string | null;
  _count: {
    threads: number;
  };
}

export default function ForumPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is connected (looking for common wallet detection)
    const checkWallet = () => {
      if (typeof window !== 'undefined') {
        const hasEthereum = !!(window as any).ethereum;
        setWalletConnected(hasEthereum);
      }
    };
    
    checkWallet();
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const res = await fetch('/api/forum/boards');
      const data = await res.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading boards...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-[#AF0A0F] mb-2">
          The Basement
        </h2>
        <p className="text-sm text-gray-700">
          What are you going to lurk today?
        </p>
      </div>

      <BoardList 
        boards={boards} 
        walletConnected={walletConnected}
        onRefresh={fetchBoards}
      />

      {/* Info Section - 4chan Style */}
      <div className="mt-12 p-4 bg-[#F0E0D6] border border-[#B7C5D9]">
        <h3 className="text-base font-bold text-[#AF0A0F] mb-3 text-center">What is The Basement?</h3>
        <div className="text-xs text-gray-800 space-y-2">
          <p>
            The Basement is a Web3-powered anonymous imageboard. Post anonymously using your wallet without revealing your identity.
          </p>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <span className="font-bold text-[#800000]">Anonymous IDs:</span> Daily rotating IDs let you identify same-poster without revealing identity.
            </div>
            <div>
              <span className="font-bold text-[#800000]">Tripcodes:</span> Use ##password to maintain consistent identity across posts.
            </div>
            <div>
              <span className="font-bold text-[#800000]">Sage:</span> Reply without bumping the thread.
            </div>
            <div>
              <span className="font-bold text-[#800000]">Greentext:</span> Start a line with &gt; for greentext.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

