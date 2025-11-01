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
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Análisis Asignados
                </CardTitle>
            </CardHeader>
            <CardContent>
                {lot.tiposAnalisisAsignados && lot.tiposAnalisisAsignados.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {lot.tiposAnalisisAsignados.map((tipo, index) => (
                            <span 
                                key={index} 
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                            >
                                {tipo}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">No hay análisis asignados</p>
                )}
            </CardContent>
        </Card>
    )
}
