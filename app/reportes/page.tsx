"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  LineChart,
  Line,
} from "recharts" // Fixed missing closing brace in Recharts import
import { FileText, Download, Filter, BarChart3, TrendingUp, Calendar, Package, Beaker, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ReportesPage() {
  const [reportType, setReportType] = useState("general")
  const [dateRange, setDateRange] = useState("month")
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data for charts
  const lotesData = [
    { mes: "Ene", lotes: 12, analisis: 15 },
    { mes: "Feb", lotes: 19, analisis: 22 },
    { mes: "Mar", lotes: 15, analisis: 18 },
    { mes: "Abr", lotes: 25, analisis: 28 },
    { mes: "May", lotes: 22, analisis: 25 },
    { mes: "Jun", lotes: 18, analisis: 21 },
  ]

  const purezaData = [
    { cultivo: "Soja", pureza: 98.5 },
    { cultivo: "Maíz", pureza: 97.2 },
    { cultivo: "Trigo", pureza: 99.1 },
    { cultivo: "Arroz", pureza: 96.8 },
    { cultivo: "Girasol", pureza: 95.5 },
  ]

  const cultivosDistribution = [
    { name: "Soja", value: 35, color: "#059669" },
    { name: "Maíz", value: 25, color: "#10b981" },
    { name: "Trigo", value: 20, color: "#34d399" },
    { name: "Arroz", value: 15, color: "#6ee7b7" },
    { name: "Otros", value: 5, color: "#a7f3d0" },
  ]

  const reportTemplates = [
    {
      id: "lotes-mensual",
      name: "Reporte Mensual de Lotes",
      description: "Resumen mensual de lotes registrados y analizados",
      icon: Package,
      type: "lotes",
    },
    {
      id: "pureza-general",
      name: "Análisis de Pureza General",
      description: "Estadísticas generales de pureza por cultivo",
      icon: Beaker,
      type: "pureza",
    },
    {
      id: "productividad",
      name: "Reporte de Productividad",
      description: "Análisis de productividad del laboratorio",
      icon: TrendingUp,
      type: "productividad",
    },
    {
      id: "calendario-actividades",
      name: "Calendario de Actividades",
      description: "Resumen de actividades programadas y completadas",
      icon: Calendar,
      type: "calendario",
    },
  ]

  const recentReports = [
    {
      id: "RPT-001",
      name: "Reporte Mensual Noviembre 2024",
      type: "Lotes",
      fecha: "2024-12-01",
      estado: "Completado",
      size: "2.3 MB",
    },
    {
      id: "RPT-002",
      name: "Análisis Pureza Q4 2024",
      type: "Pureza",
      fecha: "2024-12-05",
      estado: "Completado",
      size: "1.8 MB",
    },
    {
      id: "RPT-003",
      name: "Productividad Laboratorio",
      type: "Productividad",
      fecha: "2024-12-10",
      estado: "En proceso",
      size: "-",
    },
  ]

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Centro de Reportes</h1>
          <p className="text-muted-foreground text-pretty">Genera y consulta reportes estadísticos del sistema INIA</p>
        </div>
        <div className="flex gap-2">
          <Link href="/reportes/validacion">
            <Button variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validación
            </Button>
          </Link>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Plantillas
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportType">Tipo de Reporte</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="lotes">Lotes</SelectItem>
                    <SelectItem value="pureza">Pureza</SelectItem>
                    <SelectItem value="productividad">Productividad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateRange">Período</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="quarter">Último trimestre</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate">Desde</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">Hasta</Label>
                  <Input type="date" />
                </div>
              </div>
              <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? "Generando..." : "Generar"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{report.fecha}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {report.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{report.size}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Lotes</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Análisis Completados</p>
                    <p className="text-2xl font-bold">142</p>
                  </div>
                  <Beaker className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pureza Promedio</p>
                    <p className="text-2xl font-bold">97.8%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reportes Generados</p>
                    <p className="text-2xl font-bold">28</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lotes y Análisis por Mes</CardTitle>
                <CardDescription>Evolución mensual de lotes registrados y análisis realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={lotesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="lotes" fill="#059669" name="Lotes" />
                    <Bar dataKey="analisis" fill="#10b981" name="Análisis" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Cultivo</CardTitle>
                <CardDescription>Porcentaje de lotes por tipo de cultivo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cultivosDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {cultivosDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Niveles de Pureza por Cultivo</CardTitle>
              <CardDescription>Comparación de niveles de pureza promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={purezaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cultivo" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Pureza"]} />
                  <Line type="monotone" dataKey="pureza" stroke="#059669" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Reportes</CardTitle>
              <CardDescription>Reportes predefinidos listos para generar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <template.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                          Generar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
