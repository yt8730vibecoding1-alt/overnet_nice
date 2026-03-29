'use server';

import { createAuthenticatedClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreatePhotoInput {
  building_id: string;
  dong_id?: string | null;
  image_url: string;
  storage_path: string;
  description?: string | null;
}

export async function createPhoto(input: CreatePhotoInput): Promise<string> {
  const supabase = await createAuthenticatedClient();

  const { data, error } = await supabase
    .from('photos')
    .insert({
      building_id: input.building_id,
      dong_id: input.dong_id || null,
      image_url: input.image_url,
      storage_path: input.storage_path,
      description: input.description || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${input.building_id}`);
  return data.id;
}

export async function deletePhoto(id: string, buildingId: string): Promise<void> {
  const supabase = await createAuthenticatedClient();

  // DB에서 실제 storage_path 조회 (클라이언트 전달값 신뢰하지 않음)
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError || !photo) throw new Error('사진을 찾을 수 없습니다');

  // DB 레코드 먼저 삭제
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // DB 삭제 성공 후 Storage 파일 삭제
  await supabase.storage.from('building-photos').remove([photo.storage_path]);

  revalidatePath(`/buildings/${buildingId}`);
}
