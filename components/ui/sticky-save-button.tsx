"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StickySaveButtonProps {
  onSave: () => void
  isLoading?: boolean
  disabled?: boolean
  label?: string
  loadingLabel?: string
  showAfterScroll?: number // Píxeles de scroll antes de mostrar el botón
  className?: string
}

export function StickySaveButton({
  onSave,
  isLoading = false,
  disabled = false,
  label = "Guardar Cambios",
  loadingLabel = "Guardando...",
  showAfterScroll = 300,
  className,
}: StickySaveButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsVisible(scrollPosition > showAfterScroll)
    }

    // Agregar el listener de scroll
    window.addEventListener("scroll", handleScroll)

    // Verificar la posición inicial
    handleScroll()

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [showAfterScroll])

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <Button
        onClick={onSave}
        disabled={disabled || isLoading}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-shadow"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? loadingLabel : label}
      </Button>
    </div>
  )
}
