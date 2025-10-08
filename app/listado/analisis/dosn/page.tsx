"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { obtenerTodasDosnActivas } from "@/app/services/dosn-service"
import { DosnDTO } from "@/app/models"
import { EstadoAnalisis } from "@/app/models/types/enums"

// Función utilitaria para formatear fechas correctamente
const formatearFechaLocal = (fechaString: string): string => {
  if (!fechaString) return ''
  
  try {
    // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
      const [year, month, day] = fechaString.split('-').map(Number)
      const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    
    // Si viene en otro formato, parsearlo de manera segura
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.warn("Error al formatear fecha:", fechaString, error)
    return fechaString
  }
}

export default function ListadoDOSNPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dosns, setDosns] = useState<DosnDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDosns = async () => {
      try {
        setLoading(true)
        const data = await obtenerTodasDosnActivas()
        setDosns(data)
      } catch (err) {
        setError("Error al cargar los análisis DOSN")
        console.error("Error fetching DOSNs:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDosns()
  }, [])

  const filteredAnalysis = dosns.filter((analysis) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      analysis.analisisID.toString().includes(searchLower) ||
      analysis.lote.toLowerCase().includes(searchLower) ||
      (analysis.comentarios && analysis.comentarios.toLowerCase().includes(searchLower)) ||
      `dosn-${analysis.analisisID}`.includes(searchLower)
    const matchesStatus = selectedStatus === "all" || analysis.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats from real data
  const totalAnalysis = dosns.length
  const completedAnalysis = dosns.filter(d => d.estado === "FINALIZADO" || d.estado === "APROBADO").length
  const inProgressAnalysis = dosns.filter(d => d.estado === "EN_PROCESO").length
  const pendingAnalysis = dosns.filter(d => d.estado === "PENDIENTE").length
  const complianceRate = dosns.length > 0 ? Math.round((dosns.filter(d => d.cumpleEstandar === true).length / dosns.length) * 100) : 0

  const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "FINALIZADO":
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
        return "secondary"
      case "PENDIENTE":
        return "destructive"
      case "PENDIENTE_APROBACION":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatEstado = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "FINALIZADO":
        return "Finalizado"
      case "EN_PROCESO":
        return "En Proceso"
      case "PENDIENTE":
        return "Pendiente"
      case "APROBADO":
        return "Aprobado"
      case "PENDIENTE_APROBACION":
        return "Pend. Aprobación"
      case "PARA_REPETIR":
        return "Para Repetir"
      default:
        return estado
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando análisis DOSN...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error al cargar</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/listado">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Listados
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análisis DOSN</h1>
            <p className="text-muted-foreground">Consulta la determinación de otras semillas nocivas</p>
          </div>
        </div>
        <Link href="/registro/analisis/dosn">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{totalAnalysis}</p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{completedAnalysis}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold">{inProgressAnalysis}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cumplen Norma</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, lote o comentarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADO">Aprobado</option>
                <option value="PENDIENTE_APROBACION">Pend. Aprobación</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Análisis DOSN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID Análisis</TableHead>
                  <TableHead className="min-w-[150px]">Lote</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Inicio</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Fin</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px]">Cumple Estándar</TableHead>
                  <TableHead className="min-w-[200px]">Comentarios</TableHead>
                  <TableHead className="min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalysis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron análisis DOSN</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalysis.map((analysis) => (
                    <TableRow key={analysis.analisisID}>
                      <TableCell className="font-medium">DOSN-{analysis.analisisID}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{analysis.lote}</div>
                          {analysis.idLote && (
                            <div className="text-sm text-muted-foreground">ID: {analysis.idLote}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatearFechaLocal(analysis.fechaInicio)}</TableCell>
                      <TableCell>
                        {analysis.fechaFin ? formatearFechaLocal(analysis.fechaFin) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                          {formatEstado(analysis.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {analysis.cumpleEstandar !== undefined ? (
                          <Badge
                            variant={analysis.cumpleEstandar ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {analysis.cumpleEstandar ? "Sí" : "No"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No evaluado</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {analysis.comentarios ? (
                          <div className="truncate" title={analysis.comentarios}>
                            {analysis.comentarios}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/listado/analisis/dosn/${analysis.analisisID}`}>
                            <Button variant="ghost" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/listado/analisis/dosn/${analysis.analisisID}/editar`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
