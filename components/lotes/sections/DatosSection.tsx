"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { LoteDTO } from "@/app/models"

interface DatosSectionProps {
    lot: LoteDTO
}

export function DatosSection({ lot }: DatosSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="h-5 w-5" />
                    Datos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Ficha</Label>
                        <div className="font-semibold mt-1">{lot.ficha}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nombre Lote</Label>
                        <div className="font-semibold mt-1">{lot.nomLote || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Especie</Label>
                        <div className="font-semibold mt-1">{lot.especieNombre || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Cultivar</Label>
                        <div className="font-semibold mt-1">{lot.cultivarNombre || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                        <div className="font-semibold mt-1">{lot.tipo || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Código CC</Label>
                        <div className="font-semibold mt-1">{lot.codigoCC || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Código FF</Label>
                        <div className="font-semibold mt-1">{lot.codigoFF || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Origen</Label>
                        <div className="font-semibold mt-1">{lot.origenValor || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                        <div className="font-semibold mt-1">{lot.estadoValor || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Número de Artículo</Label>
                        <div className="font-semibold mt-1">{lot.numeroArticuloValor || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Kilos Limpios</Label>
                        <div className="font-semibold mt-1">{lot.kilosLimpios || "-"}</div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha Cosecha</Label>
                        <div className="font-semibold mt-1">
                            {lot.fechaCosecha ? new Date(lot.fechaCosecha).toLocaleDateString('es-ES') : "-"}
                        </div>
                    </div>
                </div>
                
                {/* Datos de Humedad */}
                {lot.datosHumedad && lot.datosHumedad.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Datos de Humedad</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {lot.datosHumedad.map((humedad: any, index) => {
                                // Soportar ambos formatos: DatosHumedadDTO y el formato del request
                                const nombre = humedad.humedadNombre || humedad.tipoHumedadNombre || `Humedad ${index + 1}`;
                                const valor = humedad.porcentaje ?? humedad.valor;
                                
                                return (
                                    <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                        <div className="text-xs font-medium text-blue-700 mb-1">
                                            {nombre}
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900">
                                            {valor !== undefined && valor !== null 
                                                ? `${valor}%` 
                                                : 'N/A'}
                                        </div>
                                        {humedad.observaciones && (
                                            <div className="text-xs text-blue-600 mt-1 italic">
                                                {humedad.observaciones}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
