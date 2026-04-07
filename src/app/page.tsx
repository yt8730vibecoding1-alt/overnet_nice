import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BuildingList } from '@/components/buildings/building-list';
import { getBuildings } from '@/actions/buildings';

export default async function HomePage() {
  const buildings = await getBuildings();

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3">
        <h1 className="text-lg font-bold text-white">오버넷 건물정보</h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 flex-col gap-3 p-4">
        <BuildingList initialBuildings={buildings} />
      </main>

      {/* FAB: 건물 등록 */}
      <Link
        href="/buildings/new"
        className="safe-bottom fixed bottom-6 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </Link>
    </div>
  );
}
