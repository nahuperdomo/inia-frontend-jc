"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

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

  const [lotes] = useState<Lote[]>([
    {
      id: "RG-LE-ex-0018",
      empresa: "INIA",
      cultivo: "Soja",
      codigoCC: "CC001",
      codigoFT: "FT001",
      fechaRegistro: "2024-12-10",
      estado: "Activo",
      pureza: 98.5,
      observaciones: "Lote en condiciones óptimas",
    },
    {
      id: "RG-LE-ex-0019",
      empresa: "INIA",
      cultivo: "Maíz",
      codigoCC: "CC002",
      codigoFT: "FT002",
      fechaRegistro: "2024-12-12",
      estado: "En análisis",
      pureza: 97.2,
      observaciones: "Análisis de pureza en proceso",
    },
    {
      id: "RG-LE-ex-0020",
      empresa: "INIA",
      cultivo: "Trigo",
      codigoCC: "CC003",
      codigoFT: "FT003",
      fechaRegistro: "2024-12-08",
      estado: "Completado",
      pureza: 99.1,
      observaciones: "Análisis completado satisfactoriamente",
    },
    {
      id: "RG-LE-ex-0021",
      empresa: "INIA",
      cultivo: "Soja",
      codigoCC: "CC004",
      codigoFT: "FT004",
      fechaRegistro: "2024-12-14",
      estado: "Pendiente",
      pureza: 0,
      observaciones: "Esperando inicio de análisis",
    },
    {
      id: "RG-LE-ex-0022",
      empresa: "INIA",
      cultivo: "Arroz",
      codigoCC: "CC005",
      codigoFT: "FT005",
      fechaRegistro: "2024-12-13",
      estado: "Activo",
      pureza: 96.8,
      observaciones: "Lote con características especiales",
    },
  ])

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
                <p className="text-2xl font-bold">{lotes.length}</p>
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
                <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "Activo").length}</p>
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
                <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "En análisis").length}</p>
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
                <p className="text-2xl font-bold">{lotes.filter((l) => l.estado === "Completado").length}</p>
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
            {filteredLotes.length} lote{filteredLotes.length !== 1 ? "s" : ""} encontrado
            {filteredLotes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {filteredLotes.map((lote) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
