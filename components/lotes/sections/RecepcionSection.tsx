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
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5" />
                    Recepción y almacenamiento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de entrega</Label>
                        <div className="font-semibold">
                            {lot.fechaEntrega ? new Date(lot.fechaEntrega).toLocaleDateString() : "-"}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de recibo</Label>
                        <div className="font-semibold">
                            {lot.fechaRecibo ? new Date(lot.fechaRecibo).toLocaleDateString() : "-"}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Depósito asignado</Label>
                        <div className="font-semibold">{lot.depositoAsignado || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Unidad de embalado</Label>
                        <div className="font-semibold">{lot.unidadEmbalado || lot.unidadEmbolsado || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Resultados</Label>
                        <div className="font-semibold">{lot.resultados || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                        <div className="font-semibold">{lot.observaciones || "-"}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
