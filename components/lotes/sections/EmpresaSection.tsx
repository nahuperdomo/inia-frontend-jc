"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { LoteDTO } from "@/app/models"

interface EmpresaSectionProps {
    lot: LoteDTO
}

export function EmpresaSection({ lot }: EmpresaSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Empresa
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                        <div className="font-semibold">{lot.empresaNombre || lot.empresa}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                        <div className="font-semibold">{lot.clienteNombre || lot.cliente}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Código CC</Label>
                        <div className="font-semibold">{lot.codigoCC}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Código FF</Label>
                        <div className="font-semibold">{lot.codigoFF}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}