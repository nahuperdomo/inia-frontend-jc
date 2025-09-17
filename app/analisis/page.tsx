"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  TestTube,
  FlaskConical,
  Beaker,
  Microscope,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function AnalisisPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const analysisTypes = [
    {
      type: "pureza",
      name: "Pureza Física",
      description: "Análisis de pureza física de semillas",
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      pending: 8,
      inProgress: 5,
      completed: 23,
    },
    {
      type: "germinacion",
      name: "Germinación",
      description: "Ensayos de germinación estándar",
      icon: TestTube,
      color: "text-green-600",
      bgColor: "bg-green-50",
      pending: 12,
      inProgress: 8,
      completed: 31,
    },
    {
      type: "pms",
      name: "Peso de Mil Semillas",
      description: "Determinación del peso de mil semillas",
      icon: FlaskConical,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      pending: 6,
      inProgress: 3,
      completed: 18,
    },
    {
      type: "tetrazolio",
      name: "Tetrazolio",
      description: "Ensayo de viabilidad y vigor",
      icon: Beaker,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      pending: 4,
      inProgress: 2,
      completed: 12,
    },
    {
      type: "dosn",
      name: "DOSN",
      description: "Determinación de otras semillas nocivas",
      icon: Microscope,
      color: "text-red-600",
      bgColor: "bg-red-50",
      pending: 3,
      inProgress: 1,
      completed: 8,
    },
  ]

  const recentAnalysis = [
    {
      id: "AN-2024-0048",
      muestra: "RG-LE-ex-0021",
      tipo: "Pureza",
      cliente: "Instituto Semillas",
      especie: "Helianthus annuus",
      estado: "En progreso",
      fechaInicio: "2024-12-13",
      responsable: "Dr. Juan Pérez",
    },
    {
      id: "AN-2024-0047",
      muestra: "RG-LE-ex-0020",
      tipo: "Tetrazolio",
      cliente: "AgroTech",
      especie: "Triticum aestivum",
      estado: "Completado",
      fechaInicio: "2024-12-12",
      responsable: "Dra. Ana Martínez",
    },
    {
      id: "AN-2024-0046",
      muestra: "RG-LE-ex-0019",
      tipo: "PMS",
      cliente: "Semillas del Sur",
      especie: "Zea mays",
      estado: "Pendiente",
      fechaInicio: "2024-12-11",
      responsable: "Dr. Carlos Rodríguez",
    },
  ]

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "En progreso":
        return "bg-blue-100 text-blue-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalStats = analysisTypes.reduce(
    (acc, type) => ({
      pending: acc.pending + type.pending,
      inProgress: acc.inProgress + type.inProgress,
      completed: acc.completed + type.completed,
    }),
    { pending: 0, inProgress: 0, completed: 0 },
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Análisis</h1>
          <p className="text-muted-foreground text-pretty">Administra todos los tipos de análisis del laboratorio</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{totalStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-3xl font-bold text-blue-600">{totalStats.inProgress}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-3xl font-bold text-green-600">{totalStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Análisis</CardTitle>
          <CardDescription>Gestiona cada tipo de análisis por separado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((analysis) => (
              <Link key={analysis.type} href={`/analisis/${analysis.type}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${analysis.bgColor} rounded-full p-3 group-hover:scale-110 transition-transform`}
                        >
                          <analysis.icon className={`h-6 w-6 ${analysis.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{analysis.name}</h3>
                          <p className="text-sm text-muted-foreground">{analysis.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-yellow-50 rounded">
                          <p className="text-lg font-bold text-yellow-600">{analysis.pending}</p>
                          <p className="text-xs text-muted-foreground">Pendientes</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-600">{analysis.inProgress}</p>
                          <p className="text-xs text-muted-foreground">En Progreso</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-600">{analysis.completed}</p>
                          <p className="text-xs text-muted-foreground">Completados</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Análisis Recientes</CardTitle>
            <CardDescription>Últimos análisis registrados en el sistema</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar análisis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnalysis.map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <TestTube className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{analysis.id}</h3>
                        <p className="text-sm text-muted-foreground">Muestra: {analysis.muestra}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo</p>
                        <p className="font-medium">{analysis.tipo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{analysis.cliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Especie</p>
                        <p className="font-medium">{analysis.especie}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsable</p>
                        <p className="font-medium">{analysis.responsable}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fecha Inicio</p>
                        <p className="font-medium">{analysis.fechaInicio}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(analysis.estado)}>{analysis.estado}</Badge>
                    <div className="flex gap-2">
                      <Link href={`/analisis/${analysis.tipo.toLowerCase()}/${analysis.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
