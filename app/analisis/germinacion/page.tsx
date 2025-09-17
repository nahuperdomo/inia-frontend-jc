"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TestTube, ArrowLeft, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function GerminacionPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const germinacionAnalysis = [
    {
      id: "AN-2024-0049",
      muestra: "RG-LE-ex-0022",
      cliente: "Cooperativa Central",
      especie: "Glycine max",
      cultivar: "Don Mario 6.2",
      estado: "En progreso",
      fechaInicio: "2024-12-14",
      responsable: "Dra. María González",
      repeticiones: 4,
      diasConteo: "4, 7",
      temperaturaGerminacion: "25°C",
      progreso: 60,
      conteoActual: "Día 4",
    },
    {
      id: "AN-2024-0046",
      muestra: "RG-LE-ex-0019",
      cliente: "Semillas del Sur",
      especie: "Zea mays",
      cultivar: "Pioneer 30F35",
      estado: "Completado",
      fechaInicio: "2024-12-11",
      responsable: "Dr. Carlos Rodríguez",
      repeticiones: 4,
      diasConteo: "4, 7",
      temperaturaGerminacion: "25°C",
      progreso: 100,
      germinacionFinal: "92%",
      plántulasNormales: "92",
      plántulasAnormales: "5",
      semillasFrescas: "2",
      semillasDuras: "0",
      semillasVacias: "1",
      semillasMuertas: "0",
    },
    {
      id: "AN-2024-0043",
      muestra: "RG-LE-ex-0016",
      cliente: "AgroTech",
      especie: "Triticum aestivum",
      cultivar: "INIA Tijereta",
      estado: "Pendiente",
      fechaInicio: "2024-12-12",
      responsable: "Dra. Ana Martínez",
      repeticiones: 4,
      diasConteo: "4, 7",
      temperaturaGerminacion: "20°C",
      progreso: 0,
    },
  ]

  const stats = [
    { label: "Total Análisis", value: "31", icon: TestTube, color: "text-green-600" },
    { label: "Pendientes", value: "12", icon: Clock, color: "text-yellow-600" },
    { label: "En Progreso", value: "8", icon: AlertTriangle, color: "text-orange-600" },
    { label: "Completados", value: "11", icon: CheckCircle, color: "text-green-600" },
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
            <h1 className="text-3xl font-bold text-balance">Ensayos de Germinación</h1>
            <p className="text-muted-foreground text-pretty">Gestión de ensayos de germinación estándar</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ensayo
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
                <TestTube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          <CardTitle>Ensayos de Germinación</CardTitle>
          <CardDescription>Lista de todos los ensayos de germinación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {germinacionAnalysis.map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 rounded-full p-2">
                        <TestTube className="h-4 w-4 text-green-600" />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted/30 p-3 rounded">
                      <div>
                        <p className="text-muted-foreground">Repeticiones</p>
                        <p className="font-medium">{analysis.repeticiones}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Días de Conteo</p>
                        <p className="font-medium">{analysis.diasConteo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temperatura</p>
                        <p className="font-medium">{analysis.temperaturaGerminacion}</p>
                      </div>
                    </div>

                    {analysis.estado === "Completado" && (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm bg-green-50 p-3 rounded">
                        <div>
                          <p className="text-muted-foreground">Germinación Final</p>
                          <p className="font-bold text-green-600 text-lg">{analysis.germinacionFinal}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Normales</p>
                          <p className="font-medium">{analysis.plántulasNormales}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Anormales</p>
                          <p className="font-medium">{analysis.plántulasAnormales}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frescas</p>
                          <p className="font-medium">{analysis.semillasFrescas}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duras</p>
                          <p className="font-medium">{analysis.semillasDuras}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Muertas</p>
                          <p className="font-medium">{analysis.semillasMuertas}</p>
                        </div>
                      </div>
                    )}

                    {analysis.estado === "En progreso" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso del ensayo - {analysis.conteoActual}</span>
                          <span>{analysis.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
                      <Link href={`/analisis/germinacion/${analysis.id}`}>
                        <Button variant="outline" size="sm">
                          {analysis.estado === "Pendiente"
                            ? "Iniciar"
                            : analysis.estado === "En progreso"
                              ? "Continuar"
                              : "Ver Detalle"}
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
