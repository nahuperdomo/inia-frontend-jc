"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Search, Calendar, Building2, Wheat } from "lucide-react"

interface Lot {
  loteID: number
  numeroFicha: number
  ficha: string
  tipo: string
  empresaNombre: string
  clienteNombre: string
  codigoCC: string
  codigoFF: string
  fechaEntrega: string
  fechaRecibo: string
  cultivarNombre: string
  especieNombre: string
  observaciones: string
  activo: boolean
}

interface LotListProps {
  lots: Lot[]
  onViewDetails: (lot: Lot) => void
}

export function LotList({ lots = [], onViewDetails }: LotListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "En proceso":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "Completado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const filteredLots = Array.isArray(lots) ? lots.filter(
    (lot) =>
      lot.ficha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.especieNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.cultivarNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.empresaNombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  ) : []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Últimos Lotes Registrados
            </CardTitle>
            <CardDescription>Consulta y busca entre los lotes registrados recientemente</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote, especie, cultivar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron lotes que coincidan con la búsqueda</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLots.map((lot) => (
                <div
                  key={lot.loteID}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                      <Wheat className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Ficha #{lot.numeroFicha}</h4>
                        <Badge variant="outline" className="text-xs">
                          {lot.ficha}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wheat className="h-3 w-3" />
                          {lot.especieNombre} - {lot.cultivarNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lot.empresaNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(lot.fechaRecibo).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(lot.activo ? "Activo" : "Inactivo")}>{lot.activo ? "Activo" : "Inactivo"}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(lot)}>
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
