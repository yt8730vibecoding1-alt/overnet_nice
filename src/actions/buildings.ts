'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BuildingInsert, BuildingUpdate, BuildingWithDetails, Building } from '@/lib/supabase/types';

export async function getBuildings(query?: string): Promise<Building[]> {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('buildings')
    .select('*')
    .order('updated_at', { ascending: false });

  if (query && query.trim()) {
    const trimmed = query.trim().slice(0, 100);
    dbQuery = dbQuery.ilike('name', `%${trimmed}%`);
  }

  const { data, error } = await dbQuery.limit(50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBuilding(id: string): Promise<BuildingWithDetails> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('buildings')
    .select('*, dongs(*), photos(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as BuildingWithDetails;
}

export async function createBuilding(input: BuildingInsert): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('buildings')
    .insert(input)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data.id;
}

export async function updateBuilding(id: string, input: BuildingUpdate): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('buildings')
    .update(input)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/buildings/${id}`);
}

export async function deleteBuilding(id: string): Promise<void> {
  const supabase = await createClient();

  // 먼저 Storage에서 사진 파일 삭제
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('building_id', id);

  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    await supabase.storage.from('building-photos').remove(paths);
  }

  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}
