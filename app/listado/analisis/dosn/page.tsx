"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const mockAnalysis = [
  {
    id: "DOSN001",
    loteId: "L-2024-001",
    loteName: "Trigo Don Mario",
    analyst: "Dr. María González",
    startDate: "2024-09-15",
    endDate: "2024-09-16",
    status: "Completado",
    priority: "Alta",
    conditions: {
      muestra: "500g",
      metodo: "Separación manual",
      tiempo: "2 horas",
    },
    results: {
      semillasNocivas: "3",
      tiposEncontrados: ["Avena fatua", "Bromus spp."],
      porcentajePeso: "0.6%",
      cumpleNorma: "Sí",
    },
  },
  {
    id: "DOSN002",
    loteId: "L-2024-003",
    loteName: "Maíz Pioneer",
    analyst: "Ana Martínez",
    startDate: "2024-09-18",
    endDate: null,
    status: "En Proceso",
    priority: "Media",
    conditions: {
      muestra: "1000g",
      metodo: "Separación manual",
      tiempo: "3 horas",
    },
    results: null,
  },
]

export default function ListadoDOSNPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredAnalysis = mockAnalysis.filter((analysis) => {
    const matchesSearch =
      analysis.loteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.loteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.analyst.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || analysis.status === selectedStatus
    return matchesSearch && matchesStatus
  })

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">19</p>
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
                <p className="text-2xl font-bold">15</p>
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
                <p className="text-2xl font-bold">4</p>
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
                <p className="text-2xl font-bold">92%</p>
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
                  placeholder="Buscar por lote, nombre o analista..."
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
                <option value="Completado">Completado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Pendiente">Pendiente</option>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Análisis</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Analista</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Muestra</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalysis.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell className="font-medium">{analysis.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{analysis.loteId}</div>
                      <div className="text-sm text-muted-foreground">{analysis.loteName}</div>
                    </div>
                  </TableCell>
                  <TableCell>{analysis.analyst}</TableCell>
                  <TableCell>{analysis.startDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        analysis.status === "Completado"
                          ? "default"
                          : analysis.status === "En Proceso"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {analysis.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        analysis.priority === "Alta"
                          ? "destructive"
                          : analysis.priority === "Media"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {analysis.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{analysis.conditions.muestra}</TableCell>
                  <TableCell>
                    {analysis.results ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Semillas nocivas:</span> {analysis.results.semillasNocivas}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">% en peso:</span> {analysis.results.porcentajePeso}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Cumple norma:</span>{" "}
                          <Badge
                            variant={analysis.results.cumpleNorma === "Sí" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {analysis.results.cumpleNorma}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tipos: {analysis.results.tiposEncontrados.join(", ")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pendiente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
