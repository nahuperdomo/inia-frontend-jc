"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, User, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  obtenerMisNotificacionesNoLeidas, 
  contarMisNotificacionesNoLeidas,
  marcarComoLeida,
  marcarTodasMisNotificacionesComoLeidas,
  eliminarNotificacion
} from "@/app/services/notificacion-service"
import type { NotificacionDTO } from "@/app/models/interfaces/notificacion"
import type { TipoNotificacion } from "@/app/models/types/enums"

interface NotificacionesDropdownProps {
  // Ya no necesitamos usuarioId porque usamos el usuario autenticado
}

export function NotificacionesDropdown({}: NotificacionesDropdownProps) {
  const [notificaciones, setNotificaciones] = useState<NotificacionDTO[]>([])
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotificaciones = async () => {
    try {
      setLoading(true)
      const [notificacionesData, countData] = await Promise.all([
        obtenerMisNotificacionesNoLeidas(),
        contarMisNotificacionesNoLeidas()
      ])
      setNotificaciones(notificacionesData)
      setCount(countData)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificaciones()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000)
    return () => clearInterval(interval)
  }, []) // Sin dependencias porque ya no usamos usuarioId

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMarcarComoLeida = async (notificacionId: number) => {
    try {
      await marcarComoLeida(notificacionId)
      fetchNotificaciones() // Refrescar
    } catch (error) {
      console.error("Error al marcar como leída:", error)
    }
  }

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await marcarTodasMisNotificacionesComoLeidas()
      fetchNotificaciones() // Refrescar
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  const handleEliminar = async (notificacionId: number) => {
    try {
      await eliminarNotificacion(notificacionId)
      fetchNotificaciones() // Refrescar
    } catch (error) {
      console.error("Error al eliminar notificación:", error)
    }
  }

  const getIconByType = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "USUARIO_REGISTRO":
        return <User className="h-4 w-4" />
      case "ANALISIS_FINALIZADO":
        return <FileText className="h-4 w-4" />
      case "ANALISIS_APROBADO":
        return <CheckCircle className="h-4 w-4" />
      case "ANALISIS_REPETIR":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getColorByType = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "USUARIO_REGISTRO":
        return "text-blue-600"
      case "ANALISIS_FINALIZADO":
        return "text-orange-600"
      case "ANALISIS_APROBADO":
        return "text-green-600"
      case "ANALISIS_REPETIR":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <span className="font-semibold">Notificaciones</span>
              {count > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarcarTodasComoLeidas}
                  className="text-xs h-auto p-1"
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <Separator />
            
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Cargando...
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay notificaciones nuevas
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notificaciones.slice(0, 10).map((notificacion) => (
                  <div 
                    key={notificacion.id} 
                    className="p-3 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getColorByType(notificacion.tipo)}`}>
                        {getIconByType(notificacion.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notificacion.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notificacion.mensaje}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatearFecha(notificacion.fechaCreacion)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarcarComoLeida(notificacion.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(notificacion.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notificaciones.length > 10 && (
              <>
                <Separator />
                <div className="p-2 text-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todas las notificaciones
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}