"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { obtenerLotesActivos } from "@/app/services/lote-service"
import { LoteSimpleDTO } from "@/app/models"

interface Lote {
  id: string
  empresa: string
  cultivo: string
  codigoCC: string
  codigoFT: string
  fechaRegistro: string
  estado: "Activo" | "En análisis" | "Completado" | "Pendiente"
  pureza: number
  observaciones: string
}

export default function ListadoLotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterCultivo, setFilterCultivo] = useState<string>("todos")
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        setIsLoading(true)
        const lotesData = await obtenerLotesActivos()

        // Transform API data to component format
        // Note: Some fields might not be available from the API, so we use placeholders
        const lotesTransformed = lotesData.map((lote: LoteSimpleDTO) => ({
          id: lote.ficha || `#${lote.loteID}`,
          empresa: "INIA", // Placeholder - not available in LoteSimpleDTO
          cultivo: "No especificado", // Placeholder - not available in LoteSimpleDTO
          codigoCC: `CC-${lote.loteID}`, // Placeholder - not available in LoteSimpleDTO
          codigoFT: `FT-${lote.loteID}`, // Placeholder - not available in LoteSimpleDTO
          fechaRegistro: new Date().toISOString(), // Placeholder - not available in LoteSimpleDTO
          estado: lote.activo ? "Activo" : "Pendiente" as any,
          pureza: 0, // Placeholder - would need to fetch from pureza analysis
          observaciones: "", // Placeholder - not available in LoteSimpleDTO
        }))

        setLotes(lotesTransformed)
      } catch (err) {
        console.error("Error fetching lotes:", err)
        setError("Error al cargar los lotes. Intente nuevamente más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLotes()
  }, [])

  const filteredLotes = lotes.filter((lote) => {
    const matchesSearch =
      lote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.cultivo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "todos" || lote.estado === filterEstado
    const matchesCultivo = filterCultivo === "todos" || lote.cultivo === filterCultivo

    return matchesSearch && matchesEstado && matchesCultivo
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "default"
      case "En análisis":
        return "secondary"
      case "Completado":
        return "outline"
      case "Pendiente":
        return "destructive"
      default:
        return "outline"
    }
  }

  const cultivos = [...new Set(lotes.map((lote) => lote.cultivo))]

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-balance">Listado de Lotes</h1>
            <p className="text-muted-foreground text-pretty">
              Consulta y administra todos los lotes registrados en el sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/registro/lotes">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Lote
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lotes</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{lotes.length}</p>
                )}
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "Activo").length}</p>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Análisis</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "En análisis").length}</p>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "Completado").length}</p>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, empresa o cultivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="En análisis">En análisis</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCultivo} onValueChange={setFilterCultivo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por cultivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los cultivos</SelectItem>
                {cultivos.map((cultivo) => (
                  <SelectItem key={cultivo} value={cultivo}>
                    {cultivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Lotes</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando lotes..."
              : `${filteredLotes.length} lote${filteredLotes.length !== 1 ? "s" : ""} encontrado${filteredLotes.length !== 1 ? "s" : ""}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center p-6 text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Lote</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cultivo</TableHead>
                    <TableHead>Código CC</TableHead>
                    <TableHead>Código FT</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pureza (%)</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                          <p className="text-muted-foreground">Cargando datos de lotes...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">No se encontraron lotes que coincidan con los criterios de búsqueda.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-medium">{lote.id}</TableCell>
                        <TableCell>{lote.empresa}</TableCell>
                        <TableCell>{lote.cultivo}</TableCell>
                        <TableCell>{lote.codigoCC}</TableCell>
                        <TableCell>{lote.codigoFT}</TableCell>
                        <TableCell>{new Date(lote.fechaRegistro).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(lote.estado)}>{lote.estado}</Badge>
                        </TableCell>
                        <TableCell>{lote.pureza > 0 ? `${lote.pureza}%` : "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/lotes/${lote.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/lotes/${lote.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
