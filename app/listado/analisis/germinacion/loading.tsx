export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando análisis de germinación...</p>
        </div>
      </div>
    </div>
  )
}
