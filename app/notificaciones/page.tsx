"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    obtenerMisNotificaciones,
    marcarComoLeida,
    marcarTodasMisNotificacionesComoLeidas,
    eliminarNotificacion
} from '@/app/services/notificacion-service';
import type { NotificacionDTO } from '@/app/models/interfaces/notificacion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Bell,
    CheckCircle,
    RefreshCw,
    Trash2,
    Eye,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificacionDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await obtenerMisNotificaciones(0, 1000); // Página 0, 1000 elementos máximo
            setNotifications(data.content);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await marcarComoLeida(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, leido: true } : n)
            );
            toast.success('Notificación marcada como leída');
        } catch (error) {
            console.error('Error marcando como leída:', error);
            toast.error('Error al marcar como leída');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await marcarTodasMisNotificacionesComoLeidas();
            setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            toast.error('Error al marcar todas como leídas');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await eliminarNotificacion(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notificación eliminada');
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    const handleNavigate = async (notification: NotificacionDTO) => {
        // Marcar como leída al navegar
        if (!notification.leido) {
            await handleMarkAsRead(notification.id);
        }

        // Navegar si tiene analisisId (construir URL manualmente)
        if (notification.analisisId) {
            // Aquí puedes construir la URL según el tipo de análisis
            router.push(`/listado/analisis/${notification.analisisId}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getTipoBadgeVariant = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'aprobacion':
            case 'aprobado':
                return 'default';
            case 'revision':
            case 'pendiente':
                return 'secondary';
            case 'rechazo':
            case 'rechazado':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const unreadCount = notifications.filter(n => !n.leido).length;

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Bell className="w-6 h-6" />
                                Notificaciones
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {unreadCount} no leídas
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-muted-foreground">
                                Gestiona tus notificaciones del sistema
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={loadNotifications}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>

                            {unreadCount > 0 && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    variant="outline"
                                    size="sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de notificaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Todas las notificaciones ({notifications.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                                <p className="text-muted-foreground">Cargando notificaciones...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-muted-foreground">No tienes notificaciones</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border rounded-lg transition-colors ${!notification.leido
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-background hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icono */}
                                            <div className={`mt-1 ${!notification.leido ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                                <Bell className="w-5 h-5" />
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm ${!notification.leido ? 'font-semibold' : ''}`}>
                                                        {notification.mensaje}
                                                    </p>
                                                    {!notification.leido && (
                                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                    <Badge variant={getTipoBadgeVariant(notification.tipo)} className="text-xs">
                                                        {notification.tipo}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>{formatDate(notification.fechaCreacion)}</span>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1">
                                                {notification.analisisId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleNavigate(notification)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {!notification.leido && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        title="Marcar como leída"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    title="Eliminar"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
