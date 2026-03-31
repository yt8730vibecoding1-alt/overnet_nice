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
  const [uploadProgress, setUploadProgress] = useState('');

  const isMaxReached = currentCount >= MAX_PHOTOS_PER_BUILDING;

  const uploadSingleFile = async (file: File): Promise<boolean> => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: 10MB 초과`);
      return false;
    }

    let compressed: Blob;
    try {
      compressed = await compressImage(file);
    } catch (err) {
      console.error('Image compression failed:', err);
      toast.error('이미지를 처리할 수 없습니다');
      return false;
    }

    const supabase = createClient();
    const fileName = `${crypto.randomUUID()}.jpg`;
    const storagePath = `${buildingId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('building-photos')
      .upload(storagePath, compressed, { contentType: 'image/jpeg' });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('building-photos')
      .getPublicUrl(storagePath);

    try {
      await createPhoto({
        building_id: buildingId,
        dong_id: dongId,
        image_url: urlData.publicUrl,
        storage_path: storagePath,
      });
    } catch (err) {
      await supabase.storage.from('building-photos').remove([storagePath]);
      throw err;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    e.target.value = '';

    const remaining = MAX_PHOTOS_PER_BUILDING - currentCount;
    const filesToUpload = Array.from(files).slice(0, remaining);

    if (filesToUpload.length === 0) {
      toast.error(`최대 ${MAX_PHOTOS_PER_BUILDING}장까지 가능합니다`);
      return;
    }

    setUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        setUploadProgress(`${i + 1}/${filesToUpload.length}`);
        const ok = await uploadSingleFile(filesToUpload[i]);
        if (ok) successCount++;
      }

      if (successCount > 0) {
        toast.success(`사진 ${successCount}장 업로드 완료`);
        router.refresh();
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error('업로드에 실패했습니다');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
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
            업로드 중 {uploadProgress}
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
