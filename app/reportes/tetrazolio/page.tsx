"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, TestTube, Calendar } from "lucide-react"
import Link from "next/link"
import { obtenerReporteTetrazolio } from "@/app/services/reporte-service"
import { ReporteTetrazolioDTO } from "@/app/models/interfaces/reportes"

export default function ReporteTetrazolioPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<ReporteTetrazolioDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const cargarReporte = async () => {
    setIsLoading(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerReporteTetrazolio(filtros)
      console.log('Respuesta del backend Tetrazolio:', data)
      console.log('viabilidadIniaPorEspecie:', data?.viabilidadIniaPorEspecie)
      console.log('viabilidadInasePorEspecie:', data?.viabilidadInasePorEspecie)
      console.log('totalTetrazolios:', data?.totalTetrazolios)
      setReporte(data)
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarReporte()
  }, [])

  const dataViabilidadInia = reporte?.viabilidadIniaPorEspecie
    ? Object.entries(reporte.viabilidadIniaPorEspecie).map(([key, value]) => ({
        especie: key,
        viabilidad: Number(value) || 0,
      }))
    : []

  const dataViabilidadInase = reporte?.viabilidadInasePorEspecie
    ? Object.entries(reporte.viabilidadInasePorEspecie).map(([key, value]) => ({
        especie: key,
        viabilidad: Number(value) || 0,
      }))
    : []

  console.log('dataViabilidadInia procesada:', dataViabilidadInia)
  console.log('dataViabilidadInase procesada:', dataViabilidadInase)

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href="/reportes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="bg-amber-100 text-amber-700 rounded-full p-3">
            <TestTube className="h-8 w-8" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">Reporte de Tetrazolio</h1>
          <p className="text-muted-foreground text-pretty">
            Métricas y estadísticas de análisis de viabilidad
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={cargarReporte} disabled={isLoading} className="w-full">
                {isLoading ? "Cargando..." : "Aplicar Filtros"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Análisis de Tetrazolio</p>
              <p className="text-4xl font-bold">{reporte?.totalTetrazolios || 0}</p>
            </div>
            <TestTube className="h-12 w-12 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Viabilidad INIA Promedio por Especie (%)</CardTitle>
          <CardDescription>Porcentaje de viabilidad con redondeo (INIA) promedio por especie</CardDescription>
        </CardHeader>
        <CardContent>
          {dataViabilidadInia.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataViabilidadInia} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="especie" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Viabilidad INIA"]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="viabilidad" fill="#fb923c" name="Viabilidad INIA %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Viabilidad INASE Promedio por Especie (%)</CardTitle>
          <CardDescription>Porcentaje de viabilidad INASE promedio por especie</CardDescription>
        </CardHeader>
        <CardContent>
          {dataViabilidadInase.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataViabilidadInase} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="especie" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Viabilidad INASE"]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="viabilidad" fill="#10b981" name="Viabilidad INASE %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {(dataViabilidadInia.length > 0 || dataViabilidadInase.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Especie</CardTitle>
            <CardDescription>Detalle de viabilidad por especie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dataViabilidadInia.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-amber-600">Viabilidad INIA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dataViabilidadInia.map((item) => (
                      <div key={`inia-${item.especie}`} className="p-5 border-2 border-amber-200 bg-amber-50 rounded-xl">
                        <p className="text-sm text-amber-700 mb-2 font-medium">{item.especie}</p>
                        <p className="text-3xl font-bold text-amber-600">{item.viabilidad.toFixed(2)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dataViabilidadInase.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-emerald-600">Viabilidad INASE</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dataViabilidadInase.map((item) => (
                      <div key={`inase-${item.especie}`} className="p-5 border-2 border-emerald-200 bg-emerald-50 rounded-xl">
                        <p className="text-sm text-emerald-700 mb-2 font-medium">{item.especie}</p>
                        <p className="text-3xl font-bold text-emerald-600">{item.viabilidad.toFixed(2)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
