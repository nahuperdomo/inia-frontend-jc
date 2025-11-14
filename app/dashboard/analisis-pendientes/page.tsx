"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obtenerAnalisisPendientesPaginados, AnalisisPendiente } from "@/app/services/dashboard-service"
import Pagination from "@/components/pagination"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"

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
  const { user } = useAuth()
  const [pendientes, setPendientes] = useState<AnalisisPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const pageSize = 10

  useEffect(() => {
    cargarPrimeraPagina()
  }, [])

  const cargarPrimeraPagina = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await obtenerAnalisisPendientesPaginados(0, pageSize)

      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<AnalisisPendiente>(data, 0)

      setPendientes(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
      setIsFirst(pageData.isFirst)
      setIsLast(pageData.isLast)
    } catch (err) {
      console.error("Error al cargar análisis pendientes:", err)
      setError("Error al cargar los análisis pendientes. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendientes = async (page: number = 0) => {
    try {
      setLoading(true)
      setError(null)
      const data = await obtenerAnalisisPendientesPaginados(page, pageSize)

      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<AnalisisPendiente>(data, page)

      setPendientes(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
      setIsFirst(pageData.isFirst)
      setIsLast(pageData.isLast)
    } catch (err) {
      console.error("Error al cargar análisis:", err)
      setError("Error al cargar análisis. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
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
          {totalElements} total
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
            {user?.role === "observador"
              ? "Análisis asignados que aún no han sido creados o requieren repetición"
              : "Haga clic en \"Crear Análisis\" para iniciar el registro correspondiente"
            }
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
                      {user?.role !== "observador" && (
                        <TableHead className="text-right">Acción</TableHead>
                      )}
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
                        {user?.role !== "observador" && (
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleCrearAnalisis(item.loteID, item.tipoAnalisis)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Crear Análisis
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                <div className="text-sm text-muted-foreground">
                  {totalElements === 0 ? (
                    <>Mostrando 0 de 0 resultados</>
                  ) : (
                    <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
                  )}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(totalPages, 1)}
                  onPageChange={(p) => fetchPendientes(p)}
                  showRange={1}
                  alwaysShow={true}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
