"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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


  return (
    <div className="bg-background min-h-screen">
      {/* Header - Responsive */}
      <header className="border-b bg-card">
        <div className="flex flex-col sm:flex-row sm:h-16 items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-0 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary rounded-full p-1.5 sm:p-2">
              <Microscope className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold">Laboratorio de Semillas INIA</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Dashboard de Operaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">{stat.label}</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Modules */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Tipos de Análisis</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Acceso rápido a los diferentes análisis de laboratorio</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
                <Link href="/analisis/pureza" className="w-full">
                  <Button variant="outline" className="h-20 sm:h-24 w-full flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 bg-transparent hover:scale-105 transition-transform">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Pureza</div>
                      <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Análisis de pureza física</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/germinacion" className="w-full">
                  <Button variant="outline" className="h-20 sm:h-24 w-full flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 bg-transparent hover:scale-105 transition-transform">
                    <TestTube className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Germinación</div>
                      <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Ensayos de germinación</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/pms" className="w-full">
                  <Button variant="outline" className="h-20 sm:h-24 w-full flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 bg-transparent hover:scale-105 transition-transform">
                    <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">PMS</div>
                      <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Peso de mil semillas</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/tetrazolio" className="w-full">
                  <Button variant="outline" className="h-20 sm:h-24 w-full flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 bg-transparent hover:scale-105 transition-transform">
                    <Beaker className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">Tetrazolio</div>
                      <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Viabilidad y vigor</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/analisis/dosn" className="w-full">
                  <Button variant="outline" className="h-20 sm:h-24 w-full flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 bg-transparent hover:scale-105 transition-transform">
                    <Microscope className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">DOSN</div>
                      <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Otras semillas nocivas</div>
                    </div>
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
