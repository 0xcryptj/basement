'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmojiPicker from '@/components/forum/EmojiPicker';

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [forumEmoji, setForumEmoji] = useState('💬');

  // Load saved emoji from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('forumEmoji');
    if (saved) setForumEmoji(saved);
  }, []);

  // Save emoji to localStorage
  const handleEmojiChange = (emoji: string) => {
    setForumEmoji(emoji);
    localStorage.setItem('forumEmoji', emoji);
  };

  return (
    <div className="min-h-screen bg-[#F0E0D6] text-[#000000] font-sans">
      {/* Forum Header - 4chan Style */}
      <header className="bg-[#D6DAF0] border-b-2 border-[#B7C5D9] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/forum" className="flex items-center gap-2 hover:opacity-80">
              <EmojiPicker 
                onSelect={handleEmojiChange} 
                currentEmoji={forumEmoji}
              />
              <div>
                <h1 className="text-2xl font-bold text-[#AF0A0F]">
                  The Basement
                </h1>
              </div>
            </Link>

            <nav className="flex items-center gap-3 text-sm font-semibold">
              <Link
                href="/index.html"
                className="text-[#34345C] hover:underline"
              >
                [Home]
              </Link>
              <Link
                href="/forum"
                className="text-[#34345C] hover:underline"
              >
                [Boards]
              </Link>
              <Link
                href="/forum/catalog"
                className="text-[#34345C] hover:underline"
              >
                [Catalog]
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-4">
        {children}
      </main>

      {/* Forum Footer - 4chan Style */}
      <footer className="bg-[#D6DAF0] border-t-2 border-[#B7C5D9] mt-12">
        <div className="max-w-[1200px] mx-auto px-4 py-3 text-center text-xs">
          <p className="mb-1">
            All trademarks and copyrights on this page are owned by their respective parties.
          </p>
          <p className="text-gray-600">
            Posts do not represent the views of The Basement administration.
          </p>
        </div>
      </footer>
    </div>
  );
}

