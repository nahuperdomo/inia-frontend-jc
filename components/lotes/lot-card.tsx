"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, Wheat } from "lucide-react"

interface Lot {
  id: string
  lote: string
  numeroReferencia: string
  especie: string
  cultivar: string
  empresa: string
  fechaRecibo: string
  estado: string
}

interface LotCardProps {
  lot: Lot
  onViewDetails: (lot: Lot) => void
}

export function LotCard({ lot, onViewDetails }: LotCardProps) {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "En proceso":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "Completado":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80"
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Wheat className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{lot.lote}</h4>
            <Badge variant="outline" className="text-xs">
              {lot.numeroReferencia}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Wheat className="h-3 w-3" />
              {lot.especie} - {lot.cultivar}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {lot.empresa}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(lot.fechaRecibo).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={getStatusColor(lot.estado)}>{lot.estado}</Badge>
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(lot)}>
          Ver detalles
        </Button>
      </div>
    </div>
  )
}

