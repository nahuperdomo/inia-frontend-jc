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
                        <Label className="text-sm font-medium text-muted-foreground">Número de referencia</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.numeroReferencia || ""}
                                onChange={(e) => handleEditFormChange("numeroReferencia", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.numeroReferencia}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Número de ficha</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.numeroFicha?.toString() || ""}
                                onChange={(e) => handleEditFormChange("numeroFicha", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.numeroFicha}</div>
                        )}
                    </div>
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
                        <Label className="text-sm font-medium text-muted-foreground">Lote</Label>
                        {isEditMode ? (
                            <Input
                                value={editFormData.lote || ""}
                                onChange={(e) => handleEditFormChange("lote", e.target.value)}
                                className="mt-1"
                            />
                        ) : (
                            <div className="font-semibold">{lot.lote}</div>
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
                        <Label className="text-sm font-medium text-muted-foreground">Especie</Label>
                        {isEditMode ? (
                            <Select
                                value={editFormData.especieNombre || ""}
                                onValueChange={(value) => handleEditFormChange("especieNombre", value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {especies.map((especie) => (
                                        <SelectItem key={especie} value={especie}>
                                            {especie}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="font-semibold">{lot.especieNombre}</div>
                        )}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Origen</Label>
                        {isEditMode ? (
                            <Select
                                value={editFormData.origen || ""}
                                onValueChange={(value) => handleEditFormChange("origen", value)}
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
                            <div className="font-semibold">{lot.origen}</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}