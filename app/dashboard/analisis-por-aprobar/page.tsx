"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, ArrowLeft, ShieldAlert, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obtenerAnalisisPorAprobarKeyset, AnalisisPorAprobar, KeysetCursor } from "@/app/services/dashboard-service"
import { obtenerPerfil } from "@/app/services/auth-service"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

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

const tipoAnalisisRoutes: Record<string, string> = {
  PUREZA: "/listado/analisis/pureza",
  GERMINACION: "/listado/analisis/germinacion",
  PMS: "/listado/analisis/pms",
  TETRAZOLIO: "/listado/analisis/tetrazolio",
  DOSN: "/listado/analisis/dosn"
}

export default function AnalisisPorAprobarPage() {
  const router = useRouter()
  const [porAprobar, setPorAprobar] = useState<AnalisisPorAprobar[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<KeysetCursor | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 20

  useEffect(() => {
    cargarPerfilYDatos()
  }, [])

  const cargarPerfilYDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar rol del usuario
      const perfil: any = await obtenerPerfil()
      const rol = perfil?.rol || perfil?.role || perfil?.usuario?.rol || "USER"
      setUserRole(rol)
      
      if (rol !== "ADMIN") {
        setError("No tiene permisos para ver esta sección")
        setLoading(false)
        return
      }

      // Cargar primera página
      const response = await obtenerAnalisisPorAprobarKeyset(undefined, undefined, pageSize)
      setPorAprobar(response.items)
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      console.error("Error al cargar análisis por aprobar:", err)
      setError("Error al cargar los análisis por aprobar. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const cargarMas = async () => {
    if (!nextCursor || loadingMore) return
    
    try {
      setLoadingMore(true)
      setError(null)
      const response = await obtenerAnalisisPorAprobarKeyset(
        nextCursor.lastFecha,
        nextCursor.lastId,
        pageSize
      )
      setPorAprobar(prev => [...prev, ...response.items])
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      console.error("Error al cargar más análisis:", err)
      setError("Error al cargar más análisis. Por favor, intente nuevamente.")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleVerDetalle = (analisisID: number, tipo: string) => {
    const route = tipoAnalisisRoutes[tipo]
    if (route) {
      router.push(`${route}/${analisisID}`)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (err) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Aprobar</CardTitle>
            <CardDescription>Cargando análisis pendientes de aprobación...</CardDescription>
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

  if (userRole !== "ADMIN") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              Acceso Denegado
            </CardTitle>
            <CardDescription>No tiene permisos para acceder a esta sección</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Solo los administradores pueden ver los análisis pendientes de aprobación
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
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
            <h1 className="text-3xl font-bold">Análisis por Aprobar</h1>
            <p className="text-muted-foreground mt-1">
              Análisis completados pendientes de revisión y aprobación
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {porAprobar.length} cargados
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
          <CardTitle>Listado de Análisis por Aprobar</CardTitle>
          <CardDescription>
            Haga clic en "Ver Detalle" para revisar y aprobar/rechazar el análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {porAprobar.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-semibold">No hay análisis por aprobar</h3>
              <p className="text-muted-foreground mt-2">
                Todos los análisis han sido revisados
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
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>ID Lote</TableHead>
                      <TableHead>Nombre Lote</TableHead>
                      <TableHead>Ficha</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porAprobar.map((item) => (
                      <TableRow key={`${item.tipo}-${item.analisisID}`}>
                        <TableCell className="font-medium">{item.analisisID}</TableCell>
                        <TableCell>
                          <Badge className={tipoAnalisisColors[item.tipo] || "bg-gray-100 text-gray-800"}>
                            {tipoAnalisisLabels[item.tipo] || item.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.loteID}</TableCell>
                        <TableCell>{item.nomLote}</TableCell>
                        <TableCell>{item.ficha}</TableCell>
                        <TableCell className="text-sm">{formatDate(item.fechaInicio)}</TableCell>
                        <TableCell className="text-sm">{formatDate(item.fechaFin)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleVerDetalle(item.analisisID, item.tipo)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalle
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
                ) : porAprobar.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>No hay más análisis por aprobar</span>
                  </div>
                ) : null}
                
                <p className="text-sm text-muted-foreground">
                  Mostrando {porAprobar.length} {porAprobar.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
