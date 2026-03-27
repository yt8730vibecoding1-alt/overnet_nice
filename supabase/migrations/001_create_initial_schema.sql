-- 건물정보 관리 웹앱 초기 스키마
-- Supabase 대시보드 SQL 에디터에서 실행

-- UUID 생성 확장
create extension if not exists "uuid-ossp";

-- Buildings 테이블
create table public.buildings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  equipment_location text not null,
  address text,
  wiring_structure text,
  floor_panels text,
  access_method text,
  admin_contact text,
  indoor_panel_location text,
  work_scope text,
  difficulty smallint check (difficulty >= 1 and difficulty <= 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dongs (동) 테이블
create table public.dongs (
  id uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  dong_name text not null,
  equipment_location text,
  wiring_structure text,
  floor_panels text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Photos 테이블
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  dong_id uuid references public.dongs(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 인덱스
create index idx_buildings_name on public.buildings(name);
create index idx_buildings_updated_at on public.buildings(updated_at desc);
create index idx_dongs_building_id on public.dongs(building_id);
create index idx_photos_building_id on public.photos(building_id);
create index idx_photos_dong_id on public.photos(dong_id);

-- updated_at 자동 갱신 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_building_updated
  before update on public.buildings
  for each row execute function public.handle_updated_at();

create trigger on_dong_updated
  before update on public.dongs
  for each row execute function public.handle_updated_at();

-- Storage 버킷 생성
insert into storage.buckets (id, name, public)
values ('building-photos', 'building-photos', true);

-- Storage 정책: 인증된 사용자만 업로드/삭제, 공개 조회
create policy "Allow public read" on storage.objects
  for select using (bucket_id = 'building-photos');

create policy "Allow authenticated insert" on storage.objects
  for insert with check (bucket_id = 'building-photos' and auth.role() = 'authenticated');

create policy "Allow authenticated delete" on storage.objects
  for delete using (bucket_id = 'building-photos' and auth.role() = 'authenticated');
