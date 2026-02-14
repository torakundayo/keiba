export function LoadingSkeleton() {
  return (
    <div className="py-8 space-y-4 animate-pulse">
      <div className="h-5 w-40 bg-slate-100 rounded" />
      <div className="h-4 w-56 bg-slate-100 rounded" />
      <div className="h-px bg-slate-100 my-4" />
      <div className="h-4 w-72 bg-slate-50 rounded" />
      <div className="h-px bg-slate-100 my-2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-50 rounded" />
      ))}
    </div>
  )
}
