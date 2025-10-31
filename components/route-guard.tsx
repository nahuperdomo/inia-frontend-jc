"use client"

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions, PUBLIC_ROUTES } from '@/lib/hooks/usePermissions';

interface RouteGuardProps {
    children: React.ReactNode;
}

/**
 * Componente que protege rutas según el rol del usuario
 * Redirige a /acceso-denegado si el usuario no tiene permisos
 * Las rutas públicas (PUBLIC_ROUTES) no requieren autenticación
 */
export function RouteGuard({ children }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { canAccessRoute, isLoading, user } = usePermissions();

    // Verificar si la ruta actual es pública
    const isPublicRoute = PUBLIC_ROUTES.some(publicRoute =>
        pathname === publicRoute || pathname.startsWith(publicRoute + '/')
    );

    useEffect(() => {
        // Las rutas públicas siempre son accesibles
        if (isPublicRoute) return;

        // ⚠️ CRÍTICO: Esperar a que termine de cargar ANTES de verificar permisos
        if (isLoading) return;

        // ⚠️ CRÍTICO: Si no hay usuario después de cargar, redirigir a login
        if (!user) {
            console.warn(`🚫 No hay usuario autenticado, redirigiendo a login`);
            router.replace('/login');
            return;
        }

        // Verificar si el usuario puede acceder a la ruta actual
        const hasAccess = canAccessRoute(pathname);

        if (!hasAccess) {
            console.warn(`🚫 Acceso denegado a la ruta: ${pathname} para usuario: ${user.name} (${user.role})`);
            router.replace('/acceso-denegado');
        }
    }, [pathname, canAccessRoute, isLoading, router, isPublicRoute, user]);

    // Las rutas públicas se renderizan inmediatamente
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // ⚠️ CRÍTICO: Mostrar loading mientras carga O mientras no hay usuario
    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    // ⚠️ CRÍTICO: Solo verificar acceso DESPUÉS de confirmar que user está cargado
    const hasAccess = canAccessRoute(pathname);

    if (!hasAccess) {
        // No renderizar nada, el useEffect ya redirigió
        return null;
    }

    // Si tiene acceso, renderizar el contenido
    return <>{children}</>;
}

