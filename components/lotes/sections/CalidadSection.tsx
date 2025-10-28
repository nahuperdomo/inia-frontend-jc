"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BarChart3 } from "lucide-react"
import { LoteDTO } from "@/app/models"

interface CalidadSectionProps {
    lot: LoteDTO
}

export function CalidadSection({ lot }: CalidadSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Calidad y producción
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Kilos limpios</Label>
                        <div className="font-semibold">{lot.kilosLimpios ? `${lot.kilosLimpios} kg` : "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Depósito</Label>
                        <div className="font-semibold">{lot.depositoValor || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                        <div className="font-semibold">{lot.estadoValor || "-"}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
