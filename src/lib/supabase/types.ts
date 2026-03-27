export interface Building {
  id: string;
  name: string;
  equipment_location: string;
  address: string | null;
  wiring_structure: string | null;
  floor_panels: string | null;
  access_method: string | null;
  admin_contact: string | null;
  indoor_panel_location: string | null;
  work_scope: string | null;
  difficulty: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dong {
  id: string;
  building_id: string;
  dong_name: string;
  equipment_location: string | null;
  wiring_structure: string | null;
  floor_panels: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  building_id: string;
  dong_id: string | null;
  image_url: string;
  storage_path: string;
  description: string | null;
  created_at: string;
}

export interface BuildingWithDetails extends Building {
  dongs: Dong[];
  photos: Photo[];
}

export type BuildingInsert = Pick<Building, 'name' | 'equipment_location'> &
  Partial<Omit<Building, 'id' | 'name' | 'equipment_location' | 'created_at' | 'updated_at'>>;

export type BuildingUpdate = Partial<Omit<Building, 'id' | 'created_at' | 'updated_at'>>;

export type DongInsert = Pick<Dong, 'building_id' | 'dong_name'> &
  Partial<Omit<Dong, 'id' | 'building_id' | 'dong_name' | 'created_at' | 'updated_at'>>;

export type DongUpdate = Partial<Omit<Dong, 'id' | 'building_id' | 'created_at' | 'updated_at'>>;
