export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Info Card Skeleton */}
      <div className="border rounded-lg p-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="space-y-6">
        {/* Tabs Skeleton */}
        <div className="border rounded-lg p-6">
          <div className="flex space-x-1 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          
          {/* Form Fields Skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}