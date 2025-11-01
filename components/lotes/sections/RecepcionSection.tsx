"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Truck } from "lucide-react"
import { LoteDTO } from "@/app/models"

interface RecepcionSectionProps {
    lot: LoteDTO
}

export function RecepcionSection({ lot }: RecepcionSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Truck className="h-5 w-5" />
                    Recepción y almacenamiento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de entrega</Label>
                        <div className="font-semibold mt-1">
                            {lot.fechaEntrega ? new Date(lot.fechaEntrega).toLocaleDateString('es-ES') : "-"}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de recibo</Label>
                        <div className="font-semibold mt-1">
                            {lot.fechaRecibo ? new Date(lot.fechaRecibo).toLocaleDateString('es-ES') : "-"}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Depósito</Label>
                        <div className="font-semibold mt-1">{lot.depositoValor || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Unidad de embolsado</Label>
                        <div className="font-semibold mt-1">{lot.unidadEmbolsado || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Remitente</Label>
                        <div className="font-semibold mt-1">{lot.remitente || "-"}</div>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                        <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                        <div className="font-semibold mt-1">{lot.observaciones || "-"}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
