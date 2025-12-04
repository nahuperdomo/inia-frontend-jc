"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FlaskConical, Package, Calendar, TestTube, Microscope, Beaker, Activity, Loader2 } from "lucide-react"
import Link from "next/link"
import { obtenerLotesPaginadas } from "@/app/services/lote-service"
import { obtenerPurezasPaginadas } from "@/app/services/pureza-service"
import { obtenerGerminacionesPaginadas } from "@/app/services/germinacion-service"
import { obtenerTetrazoliosPaginadas } from "@/app/services/tetrazolio-service"
import { obtenerPmsPaginadas } from "@/app/services/pms-service"
import { obtenerDosnPaginadas } from "@/app/services/dosn-service"

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
    description: "Consulta la determinación de otras semillas en número",
    icon: Activity,
    href: "/listado/analisis/dosn",
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600",
    count: "19 análisis",
  },
  {
    id: "legado",
    title: "Datos Legados",
    description: "Consulta los datos históricos importados desde Excel",
    icon: Calendar,
    href: "/listado/legado",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600",
    count: "Datos históricos",
  },
]

export default function ListadoPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLotes: 0,
    totalAnalisis: 0,
    analisisActivos: 0,
    analisisCompletados: 0,
    totalPureza: 0,
    totalGerminacion: 0,
    totalTetrazolio: 0,
    totalPms: 0,
    totalDosn: 0,
  })

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true)
        
        // Cargar todos los datos para contar correctamente
        const [lotesResp, purezasResp, germinacionesResp, tetrazoliosResp, pmsResp, dosnResp] = await Promise.all([
          obtenerLotesPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
          obtenerPurezasPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
          obtenerGerminacionesPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
          obtenerTetrazoliosPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
          obtenerPmsPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
          obtenerDosnPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
        ])

        // Contar IDs únicos de cada tipo
        const totalLotes = lotesResp.content?.length || 0
        const totalPureza = purezasResp.content?.length || 0
        const totalGerminacion = germinacionesResp.content?.length || 0
        const totalTetrazolio = tetrazoliosResp.content?.length || 0
        const totalPms = pmsResp.content?.length || 0
        const totalDosn = dosnResp.content?.length || 0

        const totalAnalisis = totalPureza + totalGerminacion + totalTetrazolio + totalPms + totalDosn

        // Contar análisis por estado
        let activos = 0
        let completados = 0

        // Contar purezas
        purezasResp.content?.forEach((p: any) => {
          if (p.estado === 'EN_PROCESO' || p.estado === 'PENDIENTE') activos++
          else if (p.estado === 'FINALIZADO' || p.estado === 'APROBADO') completados++
        })

        // Contar germinaciones
        germinacionesResp.content?.forEach((g: any) => {
          if (g.estado === 'EN_PROCESO' || g.estado === 'PENDIENTE') activos++
          else if (g.estado === 'FINALIZADO' || g.estado === 'APROBADO') completados++
        })

        // Contar tetrazolios
        tetrazoliosResp.content?.forEach((t: any) => {
          if (t.estado === 'EN_PROCESO' || t.estado === 'PENDIENTE') activos++
          else if (t.estado === 'FINALIZADO' || t.estado === 'APROBADO') completados++
        })

        // Contar PMS
        pmsResp.content?.forEach((p: any) => {
          if (p.estado === 'EN_PROCESO' || p.estado === 'PENDIENTE') activos++
          else if (p.estado === 'FINALIZADO' || p.estado === 'APROBADO') completados++
        })

        // Contar DOSN
        dosnResp.content?.forEach((d: any) => {
          if (d.estado === 'EN_PROCESO' || d.estado === 'PENDIENTE') activos++
          else if (d.estado === 'FINALIZADO' || d.estado === 'APROBADO') completados++
        })

        setStats({
          totalLotes,
          totalAnalisis,
          analisisActivos: activos,
          analisisCompletados: completados,
          totalPureza,
          totalGerminacion,
          totalTetrazolio,
          totalPms,
          totalDosn,
        })
      } catch (error) {
        console.error("Error cargando estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalLotes}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalAnalisis}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">{stats.analisisActivos}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">{stats.analisisCompletados}</p>
                )}
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
            
            // Obtener el conteo real según el tipo
            let count = option.count
            if (!loading) {
              switch(option.id) {
                case "lotes":
                  count = `${stats.totalLotes} lotes`
                  break
                case "pureza":
                  count = `${stats.totalPureza} análisis`
                  break
                case "germinacion":
                  count = `${stats.totalGerminacion} análisis`
                  break
                case "tetrazolio":
                  count = `${stats.totalTetrazolio} análisis`
                  break
                case "pms":
                  count = `${stats.totalPms} análisis`
                  break
                case "dosn":
                  count = `${stats.totalDosn} análisis`
                  break
                case "legado":
                  count = "Datos históricos"
                  break
              }
            }
            
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
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground bg-white/50 px-2 py-1 rounded">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
