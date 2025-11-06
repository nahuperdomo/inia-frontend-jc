/**
 * Hook de React para usar WebSocket de notificaciones
 * 
 * ¿Qué hace este hook?
 * - Conecta al WebSocket cuando el componente se monta
 * - Escucha eventos de notificaciones en tiempo real
 * - Maneja reconexión automática
 * - Desconecta cuando el componente se desmonta
 * - Proporciona estado de conexión
 * 
 * Este hook encapsula toda la lógica de WebSocket para que
 * los componentes solo se preocupen por los datos recibidos.
 */

"use client"

import { useEffect, useCallback, useState, useRef } from 'react';
import { notificationWebSocket } from '@/lib/websocket/notification-websocket';
import type { NotificacionDTO } from '@/app/models/interfaces/notificacion';
import { toast } from 'sonner';

/**
 * Tipo de retorno del hook
 */
interface UseNotificationWebSocketReturn {
  /** Estado de la conexión WebSocket */
  isConnected: boolean;
  /** Error de conexión si existe */
  error: string | null;
  /** Función para reconectar manualmente */
  reconnect: () => Promise<void>;
}

/**
 * Props del hook
 */
interface UseNotificationWebSocketProps {
  /** Token JWT para autenticación */
  token?: string;
  /** ID del usuario actual */
  userId?: string | number;
  /** Callback cuando llega una nueva notificación */
  onNotification?: (notification: NotificacionDTO) => void;
  /** Callback cuando se actualiza el contador */
  onCountUpdate?: (count: number) => void;
  /** Callback cuando se marca una notificación como leída */
  onMarkAsRead?: (notificationId: number) => void;
  /** Callback cuando se elimina una notificación */
  onDelete?: (notificationId: number) => void;
  /** Mostrar toasts automáticos para nuevas notificaciones */
  showToasts?: boolean;
}

/**
 * Hook para gestionar WebSocket de notificaciones
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, error } = useNotificationWebSocket({
 *     token: userToken,
 *     userId: currentUser.id,
 *     onNotification: (notif) => {
 *       console.log('Nueva notificación:', notif);
 *       // Actualizar estado local
 *     },
 *     onCountUpdate: (count) => {
 *       setBadgeCount(count);
 *     },
 *     showToasts: true
 *   });
 * 
 *   return (
 *     <div>
 *       {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
 *       {error && <span>Error: {error}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
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

  /**
   * Función para conectar al WebSocket
   * 
   * Usa useCallback para estabilizar la referencia
   * Solo se crea una vez y se memoriza
   */
  const connect = useCallback(async () => {
    // Validar que tenemos token y userId
    if (!token || !userId) {
      console.warn('⚠️ No se puede conectar WebSocket: falta token o userId');
      return;
    }

    // Evitar múltiples intentos simultáneos
    if (isConnecting.current) {
      console.log('⏳ Ya hay una conexión en progreso...');
      return;
    }

    // Si ya está conectado, no reconectar
    if (notificationWebSocket.isConnected && hasConnected.current) {
      console.log('✅ WebSocket ya está conectado');
      setIsConnected(true);
      return;
    }

    try {
      isConnecting.current = true;
      setError(null);

      console.log('🔌 Iniciando conexión WebSocket...');
      
      // Conectar al WebSocket
      await notificationWebSocket.connect(token, userId.toString());
      
      setIsConnected(true);
      hasConnected.current = true;
      console.log('✅ WebSocket conectado desde hook');

    } catch (err: any) {
      console.error('❌ Error conectando WebSocket:', err);
      setError(err.message || 'Error de conexión');
      setIsConnected(false);
      hasConnected.current = false;

    } finally {
      isConnecting.current = false;
    }
  }, [token, userId]);

  /**
   * Función para reconectar manualmente
   * 
   * Útil para botón de "Reconectar" en la UI
   */
  const reconnect = useCallback(async () => {
    console.log('🔄 Reconectando WebSocket...');
    notificationWebSocket.disconnect();
    hasConnected.current = false;
    await connect();
  }, [connect]);

  /**
   * Efecto: Conectar al montar el componente
   * 
   * Se ejecuta cuando:
   * - El componente se monta
   * - Cambia el token o userId
   */
  useEffect(() => {
    connect();

    // Cleanup: Desconectar al desmontar
    return () => {
      console.log('🧹 Limpiando conexión WebSocket del hook');
      // NO desconectamos aquí porque puede ser usado por otros componentes
      // Solo el Provider principal debe desconectar
    };
  }, [connect]);

  /**
   * Efecto: Suscribirse a eventos de notificaciones
   * 
   * Se ejecuta cuando:
   * - Se conecta el WebSocket
   * - Cambian los callbacks
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('📡 Suscribiendo a eventos WebSocket...');

    // Suscripción a nuevas notificaciones
    const unsubNotification = notificationWebSocket.on('notification', (notification: NotificacionDTO) => {
      console.log('📩 Nueva notificación recibida:', notification.nombre);
      
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
      console.log('🔢 Contador actualizado:', count);
      onCountUpdate?.(count);
    });

    // Suscripción a notificación marcada como leída
    const unsubMarkRead = notificationWebSocket.on('mark-read', (data: { id: number }) => {
      console.log('✓ Notificación marcada como leída:', data.id);
      onMarkAsRead?.(data.id);
    });

    // Suscripción a notificación eliminada
    const unsubDelete = notificationWebSocket.on('delete', (data: { id: number }) => {
      console.log('🗑️ Notificación eliminada:', data.id);
      onDelete?.(data.id);
    });

    // Cleanup: Desuscribirse cuando cambien las dependencias
    return () => {
      console.log('🧹 Desuscribiendo de eventos WebSocket');
      unsubNotification();
      unsubCount();
      unsubMarkRead();
      unsubDelete();
    };
  }, [isConnected, onNotification, onCountUpdate, onMarkAsRead, onDelete, showToasts]);

  /**
   * Efecto: Monitorear estado de conexión
   * 
   * Actualiza el estado cuando el WebSocket se desconecta
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = notificationWebSocket.isConnected;
      if (connected !== isConnected) {
        setIsConnected(connected);
        if (!connected) {
          console.warn('⚠️ WebSocket desconectado');
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
