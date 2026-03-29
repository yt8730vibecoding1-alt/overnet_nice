-- RLS 활성화: 인증된 사용자만 데이터 접근 가능
-- Supabase 대시보드 SQL 에디터에서 실행

-- Buildings 테이블 RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.buildings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Dongs 테이블 RLS
ALTER TABLE public.dongs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.dongs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Photos 테이블 RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.photos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
