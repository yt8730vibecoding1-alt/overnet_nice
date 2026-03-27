'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreatePhotoInput {
  building_id: string;
  dong_id?: string | null;
  image_url: string;
  storage_path: string;
  description?: string | null;
}

export async function createPhoto(input: CreatePhotoInput): Promise<string> {
  const supabase = await createClient();

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

export async function deletePhoto(id: string, buildingId: string, storagePath: string): Promise<void> {
  const supabase = await createClient();

  // DB 레코드 먼저 삭제 (실패하면 Storage 건드리지 않음)
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // DB 삭제 성공 후 Storage 파일 삭제
  await supabase.storage.from('building-photos').remove([storagePath]);

  revalidatePath(`/buildings/${buildingId}`);
}
