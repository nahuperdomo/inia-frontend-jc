"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  TestTube,
  FlaskConical,
  Beaker,
  Microscope,
  CheckCircle,
  User,
} from "lucide-react"
import Link from "next/link"

interface PendingTask {
  id: string
  tipo: "Pureza" | "Germinación" | "PMS" | "Tetrazolio" | "DOSN"
  muestra: string
  cliente: string
  especie: string
  cultivar: string
  responsable: string
  fechaVencimiento: string
  prioridad: "Alta" | "Media" | "Baja" | "Urgente"
  estado: "Pendiente" | "En progreso" | "Vencido"
  diasRestantes: number
  observaciones?: string
}

export default function PendientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterResponsible, setFilterResponsible] = useState("all")

  const pendingTasks: PendingTask[] = [
    {
      id: "AN-2024-0050",
      tipo: "Germinación",
      muestra: "RG-LE-ex-0023",
      cliente: "Cooperativa Norte",
      especie: "Glycine max",
      cultivar: "Don Mario 4.2",
      responsable: "Dr. Juan Pérez",
      fechaVencimiento: "2024-12-16",
      prioridad: "Urgente",
      estado: "Vencido",
      diasRestantes: -1,
      observaciones: "Conteo día 7 pendiente",
    },
    {
      id: "AN-2024-0049",
      tipo: "Pureza",
      muestra: "RG-LE-ex-0022",
      cliente: "Semillas Premium",
      especie: "Zea mays",
      cultivar: "Pioneer 30F35",
      responsable: "Dra. María González",
      fechaVencimiento: "2024-12-17",
      prioridad: "Alta",
      estado: "Pendiente",
      diasRestantes: 2,
      observaciones: "Separación de componentes pendiente",
    },
    {
      id: "AN-2024-0048",
      tipo: "PMS",
      muestra: "RG-LE-ex-0021",
      cliente: "AgroTech",
      especie: "Triticum aestivum",
      cultivar: "INIA Tijereta",
      responsable: "Dr. Carlos Rodríguez",
      fechaVencimiento: "2024-12-18",
      prioridad: "Media",
      estado: "En progreso",
      diasRestantes: 3,
      observaciones: "Segunda repetición en proceso",
    },
    {
      id: "AN-2024-0047",
      tipo: "Tetrazolio",
      muestra: "RG-LE-ex-0020",
      cliente: "Instituto Semillas",
      especie: "Helianthus annuus",
      cultivar: "Paraíso 20",
      responsable: "Dra. Ana Martínez",
      fechaVencimiento: "2024-12-19",
      prioridad: "Media",
      estado: "Pendiente",
      diasRestantes: 4,
    },
    {
      id: "AN-2024-0046",
      tipo: "DOSN",
      muestra: "RG-LE-ex-0019",
      cliente: "Productores Unidos",
      especie: "Sorghum bicolor",
      cultivar: "Granífero",
      responsable: "Dr. Juan Pérez",
      fechaVencimiento: "2024-12-20",
      prioridad: "Baja",
      estado: "Pendiente",
      diasRestantes: 5,
    },
    {
      id: "AN-2024-0045",
      tipo: "Germinación",
      muestra: "RG-LE-ex-0018",
      cliente: "Cooperativa Central",
      especie: "Hordeum vulgare",
      cultivar: "Maltería",
      responsable: "Dra. María González",
      fechaVencimiento: "2024-12-21",
      prioridad: "Media",
      estado: "En progreso",
      diasRestantes: 6,
      observaciones: "Conteo día 4 completado",
    },
  ]

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "Pureza":
        return Search
      case "Germinación":
        return TestTube
      case "PMS":
        return FlaskConical
      case "Tetrazolio":
        return Beaker
      case "DOSN":
        return Microscope
      default:
        return Clock
    }
  }

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "Pureza":
        return "text-blue-600 bg-blue-50"
      case "Germinación":
        return "text-green-600 bg-green-50"
      case "PMS":
        return "text-purple-600 bg-purple-50"
      case "Tetrazolio":
        return "text-orange-600 bg-orange-50"
      case "DOSN":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "Urgente":
        return "bg-red-100 text-red-800 border-red-200"
      case "Alta":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Baja":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (estado: string, diasRestantes: number) => {
    if (estado === "Vencido" || diasRestantes < 0) {
      return "bg-red-100 text-red-800"
    }
    if (diasRestantes <= 1) {
      return "bg-orange-100 text-orange-800"
    }
    if (estado === "En progreso") {
      return "bg-blue-100 text-blue-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  const filteredTasks = pendingTasks.filter((task) => {
    const matchesSearch =
      task.muestra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || task.tipo === filterType
    const matchesPriority = filterPriority === "all" || task.prioridad === filterPriority
    const matchesResponsible = filterResponsible === "all" || task.responsable === filterResponsible

    return matchesSearch && matchesType && matchesPriority && matchesResponsible
  })

  const stats = {
    total: pendingTasks.length,
    vencidos: pendingTasks.filter((t) => t.diasRestantes < 0).length,
    urgentes: pendingTasks.filter((t) => t.diasRestantes <= 1 && t.diasRestantes >= 0).length,
    enProgreso: pendingTasks.filter((t) => t.estado === "En progreso").length,
  }

  const responsables = [...new Set(pendingTasks.map((t) => t.responsable))]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tablero de Pendientes</h1>
          <p className="text-muted-foreground text-pretty">
            Gestiona todas las tareas pendientes del laboratorio organizadas por prioridad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendientes</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{stats.vencidos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-3xl font-bold text-orange-600">{stats.urgentes}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-3xl font-bold text-green-600">{stats.enProgreso}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por muestra, cliente, especie o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Pureza">Pureza</SelectItem>
                  <SelectItem value="Germinación">Germinación</SelectItem>
                  <SelectItem value="PMS">PMS</SelectItem>
                  <SelectItem value="Tetrazolio">Tetrazolio</SelectItem>
                  <SelectItem value="DOSN">DOSN</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {responsables.map((responsable) => (
                    <SelectItem key={responsable} value={responsable}>
                      {responsable}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas Pendientes ({filteredTasks.length})</CardTitle>
          <CardDescription>Lista de análisis que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const TypeIcon = getTypeIcon(task.tipo)
              return (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                    task.diasRestantes < 0 ? "border-red-200 bg-red-50/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${getTypeColor(task.tipo)}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.tipo} - Muestra: {task.muestra}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Cliente</p>
                          <p className="font-medium">{task.cliente}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Especie</p>
                          <p className="font-medium">{task.especie}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cultivar</p>
                          <p className="font-medium">{task.cultivar}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Responsable</p>
                          <p className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.responsable}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fecha Vencimiento</p>
                          <p className="font-medium">{task.fechaVencimiento}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Días Restantes</p>
                          <p
                            className={`font-medium ${
                              task.diasRestantes < 0
                                ? "text-red-600"
                                : task.diasRestantes <= 1
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            {task.diasRestantes < 0
                              ? `${Math.abs(task.diasRestantes)} días vencido`
                              : `${task.diasRestantes} días`}
                          </p>
                        </div>
                      </div>

                      {task.observaciones && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Observaciones</p>
                          <p className="font-medium">{task.observaciones}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex flex-col gap-2">
                        <Badge className={getPriorityColor(task.prioridad)}>{task.prioridad}</Badge>
                        <Badge className={getStatusColor(task.estado, task.diasRestantes)}>
                          {task.diasRestantes < 0 ? "Vencido" : task.estado}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/analisis/${task.tipo.toLowerCase()}/${task.id}`}>
                          <Button variant="outline" size="sm">
                            {task.estado === "Pendiente" ? "Iniciar" : "Continuar"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay tareas pendientes</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all" || filterPriority !== "all" || filterResponsible !== "all"
                    ? "No se encontraron tareas que coincidan con los filtros aplicados."
                    : "¡Excelente! No tienes tareas pendientes en este momento."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
