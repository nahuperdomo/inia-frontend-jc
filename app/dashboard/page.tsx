"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Microscope,
  TestTube,
  FlaskConical,
  Beaker,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Sprout,
  Scale,
} from "lucide-react"
import Link from "next/link"
import { obtenerEstadisticasDashboard, DashboardStats } from "@/app/services/dashboard-service"
import { obtenerPerfil } from "@/app/services/auth-service"
import { toast } from "sonner"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      // Obtener rol desde el backend usando cookies HttpOnly automáticamente
      try {
        console.log("🔄 Dashboard - Obteniendo perfil del usuario desde backend...")
        const perfil = await obtenerPerfil()
        console.log("✅ Dashboard - Perfil obtenido del backend:", perfil)

        // Extraer rol soportando varias formas que el backend pueda devolver:
        // - perfil.roles: string[]
        // - perfil.rol o perfil.role: string
        // - perfil.usuario.roles / perfil.usuario.rol
        let roleFromBackend: string | null = null

        try {
          const p: any = perfil as any
          if (p) {
            if (Array.isArray(p.roles) && p.roles.length > 0) {
              roleFromBackend = String(p.roles[0])
            } else if (typeof p.rol === 'string' && p.rol.trim().length > 0) {
              roleFromBackend = p.rol
            } else if (typeof p.role === 'string' && p.role.trim().length > 0) {
              roleFromBackend = p.role
            } else if (p.usuario) {
              if (Array.isArray(p.usuario.roles) && p.usuario.roles.length > 0) {
                roleFromBackend = String(p.usuario.roles[0])
              } else if (typeof p.usuario.rol === 'string' && p.usuario.rol.trim().length > 0) {
                roleFromBackend = p.usuario.rol
              }
            }
          }
        } catch (extractErr) {
          console.warn('⚠️ Error extrayendo rol del perfil (any-cast):', extractErr)
        }

        // Normalizar
        if (roleFromBackend) roleFromBackend = roleFromBackend.trim()
        console.log('🔍 Dashboard - Rol de usuario del backend (resuelto):', roleFromBackend)

        // Actualizar estado React (NO guardar en localStorage/cookies client-side)
        if (roleFromBackend) {
          setUserRole(roleFromBackend)
          console.log('✅ Dashboard - Rol actualizado en estado:', roleFromBackend)
        }
      } catch (error) {
        console.error("❌ Error al obtener perfil del backend:", error)
        console.error("🔍 Detalles del error:", error)
        // Si falla la autenticación, el usuario podría necesitar login
        console.warn("⚠️ No se pudo obtener perfil. Usuario posiblemente no autenticado.")
      }

      // Cargar estadísticas
      try {
        const data = await obtenerEstadisticasDashboard()
        console.log("📊 Dashboard - Estadísticas cargadas:", data)
        setStats(data)
      } catch (statsError) {
        console.error("❌ Error al cargar estadísticas:", statsError)
        toast.error("Error al cargar estadísticas del dashboard")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Usar useMemo para crear quickStats de forma reactiva cuando cambie userRole, loading o stats
  const quickStats = useMemo(() => {
    const isAdmin = userRole?.trim().toUpperCase() === "ADMIN"
    console.log("🔍 Dashboard - userRole:", userRole, "| isAdmin:", isAdmin)

    const stats_array = [
      {
        label: "Lotes Activos",
        value: loading ? "..." : stats?.lotesActivos.toString() || "0",
        icon: TestTube,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        href: "/listado/lotes",
      },
      {
        label: "Análisis Pendientes",
        value: loading ? "..." : stats?.analisisPendientes.toString() || "0",
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        href: "/dashboard/analisis-pendientes",
      },
      {
        label: "Completados Hoy",
        value: loading ? "..." : stats?.completadosHoy.toString() || "0",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        href: undefined, // No tiene link
      },
    ]

    // Solo agregar "Análisis por aprobar" si es ADMIN
    if (isAdmin) {
      console.log("✅ Dashboard - Agregando card de Análisis por Aprobar")
      stats_array.push({
        label: "Análisis por Aprobar",
        value: loading ? "..." : stats?.analisisPorAprobar.toString() || "0",
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        href: "/dashboard/analisis-por-aprobar",
      })
    } else {
      console.log("❌ Dashboard - No se muestra card de Análisis por Aprobar")
    }

    return stats_array
  }, [userRole, loading, stats])

  const analysisTypes = [
    {
      id: "pureza",
      name: "Pureza",
      description: "Análisis de pureza física",
      icon: Search,
      href: "/listado/analisis/pureza",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "germinacion",
      name: "Germinación",
      description: "Ensayos de germinación",
      icon: Sprout,
      href: "/listado/analisis/germinacion",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "pms",
      name: "PMS",
      description: "Peso de mil semillas",
      icon: Scale,
      href: "/listado/analisis/pms",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "tetrazolio",
      name: "Tetrazolio",
      description: "Viabilidad y vigor",
      icon: TestTube,
      href: "/listado/analisis/tetrazolio",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "dosn",
      name: "DOSN",
      description: "Otras semillas nocivas",
      icon: Microscope,
      href: "/listado/analisis/dosn",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <Microscope className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Laboratorio de Semillas INIA</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Dashboard de Operaciones</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {quickStats.map((stat, index) => {
            const content = (
              <Card className={`hover:shadow-md transition-all ${stat.href ? 'cursor-pointer hover:scale-105' : ''}`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-2 md:p-3 rounded-full`}>
                      <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            return stat.href ? (
              <Link key={index} href={stat.href}>
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </div>

        {/* Analysis Types */}
        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido a Análisis</CardTitle>
            <CardDescription>Selecciona el tipo de análisis para ver los listados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
              {analysisTypes.map((type) => (
                <Link key={type.id} href={type.href} className="group">
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3">
                      <div className={`${type.bgColor} p-3 md:p-4 rounded-full group-hover:scale-110 transition-transform`}>
                        <type.icon className={`h-6 w-6 md:h-8 md:w-8 ${type.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm md:text-base mb-1">{type.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
