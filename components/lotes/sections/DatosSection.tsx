"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package } from "lucide-react"
import { LoteDTO } from "@/app/models"

interface DatosSectionProps {
    lot: LoteDTO
    isEditMode: boolean
    editFormData: Partial<LoteDTO>
    handleEditFormChange: (field: string, value: string) => void
    especies?: string[]
    origenes?: string[]
}

export function DatosSection({
    lot,
    isEditMode,
    editFormData,
    handleEditFormChange,
    especies = [],
    origenes = []
}: DatosSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Datos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Ficha</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.ficha || ""}
                                onChange={(e) => handleEditFormChange("ficha", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.ficha}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Código CC</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.codigoCC || ""}
                                onChange={(e) => handleEditFormChange("codigoCC", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.codigoCC}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Cultivar</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.cultivarNombre || ""}
                                onChange={(e) => handleEditFormChange("cultivarNombre", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.cultivarNombre}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.tipo || ""}
                                onChange={(e) => handleEditFormChange("tipo", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.tipo}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.empresaNombre || ""}
                                onChange={(e) => handleEditFormChange("empresaNombre", e.target.value)}
                                className="mt-1"
                                readOnly
                            />
                        ) : (
                            <div className="font-semibold">{lot.empresaNombre || "-"}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Origen</Label>
                        {isEditMode ? (
                            <Select
                                value={editFormData.origenValor || ""}
                                onValueChange={(value) => handleEditFormChange("origenValor", value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {origenes.map((origen) => (
                                        <SelectItem key={origen} value={origen}>
                                            {origen}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="font-semibold">{lot.origenValor}</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}