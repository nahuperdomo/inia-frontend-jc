'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';
import { useAuth } from '@/components/auth-provider';

export function PushNotificationManager() {
    const { user } = useAuth();
    const {
        isSupported,
        isSubscribed,
        isLoading,
        error,
        permission,
        subscribe,
        unsubscribe,
        requestPermission,
    } = usePushNotifications();

    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Mostrar el prompt solo si:
        // 1. Hay un usuario autenticado
        // 2. Las notificaciones están soportadas
        // 3. No está suscrito
        // 4. El permiso es "default" (no ha sido preguntado)
        // 5. No ha sido descartado manualmente
        if (
            user &&
            isSupported &&
            !isSubscribed &&
            permission === 'default' &&
            !dismissed &&
            !isLoading
        ) {
            // Esperar un poco antes de mostrar el prompt (mejor UX)
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [user, isSupported, isSubscribed, permission, dismissed, isLoading]);

    const handleSubscribe = async () => {
        const success = await subscribe();
        if (success) {
            setShowPrompt(false);
        }
    };

    const handleUnsubscribe = async () => {
        const confirmed = window.confirm(
            '¿Estás seguro de que deseas desactivar las notificaciones push?'
        );
        if (confirmed) {
            await unsubscribe();
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        // Guardar en localStorage para no volver a mostrar en esta sesión
        localStorage.setItem('push-prompt-dismissed', 'true');
    };

    const handleEnableFromSettings = async () => {
        if (permission === 'default') {
            await handleSubscribe();
        } else if (permission === 'denied') {
            alert(
                'Los permisos de notificación fueron denegados. Por favor, habilítalos en la configuración de tu navegador.'
            );
        }
    };

    // No mostrar nada si no está soportado o no hay usuario
    if (!isSupported || !user) {
        return null;
    }

    // Prompt flotante para solicitar suscripción
    if (showPrompt && !isSubscribed) {
        return (
            <div className="fixed bottom-4 right-4 z-50 max-w-sm">
                <Card className="shadow-lg">
                    <CardHeader className="relative pb-3">
                        <button
                            onClick={handleDismiss}
                            className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cerrar</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Notificaciones Push</CardTitle>
                        </div>
                        <CardDescription>
                            Recibe notificaciones instantáneas sobre análisis, aprobaciones y actualizaciones importantes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Activando...' : 'Activar'}
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            variant="outline"
                            className="flex-1"
                        >
                            Ahora no
                        </Button>
                    </CardContent>
                    {error && (
                        <div className="px-6 pb-4">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // Botón flotante para gestionar suscripción (cuando ya está suscrito o rechazado)
    if (permission !== 'default' && !showPrompt) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                {isSubscribed ? (
                    <Button
                        onClick={handleUnsubscribe}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg"
                        title="Desactivar notificaciones push"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                ) : permission === 'denied' ? (
                    <Button
                        onClick={handleEnableFromSettings}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg opacity-50"
                        title="Notificaciones desactivadas - Habilitar en configuración del navegador"
                    >
                        <BellOff className="h-5 w-5" />
                    </Button>
                ) : null}
            </div>
        );
    }

    return null;
}
