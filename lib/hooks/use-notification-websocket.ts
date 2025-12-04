

"use client"

import { useEffect, useCallback, useState, useRef } from 'react';
import { notificationWebSocket } from '@/lib/websocket/notification-websocket';
import type { NotificacionDTO } from '@/app/models/interfaces/notificacion';
import { toast } from 'sonner';


interface UseNotificationWebSocketReturn {
  
  isConnected: boolean;
  
  error: string | null;
  
  reconnect: () => Promise<void>;
}


interface UseNotificationWebSocketProps {
  
  token?: string;
  
  userId?: string | number;
  
  onNotification?: (notification: NotificacionDTO) => void;
  
  onCountUpdate?: (count: number) => void;
  
  onMarkAsRead?: (notificationId: number) => void;
  
  onDelete?: (notificationId: number) => void;
  
  showToasts?: boolean;
}


export function useNotificationWebSocket({
  token,
  userId,
  onNotification,
  onCountUpdate,
  onMarkAsRead,
  onDelete,
  showToasts = true,
}: UseNotificationWebSocketProps = {}): UseNotificationWebSocketReturn {
  
  // Estados
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para evitar múltiples conexiones
  const isConnecting = useRef(false);
  const hasConnected = useRef(false);

  
  const connect = useCallback(async () => {
    // Validar que tenemos token y userId
    if (!token || !userId) {
      console.warn(' No se puede conectar WebSocket: falta token o userId');
      return;
    }

    // Evitar múltiples intentos simultáneos
    if (isConnecting.current) {
      return;
    }

    // Si ya está conectado, no reconectar
    if (notificationWebSocket.isConnected && hasConnected.current) {
      setIsConnected(true);
      return;
    }

    try {
      isConnecting.current = true;
      setError(null);      
      // Conectar al WebSocket
      await notificationWebSocket.connect(token, userId.toString());
      
      setIsConnected(true);
      hasConnected.current = true;
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsConnected(false);
      hasConnected.current = false;

    } finally {
      isConnecting.current = false;
    }
  }, [token, userId]);

  
  const reconnect = useCallback(async () => {
    notificationWebSocket.disconnect();
    hasConnected.current = false;
    await connect();
  }, [connect]);

  
  useEffect(() => {
    connect();
  }, [connect]);

  
  useEffect(() => {
    if (!isConnected) return;
    // Suscripción a nuevas notificaciones
    const unsubNotification = notificationWebSocket.on('notification', (notification: NotificacionDTO) => {      
      // Mostrar toast si está habilitado
      if (showToasts) {
        toast.success(notification.nombre, {
          description: notification.mensaje,
          duration: 5000,
          action: notification.analisisId ? {
            label: 'Ver análisis',
            onClick: () => {
              window.location.href = `/listado/${notification.analisisId}`;
            }
          } : undefined,
        });
      }

      // Ejecutar callback personalizado
      onNotification?.(notification);
    });

    // Suscripción a actualizaciones de contador
    const unsubCount = notificationWebSocket.on('count', (count: number) => {
      onCountUpdate?.(count);
    });

    // Suscripción a notificación marcada como leída
    const unsubMarkRead = notificationWebSocket.on('mark-read', (data: { id: number }) => {
      onMarkAsRead?.(data.id);
    });

    // Suscripción a notificación eliminada
    const unsubDelete = notificationWebSocket.on('delete', (data: { id: number }) => {
      onDelete?.(data.id);
    });

    // Cleanup: Desuscribirse cuando cambien las dependencias
    return () => {
      unsubNotification();
      unsubCount();
      unsubMarkRead();
      unsubDelete();
    };
  }, [isConnected, onNotification, onCountUpdate, onMarkAsRead, onDelete, showToasts]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = notificationWebSocket.isConnected;
      if (connected !== isConnected) {
        setIsConnected(connected);
        if (!connected) {
          console.warn(' WebSocket desconectado');
        }
      }
    }, 2000); // Verificar cada 2 segundos

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    error,
    reconnect,
  };
}
