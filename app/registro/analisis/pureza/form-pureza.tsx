"use client"

import React, { useState } from "react";
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
    BarChartHorizontal,
    FileText,
    Percent,
    Building2,
    AlertTriangle,
    Leaf,
    Droplets,
    CheckCircle2
} from "lucide-react";
import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza";

type Props = {
    formData: {
        pesoInicial?: string;
        semillaPura?: string;
        materiaInerte?: string;
        otrosCultivos?: string;
        malezas?: string;
        malezasToleridas?: string;
        malezasToleranciasCero?: string;
        pesoTotal?: string;
        semillaPuraPorcentaje?: string;
        materiaInertePorcentaje?: string;
        otrosCultivosPorcentaje?: string;
        malezasPorcentaje?: string;
        malezasTolerididasPorcentaje?: string;
        malezasToleranciasCeroPorcentaje?: string;
        semillaPuraRedondeado?: string;
        materiaInerteRedondeado?: string;
        otrosCultivosRedondeado?: string;
        malezasRedondeado?: string;
        malezasTolerididasRedondeado?: string;
        malezasToleranciasCeroRedondeado?: string;
        iniaSemillaPuraPorcentaje?: string;
        iniaMateriaInertePorcentaje?: string;
        iniaOtrosCultivosPorcentaje?: string;
        iniaMalezasPorcentaje?: string;
        iniaMalezasTolerididasPorcentaje?: string;
        iniaMalezasToleranciasCeroPorcentaje?: string;
        inaseSemillaPuraPorcentaje?: string;
        inaseMateriaInertePorcentaje?: string;
        inaseOtrosCultivosPorcentaje?: string;
        inaseMalezasPorcentaje?: string;
        inaseMalezasTolerididasPorcentaje?: string;
        inaseMalezasToleranciasCeroPorcentaje?: string;
        alertaDiferenciaPeso?: string;
        observaciones?: string;
        [key: string]: any;
    };
    handleInputChange: (field: string, value: any) => void;
    onChangeMalezas?: (list: any[]) => void;
}

// Componente reutilizable para campos de pureza - FUERA del componente principal
const CampoPureza = ({
    numero,
    titulo,
    icono: Icono,
    colorClase = "blue",
    campoGramos,
    campoPorcentaje,
    campoRedondeado,
    requerido = false,
    formData,
    handleInputChange
}: any) => {
    const colores: any = {
        blue: "border-blue-200 bg-blue-50",
        green: "border-green-200 bg-green-50",
        amber: "border-amber-200 bg-amber-50",
        purple: "border-purple-200 bg-purple-50",
        orange: "border-orange-200 bg-orange-50",
        pink: "border-pink-200 bg-pink-50"
    };

    return (
        <Card className={`border ${colores[colorClase] || colores.blue}`}>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${colorClase}-100`}>
                            <Icono className={`h-5 w-5 text-${colorClase}-600`} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-base">{numero}. {titulo}</h4>
                            {requerido && <span className="text-xs text-red-600">* Campo requerido</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                Gramos (g)
                            </Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData[campoGramos] || ""}
                                onChange={(e) => handleInputChange(campoGramos, e.target.value)}
                                placeholder="0.000"
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200 bg-white"
                            />
                        </div>

                        {campoPorcentaje && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                    Porcentaje (%)
                                </Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={formData[campoPorcentaje] || ""}
                                    onChange={(e) => handleInputChange(campoPorcentaje, e.target.value)}
                                    placeholder="0.00"
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200 bg-white"
                                />
                            </div>
                        )}

                        {campoRedondeado && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                    % Redondeado
                                </Label>
                                <Input
                                    type="text"
                                    value={formData[campoRedondeado] || ""}
                                    onChange={(e) => handleInputChange(campoRedondeado, e.target.value)}
                                    placeholder="0"
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200 bg-white"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const PurezaFields = ({ formData, handleInputChange, onChangeMalezas }: Props) => {
    const [activeTab, setActiveTab] = useState("datos-principales");

    // Calcular la diferencia de peso (solo para mostrar, sin modificar el estado)
    const calcularDiferenciaPeso = React.useMemo(() => {
        const pesoInicial = parseFloat(formData.pesoInicial || "0");
        const semillaPura = parseFloat(formData.semillaPura || "0");
        const materiaInerte = parseFloat(formData.materiaInerte || "0");
        const otrosCultivos = parseFloat(formData.otrosCultivos || "0");
        const malezas = parseFloat(formData.malezas || "0");
        const malezasToleridas = parseFloat(formData.malezasToleridas || "0");
        const malezasToleranciasCero = parseFloat(formData.malezasToleranciasCero || "0");

        if (pesoInicial <= 0) {
            return {
                mensaje: "Ingrese el peso inicial para calcular",
                esAlerta: false,
                mostrarCalculo: false
            };
        }

        const totalComponentes = semillaPura + materiaInerte + otrosCultivos + malezas + malezasToleridas + malezasToleranciasCero;

        if (totalComponentes === 0) {
            return {
                mensaje: "Ingrese los componentes para calcular",
                esAlerta: false,
                mostrarCalculo: false
            };
        }

        const diferencia = totalComponentes - pesoInicial;
        const porcentajeDiferencia = (diferencia / pesoInicial) * 100;
        const porcentajeAbsoluto = Math.abs(porcentajeDiferencia);

        const formula = `(${totalComponentes.toFixed(3)} - ${pesoInicial.toFixed(3)}) / ${pesoInicial.toFixed(3)} × 100 = ${porcentajeDiferencia.toFixed(2)}%`;
        const esAlerta = porcentajeAbsoluto >= 5;

        const mensaje = esAlerta
            ? `⚠️ ALERTA: Diferencia de ${porcentajeAbsoluto.toFixed(2)}% (≥5%)`
            : `✓ OK: Diferencia de ${porcentajeAbsoluto.toFixed(2)}% (<5%)`;

        return {
            formula,
            porcentajeDiferencia: porcentajeDiferencia.toFixed(2),
            porcentajeAbsoluto: porcentajeAbsoluto.toFixed(2),
            mensaje,
            esAlerta,
            mostrarCalculo: true,
            totalComponentes: totalComponentes.toFixed(3),
            diferencia: diferencia.toFixed(3)
        };
    }, [
        formData.pesoInicial,
        formData.semillaPura,
        formData.materiaInerte,
        formData.otrosCultivos,
        formData.malezas,
        formData.malezasToleridas,
        formData.malezasToleranciasCero
    ]);

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
                            Registre los componentes y porcentajes del análisis de pureza
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6 h-auto gap-2">
                        <TabsTrigger value="datos-principales" className="flex items-center gap-2 py-3">
                            <Scale className="h-4 w-4" />
                            <span className="hidden sm:inline">Datos Principales</span>
                            <span className="sm:hidden">Datos</span>
                        </TabsTrigger>
                        <TabsTrigger value="inia-porcentajes" className="flex items-center gap-2 py-3">
                            <Building2 className="h-4 w-4" />
                            <span className="hidden sm:inline">INIA %</span>
                            <span className="sm:hidden">INIA</span>
                        </TabsTrigger>
                        <TabsTrigger value="inase-porcentajes" className="flex items-center gap-2 py-3">
                            <Building2 className="h-4 w-4" />
                            <span className="hidden sm:inline">INASE %</span>
                            <span className="sm:hidden">INASE</span>
                        </TabsTrigger>
                        <TabsTrigger value="detalle-malezas" className="flex items-center gap-2 py-3">
                            <Microscope className="h-4 w-4" />
                            <span className="hidden sm:inline">Detalle Malezas</span>
                            <span className="sm:hidden">Malezas</span>
                        </TabsTrigger>
                        <TabsTrigger value="observaciones" className="flex items-center gap-2 py-3">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Observaciones</span>
                            <span className="sm:hidden">Obs.</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Datos Principales */}
                    <TabsContent value="datos-principales" className="space-y-6">
                        <div className="space-y-6">
                            {/* Peso Inicial */}
                            <Card className="border border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-200">
                                            <Scale className="h-5 w-5 text-blue-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base">1. Peso Inicial</h4>
                                            <span className="text-xs text-red-600">* Campo requerido</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Peso inicial de la muestra (g)</Label>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.pesoInicial || ""}
                                            onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                                            placeholder="Ej: 100.000"
                                            className="h-12 text-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-300 bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Peso de la muestra antes de separar los componentes
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Semilla Pura */}
                            <CampoPureza
                                numero="2"
                                titulo="Semilla Pura"
                                icono={FlaskConical}
                                colorClase="green"
                                campoGramos="semillaPura"
                                campoPorcentaje="semillaPuraPorcentaje"
                                campoRedondeado="semillaPuraRedondeado"
                                requerido
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Materia Inerte */}
                            <CampoPureza
                                numero="3"
                                titulo="Materia Inerte"
                                icono={Droplets}
                                colorClase="amber"
                                campoGramos="materiaInerte"
                                campoPorcentaje="materiaInertePorcentaje"
                                campoRedondeado="materiaInerteRedondeado"
                                requerido
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Otros Cultivos */}
                            <CampoPureza
                                numero="4"
                                titulo="Otros Cultivos"
                                icono={PieChart}
                                colorClase="purple"
                                campoGramos="otrosCultivos"
                                campoPorcentaje="otrosCultivosPorcentaje"
                                campoRedondeado="otrosCultivosRedondeado"
                                requerido
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Malezas */}
                            <CampoPureza
                                numero="5"
                                titulo="Malezas"
                                icono={Leaf}
                                colorClase="orange"
                                campoGramos="malezas"
                                campoPorcentaje="malezasPorcentaje"
                                campoRedondeado="malezasRedondeado"
                                requerido
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Malezas Toleradas */}
                            <CampoPureza
                                numero="6"
                                titulo="Malezas Toleradas"
                                icono={Microscope}
                                colorClase="pink"
                                campoGramos="malezasToleridas"
                                campoPorcentaje="malezasTolerididasPorcentaje"
                                campoRedondeado="malezasTolerididasRedondeado"
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Malezas con Tolerancia Cero */}
                            <CampoPureza
                                numero="7"
                                titulo="Malezas con Tolerancia Cero"
                                icono={AlertTriangle}
                                colorClase="orange"
                                campoGramos="malezasToleranciasCero"
                                campoPorcentaje="malezasToleranciasCeroPorcentaje"
                                campoRedondeado="malezasToleranciasCeroRedondeado"
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            {/* Peso Total */}
                            <Card className="border border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-200">
                                            <Scale className="h-5 w-5 text-purple-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base">8. Peso Total</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Seleccione el peso total utilizado</Label>
                                        <Select
                                            value={formData.pesoTotal || ""}
                                            onValueChange={(value) => handleInputChange("pesoTotal", value)}
                                        >
                                            <SelectTrigger className="h-11 bg-white transition-all duration-200 focus:ring-2 focus:ring-purple-300">
                                                <SelectValue placeholder="Seleccione un peso estándar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3.000">3.000 g</SelectItem>
                                                <SelectItem value="5.000">5.000 g</SelectItem>
                                                <SelectItem value="10.000">10.000 g</SelectItem>
                                                <SelectItem value="25.000">25.000 g</SelectItem>
                                                <SelectItem value="50.000">50.000 g</SelectItem>
                                                <SelectItem value="100.000">100.000 g</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alerta Diferencia de Peso */}
                            <Card className={`border ${calcularDiferenciaPeso.esAlerta
                                ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                                : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100'
                                }`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${calcularDiferenciaPeso.esAlerta ? 'bg-red-200' : 'bg-green-200'
                                            }`}>
                                            <AlertTriangle className={`h-5 w-5 ${calcularDiferenciaPeso.esAlerta ? 'text-red-700' : 'text-green-700'
                                                }`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base">9. Alerta Diferencia de Peso</h4>
                                            <span className="text-xs text-muted-foreground">Cálculo automático</span>
                                        </div>
                                    </div>

                                    {calcularDiferenciaPeso.mostrarCalculo ? (
                                        <div className="space-y-3">
                                            {/* Resumen visual */}
                                            <Alert className={`${calcularDiferenciaPeso.esAlerta
                                                ? 'border-red-400 bg-red-100'
                                                : 'border-green-400 bg-green-100'
                                                }`}>
                                                <AlertDescription className={
                                                    calcularDiferenciaPeso.esAlerta ? 'text-red-900' : 'text-green-900'
                                                }>
                                                    <div className="font-semibold text-lg mb-2">
                                                        {calcularDiferenciaPeso.mensaje}
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <p>• Peso inicial: <strong>{formData.pesoInicial || '0'} g</strong></p>
                                                        <p>• Total componentes: <strong>{calcularDiferenciaPeso.totalComponentes} g</strong></p>
                                                        <p>• Diferencia: <strong>{calcularDiferenciaPeso.diferencia} g</strong></p>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>

                                            {/* Fórmula detallada */}
                                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                <Label className="text-xs font-medium text-gray-600 mb-1 block">
                                                    Fórmula de cálculo:
                                                </Label>
                                                <code className="text-sm font-mono text-gray-800 break-all">
                                                    {calcularDiferenciaPeso.formula}
                                                </code>
                                            </div>

                                            {/* Campo manual opcional */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Notas adicionales (opcional)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={formData.alertaDiferenciaPeso || ""}
                                                    onChange={(e) => handleInputChange("alertaDiferenciaPeso", e.target.value)}
                                                    placeholder="Ingrese observaciones adicionales si es necesario..."
                                                    className={`h-11 transition-all duration-200 ${calcularDiferenciaPeso.esAlerta
                                                        ? 'focus:ring-2 focus:ring-red-300'
                                                        : 'focus:ring-2 focus:ring-green-300'
                                                        } bg-white`}
                                                />
                                            </div>

                                            {calcularDiferenciaPeso.esAlerta && (
                                                <Alert className="border-amber-300 bg-amber-50">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    <AlertDescription className="text-amber-900 text-sm">
                                                        <strong>Recomendación:</strong> La diferencia es ≥5%.
                                                        Por favor, verifique los valores ingresados o documente la razón de la diferencia.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ) : (
                                        <Alert className="border-gray-300 bg-gray-50">
                                            <AlertDescription className="text-gray-600">
                                                {calcularDiferenciaPeso.mensaje}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAB: INIA Porcentajes */}
                    <TabsContent value="inia-porcentajes" className="space-y-6">
                        <div className="space-y-4">
                            <Alert className="border-emerald-300 bg-emerald-50">
                                <Building2 className="h-4 w-4 text-emerald-600" />
                                <AlertDescription className="text-emerald-800">
                                    <strong>INIA - Instituto Nacional de Investigación Agropecuaria</strong>
                                    <br />
                                    Ingrese los porcentajes oficiales para el registro de INIA
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FlaskConical className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Semilla pura (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaSemillaPuraPorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaSemillaPuraPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChartHorizontal className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Materia inerte (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaMateriaInertePorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaMateriaInertePorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <PieChart className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Otros cultivos (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaOtrosCultivosPorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaOtrosCultivosPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Microscope className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Malezas (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaMalezasPorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaMalezasPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Malezas toleradas (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaMalezasTolerididasPorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaMalezasTolerididasPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-emerald-600" />
                                            <Label className="text-sm font-medium text-emerald-900">Malezas tolerancia cero (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.iniaMalezasToleranciasCeroPorcentaje || ""}
                                            onChange={(e) => handleInputChange("iniaMalezasToleranciasCeroPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: INASE Porcentajes */}
                    <TabsContent value="inase-porcentajes" className="space-y-6">
                        <div className="space-y-4">
                            <Alert className="border-indigo-300 bg-indigo-50">
                                <Building2 className="h-4 w-4 text-indigo-600" />
                                <AlertDescription className="text-indigo-800">
                                    <strong>INASE - Instituto Nacional de Semillas</strong>
                                    <br />
                                    Ingrese los porcentajes oficiales para el registro de INASE
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FlaskConical className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Semilla pura (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseSemillaPuraPorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseSemillaPuraPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChartHorizontal className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Materia inerte (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseMateriaInertePorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseMateriaInertePorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <PieChart className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Otros cultivos (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseOtrosCultivosPorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseOtrosCultivosPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Microscope className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Malezas (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseMalezasPorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseMalezasPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Malezas toleradas (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseMalezasTolerididasPorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseMalezasTolerididasPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-indigo-200 bg-indigo-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-indigo-600" />
                                            <Label className="text-sm font-medium text-indigo-900">Malezas tolerancia cero (%)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.inaseMalezasToleranciasCeroPorcentaje || ""}
                                            onChange={(e) => handleInputChange("inaseMalezasToleranciasCeroPorcentaje", e.target.value)}
                                            placeholder="0.00"
                                            className="h-11 bg-white border-indigo-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: Detalle de Malezas */}
                    <TabsContent value="detalle-malezas" className="space-y-6">
                        <Alert className="border-blue-300 bg-blue-50">
                            <Microscope className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                Esta sección permite registrar el detalle específico de las malezas encontradas
                                durante el análisis de pureza física.
                            </AlertDescription>
                        </Alert>

                        <MalezaFields
                            titulo="Identificación Detallada de Malezas"
                            registros={[]}
                            onChangeListados={onChangeMalezas}
                        />
                    </TabsContent>

                    {/* TAB: Observaciones */}
                    <TabsContent value="observaciones" className="space-y-6">
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-200">
                                        <MessageCircle className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-base">Observaciones del Análisis</h4>
                                        <p className="text-xs text-muted-foreground">Campo opcional para notas adicionales</p>
                                    </div>
                                </div>
                                <Textarea
                                    placeholder="Ingrese observaciones específicas del análisis de pureza física, condiciones especiales, particularidades encontradas u otra información relevante..."
                                    value={formData.observaciones || ""}
                                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                                    rows={10}
                                    className="resize-y min-h-[200px] transition-all duration-200 focus:ring-2 focus:ring-blue-200 bg-white"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default PurezaFields;