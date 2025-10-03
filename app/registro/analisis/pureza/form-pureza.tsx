"use client"

import React from "react";
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
    MessageCircle,
    Scale,
    Search,
    FlaskConical,
    Microscope,
    PieChart,
    BarChartHorizontal
} from "lucide-react";

type Props = {
    formData: {
        pesoInicial?: string;
        semillaPura?: string;
        materiaInerte?: string;
        otrosCultivos?: string;
        malezas?: string;
        malezasToleridas?: string;
        pesoTotal?: string;
        observaciones?: string;
        [key: string]: any; // Para permitir campos adicionales
    };
    handleInputChange: (field: string, value: any) => void;
}

export default function PurezaFields({ formData = {}, handleInputChange = () => { } }: Props = { formData: {}, handleInputChange: () => { } }) {
    // Para usar el componente de forma independiente (con estado propio)
    const [localFormData, setLocalFormData] = React.useState({
        pesoInicial: '',
        semillaPura: '',
        materiaInerte: '',
        otrosCultivos: '',
        malezas: '',
        malezasToleridas: '',
        pesoTotal: '',
        observaciones: ''
    });

    // Función para manejar cambios en campos cuando se usa de forma independiente
    const handleLocalChange = (field: string, value: any) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
    };

    // Usar los datos y función externa si se proporcionan, o los locales si no
    const data = Object.keys(formData).length > 0 ? formData : localFormData;
    const handleChange = handleInputChange || handleLocalChange;

    // Calcular la suma total de los componentes
    React.useEffect(() => {
        const pesoInicial = parseFloat(data.pesoInicial || "0");
        const semillaPura = parseFloat(data.semillaPura || "0");
        const materiaInerte = parseFloat(data.materiaInerte || "0");
        const otrosCultivos = parseFloat(data.otrosCultivos || "0");
        const malezas = parseFloat(data.malezas || "0");

        const total = semillaPura + materiaInerte + otrosCultivos + malezas;

        // Solo actualizar si hay una diferencia significativa
        if (Math.abs(pesoInicial - total) > 0.01 && pesoInicial > 0) {
            // Agregar información de diferencia si existe
            const diferencia = (pesoInicial - total).toFixed(2);
            const mensaje = `Diferencia con peso inicial: ${diferencia}g`;

            if (data.observaciones && !data.observaciones.includes(mensaje)) {
                handleChange("observaciones", `${data.observaciones || ""}\n${mensaje}`);
            }
        }
    }, [data.pesoInicial, data.semillaPura, data.materiaInerte, data.otrosCultivos, data.malezas]);

    return (
        <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-foreground">
                            Análisis de Pureza Física
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Registra los componentes de pureza para la muestra seleccionada
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Componentes de pureza */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Componentes de la Muestra</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="pesoInicial" className="text-sm font-medium flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                Peso Inicial (g) *
                            </Label>
                            <Input
                                id="pesoInicial"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={data.pesoInicial || ""}
                                onChange={(e) => handleChange("pesoInicial", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semillaPura" className="text-sm font-medium flex items-center gap-2">
                                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                                Semilla Pura (g) *
                            </Label>
                            <Input
                                id="semillaPura"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={data.semillaPura || ""}
                                onChange={(e) => handleChange("semillaPura", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="materiaInerte" className="text-sm font-medium flex items-center gap-2">
                                <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
                                Materia Inerte (g) *
                            </Label>
                            <Input
                                id="materiaInerte"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={data.materiaInerte || ""}
                                onChange={(e) => handleChange("materiaInerte", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otrosCultivos" className="text-sm font-medium flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-muted-foreground" />
                                Otros Cultivos (g) *
                            </Label>
                            <Input
                                id="otrosCultivos"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={data.otrosCultivos || ""}
                                onChange={(e) => handleChange("otrosCultivos", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="malezas" className="text-sm font-medium flex items-center gap-2">
                                <Microscope className="h-4 w-4 text-muted-foreground" />
                                Malezas (g) *
                            </Label>
                            <Input
                                id="malezas"
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={data.malezas || ""}
                                onChange={(e) => handleChange("malezas", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="malezasToleridas" className="text-sm font-medium flex items-center gap-2">
                                <Microscope className="h-4 w-4 text-muted-foreground" />
                                Malezas Toleradas
                            </Label>
                            <Input
                                id="malezasToleridas"
                                placeholder="Especificar malezas toleradas"
                                value={data.malezasToleridas || ""}
                                onChange={(e) => handleChange("malezasToleridas", e.target.value)}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                            <p className="text-xs text-muted-foreground">
                                Detalle las malezas toleradas encontradas en el análisis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Configuración de peso total */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Configuración Adicional</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="pesoTotal" className="text-sm font-medium flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                Peso Total de Muestra
                            </Label>
                            <Select
                                value={data.pesoTotal || ""}
                                onValueChange={(v) => handleChange("pesoTotal", v)}
                            >
                                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200">
                                    <SelectValue placeholder="Seleccionar peso total" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5g">5g</SelectItem>
                                    <SelectItem value="10g">10g</SelectItem>
                                    <SelectItem value="25g">25g</SelectItem>
                                    <SelectItem value="50g">50g</SelectItem>
                                    <SelectItem value="100g">100g</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Tamaño estándar de muestra utilizada para el análisis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen de pesos y cálculo de totales */}
                {parseFloat(data.pesoInicial || "0") > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                                    <Scale className="h-4 w-4 text-blue-700" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-blue-900 mb-2">Resumen de Componentes</h4>
                                    <div className="space-y-2 text-sm text-blue-800">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-blue-700">Peso inicial:</span>
                                                <span className="font-medium float-right">{parseFloat(data.pesoInicial || "0").toFixed(2)}g</span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Semilla pura:</span>
                                                <span className="float-right">{parseFloat(data.semillaPura || "0").toFixed(2)}g</span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Materia inerte:</span>
                                                <span className="float-right">{parseFloat(data.materiaInerte || "0").toFixed(2)}g</span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Otros cultivos:</span>
                                                <span className="float-right">{parseFloat(data.otrosCultivos || "0").toFixed(2)}g</span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Malezas:</span>
                                                <span className="float-right">{parseFloat(data.malezas || "0").toFixed(2)}g</span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-blue-200 my-2"></div>

                                        <div className="font-medium flex justify-between">
                                            <span>Total componentes:</span>
                                            <span>{(
                                                parseFloat(data.semillaPura || "0") +
                                                parseFloat(data.materiaInerte || "0") +
                                                parseFloat(data.otrosCultivos || "0") +
                                                parseFloat(data.malezas || "0")
                                            ).toFixed(2)}g</span>
                                        </div>

                                        {Math.abs(parseFloat(data.pesoInicial || "0") - (
                                            parseFloat(data.semillaPura || "0") +
                                            parseFloat(data.materiaInerte || "0") +
                                            parseFloat(data.otrosCultivos || "0") +
                                            parseFloat(data.malezas || "0")
                                        )) > 0.01 && (
                                                <div className="flex justify-between text-red-600 font-medium">
                                                    <span>Diferencia:</span>
                                                    <span>{(parseFloat(data.pesoInicial || "0") - (
                                                        parseFloat(data.semillaPura || "0") +
                                                        parseFloat(data.materiaInerte || "0") +
                                                        parseFloat(data.otrosCultivos || "0") +
                                                        parseFloat(data.malezas || "0")
                                                    )).toFixed(2)}g</span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sección dedicada para comentarios de pureza física */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Comentarios y Observaciones</h3>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comentariosPureza" className="text-sm font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            Comentarios de Pureza Física
                        </Label>
                        <Textarea
                            id="comentariosPureza"
                            placeholder="Ingrese comentarios específicos del análisis de pureza física..."
                            value={data.observaciones || ""}
                            onChange={(e) => handleChange("observaciones", e.target.value)}
                            rows={4}
                            className="resize-y min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="text-xs text-muted-foreground">
                            Incluya observaciones sobre la muestra, condiciones del análisis, particularidades
                            encontradas u otra información relevante para documentar este análisis.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>);
}