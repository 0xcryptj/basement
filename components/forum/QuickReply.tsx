'use client';

import { useState, useEffect, useRef } from 'react';

interface QuickReplyProps {
  threadId: string;
  isVisible: boolean;
  onClose: () => void;
  quotedPostNumber?: number;
}

export default function QuickReply({ threadId, isVisible, onClose, quotedPostNumber }: QuickReplyProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // Add quote when post number changes
  useEffect(() => {
    if (quotedPostNumber) {
      setText((prev) => {
        const quote = `>>${quotedPostNumber}\n`;
        if (!prev.includes(quote)) {
          return prev + quote;
        }
        return prev;
      });
    }
  }, [quotedPostNumber]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'TEXTAREA' && 
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'BUTTON') {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('threadId', threadId);
      formData.append('text', text);

      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post');
      }

      // Success - reload page
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post';
      setError(errorMessage);
      setLoading(false);
    }
  }

  if (!isVisible) return null;

  return (
    <div
      ref={boxRef}
      className="fixed bg-[#D6DAF0] border-2 border-[#B7C5D9] shadow-lg z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        maxWidth: '90vw',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="bg-[#B7C5D9] px-2 py-1 flex justify-between items-center">
        <span className="text-xs font-bold">Quick Reply</span>
        <button
          onClick={onClose}
          className="text-lg leading-none hover:text-red-600"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-3">
        {error && (
          <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs">
            {error}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comment"
          className="w-full border border-[#B7C5D9] p-2 text-sm focus:border-[#800000] focus:outline-none resize-y"
          rows={6}
          disabled={loading}
        />

        <div className="mt-2 flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F0E0D6] border border-[#B7C5D9] hover:bg-[#EEDAC2] disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-1 text-sm font-semibold transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          
          <div className="text-xs text-gray-600">
            Hint: Click post numbers to quote them
          </div>
        </div>
      </form>
    </div>
  );
}

