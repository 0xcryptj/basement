'use client';

import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

const FORUM_EMOJIS = [
  '💬', '🎮', '🎯', '🎲', '🎰', '🃏', '🎪', '🎭',
  '🔥', '⚡', '🌟', '💎', '🎨', '🎵', '📱', '💻',
  '🖥️', '⌨️', '🖱️', '💿', '📀', '🎧', '🎬', '📺',
  '🚀', '🛸', '🌙', '⭐', '✨', '💫', '🌈', '🔮',
  '👾', '🤖', '👽', '🦾', '🧠', '👁️', '🗨️', '💭',
];

export default function EmojiPicker({ onSelect, currentEmoji = '💬' }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-2xl hover:scale-110 transition-transform cursor-pointer"
        title="Click to change emoji"
      >
        {currentEmoji}
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker */}
          <div className="absolute top-full left-0 mt-2 bg-[#F0E0D6] border-2 border-[#B7C5D9] rounded-lg shadow-xl z-50 p-3">
            <div className="mb-2 text-xs font-bold text-[#800000]">
              Select Forum Icon:
            </div>
            <div className="grid grid-cols-8 gap-2 max-w-xs">
              {FORUM_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji);
                    setShowPicker(false);
                  }}
                  className={`
                    text-2xl hover:bg-[#EEDAC2] rounded p-1 transition-colors
                    ${emoji === currentEmoji ? 'bg-[#EEDAC2] ring-2 ring-[#800000]' : ''}
                  `}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {/* Text Input Option */}
            <div className="mt-3 pt-3 border-t border-[#B7C5D9]">
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Or use text:
              </label>
              <input
                type="text"
                placeholder="/forum/"
                maxLength={10}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    onSelect(e.currentTarget.value.trim());
                    setShowPicker(false);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full border border-[#B7C5D9] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#800000]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Press Enter to apply
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

