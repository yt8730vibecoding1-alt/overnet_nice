'use server';

import { createAuthenticatedClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BuildingInsert, BuildingUpdate, BuildingWithDetails, Building } from '@/lib/supabase/types';

export async function getBuildings(query?: string): Promise<Building[]> {
  const supabase = await createAuthenticatedClient();

  let dbQuery = supabase
    .from('buildings')
    .select('*')
    .order('updated_at', { ascending: false });

  if (query && query.trim()) {
    const trimmed = query.trim().slice(0, 100);
    dbQuery = dbQuery.or(`name.ilike.%${trimmed}%,equipment_location.ilike.%${trimmed}%,address.ilike.%${trimmed}%`);
  }

  const { data, error } = await dbQuery.limit(50);

  if (error) { console.error('DB error:', error); throw new Error('처리 중 오류가 발생했습니다'); }
  return data ?? [];
}

export async function getBuilding(id: string): Promise<BuildingWithDetails> {
  const supabase = await createAuthenticatedClient();

  const { data, error } = await supabase
    .from('buildings')
    .select('*, dongs(*), photos(*)')
    .eq('id', id)
    .single();

  if (error) { console.error('DB error:', error); throw new Error('처리 중 오류가 발생했습니다'); }
  return data as BuildingWithDetails;
}

export async function createBuilding(input: BuildingInsert): Promise<string> {
  const supabase = await createAuthenticatedClient();

  const { data, error } = await supabase
    .from('buildings')
    .insert(input)
    .select('id')
    .single();

  if (error) { console.error('DB error:', error); throw new Error('처리 중 오류가 발생했습니다'); }
  revalidatePath('/');
  return data.id;
}

export async function updateBuilding(id: string, input: BuildingUpdate): Promise<void> {
  const supabase = await createAuthenticatedClient();

  const { error } = await supabase
    .from('buildings')
    .update(input)
    .eq('id', id);

  if (error) { console.error('DB error:', error); throw new Error('처리 중 오류가 발생했습니다'); }
  revalidatePath('/');
  revalidatePath(`/buildings/${id}`);
}

export async function deleteBuilding(id: string): Promise<void> {
  const supabase = await createAuthenticatedClient();

  // 삭제할 사진 경로를 먼저 조회 (DB 삭제 전에 조회해야 함)
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('building_id', id);

  // DB 레코드 먼저 삭제 (cascade로 dongs, photos도 삭제됨)
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) { console.error('DB error:', error); throw new Error('처리 중 오류가 발생했습니다'); }

  // DB 삭제 성공 후 Storage 파일 정리
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    await supabase.storage.from('building-photos').remove(paths);
  }

  revalidatePath('/');
}
