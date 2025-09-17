"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TestTube, Search, Plus, Filter, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function MuestrasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const samples = [
    {
      id: "RG-LE-ex-0018",
      cliente: "Cooperativa Norte",
      especie: "Glycine max",
      cultivar: "Don Mario 4.2",
      lote: "LT-2024-001",
      fechaRecepcion: "2024-12-10",
      estado: "En análisis",
      analisis: ["Pureza", "Germinación"],
      numeroAnalisis: "AN-2024-0045",
      responsable: "Dr. Juan Pérez",
    },
    {
      id: "RG-LE-ex-0019",
      cliente: "Semillas del Sur",
      especie: "Zea mays",
      cultivar: "Pioneer 30F35",
      lote: "LT-2024-002",
      fechaRecepcion: "2024-12-11",
      estado: "Pendiente",
      analisis: ["PMS", "DOSN"],
      numeroAnalisis: "AN-2024-0046",
      responsable: "Dra. María González",
    },
    {
      id: "RG-LE-ex-0020",
      cliente: "AgroTech",
      especie: "Triticum aestivum",
      cultivar: "INIA Tijereta",
      lote: "LT-2024-003",
      fechaRecepcion: "2024-12-12",
      estado: "Completado",
      analisis: ["Tetrazolio"],
      numeroAnalisis: "AN-2024-0047",
      responsable: "Dr. Carlos Rodríguez",
    },
    {
      id: "RG-LE-ex-0021",
      cliente: "Instituto Semillas",
      especie: "Helianthus annuus",
      cultivar: "Paraíso 20",
      lote: "LT-2024-004",
      fechaRecepcion: "2024-12-13",
      estado: "En curso",
      analisis: ["Pureza", "Germinación", "PMS"],
      numeroAnalisis: "AN-2024-0048",
      responsable: "Dra. Ana Martínez",
    },
  ]

  const stats = [
    { label: "Total Muestras", value: "47", icon: TestTube, color: "text-blue-600" },
    { label: "En Análisis", value: "23", icon: Clock, color: "text-orange-600" },
    { label: "Completadas", value: "18", icon: CheckCircle, color: "text-green-600" },
    { label: "Pendientes", value: "6", icon: AlertTriangle, color: "text-red-600" },
  ]

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "En análisis":
        return "bg-blue-100 text-blue-800"
      case "En curso":
        return "bg-yellow-100 text-yellow-800"
      case "Pendiente":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Muestras</h1>
          <p className="text-muted-foreground text-pretty">
            Administra las muestras del laboratorio y sus análisis asociados
          </p>
        </div>
        <Link href="/muestras/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Muestra
          </Button>
        </Link>
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, cliente, especie o cultivar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Fecha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Samples Table */}
      <Card>
        <CardHeader>
          <CardTitle>Muestras Registradas</CardTitle>
          <CardDescription>Lista completa de muestras en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {samples.map((sample) => (
              <div key={sample.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <TestTube className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{sample.id}</h3>
                        <p className="text-sm text-muted-foreground">Análisis: {sample.numeroAnalisis}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{sample.cliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Especie y Cultivar</p>
                        <p className="font-medium">{sample.especie}</p>
                        <p className="text-xs text-muted-foreground">{sample.cultivar}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lote</p>
                        <p className="font-medium">{sample.lote}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fecha Recepción</p>
                        <p className="font-medium">{sample.fechaRecepcion}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsable</p>
                        <p className="font-medium">{sample.responsable}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sample.analisis.map((analisis, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {analisis}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(sample.estado)}>{sample.estado}</Badge>
                    <div className="flex gap-2">
                      <Link href={`/muestras/${sample.id}`}>
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
