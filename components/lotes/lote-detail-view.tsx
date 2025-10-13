"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Package, Building2, User, MapPin, Scale, Droplets, FileText } from "lucide-react";
import { LoteDTO } from "@/app/models";

interface LoteDetailViewProps {
    lote: LoteDTO;
    showActions?: boolean;
    className?: string;
}

// Función utilitaria para formatear fechas localmente (igual que en DOSN)
const formatearFechaLocal = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            const [year, month, day] = fechaString.split('-').map(Number)
            const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        // Si viene en otro formato, parsearlo de manera segura
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (error) {
        console.warn("Error al formatear fecha:", fechaString, error)
        return fechaString
    }
}

export function LoteDetailView({ lote, showActions = false, className }: LoteDetailViewProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Información General */}
            <Card className="overflow-hidden bg-background">
                <CardHeader className="bg-background border-b sticky top-[20px] z-20">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        Información General
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                ID Lote
                            </label>
                            <p className="text-2xl font-bold">{lote.loteID}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ficha</label>
                            <p className="text-2xl font-semibold">{lote.ficha}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Cultivar
                            </label>
                            <p className="text-lg font-medium">{lote.cultivarNombre || 'No especificado'}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Especie
                            </label>
                            <p className="text-lg font-medium">{lote.especieNombre || 'No especificado'}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Fecha de Ingreso
                            </label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p className="text-lg font-medium">
                                    {formatearFechaLocal(lote.fechaIngreso)}
                                </p>
                            </div>
                        </div>

                        {lote.fechaVencimiento && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Fecha de Vencimiento
                                </label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-lg font-medium">
                                        {formatearFechaLocal(lote.fechaVencimiento)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {lote.tipo && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Tipo
                                </label>
                                <p className="text-lg font-semibold">{lote.tipo}</p>
                            </div>
                        )}

                        {lote.origen && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Origen
                                </label>
                                <p className="text-lg font-semibold">{lote.origen}</p>
                            </div>
                        )}
                    </div>

                    {lote.observaciones && (
                        <>
                            <Separator className="my-6" />
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Observaciones
                                </label>
                                <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">{lote.observaciones}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Empresa y Cliente */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        Empresa y Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Empresa
                            </label>
                            <p className="text-lg font-semibold">
                                {lote.empresaNombre || 'No especificado'}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Cliente
                            </label>
                            <p className="text-lg font-semibold">{lote.clienteNombre || 'No especificado'}</p>
                        </div>
                        {lote.codigoCC && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Código CC
                                </label>
                                <p className="text-lg font-medium font-mono">{lote.codigoCC}</p>
                            </div>
                        )}
                        {lote.codigoFF && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Código FF
                                </label>
                                <p className="text-lg font-medium font-mono">{lote.codigoFF}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recepción y Almacenamiento */}
            {(lote.fechaEntrega || lote.fechaRecibo || lote.depositoAsignado || lote.remitente) && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            Recepción y Almacenamiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {lote.fechaEntrega && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Fecha de Entrega
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            {formatearFechaLocal(lote.fechaEntrega)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {lote.fechaRecibo && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Fecha de Recibo
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            {formatearFechaLocal(lote.fechaRecibo)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {lote.depositoAsignado && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Depósito Asignado
                                    </label>
                                    <p className="text-lg font-semibold">{lote.depositoAsignado}</p>
                                </div>
                            )}
                            {lote.unidadEmbolsado && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Unidad de Embolsado
                                    </label>
                                    <p className="text-lg font-semibold">{lote.unidadEmbolsado}</p>
                                </div>
                            )}
                            {lote.remitente && (
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Remitente
                                    </label>
                                    <p className="text-lg font-medium">{lote.remitente}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Calidad y Producción */}
            {(lote.kilosBrutos || lote.kilosLimpios || lote.humedad || lote.catSeed) && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Scale className="h-5 w-5 text-orange-600" />
                            </div>
                            Calidad y Producción
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lote.kilosBrutos && (
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-lg p-4 text-center space-y-2">
                                    <p className="text-3xl font-bold text-blue-600">{lote.kilosBrutos}</p>
                                    <p className="text-sm font-medium text-muted-foreground">Kilos Brutos</p>
                                </div>
                            )}
                            {lote.kilosLimpios && (
                                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-lg p-4 text-center space-y-2">
                                    <p className="text-3xl font-bold text-green-600">{lote.kilosLimpios}</p>
                                    <p className="text-sm font-medium text-muted-foreground">Kilos Limpios</p>
                                </div>
                            )}
                            {lote.humedad && (
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-lg p-4 text-center space-y-2">
                                    <p className="text-3xl font-bold text-purple-600">{lote.humedad}</p>
                                    <p className="text-sm font-medium text-muted-foreground">Humedad</p>
                                </div>
                            )}
                            {lote.catSeed && (
                                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-200/50 rounded-lg p-4 text-center space-y-2">
                                    <p className="text-3xl font-bold text-yellow-600">{lote.catSeed}</p>
                                    <p className="text-sm font-medium text-muted-foreground">Cat Seed</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Datos de Humedad */}
            {lote.datosHumedad && lote.datosHumedad.length > 0 && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                                <Droplets className="h-5 w-5 text-cyan-600" />
                            </div>
                            Datos de Humedad
                            <Badge variant="secondary" className="ml-auto">
                                {lote.datosHumedad.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {lote.datosHumedad.map((dato, index) => (
                                <div
                                    key={index}
                                    className="bg-muted/30 border rounded-xl p-5 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Humedad ID
                                            </label>
                                            <p className="text-base font-semibold">{dato.humedadID}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Porcentaje
                                            </label>
                                            <p className="text-base font-medium">{dato.porcentaje}%</p>
                                        </div>
                                        {dato.observaciones && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Observaciones
                                                </label>
                                                <p className="text-base font-medium">{dato.observaciones}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default LoteDetailView;