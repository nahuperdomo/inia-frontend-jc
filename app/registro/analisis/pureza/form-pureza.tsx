"use client"

import React, { useState, useEffect, useMemo } from "react";
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
    ClipboardList,
    Percent,
    Building2,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

// Importar el componente de malezas
import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza";

type Props = {
    formData: {
        // Datos en gramos
        pesoInicial?: string;
        semillaPura?: string;
        materiaInerte?: string;
        otrosCultivos?: string;
        malezas?: string;
        malezasToleridas?: string;
        malezasToleranciasCero?: string;
        pesoTotal?: string;

        // Porcentajes manuales
        semillaPuraPorcentaje?: string;
        materiaInertePorcentaje?: string;
        otrosCultivosPorcentaje?: string;
        malezasPorcentaje?: string;
        malezasTolerididasPorcentaje?: string;
        malezasToleranciasCeroPorcentaje?: string;

        // Porcentajes redondeados manuales
        semillaPuraRedondeado?: string;
        materiaInerteRedondeado?: string;
        otrosCultivosRedondeado?: string;
        malezasRedondeado?: string;
        malezasTolerididasRedondeado?: string;
        malezasToleranciasCeroRedondeado?: string;

        // Datos INIA manuales
        iniaSemillaPuraPorcentaje?: string;
        iniaMateriaInertePorcentaje?: string;
        iniaOtrosCultivosPorcentaje?: string;
        iniaMalezasPorcentaje?: string;
        iniaMalezasTolerididasPorcentaje?: string;
        iniaMalezasToleranciasCeroPorcentaje?: string;

        // Alerta diferencia
        alertaDiferenciaPeso?: string;

        observaciones?: string;
        [key: string]: any;
    };
    handleInputChange: (field: string, value: any) => void;
    onChangeMalezas?: (list: any[]) => void;
}

export default function PurezaFields({
    formData = {},
    handleInputChange = () => { },
    onChangeMalezas
}: Props) {
    // Para usar el componente de forma independiente (con estado propio)
    const [localFormData, setLocalFormData] = React.useState({
        pesoInicial: '',
        semillaPura: '',
        materiaInerte: '',
        otrosCultivos: '',
        malezas: '',
        malezasToleridas: '',
        malezasToleranciasCero: '',
        pesoTotal: '',
        observaciones: '',
        // Porcentajes
        semillaPuraPorcentaje: '',
        materiaInertePorcentaje: '',
        otrosCultivosPorcentaje: '',
        malezasPorcentaje: '',
        malezasTolerididasPorcentaje: '',
        malezasToleranciasCeroPorcentaje: '',
        // Redondeados
        semillaPuraRedondeado: '',
        materiaInerteRedondeado: '',
        otrosCultivosRedondeado: '',
        malezasRedondeado: '',
        malezasTolerididasRedondeado: '',
        malezasToleranciasCeroRedondeado: '',
        // INIA
        iniaSemillaPuraPorcentaje: '',
        iniaMateriaInertePorcentaje: '',
        iniaOtrosCultivosPorcentaje: '',
        iniaMalezasPorcentaje: '',
        iniaMalezasTolerididasPorcentaje: '',
        iniaMalezasToleranciasCeroPorcentaje: '',
        alertaDiferenciaPeso: ''
    });

    // Estado para manejar la pestaña activa
    const [activeTab, setActiveTab] = useState("datos-principales");

    // Función para manejar cambios en campos cuando se usa de forma independiente
    const handleLocalChange = (field: string, value: any) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
    };

    // Usar los datos y función externa si se proporcionan, o los locales si no
    const data = Object.keys(formData).length > 0 ? formData : localFormData;
    const handleChange = handleInputChange || handleLocalChange;

    // Calcular automáticamente la diferencia de peso
    const calculoDiferenciaPeso = useMemo(() => {
        const pesoInicial = parseFloat(data.pesoInicial || "0");
        const semillaPura = parseFloat(data.semillaPura || "0");
        const materiaInerte = parseFloat(data.materiaInerte || "0");
        const otrosCultivos = parseFloat(data.otrosCultivos || "0");
        const malezas = parseFloat(data.malezas || "0");
        const malezasToleridas = parseFloat(data.malezasToleridas || "0");
        const malezasToleranciasCero = parseFloat(data.malezasToleranciasCero || "0");

        const totalComponentes = semillaPura + materiaInerte + otrosCultivos + malezas + malezasToleridas + malezasToleranciasCero;

        if (pesoInicial <= 0) {
            return {
                formula: "",
                porcentaje: 0,
                esAlerta: false,
                mensaje: "Ingrese peso inicial para calcular"
            };
        }

        const diferencia = totalComponentes - pesoInicial;
        const porcentajeDiferencia = (diferencia / pesoInicial) * 100;
        const porcentajeAbsoluto = Math.abs(porcentajeDiferencia);

        const formula = `(${totalComponentes.toFixed(3)}-${pesoInicial.toFixed(3)})/${pesoInicial.toFixed(3)}*100=${porcentajeDiferencia.toFixed(1)}%`;
        const esAlerta = porcentajeAbsoluto >= 5;
        const mensaje = esAlerta
            ? `≥5% - ALERTA: Diferencia significativa`
            : `<5% - OK: Diferencia aceptable`;

        return {
            formula,
            porcentaje: porcentajeDiferencia,
            porcentajeAbsoluto,
            esAlerta,
            mensaje
        };
    }, [data.pesoInicial, data.semillaPura, data.materiaInerte, data.otrosCultivos, data.malezas, data.malezasToleridas, data.malezasToleranciasCero]);

    // Actualizar automáticamente el campo de alerta cuando cambie el cálculo
    useEffect(() => {
        if (calculoDiferenciaPeso.formula && handleChange) {
            const alertaTexto = `${calculoDiferenciaPeso.formula} ${calculoDiferenciaPeso.mensaje}`;
            handleChange("alertaDiferenciaPeso", alertaTexto);
        }
    }, [calculoDiferenciaPeso, handleChange]);

    // Componente reutilizable para una fila de datos de pureza
    const PurezaRow = ({
        label,
        icon: Icon,
        gramosField,
        porcentajeField,
        redondeadoField,
        required = false,
        isAlert = false
    }: {
        label: string;
        icon: any;
        gramosField: string;
        porcentajeField?: string;
        redondeadoField?: string;
        required?: boolean;
        isAlert?: boolean;
    }) => (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border ${isAlert ? 'border-red-200 bg-red-50' : 'border-border/50 bg-background'
            }`}>
            <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label} (g) {required && '*'}
                </Label>
                <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={(data as any)[gramosField] || ""}
                    onChange={(e) => handleChange(gramosField, e.target.value)}
                    className="h-11"
                    required={required}
                />
            </div>

            {porcentajeField && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        % Manual
                    </Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={(data as any)[porcentajeField] || ""}
                        onChange={(e) => handleChange(porcentajeField, e.target.value)}
                        className="h-11"
                    />
                </div>
            )}

            {redondeadoField && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        % Redondeado
                    </Label>
                    <Input
                        type="text"
                        placeholder="0"
                        value={(data as any)[redondeadoField] || ""}
                        onChange={(e) => handleChange(redondeadoField, e.target.value)}
                        className="h-11"
                    />
                </div>
            )}
        </div>
    );

    // Componente para fila INIA
    const IniaRow = ({
        label,
        icon: Icon,
        field
    }: {
        label: string;
        icon: any;
        field: string;
    }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">{label}</span>
            </div>
            <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={(data as any)[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="h-10 bg-white border-emerald-300"
            />
        </div>
    );

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
                            Sistema de registro manual como en Excel - sin cálculos automáticos
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap gap-2 w-full mb-6">
                        <TabsTrigger value="datos-principales" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <Scale className="h-4 w-4" />
                            Datos Principales
                        </TabsTrigger>
                        <TabsTrigger value="inia-porcentajes" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <Building2 className="h-4 w-4" />
                            INIA %
                        </TabsTrigger>
                        <TabsTrigger value="detalle-malezas" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <Microscope className="h-4 w-4" />
                            Detalle Malezas
                        </TabsTrigger>
                        <TabsTrigger value="observaciones" className="flex items-center gap-2 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4" />
                            Observaciones
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Datos Principales - Como en Excel */}
                    <TabsContent value="datos-principales" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Scale className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">Datos de Pureza Física</h3>
                                <p className="text-sm text-muted-foreground ml-2">(Entrada manual como Excel)</p>
                            </div>

                            {/* Peso Inicial - Solo gramos */}
                            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-blue-600" />
                                            1. Peso inicial (g) *
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            placeholder="3.000"
                                            value={data.pesoInicial || ""}
                                            onChange={(e) => handleChange("pesoInicial", e.target.value)}
                                            className="h-11 font-medium bg-white"
                                            required
                                        />
                                    </div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>

                            {/* Semilla Pura */}
                            <PurezaRow
                                label="2. Semilla pura"
                                icon={FlaskConical}
                                gramosField="semillaPura"
                                porcentajeField="semillaPuraPorcentaje"
                                redondeadoField="semillaPuraRedondeado"
                                required
                            />

                            {/* Materia Inerte */}
                            <PurezaRow
                                label="3. Materia inerte"
                                icon={BarChartHorizontal}
                                gramosField="materiaInerte"
                                porcentajeField="materiaInertePorcentaje"
                                redondeadoField="materiaInerteRedondeado"
                                required
                            />

                            {/* Otros Cultivos */}
                            <PurezaRow
                                label="4. Otros cultivos"
                                icon={PieChart}
                                gramosField="otrosCultivos"
                                porcentajeField="otrosCultivosPorcentaje"
                                redondeadoField="otrosCultivosRedondeado"
                                required
                            />

                            {/* Malezas */}
                            <PurezaRow
                                label="5. Malezas"
                                icon={Microscope}
                                gramosField="malezas"
                                porcentajeField="malezasPorcentaje"
                                redondeadoField="malezasRedondeado"
                                required
                            />

                            {/* Malezas Toleradas */}
                            <PurezaRow
                                label="6. Malezas toleradas"
                                icon={Microscope}
                                gramosField="malezasToleridas"
                                porcentajeField="malezasTolerididasPorcentaje"
                                redondeadoField="malezasTolerididasRedondeado"
                            />

                            {/* Malezas con Tolerancia Cero */}
                            <PurezaRow
                                label="7. Malezas con tolerancia cero"
                                icon={Microscope}
                                gramosField="malezasToleranciasCero"
                                porcentajeField="malezasToleranciasCeroPorcentaje"
                                redondeadoField="malezasToleranciasCeroRedondeado"
                            />

                            {/* Peso Total */}
                            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-purple-600" />
                                            8. Peso total
                                        </Label>
                                        <Select
                                            value={data.pesoTotal || ""}
                                            onValueChange={(v) => handleChange("pesoTotal", v)}
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue placeholder="Seleccionar peso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3.000">3.000g</SelectItem>
                                                <SelectItem value="5.000">5.000g</SelectItem>
                                                <SelectItem value="10.000">10.000g</SelectItem>
                                                <SelectItem value="25.000">25.000g</SelectItem>
                                                <SelectItem value="50.000">50.000g</SelectItem>
                                                <SelectItem value="100.000">100.000g</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>

                            {/* Alerta Diferencia de Peso - Cálculo Automático */}
                            <div className={`p-4 rounded-lg border ${calculoDiferenciaPeso.esAlerta
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-green-200 bg-green-50'
                                }`}>
                                <div className="space-y-3">
                                    <Label className={`text-sm font-medium flex items-center gap-2 ${calculoDiferenciaPeso.esAlerta ? 'text-red-700' : 'text-green-700'
                                        }`}>
                                        {calculoDiferenciaPeso.esAlerta ? (
                                            <AlertTriangle className="h-4 w-4" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        9. Alerta Diferencia de peso (automático)
                                    </Label>

                                    {/* Campo readonly que muestra el cálculo automático */}
                                    <div className={`p-3 rounded border ${calculoDiferenciaPeso.esAlerta
                                            ? 'bg-red-100 border-red-300'
                                            : 'bg-green-100 border-green-300'
                                        }`}>
                                        <div className="space-y-2">
                                            <div className="font-mono text-sm">
                                                <strong>Fórmula:</strong> {calculoDiferenciaPeso.formula || "Esperando datos..."}
                                            </div>
                                            <div className={`text-sm font-medium ${calculoDiferenciaPeso.esAlerta ? 'text-red-800' : 'text-green-800'
                                                }`}>
                                                <strong>Estado:</strong> {calculoDiferenciaPeso.mensaje}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo oculto para mantener el valor en el formulario */}
                                    <input
                                        type="hidden"
                                        value={data.alertaDiferenciaPeso || ""}
                                        onChange={(e) => handleChange("alertaDiferenciaPeso", e.target.value)}
                                    />

                                    <p className={`text-xs ${calculoDiferenciaPeso.esAlerta ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        ✨ Cálculo automático: (Total componentes - Peso inicial) / Peso inicial × 100
                                        {calculoDiferenciaPeso.esAlerta && (
                                            <span className="block mt-1 font-medium">
                                                ⚠️ ATENCIÓN: La diferencia es ≥5%, revisar los datos ingresados
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: INIA Porcentajes */}
                    <TabsContent value="inia-porcentajes" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-semibold">Registro INIA - Porcentajes Manuales</h3>
                            </div>

                            <Card className="border-emerald-200 bg-emerald-50">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-emerald-600" />
                                        <CardTitle className="text-lg text-emerald-800">INIA - Instituto Nacional de Investigación Agropecuaria</CardTitle>
                                    </div>
                                    <p className="text-sm text-emerald-700">Ingrese los porcentajes manualmente para el registro de INIA</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <IniaRow label="Semilla pura %" icon={FlaskConical} field="iniaSemillaPuraPorcentaje" />
                                    <IniaRow label="Materia inerte %" icon={BarChartHorizontal} field="iniaMateriaInertePorcentaje" />
                                    <IniaRow label="Otros cultivos %" icon={PieChart} field="iniaOtrosCultivosPorcentaje" />
                                    <IniaRow label="Malezas %" icon={Microscope} field="iniaMalezasPorcentaje" />
                                    <IniaRow label="Malezas toleradas %" icon={Microscope} field="iniaMalezasTolerididasPorcentaje" />
                                    <IniaRow label="Malezas tolerancia cero %" icon={Microscope} field="iniaMalezasToleranciasCeroPorcentaje" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAB: Detalle de Malezas */}
                    <TabsContent value="detalle-malezas" className="space-y-6">
                        <MalezaFields
                            titulo="Identificación Detallada de Malezas"
                            registros={[]}
                            onChangeListados={onChangeMalezas}
                        />
                        <Alert>
                            <Microscope className="h-4 w-4" />
                            <AlertDescription>
                                Esta sección permite registrar el detalle específico de las malezas encontradas
                                durante el análisis de pureza física. Los pesos registrados aquí deben coincidir
                                con los totales ingresados en la pestaña "Datos Principales".
                            </AlertDescription>
                        </Alert>
                    </TabsContent>

                    {/* TAB: Observaciones */}
                    <TabsContent value="observaciones" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageCircle className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">Comentarios y Observaciones</h3>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observaciones" className="text-sm font-medium flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    Observaciones del Análisis de Pureza
                                </Label>
                                <Textarea
                                    id="observaciones"
                                    placeholder="Ingrese observaciones específicas del análisis de pureza física..."
                                    value={data.observaciones || ""}
                                    onChange={(e) => handleChange("observaciones", e.target.value)}
                                    rows={8}
                                    className="resize-y min-h-[200px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Incluya observaciones sobre la muestra, condiciones del análisis,
                                    particularidades encontradas u otra información relevante.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}