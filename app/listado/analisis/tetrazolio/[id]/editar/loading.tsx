import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <p className="text-lg font-medium">Cargando formulario de edición</p>
          <p className="text-sm text-muted-foreground">Un momento por favor...</p>
        </div>
      </div>
    </div>
  )
}
