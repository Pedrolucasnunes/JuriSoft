import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-24 bg-muted" />
      <Skeleton className="h-8 w-16 bg-muted" />
      <Skeleton className="h-3 w-32 bg-muted" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-border">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-24 bg-muted" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-32 bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonQuestao() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32 bg-muted" />
        <Skeleton className="h-5 w-20 bg-muted" />
      </div>
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-3/4 bg-muted" />
      <div className="space-y-2 pt-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted" />)}
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-6 space-y-3">
          <Skeleton className="h-5 w-40 bg-muted" />
          <Skeleton className="h-[300px] w-full bg-muted" />
        </div>
        <div className="rounded-lg border border-border p-6 space-y-3">
          <Skeleton className="h-5 w-40 bg-muted" />
          <Skeleton className="h-[300px] w-full bg-muted" />
        </div>
      </div>
    </div>
  )
}