/**
 * Cliente WebSocket para notificaciones en tiempo real
 * 
 * ¿Qué hace este archivo?
 * - Gestiona la conexión WebSocket con el backend
 * - Maneja suscripciones a canales de notificaciones
 * - Proporciona sistema de eventos para componentes React
 * - Reconexión automática en caso de pérdida de conexión
 * 
 * Tecnologías usadas:
 * - STOMP: Protocolo de mensajería sobre WebSocket
 * - SockJS: Fallback cuando WebSocket no está disponible
 */

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { NotificacionDTO } from '@/app/models/interfaces/notificacion';

/**
 * Tipos de eventos que puede emitir el WebSocket
 * - notification: Nueva notificación recibida
 * - count: Contador de no leídas actualizado
 * - mark-read: Notificación marcada como leída
 * - mark-all-read: Todas marcadas como leídas
 * - delete: Notificación eliminada
 */
export type NotificationEventType = 
  | 'notification' 
  | 'count' 
  | 'mark-read' 
  | 'mark-all-read' 
  | 'delete';

/**
 * Estructura de un evento de notificación
 */
export interface NotificationWebSocketEvent {
  type: NotificationEventType;
  data: NotificacionDTO | number | { id: number };
}

/**
 * Clase singleton para gestionar la conexión WebSocket
 * 
 * ¿Por qué singleton?
 * - Solo debe haber UNA conexión WebSocket por usuario
 * - Evita múltiples conexiones que consumen recursos
 * - Facilita compartir la conexión entre componentes
 */
class NotificationWebSocket {
  /**
   * Cliente STOMP (null si no está conectado)
   */
  private client: Client | null = null;

  /**
   * Mapa de suscripciones activas
   * Key: nombre del canal, Value: objeto de suscripción
   */
  private subscriptions: Map<string, StompSubscription> = new Map();

  /**
   * Mapa de listeners registrados por tipo de evento
   * Key: tipo de evento, Value: Set de callbacks
   */
  private listeners: Map<NotificationEventType, Set<(data: any) => void>> = new Map();

  /**
   * Control de reconexión
   */
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 segundos

  /**
   * ID del usuario actual (para suscripciones personalizadas)
   */
  private userId: string | null = null;

  /**
   * Conectar al WebSocket del backend
   * 
   * @param token Token JWT para autenticación
   * @param userId ID del usuario actual
   * @returns Promise que resuelve cuando la conexión está establecida
   * 
   * Flujo:
   * 1. Valida si ya está conectado
   * 2. Crea cliente STOMP con SockJS
   * 3. Configura headers de autenticación (JWT)
   * 4. Establece conexión
   * 5. Configura suscripciones automáticamente
   */
  connect(token: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Si ya está conectado, no reconectar
      if (this.client?.connected) {
        resolve();
        return;
      }

      this.userId = userId;
      
      // URL del WebSocket (usa variable de entorno)
      const wsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws/notifications`;
      // Crear cliente STOMP
      this.client = new Client({
        // Factory para crear la conexión WebSocket
        // SockJS proporciona fallback si WebSocket falla
        webSocketFactory: () => new SockJS(wsUrl) as any,
        
        // Headers de conexión (incluye JWT para autenticación)
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        // Configuración de reconexión automática
        reconnectDelay: this.reconnectDelay,
        
        // Heartbeat (mantener conexión viva)
        // Envía/recibe ping cada 4 segundos
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        /**
         * Callback cuando la conexión se establece exitosamente
         */
        onConnect: () => {
          this.reconnectAttempts = 0; // Reset intentos
          this.setupSubscriptions(); // Configurar canales
          resolve();
        },
        
        /**
         * Callback cuando hay un error STOMP
         */
        onStompError: (frame) => {
          console.error('❌ Error STOMP:', frame.headers['message']);
          console.error('Detalles:', frame.body);
          reject(new Error(frame.headers['message']));
        },
        
        /**
         * Callback cuando se cierra la conexión WebSocket
         */
        onWebSocketClose: () => {
          console.warn('⚠️ WebSocket cerrado');
          this.handleReconnect();
        },
        
        /**
         * Callback cuando se desconecta (manual o error)
         */
      });

      // Activar el cliente (iniciar conexión)
      this.client.activate();
    });
  }

  /**
   * Configurar suscripciones a canales del backend
   * 
   * Se ejecuta automáticamente después de conectar
   * 
   * Canales suscritos:
   * - /user/queue/notifications - Notificaciones personales
   * - /user/queue/notifications/count - Contador actualizado
   * - /user/queue/notifications/mark-read - Notif marcada como leída
   * - /user/queue/notifications/deleted - Notif eliminada
   */
  private setupSubscriptions(): void {
    if (!this.client || !this.userId) return;
    // Suscripción 1: Notificaciones nuevas
    const notificationSub = this.client.subscribe(
      `/user/queue/notifications`,
      (message) => {
        try {
          const notification: NotificacionDTO = JSON.parse(message.body);
          this.emit('notification', notification);
        } catch (error) {
          console.error('Error parseando notificación:', error);
        }
      }
    );
    this.subscriptions.set('user-notifications', notificationSub);

    // Suscripción 2: Contador actualizado
    const countSub = this.client.subscribe(
      `/user/queue/notifications/count`,
      (message) => {
        try {
          const count: number = JSON.parse(message.body);
          this.emit('count', count);
        } catch (error) {
        }
      }
    );
    this.subscriptions.set('user-count', countSub);

    // Suscripción 3: Notificación marcada como leída
    const markReadSub = this.client.subscribe(
      `/user/queue/notifications/mark-read`,
      (message) => {
        try {
          const notificationId: number = JSON.parse(message.body);
          this.emit('mark-read', { id: notificationId });
        } catch (error) {
        }
      }
    );
    this.subscriptions.set('user-mark-read', markReadSub);

    // Suscripción 4: Notificación eliminada
    const deletedSub = this.client.subscribe(
      `/user/queue/notifications/deleted`,
      (message) => {
        try {
          const notificationId: number = JSON.parse(message.body);
          this.emit('delete', { id: notificationId });
        } catch (error) {
        }
      }
    );
    this.subscriptions.set('user-deleted', deletedSub);
  }

  /**
   * Desconectar del WebSocket
   * 
   * Limpia todas las suscripciones y cierra la conexión
   * Útil al hacer logout o cambiar de usuario
   */
  disconnect(): void {    
    // Desuscribirse de todos los canales
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Desactivar el cliente
    this.client?.deactivate();
    this.client = null;
    this.userId = null;
  }

  /**
   * Registrar un listener para un tipo de evento
   * 
   * @param event Tipo de evento a escuchar
   * @param callback Función que se ejecuta cuando ocurre el evento
   * @returns Función para desuscribir el listener
   * 
   * Ejemplo de uso:
   * ```typescript
   * const unsubscribe = ws.on('notification', (notif) => {
   *   console.log('Nueva notificación:', notif);
   * });
   * 
   * // Más tarde, cuando no necesites más el listener:
   * unsubscribe();
   * ```
   */
  on(event: NotificationEventType, callback: (data: any) => void): () => void {
    // Inicializar Set si no existe
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    // Agregar callback al Set
    this.listeners.get(event)!.add(callback);

    // Retornar función de desuscripción
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emitir un evento a todos los listeners registrados
   * 
   * @param event Tipo de evento
   * @param data Datos del evento
   */
  private emit(event: NotificationEventType, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de evento '${event}':`, error);
        }
      });
    }
  }

  /**
   * Manejar reconexión automática
   * 
   * Se ejecuta cuando se pierde la conexión
   * Intenta reconectar con backoff exponencial
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
  }

  /**
   * Verificar si está conectado
   */
  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Obtener número de intentos de reconexión
   */
  get reconnectAttemptsCount(): number {
    return this.reconnectAttempts;
  }
}

/**
 * Exportar instancia singleton
 * 
 * Uso en componentes:
 * ```typescript
 * import { notificationWebSocket } from '@/lib/websocket/notification-websocket';
 * 
 * await notificationWebSocket.connect(token, userId);
 * ```
 */
export const notificationWebSocket = new NotificationWebSocket();
