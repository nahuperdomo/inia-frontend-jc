"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ArrowLeft, FlaskConical, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { obtenerReporteGerminacion } from "@/app/services/reporte-service"
import { ReporteGerminacionDTO } from "@/app/models/interfaces/reportes"

export default function ReporteGerminacionPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<ReporteGerminacionDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const cargarReporte = async () => {
    setIsLoading(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerReporteGerminacion(filtros)      setReporte(data)
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarReporte()
  }, [])

  const dataGerminacionEspecie = reporte?.mediaGerminacionPorEspecie
    ? Object.entries(reporte.mediaGerminacionPorEspecie).map(([key, value]) => ({
        especie: key,
        germinacion: Number(value) || 0,
      }))
    : []

  const dataPrimerConteo = reporte?.tiempoPromedioPrimerConteo
    ? Object.entries(reporte.tiempoPromedioPrimerConteo).map(([key, value]) => ({
        especie: key,
        dias: Number(value) || 0,
      }))
    : []

  const dataUltimoConteo = reporte?.tiempoPromedioUltimoConteo
    ? Object.entries(reporte.tiempoPromedioUltimoConteo).map(([key, value]) => ({
        especie: key,
        dias: Number(value) || 0,
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
          <div className="bg-emerald-100 text-emerald-700 rounded-full p-3">
            <FlaskConical className="h-8 w-8" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">Reporte de Germinación</h1>
          <p className="text-muted-foreground text-pretty">Métricas y estadísticas de análisis de germinación</p>
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
              <p className="text-sm font-medium text-muted-foreground">Total Germinaciones</p>
              <p className="text-4xl font-bold">{reporte?.totalGerminaciones || 0}</p>
            </div>
            <FlaskConical className="h-12 w-12 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media de Germinación por Especie (%)</CardTitle>
          <CardDescription>Porcentaje promedio de germinación por especie</CardDescription>
        </CardHeader>
        <CardContent>
          {dataGerminacionEspecie.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataGerminacionEspecie} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Germinación"]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="germinacion" fill="#10b981" name="Germinación %" radius={[8, 8, 0, 0]}>
                  {dataGerminacionEspecie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempo Promedio a Primer Conteo (días)
            </CardTitle>
            <CardDescription>Días promedio hasta el primer conteo por especie</CardDescription>
          </CardHeader>
          <CardContent>
            {dataPrimerConteo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPrimerConteo} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    formatter={(value) => [`${Number(value).toFixed(1)} días`, "Días"]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="dias" fill="#0ea5e9" name="Días" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempo Promedio a Último Conteo (días)
            </CardTitle>
            <CardDescription>Días promedio hasta el último conteo por especie</CardDescription>
          </CardHeader>
          <CardContent>
            {dataUltimoConteo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataUltimoConteo} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    formatter={(value) => [`${Number(value).toFixed(1)} días`, "Días"]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="dias" fill="#a855f7" name="Días" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
