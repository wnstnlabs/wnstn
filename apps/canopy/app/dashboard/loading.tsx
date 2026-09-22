export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 px-6 py-8">
      <div className="max-w-[1120px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-white/[0.05] rounded-xl animate-pulse" />
            <div className="mt-2 h-4 w-64 bg-white/[0.03] rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-40 bg-white/[0.05] rounded-xl animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="h-3 w-20 bg-white/[0.05] rounded animate-pulse mb-3" />
              <div className="h-8 w-24 bg-white/[0.05] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="h-5 w-40 bg-white/[0.05] rounded-lg animate-pulse mb-4" />
          <div className="h-64 bg-white/[0.02] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}