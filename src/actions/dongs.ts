'use server';

import { createAuthenticatedClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DongInsert, DongUpdate } from '@/lib/supabase/types';

export async function createDong(input: DongInsert): Promise<string> {
  const supabase = await createAuthenticatedClient();

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
  const supabase = await createAuthenticatedClient();

  const { error } = await supabase
    .from('dongs')
    .update(input)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteDong(id: string, buildingId: string): Promise<void> {
  const supabase = await createAuthenticatedClient();

  // 삭제할 사진 경로를 먼저 조회
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('dong_id', id);

  // DB 레코드 먼저 삭제 (cascade로 photos도 삭제됨)
  const { error } = await supabase
    .from('dongs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // DB 삭제 성공 후 Storage 파일 정리
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    await supabase.storage.from('building-photos').remove(paths);
  }

  revalidatePath(`/buildings/${buildingId}`);
}
