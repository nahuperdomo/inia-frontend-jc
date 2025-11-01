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
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Building2 className="h-5 w-5" />
                    Empresa y Cliente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                        <div className="font-semibold mt-1">{lot.empresaNombre || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                        <div className="font-semibold mt-1">{lot.clienteNombre || "-"}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
