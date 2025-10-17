"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft, Search, Eye, FileText, AlertTriangle, Database, FileArchive, Package } from "lucide-react"
import legadoService from "@/app/services/legado-service" 
import type { LegadoSimpleDTO } from "@/app/models/interfaces/legado"

export default function ListadoLegadoPage() {
  const [legados, setLegados] = useState<LegadoSimpleDTO[]>([])
  const [filteredLegados, setFilteredLegados] = useState<LegadoSimpleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchLegados = async () => {
      try {
        setLoading(true)
        const data = await legadoService.getAll()
        setLegados(data)
        setFilteredLegados(data)
      } catch (err) {
        setError("Error al cargar los datos legados")
        console.error("Error al cargar datos legados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLegados()
  }, [])

  useEffect(() => {
    const filtered = legados.filter((legado) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        legado.ficha?.toLowerCase().includes(searchLower) ||
        legado.nomLote?.toLowerCase().includes(searchLower) ||
        legado.codDoc?.toLowerCase().includes(searchLower) ||
        legado.nomDoc?.toLowerCase().includes(searchLower) ||
        legado.familia?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredLegados(filtered)
  }, [searchTerm, legados])

  // Estadísticas
  const totalLegados = legados.length
  const lotesUnicos = new Set(legados.map(l => l.nomLote).filter(Boolean)).size
  const fichasUnicas = new Set(legados.map(l => l.ficha).filter(Boolean)).size
  const familiasUnicas = new Set(legados.map(l => l.familia).filter(Boolean)).size

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando datos legados...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Datos Legados</h1>
            <p className="text-muted-foreground">Consulta los datos históricos importados desde Excel</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold">{totalLegados}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fichas Únicas</p>
                <p className="text-2xl font-bold">{fichasUnicas}</p>
              </div>
              <FileArchive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lotes Únicos</p>
                <p className="text-2xl font-bold">{lotesUnicos}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Familias Diferentes</p>
                <p className="text-2xl font-bold">{familiasUnicas}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
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
                  placeholder="Buscar por ficha, lote, código de documento, nombre o familia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Datos Legados ({filteredLegados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">ID</TableHead>
                  <TableHead className="min-w-[120px]">Ficha</TableHead>
                  <TableHead className="min-w-[150px]">Nombre Lote</TableHead>
                  <TableHead className="min-w-[120px]">Cód. Documento</TableHead>
                  <TableHead className="min-w-[150px]">Nombre Documento</TableHead>
                  <TableHead className="min-w-[120px]">Familia</TableHead>
                  <TableHead className="min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLegados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? "No se encontraron resultados" : "No hay datos legados registrados"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLegados.map((legado) => (
                    <TableRow key={legado.legadoID}>
                      <TableCell className="font-medium">LEG-{legado.legadoID}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{legado.ficha || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{legado.nomLote || "-"}</div>
                      </TableCell>
                      <TableCell>{legado.codDoc || "-"}</TableCell>
                      <TableCell>{legado.nomDoc || "-"}</TableCell>
                      <TableCell>{legado.familia || "-"}</TableCell>
                      <TableCell>
                        <Link href={`/listado/legado/${legado.legadoID}`}>
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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