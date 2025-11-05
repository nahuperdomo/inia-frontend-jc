import React from "react"
import { Label } from "@/components/ui/label"
import Combobox, { type ComboOption } from "@/components/ui/combobox"

interface FormComboboxProps {
  label: string
  id: string
  value: string | number | ""
  onChange: (value: string) => void
  onBlur: () => void
  options: ComboOption[]
  error?: string
  required?: boolean
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  valueKey?: string
  labelKey?: string
}

export default function FormCombobox({
  label,
  id,
  value,
  onChange,
  onBlur,
  options,
  error,
  required = false,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  className = "",
  disabled = false,
  valueKey = "id",
  labelKey = "nombre",
}: FormComboboxProps) {
  const stringValue = value === null || value === undefined || value === "" ? "" : String(value)

  return (
    <div className={className}>
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="mt-1" onBlur={onBlur}>
        <Combobox
          value={stringValue}
          onValueChange={onChange}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
          valueKey={valueKey}
          labelKey={labelKey}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
