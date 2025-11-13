"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Beaker, Calendar } from "lucide-react"
import Link from "next/link"
import { obtenerReportePureza, obtenerContaminantesPureza } from "@/app/services/reporte-service"
import { ReportePurezaDTO } from "@/app/models/interfaces/reportes"
import { Combobox } from "@/components/ui/combobox"

export default function ReportePurezaPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<ReportePurezaDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [especieSeleccionada, setEspecieSeleccionada] = useState<string>("")
  const [contaminantes, setContaminantes] = useState<Record<string, number>>({})
  const [isLoadingContaminantes, setIsLoadingContaminantes] = useState(false)

  const cargarReporte = async () => {
    setIsLoading(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerReportePureza(filtros)
      setReporte(data)
      
      // Auto-seleccionar la primera especie si existe
      if (data.contaminantesPorEspecie && Object.keys(data.contaminantesPorEspecie).length > 0) {
        const primeraEspecie = Object.keys(data.contaminantesPorEspecie)[0]
        setEspecieSeleccionada(primeraEspecie)
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cargarContaminantes = async (especie: string) => {
    if (!especie) return
    
    setIsLoadingContaminantes(true)
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      const data = await obtenerContaminantesPureza(especie, filtros)
      setContaminantes(data)
    } catch (error) {
      console.error("Error al cargar contaminantes:", error)
    } finally {
      setIsLoadingContaminantes(false)
    }
  }

  useEffect(() => {
    cargarReporte()
  }, [])

  useEffect(() => {
    if (especieSeleccionada) {
      cargarContaminantes(especieSeleccionada)
    }
  }, [especieSeleccionada, fechaInicio, fechaFin])

  const dataCumpleEstandar = reporte?.porcentajeCumpleEstandar
    ? Object.entries(reporte.porcentajeCumpleEstandar).map(([key, value]) => ({
        especie: key,
        porcentaje: value,
      }))
    : []

  const dataMalezas = reporte?.porcentajeMalezas
    ? Object.entries(reporte.porcentajeMalezas).map(([key, value]) => ({
        especie: key,
        porcentaje: value,
      }))
    : []

  const dataOtrasSemillas = reporte?.porcentajeOtrasSemillas
    ? Object.entries(reporte.porcentajeOtrasSemillas).map(([key, value]) => ({
        especie: key,
        porcentaje: value,
      }))
    : []

  // Extraer totales y detalles por separado
  const totalMalezas = contaminantes["Total Malezas"] || 0
  const totalOtrosCultivos = contaminantes["Total Otros Cultivos"] || 0

  // Datos para pie chart general (solo totales)
  const dataGeneralContaminantes = [
    { name: "Malezas", value: totalMalezas },
    { name: "Otros Cultivos", value: totalOtrosCultivos },
  ].filter(item => item.value > 0)

  // Datos para pie chart de malezas específicas
  const dataMalezasEspecificas = Object.entries(contaminantes)
    .filter(([key]) => key.startsWith("Maleza:"))
    .map(([key, value]) => ({
      name: key.replace("Maleza: ", ""),
      value: value,
    }))

  // Datos para pie chart de cultivos específicos
  const dataCultivosEspecificos = Object.entries(contaminantes)
    .filter(([key]) => key.startsWith("Cultivo:"))
    .map(([key, value]) => ({
      name: key.replace("Cultivo: ", ""),
      value: value,
    }))

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
          <div className="bg-sky-100 text-sky-700 rounded-full p-3">
            <Beaker className="h-8 w-8" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">Reporte de Pureza</h1>
          <p className="text-muted-foreground text-pretty">Métricas y estadísticas de análisis de pureza</p>
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
              <p className="text-sm font-medium text-muted-foreground">Total Análisis de Pureza</p>
              <p className="text-4xl font-bold">{reporte?.totalPurezas || 0}</p>
            </div>
            <Beaker className="h-12 w-12 text-sky-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contaminantes por Especie</CardTitle>
          <CardDescription>Detalle de malezas y otros cultivos encontrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="especieSelector">Seleccionar Especie</Label>
            <Combobox
              value={especieSeleccionada}
              onValueChange={setEspecieSeleccionada}
              options={dataCumpleEstandar.map((item) => ({
                id: item.especie,
                nombre: item.especie,
              }))}
              placeholder="Selecciona una especie"
              searchPlaceholder="Buscar especie..."
            />
          </div>
          
          {isLoadingContaminantes ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Cargando contaminantes...
            </div>
          ) : especieSeleccionada && (totalMalezas > 0 || totalOtrosCultivos > 0) ? (
            <div className="space-y-6">
              {/* Pie Chart General */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Distribución General</h3>
                {dataGeneralContaminantes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={dataGeneralContaminantes}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }: any) => `${name}: ${value}`}
                      >
                        <Cell fill="#f87171" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${Number(value)}`}
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
                  <div className="h-[350px] flex items-center justify-center text-sm text-muted-foreground">
                    Sin datos
                  </div>
                )}
              </div>

              {/* Pie Chart Malezas */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center text-red-600">Detalle de Malezas</h3>
                {dataMalezasEspecificas.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={dataMalezasEspecificas}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }: any) => `${name}: ${value}`}
                      >
                        {dataMalezasEspecificas.map((entry, index) => {
                          const redShades = [
                            "#ef4444", "#fca5a5", "#dc2626", "#f87171", "#991b1b",
                            "#fca5a5", "#7f1d1d", "#f87171", "#b91c1c", "#fca5a5"
                          ]
                          return <Cell key={`cell-${index}`} fill={redShades[index % redShades.length]} />
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${Number(value)}`}
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
                  <div className="h-[350px] flex items-center justify-center text-sm text-muted-foreground">
                    Sin malezas
                  </div>
                )}
              </div>

              {/* Pie Chart Otros Cultivos */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center text-amber-600">Detalle de Otros Cultivos</h3>
                {dataCultivosEspecificos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={dataCultivosEspecificos}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }: any) => `${name}: ${value}`}
                      >
                        {dataCultivosEspecificos.map((entry, index) => {
                          const orangeShades = [
                            "#f59e0b", "#fcd34d", "#d97706", "#fbbf24", "#92400e",
                            "#fde68a", "#78350f", "#fbbf24", "#b45309", "#fde68a"
                          ]
                          return <Cell key={`cell-${index}`} fill={orangeShades[index % orangeShades.length]} />
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${Number(value)}`}
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
                  <div className="h-[350px] flex items-center justify-center text-sm text-muted-foreground">
                    Sin otros cultivos
                  </div>
                )}
              </div>
            </div>
          ) : especieSeleccionada ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay contaminantes registrados para esta especie
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Selecciona una especie para ver los contaminantes
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento de Estándares (%)</CardTitle>
            <CardDescription>Porcentaje de muestras que cumplen estándares por especie</CardDescription>
          </CardHeader>
          <CardContent>
            {dataCumpleEstandar.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataCumpleEstandar} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Cumplimiento"]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="porcentaje" fill="#10b981" name="Cumplimiento %" radius={[8, 8, 0, 0]} />
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
            <CardTitle>Porcentaje Promedio de Malezas por Especie</CardTitle>
            <CardDescription>Promedio de contaminación por malezas</CardDescription>
          </CardHeader>
          <CardContent>
            {dataMalezas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataMalezas} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    formatter={(value) => [`${Number(value).toFixed(2)}%`, "Malezas"]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="porcentaje" fill="#f87171" name="Malezas %" radius={[8, 8, 0, 0]} />
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

      <Card>
        <CardHeader>
          <CardTitle>Porcentaje Promedio de Otras Semillas por Especie</CardTitle>
          <CardDescription>Promedio de contaminación por otras semillas</CardDescription>
        </CardHeader>
        <CardContent>
          {dataOtrasSemillas.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataOtrasSemillas} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Otras Semillas"]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="porcentaje" fill="#f59e0b" name="Otras Semillas %" radius={[8, 8, 0, 0]} />
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
  )
}
