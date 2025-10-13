import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Option {
    id: number | string;
    nombre: string;
    value?: string;
    [key: string]: any; // Permite indexación con string
}

interface FormSelectProps {
    label: string;
    id: string;
    value: string | number | "";
    onChange: (value: string) => void;
    onBlur: () => void;
    options: Option[];
    error?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    valueKey?: string; // Propiedad para usar como valor (default: "id")
    labelKey?: string; // Propiedad para usar como etiqueta (default: "nombre")
}

/**
 * Componente de campo select con soporte para validación
 */
export function FormSelect({
    label,
    id,
    value,
    onChange,
    onBlur,
    options,
    error,
    required = false,
    placeholder = "Seleccionar...",
    className = "",
    disabled = false,
    valueKey = "id",
    labelKey = "nombre"
}: FormSelectProps) {
    // Convertir value a string para Select
    const stringValue = value === null || value === undefined || value === ""
        ? ""
        : String(value);

    return (
        <div className={className}>
            <Label htmlFor={id} className="flex items-center">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
                value={stringValue}
                onValueChange={(v) => onChange(v)}
                disabled={disabled}
            >
                <SelectTrigger
                    id={id}
                    className={`mt-1 ${error ? "border-red-500 focus:border-red-500" : ""}`}
                    onBlur={onBlur}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option, index) => (
                        <SelectItem
                            key={`${option[valueKey] || option.id}-${index}`}
                            value={String(option[valueKey] || option.id)}
                        >
                            {option[labelKey] || option.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default FormSelect;