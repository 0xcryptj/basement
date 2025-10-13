'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import AnonIdBadge from './AnonIdBadge';
import TripcodeBadge from './TripcodeBadge';

interface Post {
  id: string;
  text: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  anonId: string;
  tripSig: string | null;
  sage: boolean;
  likes: number;
  dislikes: number;
  createdAt: string;
}

interface PostItemProps {
  post: Post;
  postNumber: number;
}

export default function PostItem({ post, postNumber }: PostItemProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [formattedText, setFormattedText] = useState('');
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [voting, setVoting] = useState(false);

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

  // Format text with greentext support
  useEffect(() => {
    const formatted = post.text;
    
    // Split into lines and process each
    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      // Greentext: lines starting with >
      if (line.trim().startsWith('>') && !line.trim().startsWith('>>')) {
        return `<span class="greentext">${line}</span>`;
      }
      
      // Quote links: >>12345
      if (line.includes('>>')) {
        return line.replace(
          /&gt;&gt;(\d+)|>>(\d+)/g,
          (match, num1, num2) => {
            const num = num1 || num2;
            return `<a href="#post-${num}" class="quotelink">&gt;&gt;${num}</a>`;
          }
        );
      }

      return line;
    });

    setFormattedText(processedLines.join('\n'));
  }, [post.text]);

  // Handle voting
  const handleVote = async (isLike: boolean) => {
    if (voting) return;
    
    setVoting(true);
    try {
      // Toggle vote if clicking same button
      const newVote = userVote === (isLike ? 'like' : 'dislike') ? null : (isLike ? 'like' : 'dislike');
      
      const res = await fetch('/api/forum/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          isLike: newVote === 'like' ? true : newVote === 'dislike' ? false : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setUserVote(newVote);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(false);
    }
  };

  const score = likes - dislikes;
  const scoreColor = score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div id={`post-${postNumber}`} className="reply mb-1">
      <div className="flex gap-2">
        {/* Thumbnail */}
        {post.thumbUrl && (
          <div className="flex-shrink-0">
            <div
              className="cursor-pointer"
              onClick={() => setShowFullImage(!showFullImage)}
            >
              {showFullImage && post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={600}
                  height={600}
                  className="object-contain max-h-[400px]"
                  unoptimized
                />
              ) : (
                <Image
                  src={post.thumbUrl}
                  alt="Post thumbnail"
                  width={125}
                  height={125}
                  className="object-cover"
                  style={{ maxWidth: '125px', maxHeight: '125px' }}
                  unoptimized
                />
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
            <span className="poster-name">Anonymous</span>
            {post.tripSig && <span className="poster-trip">{post.tripSig}</span>}
            <span className="text-gray-600">{formatDate(post.createdAt)}</span>
            <a href={`#post-${postNumber}`} className="post-number">
              No. {postNumber}
            </a>
            <AnonIdBadge anonId={post.anonId} />
            {post.sage && (
              <span className="text-red-600 font-semibold text-xs">SAGE</span>
            )}
          </div>

          {/* Text */}
          <div
            className="text-black text-sm whitespace-pre-wrap break-words post-content mb-2"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />

          {/* Voting controls - Yik Yak style */}
          <div className="flex items-center gap-3 text-xs mt-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voting}
              className={`flex items-center gap-1 transition-colors ${
                userVote === 'like' ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-green-600'
              }`}
              title="Like"
            >
              <span className="text-base">▲</span>
            </button>
            <span className={`font-semibold ${scoreColor}`}>
              {score > 0 && '+'}{score}
            </span>
            <button
              onClick={() => handleVote(false)}
              disabled={voting}
              className={`flex items-center gap-1 transition-colors ${
                userVote === 'dislike' ? 'text-red-600 font-bold' : 'text-gray-600 hover:text-red-600'
              }`}
              title="Dislike"
            >
              <span className="text-base">▼</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

