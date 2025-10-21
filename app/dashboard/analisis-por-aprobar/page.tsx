"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, ArrowLeft, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obtenerAnalisisPorAprobar, AnalisisPorAprobar } from "@/app/services/dashboard-service"
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
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener perfil del usuario desde el backend
        const perfil = await obtenerPerfil()
        console.log("🔍 Análisis por Aprobar - Perfil obtenido:", perfil)
        
        // Extraer rol usando la misma lógica robusta del dashboard
        let roleFromBackend: string | null = null
        try {
          const p: any = perfil
          if (typeof p === 'object' && p !== null) {
            if (typeof p.rol === 'string' && p.rol.trim().length > 0) {
              roleFromBackend = p.rol
            } else if (typeof p.role === 'string' && p.role.trim().length > 0) {
              roleFromBackend = p.role
            } else if (p.usuario) {
              if (Array.isArray(p.usuario.roles) && p.usuario.roles.length > 0) {
                roleFromBackend = String(p.usuario.roles[0])
              } else if (typeof p.usuario.rol === 'string' && p.usuario.rol.trim().length > 0) {
                roleFromBackend = p.usuario.rol
              }
            }
          }
        } catch (extractErr) {
          console.warn('⚠️ Análisis por Aprobar - Error extrayendo rol:', extractErr)
        }
        
        // Normalizar y quitar el prefijo ROLE_ si existe
        if (roleFromBackend) {
          roleFromBackend = roleFromBackend.trim().replace(/^ROLE_/, '')
        }
        console.log("🔍 Análisis por Aprobar - Rol detectado:", roleFromBackend)
        setUserRole(roleFromBackend)
        
        const isAdmin = roleFromBackend?.toUpperCase() === "ADMIN"
        console.log("🔍 Análisis por Aprobar - Es admin?:", isAdmin)
        
        if (!isAdmin) {
          console.log("❌ Análisis por Aprobar - Redirigiendo al dashboard (no es admin)")
          router.push("/dashboard")
          return
        }
        
        // Cargar análisis por aprobar
        setLoading(true)
        setError(null)
        const data = await obtenerAnalisisPorAprobar()
        setPorAprobar(data)
      } catch (err) {
        console.error("Error al cargar análisis por aprobar:", err)
        setError("Error al cargar los análisis por aprobar. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }
    
    cargarDatos()
  }, [router])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return "N/A"
    }
  }

  const handleVerAnalisis = (tipo: string, analisisID: number) => {
    const basePath = tipoAnalisisRoutes[tipo]
    if (basePath) {
      router.push(`${basePath}/${analisisID}`)
    }
  }

  // Protección de ruta - solo ADMIN
  const isAdmin = userRole?.trim().toUpperCase() === "ADMIN"
  if (userRole !== null && !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            No tiene permisos para acceder a esta página. Esta función está disponible solo para administradores.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Aprobar</CardTitle>
            <CardDescription>Cargando análisis por aprobar...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h1 className="text-3xl font-bold">Análisis por Aprobar</h1>
            <p className="text-muted-foreground mt-1">
              Análisis finalizados que requieren aprobación administrativa
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {porAprobar.length} {porAprobar.length === 1 ? "pendiente" : "pendientes"}
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
          <CardTitle>Listado de Análisis Pendientes de Aprobación</CardTitle>
          <CardDescription>
            Haga clic en "Ver Análisis" para revisar y aprobar/rechazar el análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {porAprobar.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay análisis por aprobar</h3>
              <p className="text-muted-foreground mt-2">
                No hay análisis pendientes de aprobación en este momento
              </p>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                Volver al Dashboard
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>ID Análisis</TableHead>
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
                      <TableCell>
                        <Badge className={tipoAnalisisColors[item.tipo] || "bg-gray-100 text-gray-800"}>
                          {tipoAnalisisLabels[item.tipo] || item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.analisisID}</TableCell>
                      <TableCell>{item.loteID}</TableCell>
                      <TableCell>{item.nomLote}</TableCell>
                      <TableCell>{item.ficha}</TableCell>
                      <TableCell>{formatDate(item.fechaInicio)}</TableCell>
                      <TableCell>{formatDate(item.fechaFin)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleVerAnalisis(item.tipo, item.analisisID)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Análisis
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
