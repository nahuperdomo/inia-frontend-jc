"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskConical, Package, Calendar, TestTube, Microscope, Beaker, Activity } from "lucide-react"
import Link from "next/link"

const listingOptions = [
  {
    id: "lotes",
    title: "Listado de Lotes",
    description: "Visualiza y gestiona todos los lotes registrados en el sistema",
    icon: Package,
    href: "/listado/lotes",
    color: "bg-background border-2 border-border hover:bg-accent/30",
    iconColor: "text-blue-600",
    count: "24 lotes",
  },
  {
    id: "pureza",
    title: "Analisis de Pureza Fisica",
    description: "Consulta todos los Analisis de Pureza Fisica realizados",
    icon: FlaskConical,
    href: "/listado/analisis/pureza",
    color: "bg-background border-2 border-border hover:bg-accent/30",
    iconColor: "text-green-600",
    count: "45 análisis",
  },
  {
    id: "germinacion",
    title: "Analisis de Germinacion",
    description: "Revisa los ensayos de germinacin estándar",
    icon: TestTube,
    href: "/listado/analisis/germinacion",
    color: "bg-background border-2 border-border hover:bg-accent/30",
    iconColor: "text-emerald-600",
    count: "38 análisis",
  },
  {
    id: "tetrazolio",
    title: "Análisis de Tetrazolio",
    description: "Consulta los ensayos de viabilidad y vigor",
    icon: Microscope,
    href: "/listado/analisis/tetrazolio",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    iconColor: "text-purple-600",
    count: "23 análisis",
  },
  {
    id: "pms",
    title: "Peso de Mil Semillas",
    description: "Revisa las determinaciones del peso de mil semillas",
    icon: Beaker,
    href: "/listado/analisis/pms",
    color: "bg-background border-2 border-border hover:bg-accent/30",
    iconColor: "text-teal-600",
    count: "31 análisis",
  },
  {
    id: "dosn",
    title: "Análisis DOSN",
    description: "Consulta la determinacin de otras semillas nocivas",
    icon: Activity,
    href: "/listado/analisis/dosn",
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600",
    count: "19 análisis",
  },
]

export default function ListadoPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Listados</h1>
          <p className="text-muted-foreground">Selecciona el tipo de listado que deseas consultar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lotes</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análisis Totales</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <FlaskConical className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análisis Activos</p>
                <p className="text-2xl font-bold">43</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análisis Completados</p>
                <p className="text-2xl font-bold">113</p>
              </div>
              <Microscope className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listing Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Opciones de Listado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listingOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Link key={option.id} href={option.href}>
                <Card className={`${option.color} transition-all duration-200 cursor-pointer hover:shadow-md`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-white/50`}>
                        <IconComponent className={`h-6 w-6 ${option.iconColor}`} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                      <div className="pt-2">
                        <span className="text-xs font-medium text-muted-foreground bg-white/50 px-2 py-1 rounded">
                          {option.count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Nuevo análisis de pureza completado</span>
              </div>
              <span className="text-xs text-muted-foreground">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Lote L-2024-003 registrado</span>
              </div>
              <span className="text-xs text-muted-foreground">Hace 4 horas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Análisis de tetrazolio iniciado</span>
              </div>
              <span className="text-xs text-muted-foreground">Hace 6 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

