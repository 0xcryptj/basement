'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { CONFIG } from '@/lib/forum/constants';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file size
    if (file.size > CONFIG.IMAGE_MAX_BYTES) {
      setError(`File too large. Max size: ${CONFIG.IMAGE_MAX_MB}MB`);
      return false;
    }

    // Check MIME type
    if (!CONFIG.ACCEPTED_MIME.includes(file.type)) {
      setError('Invalid file type. Accepted: jpg, png, gif, webp');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      onImageSelect(file);
      setPreview(URL.createObjectURL(file));
    } else {
      onImageSelect(null);
      setPreview(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      onImageSelect(file);
      setPreview(URL.createObjectURL(file));
    } else {
      onImageSelect(null);
      setPreview(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors
          ${isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'}
        `}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="py-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-400">
              Click or drag image here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {CONFIG.IMAGE_MAX_MB}MB • jpg, png, gif, webp
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={CONFIG.ACCEPTED_MIME.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

