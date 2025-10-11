'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PostItem from '@/components/forum/PostItem';
import ReplyForm from '@/components/forum/ReplyForm';
import ModToolbar from '@/components/forum/ModToolbar';
import AnonIdBadge from '@/components/forum/AnonIdBadge';
import QuickReply from '@/components/forum/QuickReply';
import { BOARD_INFO } from '@/lib/forum/constants';

export default function ThreadPage({
  params,
  searchParams,
}: {
  params: { board: string; id: string };
  searchParams: { page?: string };
}) {
  const boardSlug = params.board;
  const threadId = params.id;
  const page = parseInt(searchParams?.page || '1');

  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const [formattedOpText, setFormattedOpText] = useState('');
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [quotedPostNumber, setQuotedPostNumber] = useState<number | undefined>();

  const boardInfo = BOARD_INFO[boardSlug];

  // Global click handler for post number quoting
  useEffect(() => {
    const handlePostNumberClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('post-number')) {
        e.preventDefault();
        const postNum = parseInt(target.textContent?.replace('No. ', '') || '0');
        if (postNum) {
          setQuotedPostNumber(postNum);
          setShowQuickReply(true);
        }
      }
    };

    document.addEventListener('click', handlePostNumberClick);
    return () => document.removeEventListener('click', handlePostNumberClick);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}/${day}/${year}(${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()]})${hours}:${minutes}:${seconds}`;
  };

  // Format OP text with greentext
  useEffect(() => {
    if (!thread?.opText) return;
    
    const lines = thread.opText.split('\n');
    const processedLines = lines.map((line: string) => {
      if (line.trim().startsWith('>') && !line.trim().startsWith('>>')) {
        return `<span class="greentext">${line}</span>`;
      }
      
      if (line.includes('>>')) {
        return line.replace(
          /&gt;&gt;(\d+)|>>(\d+)/g,
          (match: string, num1: string, num2: string) => {
            const num = num1 || num2;
            return `<a href="#post-${num}" class="quotelink">&gt;&gt;${num}</a>`;
          }
        );
      }

      return line;
    });

    setFormattedOpText(processedLines.join('\n'));
  }, [thread]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch thread
        const threadRes = await fetch(
          `/api/forum/threads?board=${boardSlug}`
        );
        const threadData = await threadRes.json();
        const foundThread = threadData.threads?.find((t: any) => t.id === threadId);
        
        if (!foundThread) {
          setLoading(false);
          return;
        }
        
        setThread(foundThread);

        // Fetch posts
        const postsRes = await fetch(
          `/api/forum/posts?thread=${threadId}&page=${page}`
        );
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
        setPagination(postsData.pagination || { totalPages: 1 });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching thread:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, [boardSlug, threadId, page]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading thread...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#AF0A0F] mb-4">Thread Not Found</h2>
        <Link href={`/forum/${boardSlug}`} className="text-[#34345C] hover:underline">
          ← Back to /{boardSlug}/
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Board Header */}
      <div className="mb-4 text-center">
        <div className="text-2xl font-bold text-[#AF0A0F] mb-1">
          /{boardSlug}/ - {boardInfo?.title || boardSlug}
        </div>
        <div className="text-xs">
          <Link href="/forum" className="text-[#34345C] hover:underline mr-2">
            [Home]
          </Link>
          <Link href={`/forum/${boardSlug}`} className="text-[#34345C] hover:underline mr-2">
            [Return]
          </Link>
          <Link href={`/forum/${boardSlug}/catalog`} className="text-[#34345C] hover:underline">
            [Catalog]
          </Link>
        </div>
      </div>

      <hr className="border-[#B7C5D9] my-4" />

      {/* Mod Toolbar */}
      <div className="mb-4">
        <ModToolbar
          threadId={threadId}
          isSticky={thread.isSticky}
          isLocked={thread.isLocked}
        />
      </div>

      {/* Original Post (OP) */}
      <div id="post-1" className="opPost mb-2">
        {/* Sticky/Locked indicators */}
        {(thread.isSticky || thread.isLocked) && (
          <div className="mb-1">
            {thread.isSticky && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white mr-1">
                📌 STICKY
              </span>
            )}
            {thread.isLocked && (
              <span className="px-2 py-0.5 text-xs font-bold bg-yellow-600 text-white">
                🔒 LOCKED
              </span>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {/* OP Image */}
          {thread.opThumbUrl && (
            <div className="flex-shrink-0">
              <div className="mb-1 text-xs file-info">
                File: <span className="text-[#34345C] hover:underline cursor-pointer" onClick={() => setShowFullImage(!showFullImage)}>
                  {thread.opImageUrl?.split('/').pop()?.slice(0, 30)}...
                </span>
              </div>
              <div
                className="cursor-pointer"
                onClick={() => setShowFullImage(!showFullImage)}
              >
                {showFullImage && thread.opImageUrl ? (
                  <Image
                    src={thread.opImageUrl}
                    alt="OP image"
                    width={800}
                    height={800}
                    className="object-contain max-h-[600px]"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={thread.opThumbUrl}
                    alt="OP thumbnail"
                    width={125}
                    height={125}
                    className="object-cover border border-[#D9BFB7]"
                    style={{ maxWidth: '125px', maxHeight: '125px' }}
                    unoptimized
                  />
                )}
              </div>
            </div>
          )}

          {/* OP Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
              {thread.subject && (
                <span className="subject">{thread.subject}</span>
              )}
              <span className="poster-name">Anonymous</span>
              {thread.tripSig && <span className="poster-trip">{thread.tripSig}</span>}
              <span className="text-gray-600">{formatDate(thread.createdAt)}</span>
              <a href="#post-1" className="post-number">
                No. 1
              </a>
              <AnonIdBadge anonId={thread.anonId} />
              <span className="text-gray-500 cursor-pointer hover:underline" onClick={() => {
                const replyBox = document.getElementById('reply-form');
                replyBox?.scrollIntoView({ behavior: 'smooth' });
              }}>
                [Reply]
              </span>
            </div>

            {/* OP Text */}
            <div
              className="text-black text-sm whitespace-pre-wrap break-words post-content"
              dangerouslySetInnerHTML={{ __html: formattedOpText }}
            />
          </div>
        </div>
      </div>

      <hr className="border-[#B7C5D9] my-2" />

      {/* Replies */}
      <div className="mb-6">
        {posts.length === 0 ? (
          <div className="text-center py-6 text-gray-600 text-sm">
            No replies yet.
          </div>
        ) : (
          posts.map((post: any, index: number) => (
            <PostItem key={post.id} post={post} postNumber={index + 2} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mb-6 text-center">
          <hr className="border-[#B7C5D9] mb-3" />
          <div className="flex items-center justify-center gap-2 text-sm">
            {page > 1 && (
              <Link
                href={`/forum/${boardSlug}/thread/${threadId}?page=${page - 1}`}
                className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
              >
                Previous
              </Link>
            )}

            <span className="px-3 py-1 font-semibold">
              {page} / {pagination.totalPages}
            </span>

            {page < pagination.totalPages && (
              <Link
                href={`/forum/${boardSlug}/thread/${threadId}?page=${page + 1}`}
                className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <hr className="border-[#B7C5D9] my-4" />

      {/* Reply Form */}
      {!thread.isLocked ? (
        <div id="reply-form" className="mb-6">
          <ReplyForm threadId={threadId} />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-[#EEDAC2] border border-[#D9BFB7] text-center">
          <p className="text-[#AF0A0F] font-bold text-sm">🔒 This thread is locked.</p>
        </div>
      )}

      <hr className="border-[#B7C5D9] my-4" />

      {/* Bottom navigation */}
      <div className="text-center text-xs mb-6">
        <Link href={`/forum/${boardSlug}`} className="text-[#34345C] hover:underline mr-2">
          [Return]
        </Link>
        <Link href={`/forum/${boardSlug}/catalog`} className="text-[#34345C] hover:underline mr-2">
          [Catalog]
        </Link>
        <Link href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[#34345C] hover:underline">
          [Top]
        </Link>
      </div>

      {/* Quick Reply Box */}
      {!thread.isLocked && (
        <>
          <QuickReply 
            threadId={threadId}
            isVisible={showQuickReply}
            onClose={() => setShowQuickReply(false)}
            quotedPostNumber={quotedPostNumber}
          />

          {/* Floating Quick Reply Button */}
          <button
            onClick={() => setShowQuickReply(!showQuickReply)}
            className="fixed bottom-6 right-6 bg-[#D6DAF0] border-2 border-[#B7C5D9] hover:bg-[#EEDAC2] px-4 py-2 shadow-lg transition-colors z-40 text-sm font-semibold"
            title="Quick Reply"
          >
            {showQuickReply ? 'Close' : 'Quick Reply'}
          </button>
        </>
      )}
    </div>
  );
}
