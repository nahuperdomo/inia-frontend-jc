"use client"

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
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Menu,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {

  const quickStats = [
    { label: "Muestras Activas", value: "47", icon: TestTube, color: "text-emerald-600" },
    { label: "Análisis Pendientes", value: "23", icon: Clock, color: "text-orange-600" },
    { label: "Completados Hoy", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "Requieren Atencin", value: "5", icon: AlertTriangle, color: "text-red-600" },
  ]

  const recentSamples = [
    {
      id: "RG-LE-ex-0018",
      cliente: "Cooperativa Norte",
      especie: "Soja",
      estado: "En análisis",
      analisis: ["Pureza", "Germinacin"],
    },
    {
      id: "RG-LE-ex-0019",
      cliente: "Semillas del Sur",
      especie: "Maíz",
      estado: "Pendiente",
      analisis: ["PMS", "DOSN"],
    },
    {
      id: "RG-LE-ex-0020",
      cliente: "AgroTech",
      especie: "Trigo",
      estado: "Completado",
      analisis: ["Tetrazolio"]
    },
  ]

  const quickActions = [
    {
      label: "Nuevo Análisis",
      description: "Registrar análisis",
      href: "/registro/analisis",
      icon: Plus,
      color: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    {
      label: "Ver Reportes",
      description: "Consultar reportes",
      href: "/reportes",
      icon: BarChart3,
      color: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    },
    {
      label: "Listado",
      description: "Ver listados",
      href: "/listado",
      icon: FileText,
      color: "bg-accent hover:bg-accent/90 text-accent-foreground",
    },
    {
      label: "Empresas",
      description: "Gestionar empresas",
      href: "/registro/empresa",
      icon: Users,
      color: "bg-muted hover:bg-muted/90 text-muted-foreground",
    },
  ]

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "En análisis":
        return "bg-blue-100 text-blue-800 dark:text-blue-400"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 dark:text-yellow-400"
      case "Completado":
        return "bg-green-100 text-green-800 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsive */}
      <header className="border-b bg-card sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden flex-1 min-w-0">
            <div className="bg-primary rounded-xl sm:rounded-full p-2 sm:p-2 flex-shrink-0 shadow-md">
              <Microscope className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold truncate">
                <span className="hidden sm:inline">Laboratorio de Semillas INIA</span>
                <span className="sm:hidden">INIA Lab</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Dashboard de Operaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="hidden md:flex touch-target">
              <Settings className="h-4 w-4 mr-2" />
              Configuracin
            </Button>
            <Button variant="outline" size="icon" className="md:hidden touch-target rounded-xl">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8">
        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {quickStats.map((stat, index) => (
            <Card key={index} className="overflow-hidden hover-lift">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {/* Main Modules - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-lg sm:text-xl">Tipos de Análisis</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Acceso rápido a los diferentes análisis de laboratorio</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 pt-0">
                <Link href="/analisis/pureza" className="block">
                  <Button variant="outline" className="h-24 sm:h-28 w-full flex-col gap-2 sm:gap-2.5 hover:bg-primary/5 bg-transparent touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                    <Search className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Pureza</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Análisis de pureza física</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/germinacion" className="block">
                  <Button variant="outline" className="h-24 sm:h-28 w-full flex-col gap-2 sm:gap-2.5 hover:bg-primary/5 bg-transparent touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                    <TestTube className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Germinacin</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Ensayos de germinacin</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/pms" className="block">
                  <Button variant="outline" className="h-24 sm:h-28 w-full flex-col gap-2 sm:gap-2.5 hover:bg-primary/5 bg-transparent touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                    <FlaskConical className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">PMS</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Peso de mil semillas</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/tetrazolio" className="block">
                  <Button variant="outline" className="h-24 sm:h-28 w-full flex-col gap-2 sm:gap-2.5 hover:bg-primary/5 bg-transparent touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                    <Beaker className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Tetrazolio</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Viabilidad y vigor</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/dosn" className="block">
                  <Button variant="outline" className="h-24 sm:h-28 w-full flex-col gap-2 sm:gap-2.5 hover:bg-primary/5 bg-transparent touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                    <Microscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">DOSN</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Otras semillas nocivas</div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Samples Card - Hidden on mobile by default, shown on tablet+ */}
            <Card className="hidden md:block hover-lift">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-lg sm:text-xl">Muestras Recientes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Últimas muestras ingresadas al sistema</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {recentSamples.map((sample, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-4 border rounded-xl hover:bg-accent/50 smooth-transition gap-3 sm:gap-0 hover:shadow-md"
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base">{sample.id}</p>
                          <Badge className={`text-xs ${getEstadoBadgeColor(sample.estado)}`}>{sample.estado}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{sample.cliente}</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {sample.analisis.map((analisis, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {analisis}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="self-start sm:self-center touch-target rounded-lg">
                        Ver detalles
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-5 sm:space-y-6">
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Accesos directos principales</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-3 p-4 sm:p-5 md:p-6 pt-0">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href} className="block">
                    <Button variant="outline" className="h-auto w-full p-4 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:bg-accent/50 touch-target smooth-transition hover:scale-105 active:scale-95 rounded-xl">
                      <action.icon className="h-6 w-6 sm:h-6 sm:w-6 flex-shrink-0" />
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <div className="font-semibold text-sm sm:text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Mobile Recent Samples - Only shown on mobile */}
            <Card className="md:hidden hover-lift">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Muestras Recientes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2.5">
                  {recentSamples.slice(0, 2).map((sample, index) => (
                    <div key={index} className="p-3.5 border rounded-xl space-y-2 hover:bg-accent/30 smooth-transition active:scale-98">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{sample.id}</p>
                        <Badge className={`text-xs ${getEstadoBadgeColor(sample.estado)}`}>{sample.estado}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{sample.cliente}</p>
                    </div>
                  ))}
                </div>
                <Link href="/listado">
                  <Button variant="outline" size="sm" className="w-full touch-target rounded-lg">
                    Ver todas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
