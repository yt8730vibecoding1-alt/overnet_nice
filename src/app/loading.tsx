export default function HomeLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3">
        <h1 className="text-lg font-bold text-white">오버넷 건물정보</h1>
      </header>
      <main className="flex flex-1 flex-col gap-3 p-4">
        {/* 검색바 스켈레톤 */}
        <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
        {/* 카드 스켈레톤 */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-white p-3.5 shadow-sm">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </main>
    </div>
  );
}
