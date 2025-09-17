"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function PurezaPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const purezaAnalysis = [
    {
      id: "AN-2024-0048",
      muestra: "RG-LE-ex-0021",
      cliente: "Instituto Semillas",
      especie: "Helianthus annuus",
      cultivar: "Paraíso 20",
      estado: "En progreso",
      fechaInicio: "2024-12-13",
      responsable: "Dr. Juan Pérez",
      pesoInicial: "100.0",
      semillaPura: "95.2",
      materiaInerte: "3.1",
      otrosCultivos: "1.2",
      malezas: "0.5",
      progreso: 75,
    },
    {
      id: "AN-2024-0045",
      muestra: "RG-LE-ex-0018",
      cliente: "Cooperativa Norte",
      especie: "Glycine max",
      cultivar: "Don Mario 4.2",
      estado: "Completado",
      fechaInicio: "2024-12-10",
      responsable: "Dra. María González",
      pesoInicial: "100.0",
      semillaPura: "98.5",
      materiaInerte: "1.2",
      otrosCultivos: "0.2",
      malezas: "0.1",
      progreso: 100,
    },
    {
      id: "AN-2024-0042",
      muestra: "RG-LE-ex-0015",
      cliente: "Semillas Premium",
      especie: "Zea mays",
      cultivar: "Pioneer 30F35",
      estado: "Pendiente",
      fechaInicio: "2024-12-09",
      responsable: "Dr. Carlos Rodríguez",
      pesoInicial: "100.0",
      semillaPura: "",
      materiaInerte: "",
      otrosCultivos: "",
      malezas: "",
      progreso: 0,
    },
  ]

  const stats = [
    { label: "Total Análisis", value: "23", icon: Search, color: "text-blue-600" },
    { label: "Pendientes", value: "8", icon: Clock, color: "text-yellow-600" },
    { label: "En Progreso", value: "5", icon: AlertTriangle, color: "text-orange-600" },
    { label: "Completados", value: "10", icon: CheckCircle, color: "text-green-600" },
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/analisis">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Análisis
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Análisis de Pureza</h1>
            <p className="text-muted-foreground text-pretty">Gestión de análisis de pureza física de semillas</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, muestra, cliente o especie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Pureza</CardTitle>
          <CardDescription>Lista de todos los análisis de pureza física</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purezaAnalysis.map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-full p-2">
                        <Search className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{analysis.id}</h3>
                        <p className="text-sm text-muted-foreground">Muestra: {analysis.muestra}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{analysis.cliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Especie</p>
                        <p className="font-medium">{analysis.especie}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cultivar</p>
                        <p className="font-medium">{analysis.cultivar}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsable</p>
                        <p className="font-medium">{analysis.responsable}</p>
                      </div>
                    </div>

                    {analysis.estado === "Completado" && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm bg-muted/30 p-3 rounded">
                        <div>
                          <p className="text-muted-foreground">Peso Inicial (g)</p>
                          <p className="font-medium">{analysis.pesoInicial}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Semilla Pura (%)</p>
                          <p className="font-medium text-green-600">{analysis.semillaPura}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Materia Inerte (%)</p>
                          <p className="font-medium">{analysis.materiaInerte}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Otros Cultivos (%)</p>
                          <p className="font-medium">{analysis.otrosCultivos}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Malezas (%)</p>
                          <p className="font-medium">{analysis.malezas}</p>
                        </div>
                      </div>
                    )}

                    {analysis.estado === "En progreso" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso del análisis</span>
                          <span>{analysis.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analysis.progreso}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

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
                      <Link href={`/analisis/pureza/${analysis.id}`}>
                        <Button variant="outline" size="sm">
                          {analysis.estado === "Pendiente" ? "Iniciar" : "Ver Detalle"}
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
