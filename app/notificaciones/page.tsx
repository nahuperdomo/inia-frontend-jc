"use client"

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    useNotificationContext,
    NotificationItem,
    filterNotifications,
    sortNotifications,
    getNotificationStats
} from '@/components/notificaciones';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Bell,
    CheckCircle,
    RefreshCw,
    Trash2,
    Filter,
    Calendar,
    User,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        totalCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        currentPage,
        totalPages,
        goToPage
    } = useNotificationContext();

    // Filtros locales
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'type' | 'readStatus'>('date');

    // Aplicar filtros y ordenamiento
    const filteredAndSortedNotifications = useMemo(() => {
        let filtered = notifications;

        // Filtrar por estado de lectura
        if (statusFilter !== 'all') {
            filtered = filterNotifications[statusFilter](filtered);
        }

        // Filtrar por tipo
        if (typeFilter !== 'all') {
            filtered = filterNotifications.byType(filtered, typeFilter as any);
        }

        // Ordenar
        switch (sortBy) {
            case 'date':
                return sortNotifications.byDate(filtered, false);
            case 'type':
                return sortNotifications.byType(filtered);
            case 'readStatus':
                return sortNotifications.byReadStatus(filtered);
            default:
                return filtered;
        }
    }, [notifications, statusFilter, typeFilter, sortBy]);

    // Estadísticas
    const stats = getNotificationStats(notifications);

    // Tipos únicos para el filtro
    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(notifications.map(n => n.tipo)));
    }, [notifications]);

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleRefresh = async () => {
        await refreshNotifications();
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="w-6 h-6" />
                                Notificaciones
                            </h1>
                            <p className="text-gray-600">
                                Gestiona todas tus notificaciones del sistema
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                className={cn(loading && "animate-spin", "w-full sm:w-auto")}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualizar
                            </Button>

                            {unreadCount > 0 && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    No Leídas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Leídas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.todayCount}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="unread">No leídas</SelectItem>
                                        <SelectItem value="read">Leídas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo
                                </label>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {uniqueTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordenar por
                                </label>
                                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Fecha</SelectItem>
                                        <SelectItem value="type">Tipo</SelectItem>
                                        <SelectItem value="readStatus">Estado de lectura</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de notificaciones */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Notificaciones ({filteredAndSortedNotifications.length})
                            </CardTitle>

                            {/* Paginación info */}
                            {totalPages > 1 && (
                                <div className="text-sm text-gray-600">
                                    Página {currentPage + 1} de {totalPages}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        {loading && notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                                <p className="text-gray-500">Cargando notificaciones...</p>
                            </div>
                        ) : filteredAndSortedNotifications.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-gray-500 mb-1">No se encontraron notificaciones</p>
                                <p className="text-gray-400 text-sm">
                                    Prueba ajustando los filtros
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredAndSortedNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                        onViewDetails={(notif) => {
                                            // Aquí puedes implementar navegación a detalles específicos
                                            console.log('Ver detalles:', notif);
                                        }}
                                        className="border rounded-lg hover:shadow-md transition-shadow"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    variant="outline"
                                    size="sm"
                                >
                                    Anterior
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = currentPage < 3 ? i : currentPage - 2 + i;
                                        if (page >= totalPages) return null;

                                        return (
                                            <Button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                className="w-8 h-8"
                                            >
                                                {page + 1}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    variant="outline"
                                    size="sm"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
