"use client"

import React, { useState, useMemo, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    MessageCircle,
    Scale,
    Search,
    FlaskConical,
    Microscope,
    PieChart,
    FileText,
    Percent,
    Building2,
    Leaf,
    CheckCircle2,
    XCircle,
    Calendar,
    Calculator,
    ClipboardList
} from "lucide-react";
import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza";
import OtrosCultivosFields from "@/components/malezas-u-otros-cultivos/fields-otros-cultivos";
import BrassicaFields from "@/app/registro/analisis/dosn/fields/fields-brassica";

type Props = {
    formData: {
        fecha?: string;
        pesoInicial_g?: string;
        semillaPura_g?: string;
        materiaInerte_g?: string;
        otrosCultivos_g?: string;
        malezas_g?: string;
        malezasToleradas_g?: string;
        malezasTolCero_g?: string;
        pesoTotal_g?: string;
        
        redonSemillaPura?: string;
        redonMateriaInerte?: string;
        redonOtrosCultivos?: string;
        redonMalezas?: string;
        redonMalezasToleradas?: string;
        redonMalezasTolCero?: string;
        redonPesoTotal?: string;
        
        inasePura?: string;
        inaseMateriaInerte?: string;
        inaseOtrosCultivos?: string;
        inaseMalezas?: string;
        inaseMalezasToleradas?: string;
        inaseMalezasTolCero?: string;
        inaseFecha?: string;
        
        cumpleEstandar?: string;
        observaciones?: string;
        otrasSemillas?: any[];
        malezas?: any[];
        cultivos?: any[];
        brassicas?: any[];
        [key: string]: any;
    };
    handleInputChange: (field: string, value: any) => void;
    onChangeMalezas?: (list: any[]) => void;
    onChangeCultivos?: (list: any[]) => void;
    onChangeBrassicas?: (list: any[]) => void;
}

const PurezaFields = ({ formData, handleInputChange, onChangeMalezas, onChangeCultivos, onChangeBrassicas }: Props) => {
    const [activeTab, setActiveTab] = useState("generales");
    
    // Calcular porcentajes automáticamente en tiempo real (4 decimales)
    const porcentajes = useMemo(() => {
        const pesoInicial = parseFloat(formData.pesoInicial_g as string) || 0;
        const semillaPura = parseFloat(formData.semillaPura_g as string) || 0;
        const materiaInerte = parseFloat(formData.materiaInerte_g as string) || 0;
        const otrosCultivos = parseFloat(formData.otrosCultivos_g as string) || 0;
        const malezas = parseFloat(formData.malezas_g as string) || 0;
        const malezasToleradas = parseFloat(formData.malezasToleradas_g as string) || 0;
        const malezasTolCero = parseFloat(formData.malezasTolCero_g as string) || 0;

        console.log('=== DEBUG PORCENTAJES ===');
        console.log('Peso inicial:', pesoInicial, 'tipo:', typeof formData.pesoInicial_g);
        console.log('Semilla pura gramos:', semillaPura);
        console.log('Materia inerte gramos:', materiaInerte);
        console.log('Malezas tolerancia cero gramos:', malezasTolCero);
        
        if (pesoInicial === 0 || isNaN(pesoInicial)) {
            console.log('Peso inicial es 0 o NaN, retornando 0s');
            return {
                semillaPura: 0,
                materiaInerte: 0,
                otrosCultivos: 0,
                malezas: 0,
                malezasToleradas: 0,
                malezasTolCero: 0,
            };
        }
        
        const result = {
            semillaPura: (semillaPura / pesoInicial) * 100,
            materiaInerte: (materiaInerte / pesoInicial) * 100,
            otrosCultivos: (otrosCultivos / pesoInicial) * 100,
            malezas: (malezas / pesoInicial) * 100,
            malezasToleradas: (malezasToleradas / pesoInicial) * 100,
            malezasTolCero: (malezasTolCero / pesoInicial) * 100,
        };
        
        console.log('Resultado porcentajes:', result);
        
        return result;
    }, [
        formData.pesoInicial_g,
        formData.semillaPura_g,
        formData.materiaInerte_g,
        formData.otrosCultivos_g,
        formData.malezas_g,
        formData.malezasToleradas_g,
        formData.malezasTolCero_g
    ]);

    // Validar que los porcentajes redondeados sumen 100
    // NOTA: redonPesoTotal NO se incluye porque se calcula automáticamente
    const sumaPorcentajesRedondeados = useMemo(() => {
        const suma = (
            parseFloat(formData.redonSemillaPura || "0") +
            parseFloat(formData.redonMateriaInerte || "0") +
            parseFloat(formData.redonOtrosCultivos || "0") +
            parseFloat(formData.redonMalezas || "0") +
            parseFloat(formData.redonMalezasToleradas || "0") +
            parseFloat(formData.redonMalezasTolCero || "0")
        );
        return suma.toFixed(2);
    }, [
        formData.redonSemillaPura,
        formData.redonMateriaInerte,
        formData.redonOtrosCultivos,
        formData.redonMalezas,
        formData.redonMalezasToleradas,
        formData.redonMalezasTolCero
    ]);

    // Calcular redonPesoTotal automáticamente (100 - suma de los otros)
    // Este representa cuánto falta para llegar a 100%
    const redonPesoTotalCalculado = useMemo(() => {
        const suma = (
            parseFloat(formData.redonSemillaPura || "0") +
            parseFloat(formData.redonMateriaInerte || "0") +
            parseFloat(formData.redonOtrosCultivos || "0") +
            parseFloat(formData.redonMalezas || "0") +
            parseFloat(formData.redonMalezasToleradas || "0") +
            parseFloat(formData.redonMalezasTolCero || "0")
        );
        // Mostrar la suma total de todos los porcentajes
        return suma.toFixed(2);
    }, [
        formData.redonSemillaPura,
        formData.redonMateriaInerte,
        formData.redonOtrosCultivos,
        formData.redonMalezas,
        formData.redonMalezasToleradas,
        formData.redonMalezasTolCero
    ]);

    // Sincronizar redonPesoTotal calculado con formData para que se envíe en el payload
    useEffect(() => {
        handleInputChange("redonPesoTotal", redonPesoTotalCalculado);
    }, [redonPesoTotalCalculado]);

    return (
        <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                        <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-foreground">
                            Análisis de Pureza Física
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Análisis cuantitativo de componentes de semillas
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Observaciones - Arriba, fuera de tabs como en DOSN */}
                <Card className="border-0 shadow-sm mb-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Observaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Ingrese observaciones específicas del análisis de pureza física, condiciones especiales, particularidades encontradas u otra información relevante..."
                            value={formData.observaciones || ""}
                            onChange={(e) => handleInputChange("observaciones", e.target.value)}
                            rows={6}
                            className="resize-y min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap gap-2 w-full mb-6">
                        <TabsTrigger value="generales" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4" />
                            Datos generales
                        </TabsTrigger>
                        <TabsTrigger value="registros" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <ClipboardList className="h-4 w-4" />
                            Registros
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generales" className="space-y-6">
                        {/* SECCIÓN INIA */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">INIA</h3>
                                    <p className="text-sm text-muted-foreground">Instituto Nacional de Investigación Agropecuaria</p>
                                </div>
                            </div>

                            {/* Card 1: Fecha y Datos en Gramos */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Fecha y Valores en Gramos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {/* Fecha */}
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                Fecha del análisis *
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.fecha || ""}
                                                onChange={(e) => handleInputChange("fecha", e.target.value)}
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Peso Inicial */}
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-muted-foreground" />
                                                Peso inicial (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.pesoInicial_g || ""}
                                                onChange={(e) => handleInputChange("pesoInicial_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Semilla Pura */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-green-600" />
                                                Semilla pura (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.semillaPura_g || ""}
                                                onChange={(e) => handleInputChange("semillaPura_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Materia Inerte */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Microscope className="h-4 w-4 text-amber-600" />
                                                Materia inerte (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.materiaInerte_g || ""}
                                                onChange={(e) => handleInputChange("materiaInerte_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Otros Cultivos */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <PieChart className="h-4 w-4 text-purple-600" />
                                                Otros cultivos (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.otrosCultivos_g || ""}
                                                onChange={(e) => handleInputChange("otrosCultivos_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Malezas */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-orange-600" />
                                                Malezas (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.malezas_g || ""}
                                                onChange={(e) => handleInputChange("malezas_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Malezas Toleradas */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-pink-600" />
                                                Malezas toleradas (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.malezasToleradas_g || ""}
                                                onChange={(e) => handleInputChange("malezasToleradas_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Malezas Tolerancia Cero */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-red-600" />
                                                Malezas tol. cero (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.malezasTolCero_g || ""}
                                                onChange={(e) => handleInputChange("malezasTolCero_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Peso Total */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-muted-foreground" />
                                                Peso total (g) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.pesoTotal_g || ""}
                                                onChange={(e) => handleInputChange("pesoTotal_g", e.target.value)}
                                                placeholder="0.000"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Porcentajes SIN REDONDEO (Calculados Automáticamente) */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Calculator className="h-4 w-4 text-emerald-600" />
                                        Porcentajes sin Redondeo (Automático - 4 decimales)
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Calculados automáticamente en tiempo real</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Semilla Pura % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-green-600" />
                                                Semilla pura (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.semillaPura.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-emerald-50 border-emerald-300 font-semibold text-emerald-700"
                                            />
                                        </div>

                                        {/* Materia Inerte % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Microscope className="h-4 w-4 text-amber-600" />
                                                Materia inerte (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.materiaInerte.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-amber-50 border-amber-300 font-semibold text-amber-700"
                                            />
                                        </div>

                                        {/* Otros Cultivos % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <PieChart className="h-4 w-4 text-purple-600" />
                                                Otros cultivos (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.otrosCultivos.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-purple-50 border-purple-300 font-semibold text-purple-700"
                                            />
                                        </div>

                                        {/* Malezas % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-orange-600" />
                                                Malezas (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.malezas.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-orange-50 border-orange-300 font-semibold text-orange-700"
                                            />
                                        </div>

                                        {/* Malezas Toleradas % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-pink-600" />
                                                Malezas toleradas (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.malezasToleradas.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-pink-50 border-pink-300 font-semibold text-pink-700"
                                            />
                                        </div>

                                        {/* Malezas Tolerancia Cero % */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-red-600" />
                                                Malezas tol. cero (%)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={porcentajes.malezasTolCero.toFixed(4)}
                                                readOnly
                                                className="h-11 bg-red-50 border-red-300 font-semibold text-red-700"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 3: Porcentajes CON REDONDEO (Manual) */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-blue-600" />
                                        Porcentajes con Redondeo (Manual)
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Ingrese manualmente los valores redondeados. La suma debe ser 100%</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Semilla Pura Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-green-600" />
                                                Semilla pura (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "tr" : (formData.redonSemillaPura || "")}
                                                onChange={(e) => handleInputChange("redonSemillaPura", e.target.value)}
                                                placeholder={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Materia Inerte Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Microscope className="h-4 w-4 text-amber-600" />
                                                Materia inerte (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "tr" : (formData.redonMateriaInerte || "")}
                                                onChange={(e) => handleInputChange("redonMateriaInerte", e.target.value)}
                                                placeholder={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Otros Cultivos Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <PieChart className="h-4 w-4 text-purple-600" />
                                                Otros cultivos (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "tr" : (formData.redonOtrosCultivos || "")}
                                                onChange={(e) => handleInputChange("redonOtrosCultivos", e.target.value)}
                                                placeholder={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Malezas Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-orange-600" />
                                                Malezas (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "tr" : (formData.redonMalezas || "")}
                                                onChange={(e) => handleInputChange("redonMalezas", e.target.value)}
                                                placeholder={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.malezas > 0 && porcentajes.malezas < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Malezas Toleradas Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-pink-600" />
                                                Malezas toleradas (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "tr" : (formData.redonMalezasToleradas || "")}
                                                onChange={(e) => handleInputChange("redonMalezasToleradas", e.target.value)}
                                                placeholder={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Malezas Tolerancia Cero Redondeado */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-red-600" />
                                                Malezas tol. cero (%)
                                            </Label>
                                            <Input
                                                type={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "text" : "number"}
                                                step="0.01"
                                                value={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "tr" : (formData.redonMalezasTolCero || "")}
                                                onChange={(e) => handleInputChange("redonMalezasTolCero", e.target.value)}
                                                placeholder={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "tr" : "0.00"}
                                                readOnly={porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05}
                                                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "bg-muted italic" : ""}`}
                                            />
                                        </div>

                                        {/* Peso Total Redondeado - AUTO CALCULADO */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-blue-600" />
                                                Peso total (%) - Auto
                                            </Label>
                                            <Input
                                                type="text"
                                                value={redonPesoTotalCalculado}
                                                readOnly
                                                className="h-11 bg-blue-50 border-blue-300 font-semibold text-blue-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Validación de Suma = 100 */}
                                    <Alert className={`mt-4 ${sumaPorcentajesRedondeados === "100.00" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                                        <AlertDescription className={sumaPorcentajesRedondeados === "100.00" ? "text-green-800" : "text-red-800"}>
                                            <div className="flex items-center gap-2 font-semibold">
                                                {sumaPorcentajesRedondeados === "100.00" ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Suma correcta: {sumaPorcentajesRedondeados}%
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4" />
                                                        Suma incorrecta: {sumaPorcentajesRedondeados}% (debe ser 100.00%)
                                                    </>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECCIÓN INASE */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">INASE</h3>
                                    <p className="text-sm text-muted-foreground">Instituto Nacional de Semillas</p>
                                </div>
                            </div>

                            {/* Card 4: Porcentajes INASE */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-blue-600" />
                                        Porcentajes INASE
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Ingrese los porcentajes oficiales de INASE</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* INASE Semilla Pura */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-blue-600" />
                                                Semilla pura (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inasePura || ""}
                                                onChange={(e) => handleInputChange("inasePura", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Materia Inerte */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Microscope className="h-4 w-4 text-blue-600" />
                                                Materia inerte (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inaseMateriaInerte || ""}
                                                onChange={(e) => handleInputChange("inaseMateriaInerte", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Otros Cultivos */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <PieChart className="h-4 w-4 text-blue-600" />
                                                Otros cultivos (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inaseOtrosCultivos || ""}
                                                onChange={(e) => handleInputChange("inaseOtrosCultivos", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Malezas */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-blue-600" />
                                                Malezas (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inaseMalezas || ""}
                                                onChange={(e) => handleInputChange("inaseMalezas", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Malezas Toleradas */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                Malezas toleradas (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inaseMalezasToleradas || ""}
                                                onChange={(e) => handleInputChange("inaseMalezasToleradas", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Malezas Tolerancia Cero */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-red-600" />
                                                Malezas tol. cero (%)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.inaseMalezasTolCero || ""}
                                                onChange={(e) => handleInputChange("inaseMalezasTolCero", e.target.value)}
                                                placeholder="0.00"
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* INASE Fecha */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                Fecha INASE
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.inaseFecha || ""}
                                                onChange={(e) => handleInputChange("inaseFecha", e.target.value)}
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Card 5: Cumple Estándar */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Cumplimiento del Estándar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Estado de cumplimiento</Label>
                                    <Select
                                        value={formData.cumpleEstandar || ""}
                                        onValueChange={(value) => handleInputChange("cumpleEstandar", value)}
                                    >
                                        <SelectTrigger className="w-full h-11 border rounded-md shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="si">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Cumple con el estándar
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="no">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    No cumple con el estándar
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Mensaje dinámico */}
                                {formData.cumpleEstandar && (
                                    <div
                                        className={`mt-4 rounded-lg border p-4 transition-colors ${formData.cumpleEstandar === "si"
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-red-50 border-red-200"
                                            }`}
                                    >
                                        <div
                                            className={`flex items-center gap-2 ${formData.cumpleEstandar === "si"
                                                ? "text-emerald-800"
                                                : "text-red-800"
                                                }`}
                                        >
                                            {formData.cumpleEstandar === "si" ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="font-semibold">La muestra cumple con los estándares establecidos</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="font-semibold">La muestra NO cumple con los estándares establecidos</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="registros" className="space-y-6">
                        <MalezaFields titulo="Malezas" registros={formData.malezas && formData.malezas.length > 0 ? formData.malezas : undefined} onChangeListados={onChangeMalezas} />
                        <OtrosCultivosFields registros={formData.cultivos && formData.cultivos.length > 0 ? formData.cultivos : undefined} onChangeListados={onChangeCultivos} />
                        <BrassicaFields registros={formData.brassicas && formData.brassicas.length > 0 ? formData.brassicas : undefined} onChangeListados={onChangeBrassicas} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default PurezaFields;
