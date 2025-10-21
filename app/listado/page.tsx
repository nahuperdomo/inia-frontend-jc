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
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600",
    count: "24 lotes",
  },
  {
    id: "pureza",
    title: "Análisis de Pureza Física",
    description: "Consulta todos los análisis de pureza física realizados",
    icon: FlaskConical,
    href: "/listado/analisis/pureza",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600",
    count: "45 análisis",
  },
  {
    id: "germinacion",
    title: "Análisis de Germinación",
    description: "Revisa los ensayos de germinación estándar",
    icon: TestTube,
    href: "/listado/analisis/germinacion",
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
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
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    iconColor: "text-teal-600",
    count: "31 análisis",
  },
  {
    id: "dosn",
    title: "Análisis DOSN",
    description: "Consulta la determinación de otras semillas nocivas",
    icon: Activity,
    href: "/listado/analisis/dosn",
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600",
    count: "19 análisis",
  },
]

export default function ListadoPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Centro de Listados</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Selecciona el tipo de listado que deseas consultar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Lotes</p>
                <p className="text-xl sm:text-2xl font-bold">24</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Análisis Totales</p>
                <p className="text-xl sm:text-2xl font-bold">156</p>
              </div>
              <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Análisis Activos</p>
                <p className="text-xl sm:text-2xl font-bold">43</p>
              </div>
              <TestTube className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Análisis Completados</p>
                <p className="text-xl sm:text-2xl font-bold">113</p>
              </div>
              <Microscope className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listing Options */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Opciones de Listado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listingOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Link key={option.id} href={option.href}>
                <Card className={`${option.color} transition-all duration-200 cursor-pointer hover:shadow-md`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-lg bg-white/50`}>
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${option.iconColor}`} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{option.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{option.description}</p>
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
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm">Nuevo análisis de pureza completado</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-muted">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm">Lote L-2024-003 registrado</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">Hace 4 horas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm">Análisis de tetrazolio iniciado</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">Hace 6 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
