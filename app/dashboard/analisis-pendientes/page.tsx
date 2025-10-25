"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obtenerAnalisisPendientesKeyset, AnalisisPendiente } from "@/app/services/dashboard-service"

const tipoAnalisisLabels: Record<string, string> = {
  PUREZA: "Pureza",
  GERMINACION: "Germinación",
  PMS: "PMS",
  TETRAZOLIO: "Tetrazolio",
  DOSN: "DOSN"
}

const tipoAnalisisColors: Record<string, string> = {
  PUREZA: "bg-blue-100 text-blue-800",
  GERMINACION: "bg-green-100 text-green-800",
  PMS: "bg-purple-100 text-purple-800",
  TETRAZOLIO: "bg-orange-100 text-orange-800",
  DOSN: "bg-pink-100 text-pink-800"
}

export default function AnalisisPendientesPage() {
  const router = useRouter()
  const [pendientes, setPendientes] = useState<AnalisisPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 20

  useEffect(() => {
    cargarPrimeraPagina()
  }, [])

  const cargarPrimeraPagina = async () => {
    try {
      setLoading(true)
      setError(null)
  const response = await obtenerAnalisisPendientesKeyset(undefined, pageSize)
      setPendientes(response.items)
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      console.error("Error al cargar análisis pendientes:", err)
      setError("Error al cargar los análisis pendientes. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const cargarMas = async () => {
  if (!nextCursor || loadingMore) return
    
    try {
      setLoadingMore(true)
      setError(null)
      const response = await obtenerAnalisisPendientesKeyset(
        nextCursor,
        pageSize
      )
      setPendientes(prev => [...prev, ...response.items])
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      console.error("Error al cargar más análisis:", err)
      setError("Error al cargar más análisis. Por favor, intente nuevamente.")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleCrearAnalisis = (loteId: number, tipo: string) => {
    router.push(`/registro/analisis?loteId=${loteId}&tipo=${tipo}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis Pendientes</CardTitle>
            <CardDescription>Cargando análisis pendientes...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análisis Pendientes</h1>
            <p className="text-muted-foreground mt-1">
              Análisis asignados que aún no han sido creados o requieren repetición
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendientes.length} cargados
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado de Análisis Pendientes</CardTitle>
          <CardDescription>
            Haga clic en "Crear Análisis" para iniciar el registro correspondiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendientes.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay análisis pendientes</h3>
              <p className="text-muted-foreground mt-2">
                Todos los análisis asignados han sido completados
              </p>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                Volver al Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Lote</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Ficha</TableHead>
                      <TableHead>Especie</TableHead>
                      <TableHead>Cultivar</TableHead>
                      <TableHead>Tipo Análisis</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendientes.map((item, index) => (
                      <TableRow key={`${item.loteID}-${item.tipoAnalisis}-${index}`}>
                        <TableCell className="font-medium">{item.loteID}</TableCell>
                        <TableCell>{item.nomLote}</TableCell>
                        <TableCell>{item.ficha}</TableCell>
                        <TableCell>{item.especieNombre}</TableCell>
                        <TableCell>{item.cultivarNombre}</TableCell>
                        <TableCell>
                          <Badge className={tipoAnalisisColors[item.tipoAnalisis] || "bg-gray-100 text-gray-800"}>
                            {tipoAnalisisLabels[item.tipoAnalisis] || item.tipoAnalisis}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleCrearAnalisis(item.loteID, item.tipoAnalisis)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Crear Análisis
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Botón Cargar Más */}
              <div className="flex flex-col items-center gap-3 py-6">
                {hasMore ? (
                  <Button
                    onClick={cargarMas}
                    disabled={loadingMore}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px] transition-all hover:scale-105"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        Cargar más
                        <Badge variant="secondary" className="ml-2">
                          {pageSize} más
                        </Badge>
                      </>
                    )}
                  </Button>
                ) : pendientes.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>No hay más análisis pendientes</span>
                  </div>
                ) : null}
                
                <p className="text-sm text-muted-foreground">
                  Mostrando {pendientes.length} {pendientes.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
