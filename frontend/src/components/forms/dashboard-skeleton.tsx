import { Card, Skeleton } from "@/components/ui/primitives";
import { surfaceClassName } from "@/components/ui/styles";

export function DashboardSkeleton() {
  return (
    <div className={`grid gap-4 ${surfaceClassName} p-7 max-sm:p-5`} aria-label="Loading forms">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <div className="grid gap-3 border-b border-line p-5">
            <Skeleton className="h-7 w-2/5 max-sm:w-3/4" />
            <Skeleton className="h-4 w-3/5 max-sm:w-full" />
          </div>
          <div className="grid grid-cols-4 border-b border-line max-lg:grid-cols-2 max-[520px]:grid-cols-1">
            {[0, 1, 2, 3].map((metric) => (
              <div className="border-r border-line p-4 last:border-r-0 max-lg:border-b max-lg:[&:nth-child(2n)]:border-r-0 max-[520px]:border-r-0" key={metric}>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            <Skeleton className="h-control w-12" />
            <Skeleton className="h-control w-12" />
            <Skeleton className="h-control w-12" />
          </div>
        </Card>
      ))}
    </div>
  );
}
