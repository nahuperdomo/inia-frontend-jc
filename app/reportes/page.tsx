"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Calendar, Beaker, FlaskConical, Scale, TestTube, TestTubes, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { obtenerReporteGeneral } from "@/app/services/reporte-service"
import { ReporteGeneralDTO } from "@/app/models/interfaces/reportes"

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<ReporteGeneralDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const cargarReporte = async () => {
    setIsLoading(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerReporteGeneral(filtros)
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

    const analisCards = [
    {
      id: "germinacion",
      name: "Germinación",
      description: "Métricas de análisis de germinación",
      icon: FlaskConical,
      color: "bg-green-100 text-green-800",
      href: "/reportes/germinacion",
    },
    {
      id: "pureza",
      name: "Pureza",
      description: "Estadísticas de pureza por cultivo",
      icon: Beaker,
      color: "bg-blue-100 text-blue-800",
      href: "/reportes/pureza",
    },
    {
      id: "dosn",
      name: "DOSN",
      description: "Análisis de DOSN por especie",
      icon: TestTubes,
      color: "bg-indigo-100 text-indigo-800",
      href: "/reportes/dosn",
    },
    {
      id: "pms",
      name: "PMS",
      description: "Análisis de peso de mil semillas",
      icon: Scale,
      color: "bg-purple-100 text-purple-800",
      href: "/reportes/pms",
    },
    {
      id: "tetrazolio",
      name: "Tetrazolio",
      description: "Viabilidad por especie",
      icon: TestTube,
      color: "bg-orange-100 text-orange-800",
      href: "/reportes/tetrazolio",
    },
  ]

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]

  const dataPorEstado = reporte?.analisisPorEstado
    ? Object.entries(reporte.analisisPorEstado).map(([key, value], index) => ({
        name: key.replace(/_/g, " "),
        value: value,
        color: COLORS[index % COLORS.length],
      }))
    : []

  const dataPorPeriodo = reporte?.analisisPorPeriodo
    ? Object.entries(reporte.analisisPorPeriodo).map(([key, value]) => ({
        periodo: key,
        cantidad: value,
      }))
    : []

  const dataProblemas = reporte?.topAnalisisProblemas
    ? Object.entries(reporte.topAnalisisProblemas).map(([key, value]) => ({
        tipo: key,
        cantidad: value,
      }))
    : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Centro de Reportes</h1>
          <p className="text-muted-foreground text-pretty">
            Métricas y estadísticas del sistema INIA
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reportes/validacion">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Validación
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </CardTitle>
          <CardDescription>Selecciona un rango de fechas para filtrar los reportes</CardDescription>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{reporte?.totalAnalisis || 0}</p>
              </div>
              <Beaker className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Medio</p>
                <p className="text-2xl font-bold">
                  {reporte?.tiempoMedioFinalizacion ? `${reporte.tiempoMedioFinalizacion.toFixed(1)} días` : "N/A"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold">{reporte?.analisisPorEstado?.["APROBADO"] || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Para Repetir</p>
                <p className="text-2xl font-bold">{reporte?.analisisPorEstado?.["A_REPETIR"] || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Período</CardTitle>
            <CardDescription>Distribución mensual de análisis realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {dataPorPeriodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="periodo" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#10b981" name="Análisis" radius={[8, 8, 0, 0]} />
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
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Porcentaje de completitud de análisis</CardDescription>
          </CardHeader>
          <CardContent>
            {dataPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataPorEstado}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {dataPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dataProblemas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Análisis con Problemas</CardTitle>
            <CardDescription>Análisis marcados para repetir por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataProblemas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tipo" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="cantidad" fill="#ef4444" name="Para Repetir" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reportes por Tipo de Análisis</CardTitle>
          <CardDescription>Accede a reportes específicos por tipo de análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analisCards.map((card) => (
              <Link key={card.id} href={card.href}>
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors h-full">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`${card.color} rounded-full p-3`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{card.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
