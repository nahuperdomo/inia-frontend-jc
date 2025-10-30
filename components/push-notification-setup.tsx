"use client"

import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePushNotifications } from '@/lib/hooks/use-push-notifications';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PushNotificationSetupProps {
    /**
     * Si es true, muestra una versión compacta del componente
     */
    compact?: boolean;

    /**
     * Si es true, auto-solicita permisos al montar
     */
    autoRequest?: boolean;
}

/**
 * Componente para configurar notificaciones push
 * 
 * Features:
 * - Solicita permisos de notificación
 * - Activa/desactiva suscripción push
 * - Muestra estado actual
 * - Versión compacta y completa
 * - Se oculta automáticamente cuando está activo
 */
export function PushNotificationSetup({
    compact = false,
    autoRequest = false
}: PushNotificationSetupProps) {
    const {
        isSupported,
        isSubscribed,
        isPermissionGranted,
        permission,
        requestPermission,
        subscribe,
        unsubscribe,
        loading,
    } = usePushNotifications();

    const [showPrompt, setShowPrompt] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Auto-solicitar permisos si está habilitado y es soportado
        if (autoRequest && isSupported && permission === 'default') {
            setShowPrompt(true);
        }
    }, [autoRequest, isSupported, permission]);

    // Ocultar automáticamente cuando esté suscrito
    useEffect(() => {
        if (isSubscribed && !compact) {
            // Ocultar después de 3 segundos
            const timer = setTimeout(() => {
                setIsDismissed(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isSubscribed, compact]);

    // No mostrar nada si no está soportado
    if (!isSupported) {
        return (
            <Alert variant="destructive">
                <BellOff className="h-4 w-4" />
                <AlertTitle>Notificaciones no disponibles</AlertTitle>
                <AlertDescription>
                    Tu navegador no soporta notificaciones push. Intenta usar Chrome, Edge o Firefox en Android/Desktop.
                </AlertDescription>
            </Alert>
        );
    }

    // No mostrar si fue cerrado manualmente o está suscrito (después del delay)
    if (isDismissed) {
        return null;
    }

    // Versión compacta (para usar en settings o toolbar)
    if (compact) {
        return (
            <div className="flex items-center space-x-2">
                <Switch
                    id="push-notifications"
                    checked={isSubscribed}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            if (isPermissionGranted) {
                                subscribe();
                            } else {
                                requestPermission();
                            }
                        } else {
                            unsubscribe();
                        }
                    }}
                    disabled={loading || permission === 'denied'}
                />
                <Label htmlFor="push-notifications" className="flex items-center gap-2">
                    {isSubscribed ? (
                        <BellRing className="h-4 w-4 text-green-600" />
                    ) : (
                        <Bell className="h-4 w-4" />
                    )}
                    Notificaciones Push
                </Label>
                {loading && <LoadingSpinner size={16} />}
            </div>
        );
    }

    // Versión completa (para página de configuración)
    return (
        <Card className="relative">
            {/* Botón de cerrar */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => setIsDismissed(true)}
            >
                <X className="h-4 w-4" />
            </Button>

            <CardHeader>
                <div className="flex items-center gap-2">
                    {isSubscribed ? (
                        <BellRing className="h-5 w-5 text-green-600" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    <CardTitle>Notificaciones Push</CardTitle>
                </div>
                <CardDescription>
                    Recibe notificaciones incluso cuando la aplicación está cerrada
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Estado de permisos */}
                {permission === 'denied' && (
                    <Alert variant="destructive">
                        <BellOff className="h-4 w-4" />
                        <AlertTitle>Permisos denegados</AlertTitle>
                        <AlertDescription>
                            Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador.
                        </AlertDescription>
                    </Alert>
                )}

                {permission === 'default' && showPrompt && (
                    <Alert>
                        <Bell className="h-4 w-4" />
                        <AlertTitle>Activa las notificaciones</AlertTitle>
                        <AlertDescription>
                            Mantente informado sobre análisis, tareas y actualizaciones importantes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Mostrar mensaje de éxito si está suscrito */}
                {isSubscribed && (
                    <Alert className="border-green-500 bg-green-50">
                        <BellRing className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-900">¡Notificaciones activadas!</AlertTitle>
                        <AlertDescription className="text-green-800">
                            Recibirás notificaciones push en tiempo real. Este mensaje se cerrará automáticamente.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Estado de suscripción */}
                {!isSubscribed && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Estado</Label>
                                <p className="text-sm text-muted-foreground">
                                    Las notificaciones push están desactivadas
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {loading && <LoadingSpinner size={20} />}
                                <div className="h-3 w-3 rounded-full bg-gray-300" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                {!isSubscribed && (
                    <div className="flex flex-col gap-2">
                        {!isPermissionGranted && permission !== 'denied' && (
                            <Button
                                onClick={requestPermission}
                                disabled={loading}
                                className="w-full"
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                Solicitar Permisos
                            </Button>
                        )}

                        {isPermissionGranted && (
                            <Button
                                onClick={subscribe}
                                disabled={loading}
                                className="w-full"
                                variant="default"
                            >
                                <BellRing className="mr-2 h-4 w-4" />
                                Activar Notificaciones
                            </Button>
                        )}
                    </div>
                )}

                {/* Botón de desactivar (solo si está suscrito) */}
                {isSubscribed && (
                    <Button
                        onClick={unsubscribe}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                    >
                        <BellOff className="mr-2 h-4 w-4" />
                        Desactivar Notificaciones
                    </Button>
                )}

                {/* Información adicional - solo si no está suscrito */}
                {!isSubscribed && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium mb-1">Ventajas:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Recibe actualizaciones en tiempo real</li>
                            <li>Notificaciones incluso con la app cerrada</li>
                            <li>No te pierdas análisis completados</li>
                            <li>Alertas de tareas urgentes</li>
                        </ul>
                    </div>
                )}

                {/* Test notification button (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && isSubscribed && (
                    <Button
                        onClick={async () => {
                            const registration = await navigator.serviceWorker.ready;
                            registration.showNotification('Notificación de Prueba', {
                                body: 'Esta es una notificación de prueba del sistema INIA',
                                icon: '/icons/icon-192x192.png',
                                badge: '/icons/icon-72x72.png',
                                tag: 'test-notification',
                            });
                        }}
                        variant="secondary"
                        className="w-full"
                    >
                        Enviar Notificación de Prueba
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}