'use client';

import { useState, FormEvent } from 'react';
import ImageUpload from './ImageUpload';
import { generateTripcode } from '@/lib/forum/tripcode';

interface NewThreadFormProps {
  boardSlug: string;
  onSuccess?: () => void;
}

export default function NewThreadForm({ boardSlug, onSuccess }: NewThreadFormProps) {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [trip, setTrip] = useState('');
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
      formData.append('boardSlug', boardSlug);
      formData.append('text', text);
      if (subject.trim()) formData.append('subject', subject);
      if (trip) formData.append('trip', trip);
      if (showAddress) formData.append('showAddress', 'true');
      if (image) formData.append('image', image);

      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create thread');
      }

      // Reset form
      setSubject('');
      setText('');
      setTrip('');
      setShowAddress(false);
      setImage(null);
      setTripPreview('');

      // Callback
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to thread
      window.location.href = `/forum/${boardSlug}/thread/${data.thread.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-black/40 p-6 rounded-lg border border-purple-500/30">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Start a New Thread</h3>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Subject (optional)
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Thread subject"
          maxLength={100}
          className="w-full px-3 py-2 bg-black/60 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
          disabled={loading}
        />
      </div>

      {/* Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Text *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your post here..."
          rows={6}
          maxLength={10000}
          required
          className="w-full px-3 py-2 bg-black/60 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none resize-y"
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
          className="w-full px-3 py-2 bg-black/60 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
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
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded transition-colors"
      >
        {loading ? 'Posting...' : 'Post Thread'}
      </button>
    </form>
  );
}

