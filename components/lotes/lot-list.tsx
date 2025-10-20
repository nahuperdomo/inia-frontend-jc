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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Últimos Lotes Registrados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Consulta y busca entre los lotes registrados recientemente
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-60 md:w-80"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {filteredLots.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No se encontraron lotes que coincidan con la búsqueda</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredLots.map((lot) => (
                <div
                  key={lot.loteID}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex-shrink-0">
                      <Wheat className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4 className="font-medium text-sm sm:text-base">Ficha #{lot.numeroFicha}</h4>
                        <Badge variant="outline" className="text-xs">
                          {lot.ficha}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <Wheat className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lot.especieNombre} - {lot.cultivarNombre}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lot.empresaNombre}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          {new Date(lot.fechaRecibo).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <Badge className={`${getStatusColor(lot.activo ? "Activo" : "Inactivo")} text-xs`}>
                      {lot.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(lot)}
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden xs:inline">Ver detalles</span>
                      <span className="xs:hidden">Ver</span>
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
