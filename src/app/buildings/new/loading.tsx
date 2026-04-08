export default function NewBuildingLoading() {
  return (
    <div className="flex h-full flex-col bg-gray-100">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-primary px-4 py-3">
        <div className="h-5 w-5 rounded bg-white/30" />
        <div className="h-5 w-24 animate-pulse rounded bg-white/30" />
      </header>
      <div className="space-y-3 p-3">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white px-4 py-4">
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
