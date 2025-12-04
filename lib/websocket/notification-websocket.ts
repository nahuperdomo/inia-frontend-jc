

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { NotificacionDTO } from '@/app/models/interfaces/notificacion';


export type NotificationEventType = 
  | 'notification' 
  | 'count' 
  | 'mark-read' 
  | 'mark-all-read' 
  | 'delete';


export interface NotificationWebSocketEvent {
  type: NotificationEventType;
  data: NotificacionDTO | number | { id: number };
}


class NotificationWebSocket {
  
  private client: Client | null = null;

  
  private subscriptions: Map<string, StompSubscription> = new Map();

  
  private listeners: Map<NotificationEventType, Set<(data: any) => void>> = new Map();

  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 segundos

  
  private userId: string | null = null;

  
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
        
        
        onConnect: () => {
          this.reconnectAttempts = 0; // Reset intentos
          this.setupSubscriptions(); // Configurar canales
          resolve();
        },
        
        
        onStompError: (frame) => {
          console.error(' Error STOMP:', frame.headers['message']);
          console.error('Detalles:', frame.body);
          reject(new Error(frame.headers['message']));
        },
        
        
        onWebSocketClose: () => {
          console.warn(' WebSocket cerrado');
          this.handleReconnect();
        },
        
        
      });

      // Activar el cliente (iniciar conexión)
      this.client.activate();
    });
  }

  
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

  
  disconnect(): void {    
    // Desuscribirse de todos los canales
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Desactivar el cliente
    this.client?.deactivate();
    this.client = null;
    this.userId = null;
  }

  
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

  
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(' Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
  }

  
  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  
  get reconnectAttemptsCount(): number {
    return this.reconnectAttempts;
  }
}


export const notificationWebSocket = new NotificationWebSocket();
