"use client"

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface RouteGuardProps {
    children: React.ReactNode;
}

/**
 * Componente que protege rutas según el rol del usuario
 * Redirige a /acceso-denegado si el usuario no tiene permisos
 */
export function RouteGuard({ children }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { canAccessRoute, isLoading } = usePermissions();

    useEffect(() => {
        // No hacer nada mientras carga la información del usuario
        if (isLoading) return;

        // Verificar si el usuario puede acceder a la ruta actual
        const hasAccess = canAccessRoute(pathname);

        if (!hasAccess) {
            console.warn(`🚫 Acceso denegado a la ruta: ${pathname}`);
            router.replace('/acceso-denegado');
        }
    }, [pathname, canAccessRoute, isLoading, router]);

    // Mostrar loading mientras se verifica el acceso
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    // Si no tiene acceso, no renderizar nada (el useEffect redirigirá)
    if (!canAccessRoute(pathname)) {
        return null;
    }

    // Si tiene acceso, renderizar el contenido
    return <>{children}</>;
}
