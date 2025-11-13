"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Scale, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { obtenerReportePms } from "@/app/services/reporte-service"
import { ReportePMSDTO } from "@/app/models/interfaces/reportes"

export default function ReportePmsPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<ReportePMSDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const cargarReporte = async () => {
    setIsLoading(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerReportePms(filtros)
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

  const dataPmsPorEspecie = reporte?.pmsPorEspecie
    ? Object.entries(reporte.pmsPorEspecie).map(([key, value]) => ({
        especie: key,
        pms: value,
      }))
    : []

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
          <div className="bg-violet-100 text-violet-700 rounded-full p-3">
            <Scale className="h-8 w-8" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">Reporte de PMS</h1>
          <p className="text-muted-foreground text-pretty">
            Métricas y estadísticas de análisis de peso de mil semillas
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis PMS</p>
                <p className="text-4xl font-bold">{reporte?.totalPms || 0}</p>
              </div>
              <Scale className="h-12 w-12 text-violet-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Muestras con Repeticiones Máximas</p>
                <p className="text-4xl font-bold">{reporte?.muestrasConRepeticionesMaximas || 0}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Muestras con CV Superado</CardTitle>
          <CardDescription>
            Análisis cuyo coeficiente de variación supera los límites establecidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-red-200 bg-red-50 rounded-xl">
                <p className="text-sm text-red-700 mb-2 font-medium">Muestras con CV Superado</p>
                <p className="text-4xl font-bold text-red-600">{reporte?.muestrasConCVSuperado || 0}</p>
              </div>
              <div className="p-6 border-2 border-amber-200 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-700 mb-2 font-medium">Porcentaje del Total</p>
                <p className="text-4xl font-bold text-amber-600">
                  {reporte?.porcentajeMuestrasConCVSuperado ? `${reporte.porcentajeMuestrasConCVSuperado.toFixed(1)}%` : "0%"}
                </p>
              </div>
            </div>

            <div className="p-5 bg-sky-50 border border-sky-200 rounded-xl">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sky-900">
                <AlertCircle className="h-5 w-5 text-sky-600" />
                Información
              </h4>
              <ul className="text-sm space-y-2 text-sky-800">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 mt-0.5">•</span>
                  <span>El coeficiente de variación (CV) no debe superar el 6% para semillas normales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 mt-0.5">•</span>
                  <span>Las muestras pueden tener hasta 16 repeticiones máximas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 mt-0.5">•</span>
                  <span>Un CV alto indica variabilidad en el peso de las semillas</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PMS Promedio por Especie (g)</CardTitle>
          <CardDescription>Peso de mil semillas promedio por especie</CardDescription>
        </CardHeader>
        <CardContent>
          {dataPmsPorEspecie.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataPmsPorEspecie} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  formatter={(value) => [`${Number(value).toFixed(2)} g`, "PMS"]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="pms" fill="#8b5cf6" name="PMS (g)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {reporte && reporte.totalPms > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl text-center">
                <p className="text-sm text-emerald-700 mb-2 font-medium">Tasa de Cumplimiento</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {((((reporte.totalPms - reporte.muestrasConCVSuperado) / reporte.totalPms) * 100) || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-6 border-2 border-sky-200 bg-sky-50 rounded-xl text-center">
                <p className="text-sm text-sky-700 mb-2 font-medium">Muestras Aprobadas</p>
                <p className="text-3xl font-bold text-sky-600">
                  {reporte.totalPms - reporte.muestrasConCVSuperado}
                </p>
              </div>
              <div className="p-6 border-2 border-red-200 bg-red-50 rounded-xl text-center">
                <p className="text-sm text-red-700 mb-2 font-medium">Muestras con Problemas</p>
                <p className="text-3xl font-bold text-red-600">{reporte.muestrasConCVSuperado}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
