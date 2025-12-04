import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
    label: string;
    id: string;
    type?: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    step?: string;
    min?: string | number;
    max?: string | number;
    disabled?: boolean;
}


export function FormField({
    label,
    id,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    required = false,
    placeholder,
    className = "",
    step,
    min,
    max,
    disabled = false
}: FormFieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={id} className="flex items-center">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`mt-1 ${error ? "border-red-500 focus:border-red-500" : ""}`}
                step={step}
                min={min}
                max={max}
                disabled={disabled}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default FormField;
