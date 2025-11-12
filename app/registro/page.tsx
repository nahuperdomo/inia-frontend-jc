"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Beaker, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { obtenerLotesPaginadas, obtenerEstadisticasLotes } from "@/app/services/lote-service"
import type { LoteSimpleDTO } from "@/app/models"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function RegistroPage() {
  const [lotesRecientes, setLotesRecientes] = useState<LoteSimpleDTO[]>([])
  const [estadisticas, setEstadisticas] = useState({ total: 0, activos: 0, inactivos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar estadísticas
        const stats = await obtenerEstadisticasLotes()
        setEstadisticas(stats)

        // Cargar lotes recientes (últimos 5)
        const response = await obtenerLotesPaginadas(0, 5, undefined, true)
        setLotesRecientes(response.content || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const registrationOptions = [
    {
      title: "Registro de Lotes",
      description: "Registrar nuevos lotes de semillas para análisis",
      icon: Package,
      href: "/registro/lotes",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Registro de análisis a un lote existente",
      description: "Registrar análisis",
      icon: Beaker,
      href: "/registro/analisis",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Centro de Registro</h1>
          <p className="text-muted-foreground text-pretty">
            Registra nuevos elementos en el sistema INIA de manera rápida y eficiente
          </p>
        </div>

      {/* Registration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registrationOptions.map((option, index) => (
          <Link key={index} href={option.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${option.bgColor} rounded-full p-4 group-hover:scale-110 transition-transform`}>
                    <option.icon className={`h-8 w-8 ${option.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-balance">{option.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty mt-2">{option.description}</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Sistema</CardTitle>
          <CardDescription>Resumen general de lotes y análisis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg bg-emerald-50/50">
                <p className="text-3xl font-bold text-emerald-600">{estadisticas.activos}</p>
                <p className="text-sm text-muted-foreground mt-1">Lotes Activos</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-slate-50">
                <p className="text-3xl font-bold text-slate-600">{estadisticas.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Total de Lotes</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-amber-50/50">
                <p className="text-3xl font-bold text-amber-600">{estadisticas.inactivos}</p>
                <p className="text-sm text-muted-foreground mt-1">Lotes Inactivos</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50/50">
                <p className="text-3xl font-bold text-purple-600">{lotesRecientes.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Registros Recientes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registros Recientes
          </CardTitle>
          <CardDescription>Últimos 5 lotes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando...</div>
          ) : lotesRecientes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay registros recientes</div>
          ) : (
            <div className="space-y-3">
              {lotesRecientes.map((lote, index) => (
                <Link key={index} href={`/listado/lotes/${lote.loteID}`}>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lote.ficha || `Lote ${lote.loteID}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {lote.cultivarNombre || "Sin cultivar"} {lote.especieNombre ? `- ${lote.especieNombre}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-emerald-600">
                        {lote.activo ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
