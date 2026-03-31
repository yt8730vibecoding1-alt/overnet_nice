'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { PhotoViewer } from './photo-viewer';
import { deletePhoto } from '@/actions/photos';
import toast from 'react-hot-toast';
import type { Photo } from '@/lib/supabase/types';

interface PhotoGridProps {
  photos: Photo[];
  buildingId: string;
}

export function PhotoGrid({ photos, buildingId }: PhotoGridProps) {
  const router = useRouter();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (photos.length === 0) return null;

  const handleDelete = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return;

    setDeletingId(photo.id);
    try {
      await deletePhoto(photo.id, buildingId);
      toast.success('사진이 삭제되었습니다');
      router.refresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative cursor-pointer overflow-hidden rounded-lg border border-gray-200"
            onClick={() => setViewerIndex(index)}
          >
            <img
              src={photo.image_url}
              alt={photo.description || '건물 사진'}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            {photo.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <p className="truncate text-xs text-white">{photo.description}</p>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => handleDelete(e, photo)}
              disabled={deletingId === photo.id}
              aria-label="사진 삭제"
              className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
