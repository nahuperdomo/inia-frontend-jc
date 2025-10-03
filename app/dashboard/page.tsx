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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
