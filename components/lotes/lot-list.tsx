"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Search, Calendar, Wheat } from "lucide-react"
import { LoteSimpleDTO } from "@/app/models"

interface LotListProps {
  lots: LoteSimpleDTO[]
  onViewDetails: (lot: LoteSimpleDTO) => void
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
      lot.nomLote?.toLowerCase().includes(searchTerm.toLowerCase()),
  ) : []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Últimos Lotes Registrados
            </CardTitle>
            <CardDescription>Consulta y busca entre los lotes registrados recientemente</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote, especie, cultivar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
                      <Wheat className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-sm sm:text-base">Ficha: {lot.ficha}</h4>
                        {lot.nomLote && (
                          <Badge variant="outline" className="text-xs">
                            {lot.nomLote}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        {(lot.especieNombre || lot.cultivarNombre) && (
                          <span className="flex items-center gap-1 truncate">
                            <Wheat className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {[lot.especieNombre, lot.cultivarNombre].filter(Boolean).join(' - ')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start flex-shrink-0">
                    <Badge className={`${getStatusColor(lot.activo ? "Activo" : "Inactivo")} text-xs whitespace-nowrap`}>
                      {lot.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(lot)}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
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
