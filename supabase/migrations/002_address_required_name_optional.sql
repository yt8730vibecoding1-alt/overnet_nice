-- 주소를 필수로, 건물명을 선택으로 변경
-- 기존 데이터: address가 null인 경우 name 값을 복사
UPDATE public.buildings SET address = COALESCE(name, '주소 미입력') WHERE address IS NULL;

-- 이제 address를 NOT NULL로 변경
ALTER TABLE public.buildings ALTER COLUMN address SET NOT NULL;

-- name을 nullable로 변경
ALTER TABLE public.buildings ALTER COLUMN name DROP NOT NULL;
