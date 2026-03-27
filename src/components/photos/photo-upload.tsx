'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createPhoto } from '@/actions/photos';
import { compressImage } from '@/lib/utils';
import { MAX_FILE_SIZE, MAX_PHOTOS_PER_BUILDING } from '@/lib/constants';
import toast from 'react-hot-toast';

interface PhotoUploadProps {
  buildingId: string;
  dongId?: string | null;
  currentCount: number;
}

export function PhotoUpload({ buildingId, dongId, currentCount }: PhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isMaxReached = currentCount >= MAX_PHOTOS_PER_BUILDING;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 입력 초기화 (같은 파일 재선택 가능)
    e.target.value = '';

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    setUploading(true);
    try {
      // 이미지 압축
      let compressed: Blob;
      try {
        compressed = await compressImage(file);
      } catch (err) {
        console.error('Image compression failed:', err);
        toast.error('이미지를 처리할 수 없습니다');
        setUploading(false);
        return;
      }

      // Supabase Storage 업로드
      const supabase = createClient();
      const fileName = `${crypto.randomUUID()}.jpg`;
      const storagePath = `${buildingId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('building-photos')
        .upload(storagePath, compressed, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('building-photos')
        .getPublicUrl(storagePath);

      // DB에 메타데이터 저장 (실패 시 Storage 정리)
      try {
        await createPhoto({
          building_id: buildingId,
          dong_id: dongId,
          image_url: urlData.publicUrl,
          storage_path: storagePath,
        });
      } catch (err) {
        // DB 저장 실패 → Storage에서 업로드된 파일 정리
        await supabase.storage.from('building-photos').remove([storagePath]);
        throw err;
      }

      toast.success('사진이 업로드되었습니다');
      router.refresh();
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error('업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || isMaxReached}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            업로드 중...
          </>
        ) : isMaxReached ? (
          `최대 ${MAX_PHOTOS_PER_BUILDING}장`
        ) : (
          <>
            <Camera className="h-4 w-4" />
            사진 추가 ({currentCount}/{MAX_PHOTOS_PER_BUILDING})
          </>
        )}
      </button>
    </div>
  );
}
