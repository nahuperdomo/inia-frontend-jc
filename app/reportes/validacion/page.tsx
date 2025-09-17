"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertTriangle, Clock, User, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ValidationItem {
  id: string
  tipo: "Lote" | "Análisis" | "Reporte"
  numeroAnalisis?: string
  muestra?: string
  cliente: string
  responsableAnalisis: string
  fechaAnalisis: string
  estado: "Pendiente" | "Aprobado" | "Rechazado" | "En revisión"
  validador?: string
  fechaValidacion?: string
  observaciones?: string
  resultados?: {
    pureza?: string
    germinacion?: string
    pms?: string
    tetrazolio?: string
    dosn?: string
  }
}

export default function ValidacionPage() {
  const [selectedItem, setSelectedItem] = useState<ValidationItem | null>(null)
  const [validationNotes, setValidationNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const validationItems: ValidationItem[] = [
    {
      id: "VAL-001",
      tipo: "Análisis",
      numeroAnalisis: "AN-2024-0050",
      muestra: "RG-LE-ex-0023",
      cliente: "Cooperativa Norte",
      responsableAnalisis: "Dr. Juan Pérez",
      fechaAnalisis: "2024-12-15",
      estado: "Pendiente",
      resultados: {
        pureza: "98.5%",
        germinacion: "92%",
      },
    },
    {
      id: "VAL-002",
      tipo: "Análisis",
      numeroAnalisis: "AN-2024-0049",
      muestra: "RG-LE-ex-0022",
      cliente: "Semillas Premium",
      responsableAnalisis: "Dra. María González",
      fechaAnalisis: "2024-12-14",
      estado: "Aprobado",
      validador: "Dr. Carlos Rodríguez",
      fechaValidacion: "2024-12-15",
      resultados: {
        pureza: "97.2%",
        pms: "45.2g",
      },
    },
    {
      id: "VAL-003",
      tipo: "Análisis",
      numeroAnalisis: "AN-2024-0048",
      muestra: "RG-LE-ex-0021",
      cliente: "AgroTech",
      responsableAnalisis: "Dra. Ana Martínez",
      fechaAnalisis: "2024-12-13",
      estado: "Rechazado",
      validador: "Dr. Juan Pérez",
      fechaValidacion: "2024-12-14",
      observaciones: "Diferencia en peso inicial excede tolerancia. Repetir análisis.",
      resultados: {
        tetrazolio: "89%",
      },
    },
    {
      id: "VAL-004",
      tipo: "Lote",
      cliente: "Instituto Semillas",
      responsableAnalisis: "Dr. Carlos Rodríguez",
      fechaAnalisis: "2024-12-12",
      estado: "En revisión",
      validador: "Dra. María González",
    },
  ]

  const handleValidation = (itemId: string, action: "approve" | "reject") => {
    console.log(`${action} item ${itemId}`)
    // Here would be the API call to update validation status
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return "bg-green-100 text-green-800"
      case "Rechazado":
        return "bg-red-100 text-red-800"
      case "En revisión":
        return "bg-blue-100 text-blue-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rechazado":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "En revisión":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "Pendiente":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredItems = validationItems.filter((item) => {
    if (filterStatus === "all") return true
    return item.estado === filterStatus
  })

  const stats = {
    total: validationItems.length,
    pendientes: validationItems.filter((item) => item.estado === "Pendiente").length,
    aprobados: validationItems.filter((item) => item.estado === "Aprobado").length,
    rechazados: validationItems.filter((item) => item.estado === "Rechazado").length,
    enRevision: validationItems.filter((item) => item.estado === "En revisión").length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reportes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Sistema de Validación</h1>
            <p className="text-muted-foreground text-pretty">
              Validación y autorización de lotes y análisis del laboratorio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Revisión</p>
                <p className="text-3xl font-bold text-blue-600">{stats.enRevision}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                <p className="text-3xl font-bold text-green-600">{stats.aprobados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                <p className="text-3xl font-bold text-red-600">{stats.rechazados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input placeholder="Buscar por número de análisis, muestra o cliente..." />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En revisión">En revisión</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Validation Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items para Validación ({filteredItems.length})</CardTitle>
              <CardDescription>Lista de análisis y lotes pendientes de validación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedItem?.id === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-full p-2">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.tipo} {item.numeroAnalisis && `- ${item.numeroAnalisis}`}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium">{item.cliente}</p>
                          </div>
                          {item.muestra && (
                            <div>
                              <p className="text-muted-foreground">Muestra</p>
                              <p className="font-medium">{item.muestra}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Responsable</p>
                            <p className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.responsableAnalisis}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Fecha Análisis</p>
                            <p className="font-medium">{item.fechaAnalisis}</p>
                          </div>
                          {item.fechaValidacion && (
                            <div>
                              <p className="text-muted-foreground">Fecha Validación</p>
                              <p className="font-medium">{item.fechaValidacion}</p>
                            </div>
                          )}
                        </div>

                        {item.observaciones && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Observaciones</p>
                            <p className="font-medium text-red-600">{item.observaciones}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(item.estado)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.estado)}
                            {item.estado}
                          </div>
                        </Badge>
                        {item.validador && <p className="text-xs text-muted-foreground">Por: {item.validador}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Panel */}
        <div className="space-y-6">
          {selectedItem ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de Validación</CardTitle>
                  <CardDescription>{selectedItem.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">{selectedItem.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedItem.cliente}</p>
                    </div>
                    {selectedItem.muestra && (
                      <div>
                        <p className="text-sm text-muted-foreground">Muestra</p>
                        <p className="font-medium">{selectedItem.muestra}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Responsable</p>
                      <p className="font-medium">{selectedItem.responsableAnalisis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Actual</p>
                      <Badge className={getStatusColor(selectedItem.estado)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedItem.estado)}
                          {selectedItem.estado}
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {selectedItem.resultados && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Resultados</p>
                        <div className="space-y-2">
                          {selectedItem.resultados.pureza && (
                            <div className="flex justify-between text-sm">
                              <span>Pureza:</span>
                              <span className="font-medium">{selectedItem.resultados.pureza}</span>
                            </div>
                          )}
                          {selectedItem.resultados.germinacion && (
                            <div className="flex justify-between text-sm">
                              <span>Germinación:</span>
                              <span className="font-medium">{selectedItem.resultados.germinacion}</span>
                            </div>
                          )}
                          {selectedItem.resultados.pms && (
                            <div className="flex justify-between text-sm">
                              <span>PMS:</span>
                              <span className="font-medium">{selectedItem.resultados.pms}</span>
                            </div>
                          )}
                          {selectedItem.resultados.tetrazolio && (
                            <div className="flex justify-between text-sm">
                              <span>Tetrazolio:</span>
                              <span className="font-medium">{selectedItem.resultados.tetrazolio}</span>
                            </div>
                          )}
                          {selectedItem.resultados.dosn && (
                            <div className="flex justify-between text-sm">
                              <span>DOSN:</span>
                              <span className="font-medium">{selectedItem.resultados.dosn}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedItem.estado === "Pendiente" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Validación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Observaciones</label>
                      <Textarea
                        placeholder="Ingrese observaciones sobre la validación..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleValidation(selectedItem.id, "approve")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleValidation(selectedItem.id, "reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un item</h3>
                <p className="text-muted-foreground">
                  Selecciona un análisis o lote de la lista para ver los detalles y realizar la validación.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
