"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Microscope,
  TestTube,
  FlaskConical,
  Beaker,
  Search,
  Plus,
  BarChart3,
  Settings,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [notifications] = useState([
    { id: 1, message: "Análisis de germinación listo para conteo - Lote RG-001", time: "Hace 30 min", type: "urgent" },
    { id: 2, message: "Muestra de pureza completada - Lote TR-045", time: "Hace 2 horas", type: "success" },
    { id: 3, message: "Vencimiento de análisis PMS - Lote MA-023", time: "Hace 4 horas", type: "warning" },
  ])

  const quickStats = [
    { label: "Muestras Activas", value: "47", icon: TestTube, color: "text-emerald-600" },
    { label: "Análisis Pendientes", value: "23", icon: Clock, color: "text-orange-600" },
    { label: "Completados Hoy", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "Requieren Atención", value: "5", icon: AlertTriangle, color: "text-red-600" },
  ]

  const recentSamples = [
    {
      id: "RG-LE-ex-0018",
      cliente: "Cooperativa Norte",
      especie: "Soja",
      estado: "En análisis",
      analisis: ["Pureza", "Germinación"],
    },
    {
      id: "RG-LE-ex-0019",
      cliente: "Semillas del Sur",
      especie: "Maíz",
      estado: "Pendiente",
      analisis: ["PMS", "DOSN"],
    },
    { id: "RG-LE-ex-0020", cliente: "AgroTech", especie: "Trigo", estado: "Completado", analisis: ["Tetrazolio"] },
  ]

  const pendingTasks = [
    { task: "Conteo de germinación", sample: "RG-001", dueTime: "10:30", priority: "high" },
    { task: "Lectura de tetrazolio", sample: "TR-045", dueTime: "14:00", priority: "medium" },
    { task: "Pesaje PMS", sample: "MA-023", dueTime: "16:30", priority: "low" },
  ]

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <Microscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Laboratorio de Semillas INIA</h1>
              <p className="text-sm text-muted-foreground">Dashboard de Operaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
              <Badge variant="destructive" className="ml-2">
                {notifications.filter((n) => n.type === "urgent").length}
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Modules */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Análisis</CardTitle>
                <CardDescription>Acceso rápido a los diferentes análisis de laboratorio</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/analisis/pureza">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <Search className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Pureza</div>
                      <div className="text-sm text-muted-foreground">Análisis de pureza física</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/germinacion">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <TestTube className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Germinación</div>
                      <div className="text-sm text-muted-foreground">Ensayos de germinación</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/pms">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <FlaskConical className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">PMS</div>
                      <div className="text-sm text-muted-foreground">Peso de mil semillas</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/tetrazolio">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <Beaker className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Tetrazolio</div>
                      <div className="text-sm text-muted-foreground">Viabilidad y vigor</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/dosn">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <Microscope className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">DOSN</div>
                      <div className="text-sm text-muted-foreground">Otras semillas nocivas</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/muestras">
                  <Button variant="outline" className="h-24 w-full flex-col gap-2 hover:bg-primary/5 bg-transparent">
                    <Plus className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Muestras</div>
                      <div className="text-sm text-muted-foreground">Gestión de muestras</div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Samples */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Muestras Recientes</CardTitle>
                  <CardDescription>Últimas muestras ingresadas al laboratorio</CardDescription>
                </div>
                <Link href="/muestras">
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSamples.map((sample, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <TestTube className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{sample.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {sample.cliente} - {sample.especie}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {sample.analisis.map((analisis, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {analisis}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          sample.estado === "En análisis"
                            ? "default"
                            : sample.estado === "Pendiente"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {sample.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tareas Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{task.task}</p>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.dueTime}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Muestra: {task.sample}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/muestras/nueva">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Muestra
                  </Button>
                </Link>
                <Link href="/pendientes">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Tablero Pendientes
                  </Button>
                </Link>
                <Link href="/reportes">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas del Laboratorio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg ${
                        notification.type === "urgent"
                          ? "border-red-200 bg-red-50"
                          : notification.type === "warning"
                            ? "border-orange-200 bg-orange-50"
                            : "border-green-200 bg-green-50"
                      }`}
                    >
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
