'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/lib/supabase/types';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const photo = photos[currentIndex];

  if (!photo) {
    onClose();
    return null;
  }

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, photos.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" onClick={onClose}>
      {/* 상단 바 */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} className="p-1 text-white">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* 이미지 */}
      <div
        className="flex flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image_url}
          alt={photo.description || '건물 사진'}
          className="max-h-full max-w-full object-contain"
          style={{ touchAction: 'pinch-zoom' }}
        />

        {/* 이전/다음 버튼 */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 rounded-full bg-black/50 p-2 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {currentIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 rounded-full bg-black/50 p-2 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* 설명 */}
      {photo.description && (
        <div className="safe-bottom p-4">
          <p className="text-center text-sm text-white/80">{photo.description}</p>
        </div>
      )}
    </div>
  );
}
