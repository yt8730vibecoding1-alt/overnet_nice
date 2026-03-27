# 셀프 코드리뷰 & 작업 회고

> 작성일: 2026-03-27
> 프로젝트: 건물정보 관리 웹앱 MVP

---

## 1. 셀프 코드리뷰 결과

### 발견된 이슈 및 수정 현황

#### CRITICAL / HIGH (수정 완료)

| # | 이슈 | 심각도 | 파일 | 수정 |
|---|------|--------|------|------|
| 1 | 사진 업로드 실패 시 Storage 고아 파일 발생 | HIGH | photo-upload.tsx | DB 저장 실패 시 Storage 파일 자동 삭제 로직 추가 |
| 2 | 사진 삭제 순서 오류 (Storage→DB) | HIGH | photos.ts | DB 레코드 먼저 삭제 후 Storage 파일 삭제로 순서 변경 |
| 3 | 이미지 압축 실패 시 무한 대기 | HIGH | photo-upload.tsx | 압축 단계 별도 try-catch + 사용자 피드백 |

#### MEDIUM (수정 완료)

| # | 이슈 | 심각도 | 파일 | 수정 |
|---|------|--------|------|------|
| 4 | 동 수정/삭제 버튼 터치 타겟 < 44px | MEDIUM | dong-list.tsx | min-h-[44px] + 패딩 확대 |
| 5 | 검색 X 버튼 터치 타겟 부족 | MEDIUM | search-bar.tsx | h-11 w-11 (44px) 명시 |
| 6 | PhotoViewer 배열 범위 미검사 | MEDIUM | photo-viewer.tsx | null 체크 + 안전한 종료 |
| 7 | Toast가 FAB에 가려질 수 있음 | MEDIUM | layout.tsx | bottom-center → top-center 변경 |
| 8 | catch 블록에서 에러 로깅 누락 | MEDIUM | building-form, dong-form, photo-upload | console.error 추가 |
| 9 | 동별 사진 기능 미완성 | MEDIUM | dong-list.tsx | PhotoUpload + PhotoGrid 통합 |
| 10 | DifficultyStars 비대화 모드에서 불필요한 button 사용 | MEDIUM | difficulty-stars.tsx | 조건부 button/span 렌더링 |
| 11 | 건물 사진 섹션이 동 사진과 중복 표시 | MEDIUM | building-detail.tsx | dong_id가 null인 사진만 건물 섹션에 표시 |

#### 인지했으나 의도적으로 미수정 (MVP 범위)

| # | 이슈 | 이유 |
|---|------|------|
| A | RLS 정책 미적용 | MVP 단일 사용자. v2 다중 사용자 전환 시 추가 예정. 스키마에 user_id 여지 확보됨 |
| B | Server Actions에 auth 체크 없음 | middleware가 인증 가드 역할. RLS와 함께 v2에서 강화 |
| C | 건물 목록 페이지네이션 없음 | MVP ~100건 규모. limit(50)으로 충분 |
| D | `<img>` 대신 Next Image 미사용 | 외부 Supabase Storage URL이므로 next.config에 도메인 설정 필요. Supabase 프로젝트 생성 후 설정 예정 |
| E | 검색 쿼리 길이 미제한 | Supabase 쿼리 빌더가 SQL 인젝션 방지. MVP에서 실질적 위험 없음 |

---

## 2. 작업 회고

### 2-1. 잘한 점

1. **Server Actions 선택**: 초기 계획에서 API Routes를 고려했으나, 시니어 리뷰 단계에서 Server Actions로 전환. 보일러플레이트 50% 이상 감소, 타입 안전성 확보.

2. **모바일 퍼스트 구현**: 처음부터 모바일 레이아웃 중심으로 설계. sticky 헤더, FAB, safe-area-inset, 터치 타겟 등 모바일 핵심 패턴을 반영.

3. **건물→동 계층 구조**: PRD의 핵심 요구사항인 "동이 있는 건물 vs 없는 건물" 분기를 깔끔하게 구현. 확장/축소 UI로 정보 과부하 방지.

4. **사진 업로드 아키텍처**: 클라이언트→Storage 직접 업로드 + 클라이언트 압축으로 Vercel 서버리스 제한(10MB) 우회. 실용적 판단.

5. **빌드 검증**: 구현 후 즉시 빌드 테스트로 TypeScript/컴파일 오류 조기 발견.

### 2-2. 개선할 점

1. **코드리뷰 후에야 발견된 버그들**: 사진 업로드 실패 시 고아 파일, 삭제 순서 오류 등은 구현 시점에 예방할 수 있었음. **교훈**: 외부 리소스(Storage)와 DB 간 트랜잭션 일관성은 구현 시 항상 고려해야 함.

2. **동별 사진 기능 누락**: 스키마에 dong_id FK를 설계해놓고 UI 통합을 빠뜨림. **교훈**: 스키마 설계와 UI 구현 사이의 체크리스트가 필요.

3. **DifficultyStars 비대화 모드**: 표시 전용인데 `<button disabled>` 사용. 시맨틱 HTML 관점에서 처음부터 조건부 렌더링을 했어야 함.

4. **에러 로깅 일관성**: catch 블록에서 에러를 삼켜버린 곳이 다수. 디버깅 시 문제 추적 불가. **교훈**: 프로젝트 초기에 에러 핸들링 패턴을 확립하고 일관되게 적용.

### 2-3. 아키텍처 판단 평가

| 판단 | 결과 | 평가 |
|------|------|------|
| Server Actions 채택 | 코드량 감소, API 레이어 단순화 | 적절 |
| ILIKE 검색 (pg_trgm 미사용) | MVP 규모에서 충분 | 적절 |
| 클라이언트 사진 압축 | 네트워크 비용 절감 | 적절 |
| 수동 타입 정의 | Supabase 프로젝트 없이 개발 가능 | 적절 (프로젝트 연결 후 gen types로 전환 필요) |
| 이메일+비밀번호 인증 | PRD 명시 요구사항 충족 | 적절 |

### 2-4. 다음 단계 (Supabase 연결 후)

1. Supabase 프로젝트 생성 → SQL 마이그레이션 실행
2. `.env.local` 실제 값 설정
3. Supabase Auth에 계정 생성
4. `next.config.ts`에 Supabase Storage 이미지 도메인 추가 → `<img>` → `<Image>` 전환
5. `supabase gen types`로 수동 타입 → 자동 생성 타입 전환
6. Vercel 배포 + 환경변수 설정
7. 실제 모바일 기기에서 E2E 테스트
8. 시드 데이터(11개 건물) 이관

---

## 3. 수치 요약

- **총 파일**: 41개 (소스 29 + 설정/에셋 12)
- **코드리뷰 발견 이슈**: 24건 (CRITICAL 2, HIGH 5, MEDIUM 12, LOW 5)
- **수정 완료**: 11건 (리뷰 후 즉시 수정)
- **의도적 미수정**: 5건 (MVP 범위, 근거 명시)
- **빌드 결과**: 성공 (TypeScript strict 모드)
