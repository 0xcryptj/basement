'use client';

import { useState, FormEvent } from 'react';
import ImageUpload from './ImageUpload';
import { generateTripcode } from '@/lib/forum/tripcode';

interface ReplyFormProps {
  threadId: string;
  onSuccess?: () => void;
}

export default function ReplyForm({ threadId, onSuccess }: ReplyFormProps) {
  const [text, setText] = useState('');
  const [trip, setTrip] = useState('');
  const [sage, setSage] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState(''); // Honeypot field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripPreview, setTripPreview] = useState<string>('');

  const handleTripChange = (value: string) => {
    setTrip(value);
    if (value) {
      setTripPreview(generateTripcode(value));
    } else {
      setTripPreview('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check honeypot
    if (honeypot) {
      // Bot detected, silently fail
      return;
    }

    if (!text.trim()) {
      setError('Text is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('threadId', threadId);
      formData.append('text', text);
      if (trip) formData.append('trip', trip);
      if (sage) formData.append('sage', 'true');
      if (showAddress) formData.append('showAddress', 'true');
      if (image) formData.append('image', image);

      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      // Reset form
      setText('');
      setTrip('');
      setSage(false);
      setShowAddress(false);
      setImage(null);
      setTripPreview('');

      // Callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-black/40 p-6 rounded-lg border border-cyan-500/30">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">Post a Reply</h3>

      {/* Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Text *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply here..."
          rows={4}
          maxLength={10000}
          required
          className="w-full px-3 py-2 bg-black/60 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none resize-y"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {text.length}/10000 characters
        </p>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Image (optional)
        </label>
        <ImageUpload onImageSelect={setImage} />
      </div>

      {/* Tripcode */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tripcode (optional)
        </label>
        <input
          type="password"
          value={trip}
          onChange={(e) => handleTripChange(e.target.value)}
          placeholder="Enter tripcode password"
          className="w-full px-3 py-2 bg-black/60 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
          disabled={loading}
        />
        {tripPreview && (
          <p className="text-xs text-green-400 mt-1">
            Preview: Anonymous <span className="font-mono font-bold">{tripPreview}</span>
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={sage}
            onChange={(e) => setSage(e.target.checked)}
            disabled={loading}
            className="w-4 h-4"
          />
          Sage (don't bump thread)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showAddress}
            onChange={(e) => setShowAddress(e.target.checked)}
            disabled={loading}
            className="w-4 h-4"
          />
          Show wallet address (default: hidden)
        </label>
      </div>

      {/* Honeypot (hidden from users) */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold rounded transition-colors"
      >
        {loading ? 'Posting...' : 'Post Reply'}
      </button>
    </form>
  );
}

