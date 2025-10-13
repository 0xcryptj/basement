'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import AnonIdBadge from './AnonIdBadge';

interface Thread {
  id: string;
  subject: string | null;
  opText: string;
  opImageUrl: string | null;
  opThumbUrl: string | null;
  anonId: string;
  tripSig: string | null;
  isSticky: boolean;
  isLocked: boolean;
  views: number;
  bumpAt: string;
  createdAt: string;
  _count: {
    posts: number;
  };
}

interface ThreadCardProps {
  thread: Thread;
  boardSlug: string;
}

export default function ThreadCard({ thread, boardSlug }: ThreadCardProps) {
  const [formattedText, setFormattedText] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day}/${year}(${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()]})${hours}:${minutes}`;
  };

  // Format text preview with greentext
  useEffect(() => {
    const text = thread.opText.length > 300
      ? thread.opText.slice(0, 300) + '...'
      : thread.opText;
    
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('>') && !line.trim().startsWith('>>')) {
        return `<span class="greentext">${line}</span>`;
      }
      return line;
    });

    setFormattedText(processedLines.join('\n'));
  }, [thread.opText]);

  return (
    <div className="opPost mb-2 hover:bg-[#EEDAC2] transition-colors">
      {/* Sticky/Locked indicators */}
      {(thread.isSticky || thread.isLocked) && (
        <div className="mb-1">
          {thread.isSticky && (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white mr-1">
              STICKY
            </span>
          )}
          {thread.isLocked && (
            <span className="px-2 py-0.5 text-xs font-bold bg-yellow-600 text-white">
              LOCKED
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {/* Thumbnail */}
        {thread.opThumbUrl && (
          <div className="flex-shrink-0">
            <Link href={`/forum/${boardSlug}/thread/${thread.id}`}>
              <Image
                src={thread.opThumbUrl}
                alt="Thread image"
                width={125}
                height={125}
                className="object-cover border border-[#D9BFB7]"
                style={{ maxWidth: '125px', maxHeight: '125px' }}
                unoptimized
              />
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
            {thread.subject && (
              <Link 
                href={`/forum/${boardSlug}/thread/${thread.id}`}
                className="subject hover:underline"
              >
                {thread.subject}
              </Link>
            )}
            <span className="poster-name">Anonymous</span>
            {thread.tripSig && <span className="poster-trip">{thread.tripSig}</span>}
            <span className="text-gray-600">{formatDate(thread.createdAt)}</span>
            <Link 
              href={`/forum/${boardSlug}/thread/${thread.id}`}
              className="post-number"
            >
              No. {thread.id.slice(-8)}
            </Link>
            <AnonIdBadge anonId={thread.anonId} />
            <span className="text-gray-500">
              [<Link 
                href={`/forum/${boardSlug}/thread/${thread.id}`} 
                className="text-[#34345C] hover:underline"
              >
                Reply
              </Link>]
            </span>
          </div>

          {/* Text preview */}
          <div
            className="text-black text-sm whitespace-pre-wrap break-words post-content mb-2"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />

          {/* Footer with stats */}
          <div className="text-xs text-gray-600 flex flex-wrap gap-x-2">
            <span className="font-semibold">Replies: {thread._count.posts}</span>
            {thread.opImageUrl && <span className="font-semibold">/ Images: 1</span>}
            <span>/ Views: {thread.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

