"use client"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus, ChevronDown } from "lucide-react"
import { TipoAnalisis } from "@/app/models/types/enums"

interface TiposAnalisisSelectorProps {
  tiposSeleccionados: TipoAnalisis[];
  onChange: (tipos: TipoAnalisis[]) => void;
  disabled?: boolean;
  error?: string;
}

const tiposAnalisisDisponibles = [
  { value: "PUREZA" as TipoAnalisis, label: "Pureza" },
  { value: "GERMINACION" as TipoAnalisis, label: "Germinación" },
  { value: "PMS" as TipoAnalisis, label: "PMS" },
  { value: "DOSN" as TipoAnalisis, label: "DOSN" },
  { value: "TETRAZOLIO" as TipoAnalisis, label: "Tetrazolio" },
];

export function TiposAnalisisSelector({
  tiposSeleccionados,
  onChange,
  disabled = false,
  error
}: TiposAnalisisSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const agregarTipo = (tipo: TipoAnalisis) => {
    if (!tiposSeleccionados.includes(tipo)) {
      onChange([...tiposSeleccionados, tipo]);
    }
    setIsOpen(false);
  };

  const removerTipo = (tipo: TipoAnalisis) => {
    onChange(tiposSeleccionados.filter(t => t !== tipo));
  };

  const tiposDisponibles = tiposAnalisisDisponibles.filter(
    tipo => !tiposSeleccionados.includes(tipo.value)
  );

  const obtenerLabelPorTipo = (tipo: TipoAnalisis) => {
    return tiposAnalisisDisponibles.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {tiposSeleccionados.map((tipo) => (
          <Badge
            key={tipo}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {obtenerLabelPorTipo(tipo)}
            {!disabled && (
              <button
                type="button"
                onClick={() => removerTipo(tipo)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {!disabled && tiposDisponibles.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-dashed"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar análisis
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                {tiposDisponibles.map((tipo) => (
                  <button
                    key={tipo.value}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                    onClick={() => agregarTipo(tipo.value)}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {tiposSeleccionados.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Selecciona los tipos de análisis que se realizarán para este lote
        </p>
      )}
    </div>
  );
}
