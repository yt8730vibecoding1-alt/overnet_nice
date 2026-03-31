import Link from 'next/link';
import { Plus, Radio } from 'lucide-react';
import { BuildingList } from '@/components/buildings/building-list';
import { LogoutButton } from '@/components/auth/logout-button';
import { getBuildings } from '@/actions/buildings';

export default async function HomePage() {
  const buildings = await getBuildings();

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-gray-900 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">건물정보</h1>
              <p className="text-xs font-medium tracking-widest text-gray-400">OVERNET</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-300">
              {buildings.length}건
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 flex-col gap-3 p-3 pb-24">
        <BuildingList initialBuildings={buildings} />
      </main>

      {/* FAB: 건물 등록 */}
      <Link
        href="/buildings/new"
        className="safe-bottom fixed bottom-6 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-xl shadow-gray-900/30 transition-transform active:scale-95"
        aria-label="건물 추가"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
