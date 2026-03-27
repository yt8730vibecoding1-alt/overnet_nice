'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DongInsert, DongUpdate } from '@/lib/supabase/types';

export async function createDong(input: DongInsert): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dongs')
    .insert(input)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${input.building_id}`);
  return data.id;
}

export async function updateDong(id: string, buildingId: string, input: DongUpdate): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('dongs')
    .update(input)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteDong(id: string, buildingId: string): Promise<void> {
  const supabase = await createClient();

  // 동에 연결된 사진 Storage 파일 삭제
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('dong_id', id);

  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    await supabase.storage.from('building-photos').remove(paths);
  }

  const { error } = await supabase
    .from('dongs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
