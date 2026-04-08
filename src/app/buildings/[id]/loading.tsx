export default function BuildingDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-white/30" />
          <div className="h-5 w-40 animate-pulse rounded bg-white/30" />
        </div>
      </header>
      <div className="flex border-b border-gray-200 bg-white">
        {['정보', '사진', '동'].map((t) => (
          <div key={t} className="flex flex-1 justify-center py-3 text-sm text-gray-300">{t}</div>
        ))}
      </div>
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
