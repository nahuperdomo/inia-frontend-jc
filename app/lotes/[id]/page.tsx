"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Download, Calendar, Package, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function LoteDetailPage() {
  const params = useParams()
  const loteId = params.id as string

  // Mock data - in real app this would come from API
  const [lote] = useState({
    id: loteId,
    empresa: "INIA",
    cultivo: "Soja",
    codigoCC: "CC001",
    codigoFT: "FT001",
    fechaRegistro: "2024-12-10",
    estado: "Activo",
    pureza: 98.5,
    observaciones: "Lote en condiciones óptimas para análisis de pureza física",
    detalles: {
      numeroReferencia: "REF-2024-001",
      loteOrigen: "Campo Norte - Sector A",
      fechaRecepcion: "2024-12-09",
      fechaAnalisis: "2024-12-10",
      responsable: "Dr. Juan Pérez",
      laboratorio: "Lab Central INIA",
    },
    analisisPureza: {
      semillaPura: 98.5,
      materiaInerte: 1.2,
      otrosCultivos: 0.2,
      malezas: 0.1,
      observaciones: "Análisis realizado según normas ISTA",
    },
    historial: [
      { fecha: "2024-12-10", accion: "Lote registrado", usuario: "Admin", detalle: "Registro inicial del lote" },
      {
        fecha: "2024-12-10",
        accion: "Análisis iniciado",
        usuario: "Dr. Pérez",
        detalle: "Inicio de análisis de pureza",
      },
      {
        fecha: "2024-12-11",
        accion: "Análisis completado",
        usuario: "Dr. Pérez",
        detalle: "Análisis de pureza finalizado",
      },
    ],
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "default"
      case "En análisis":
        return "secondary"
      case "Completado":
        return "outline"
      case "Pendiente":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lotes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lotes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Lote {lote.id}</h1>
            <p className="text-muted-foreground text-pretty">Detalles completos del lote y análisis de pureza</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Link href={`/lotes/${lote.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Lote</label>
                  <p className="text-lg font-semibold">{lote.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <Badge variant={getEstadoBadgeVariant(lote.estado)}>{lote.estado}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-lg">{lote.empresa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cultivo</label>
                  <p className="text-lg">{lote.cultivo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código CC</label>
                  <p className="text-lg">{lote.codigoCC}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código FT</label>
                  <p className="text-lg">{lote.codigoFT}</p>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                <p className="mt-1">{lote.observaciones}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Referencia</label>
                  <p className="text-lg">{lote.detalles.numeroReferencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lote de Origen</label>
                  <p className="text-lg">{lote.detalles.loteOrigen}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Recepción</label>
                  <p className="text-lg">{new Date(lote.detalles.fechaRecepcion).toLocaleDateString("es-ES")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Análisis</label>
                  <p className="text-lg">{new Date(lote.detalles.fechaAnalisis).toLocaleDateString("es-ES")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Responsable</label>
                  <p className="text-lg">{lote.detalles.responsable}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Laboratorio</label>
                  <p className="text-lg">{lote.detalles.laboratorio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis de Pureza Física
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{lote.analisisPureza.semillaPura}%</p>
                  <p className="text-sm text-muted-foreground">Semilla Pura</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{lote.analisisPureza.materiaInerte}%</p>
                  <p className="text-sm text-muted-foreground">Materia Inerte</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{lote.analisisPureza.otrosCultivos}%</p>
                  <p className="text-sm text-muted-foreground">Otros Cultivos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{lote.analisisPureza.malezas}%</p>
                  <p className="text-sm text-muted-foreground">Malezas</p>
                </div>
              </div>
              <Separator />
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Observaciones del Análisis</label>
                <p className="mt-1">{lote.analisisPureza.observaciones}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/pureza/consulta?lote=${lote.id}`}>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Análisis Completo
                </Button>
              </Link>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Certificado
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Seguimiento
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lote.historial.map((item, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{item.accion}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.fecha).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.detalle}</p>
                    <p className="text-xs text-muted-foreground">Por: {item.usuario}</p>
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
