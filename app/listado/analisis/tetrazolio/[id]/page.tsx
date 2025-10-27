"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  obtenerTetrazolioPorId
} from '@/app/services/tetrazolio-service'
import {
  obtenerRepeticionesPorTetrazolio
} from '@/app/services/repeticiones-service'
import { TetrazolioDTO } from '@/app/models/interfaces/tetrazolio'
import { RepTetrazolioViabilidadDTO } from '@/app/models/interfaces/repeticiones'
import {
  TestTube,
  CalendarDays,
  Beaker,
  Plus,
  Thermometer,
  Timer,
  Hash,
  FlaskConical,
  Target,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Función utilitaria para formatear fechas
const formatearFechaLocal = (fechaString: string): string => {
  if (!fechaString) return ''

  const [year, month, day] = fechaString.split('-').map(Number)
  const fecha = new Date(year, month - 1, day)

  return fecha.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const convertirFechaParaInput = (fechaString: string): string => {
  if (!fechaString) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    return fechaString
  }

  const fecha = new Date(fechaString)
  if (isNaN(fecha.getTime())) return ''

  return fecha.toISOString().split('T')[0]
}

export default function TetrazolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tetrazolioId = params.id as string

  const [tetrazolio, setTetrazolio] = useState<TetrazolioDTO | null>(null)
  const [repeticiones, setRepeticiones] = useState<RepTetrazolioViabilidadDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando tetrazolio y repeticiones para ID:", tetrazolioId)

      const tetrazolioData = await obtenerTetrazolioPorId(parseInt(tetrazolioId))

      console.log("✅ Tetrazolio cargado:", tetrazolioData)
      setTetrazolio(tetrazolioData)

      // Cargar repeticiones
      try {
        const repeticionesData = await obtenerRepeticionesPorTetrazolio(parseInt(tetrazolioId))
        console.log("✅ Repeticiones cargadas:", repeticionesData)
        setRepeticiones(repeticionesData)
      } catch (repError) {
        console.warn("⚠️ Error al cargar repeticiones:", repError)
        setRepeticiones([])
      }

    } catch (err: any) {
      console.error("❌ Error cargando datos:", err)
      setError(err.message || 'Error al cargar el análisis de tetrazolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tetrazolioId) {
      cargarDatos()
    }
  }, [tetrazolioId])

  const getEstadoBadge = (estado: string) => {
    const variants = {
      "PENDIENTE": { variant: "outline" as const, color: "blue" },
      "EN_PROCESO": { variant: "secondary" as const, color: "yellow" },
      "FINALIZADO": { variant: "secondary" as const, color: "green" },
      "PENDIENTE_APROBACION": { variant: "secondary" as const, color: "orange" },
      "APROBADO": { variant: "default" as const, color: "green" },
      "PARA_REPETIR": { variant: "destructive" as const, color: "red" }
    }

    const config = variants[estado as keyof typeof variants] || variants["PENDIENTE"]

    return (
      <Badge variant={config.variant}>
        {estado.replace('_', ' ')}
      </Badge>
    )
  }

  // Calcular totales
  const calcularTotales = () => {
    if (repeticiones.length === 0) return { total: 0, viables: 0, noViables: 0, duras: 0 }

    const totales = repeticiones.reduce((acc, rep) => ({
      viables: acc.viables + (rep.viablesNum || 0),
      noViables: acc.noViables + (rep.noViablesNum || 0),
      duras: acc.duras + (rep.duras || 0)
    }), { viables: 0, noViables: 0, duras: 0 })

    const total = totales.viables + totales.noViables + totales.duras

    return { ...totales, total }
  }

  const totales = calcularTotales()
  const puedeFinalizarse = tetrazolio && repeticiones.length >= (tetrazolio.numRepeticionesEsperadas || 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TestTube className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold">Cargando análisis de tetrazolio...</h1>
        </div>
      </div>
    )
  }

  // Nota: los errores se muestran como un bloque rojo global dentro del render principal.

  if (!tetrazolio) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Análisis de tetrazolio no encontrado
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Header sticky solo dentro del área con scroll */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <Link href="/listado/analisis/tetrazolio">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-bold text-balance">
                    Análisis de Tetrazolio #{tetrazolio.analisisID}
                  </h1>
                  {getEstadoBadge(tetrazolio.estado || 'REGISTRADO')}
                </div>
                <p className="text-base text-muted-foreground text-pretty">
                  Viabilidad con tetrazolio • Lote {tetrazolio.lote}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/listado/analisis/tetrazolio/${tetrazolioId}/editar`}>
                  <Button
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Editar análisis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compensar altura del header sticky */}
      <div className="pt-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Información del análisis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-orange-600" />
                Información del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Lote */}
                <div className="space-y-2">
                  <Label>Lote</Label>
                  <div className="text-sm font-medium">{tetrazolio.lote}</div>
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Fecha del Ensayo
                  </Label>
                  <div className="text-sm">{formatearFechaLocal(tetrazolio.fecha || '')}</div>
                </div>

                {/* Semillas por repetición */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Número de semillas por repetición
                  </Label>
                  <div className="text-sm">{tetrazolio.numSemillasPorRep}</div>
                </div>

                {/* Pretratamiento */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Pretratamiento
                  </Label>
                  <div className="text-sm">{tetrazolio.pretratamiento || 'Ninguno'}</div>
                </div>

                {/* Concentración */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Concentración
                  </Label>
                  <div className="text-sm">{tetrazolio.concentracion}</div>
                </div>

                {/* Temperatura */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Tinción (°C)
                  </Label>
                  <div className="text-sm">{tetrazolio.tincionTemp}°C</div>
                </div>

                {/* Tiempo de tinción */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Tinción (hs)
                  </Label>
                  <div className="text-sm">{tetrazolio.tincionHs}h</div>
                </div>

                {/* Repeticiones esperadas */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Repeticiones Esperadas
                  </Label>
                  <div className="text-sm">{tetrazolio.numRepeticionesEsperadas}</div>
                </div>

                {/* Viabilidad INASE */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Viabilidad INASE (%)
                  </Label>
                  <div className="text-sm">
                    {(tetrazolio as any).viabilidadInase != null && (tetrazolio as any).viabilidadInase !== ''
                      ? `${(tetrazolio as any).viabilidadInase}%`
                      : 'No especificado'}
                  </div>
                </div>
              </div>

              {/* Notas generales */}
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <h4 className="font-medium text-orange-800 mb-2">Notas Generales del Análisis de Tetrazolio</h4>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• El orden de registro es: Viables → Duras → No viables.</li>
                  <li>• Si la suma total no coincide con el número de semillas, se ajusta ±1 en Viables.</li>
                  <li>• Los campos 'Pretratamiento', 'Tinción (hs)' y 'Tinción (°C)' pueden modificarse según la especie analizada.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sección de repeticiones - Solo vista */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-orange-600" />
                Repeticiones ({repeticiones.length}/{tetrazolio.numRepeticionesEsperadas})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de repeticiones */}
              {repeticiones.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {repeticiones.map((repeticion, index) => (
                      <Card key={repeticion.repTetrazolioViabID} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Repetición</Label>
                              <div className="font-medium">#{index + 1}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Fecha</Label>
                              <div>{formatearFechaLocal(repeticion.fecha)}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Viables</Label>
                              <div className="text-green-600 font-medium">{repeticion.viablesNum}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">No Viables</Label>
                              <div className="text-red-600 font-medium">{repeticion.noViablesNum}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Duras</Label>
                              <div className="text-yellow-600 font-medium">{repeticion.duras}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Resumen de totales */}
                  {totales.total > 0 && (
                    <Card className="bg-orange-50 border-orange-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Resumen de Resultados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{totales.total}</div>
                            <div className="text-sm text-muted-foreground">Total Semillas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{totales.viables}</div>
                            <div className="text-sm text-muted-foreground">Viables</div>
                            <div className="text-xs">({((totales.viables / totales.total) * 100).toFixed(1)}%)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{totales.noViables}</div>
                            <div className="text-sm text-muted-foreground">No Viables</div>
                            <div className="text-xs">({((totales.noViables / totales.total) * 100).toFixed(1)}%)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{totales.duras}</div>
                            <div className="text-sm text-muted-foreground">Duras</div>
                            <div className="text-xs">({((totales.duras / totales.total) * 100).toFixed(1)}%)</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay repeticiones registradas aún.</p>
                  <p className="text-sm">Las repeticiones se crean desde la página de edición.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Porcentajes redondeados - Solo vista */}
          {puedeFinalizarse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Porcentajes Finales con Redondeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>% Viables (Redondeo)</Label>
                    <div className="text-lg font-medium text-green-600">
                      {tetrazolio.porcViablesRedondeo !== null && tetrazolio.porcViablesRedondeo !== undefined 
                        ? Number(tetrazolio.porcViablesRedondeo).toFixed(1)
                        : '0.0'}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>% No Viables (Redondeo)</Label>
                    <div className="text-lg font-medium text-red-600">
                      {tetrazolio.porcNoViablesRedondeo !== null && tetrazolio.porcNoViablesRedondeo !== undefined 
                        ? Number(tetrazolio.porcNoViablesRedondeo).toFixed(1)
                        : '0.0'}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>% Duras (Redondeo)</Label>
                    <div className="text-lg font-medium text-yellow-600">
                      {tetrazolio.porcDurasRedondeo !== null && tetrazolio.porcDurasRedondeo !== undefined 
                        ? Number(tetrazolio.porcDurasRedondeo).toFixed(1)
                        : '0.0'}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}