"use client"

import { useAuth } from '@/components/auth-provider';

/**
 * Mapeo de rutas a roles permitidos
 */
export const ROUTE_PERMISSIONS = {
    '/dashboard': ['analista', 'administrador', 'observador'] as const,
    '/registro': ['analista', 'administrador'] as const,
    '/registro/lotes': ['analista', 'administrador'] as const,
    '/registro/analisis': ['analista', 'administrador'] as const,
    '/registro/usuario': ['analista', 'administrador'] as const,
    '/registro/empresa': ['analista', 'administrador'] as const,
    '/listado': ['analista', 'administrador', 'observador'] as const,
    '/listado/lotes': ['analista', 'administrador', 'observador'] as const,
    '/listado/analisis': ['analista', 'administrador', 'observador'] as const,
    '/listado/legado': ['analista', 'administrador', 'observador'] as const,
    '/reportes': ['analista', 'administrador', 'observador'] as const,
    '/reportes/validacion': ['analista', 'administrador', 'observador'] as const,
    '/notificaciones': ['analista', 'administrador'] as const,
    '/administracion': ['administrador'] as const,
    '/administracion/usuario': ['administrador'] as const,
    '/administracion/catalogos': ['administrador'] as const,
    '/administracion/contactos': ['administrador'] as const,
};

/**
 * Acciones/características que requieren permisos específicos
 */
export const FEATURE_PERMISSIONS = {
    // Botones de acción
    'finalizar-analisis': ['analista', 'administrador'] as const,
    'aprobar-analisis': ['administrador'] as const,
    'marcar-repetir': ['administrador'] as const,
    'editar-analisis': ['analista', 'administrador'] as const,
    'eliminar-analisis': ['administrador'] as const,

    // Formularios y registro
    'crear-lote': ['analista', 'administrador'] as const,
    'editar-lote': ['analista', 'administrador'] as const,
    'eliminar-lote': ['administrador'] as const,
    'registrar-analisis': ['analista', 'administrador'] as const,

    // Usuarios
    'crear-usuario': ['administrador'] as const,
    'editar-usuario': ['administrador'] as const,
    'eliminar-usuario': ['administrador'] as const,
    'aprobar-usuario': ['administrador'] as const,

    // Catálogos
    'editar-catalogos': ['administrador'] as const,

    // Exportación
    'exportar-excel': ['analista', 'administrador', 'observador'] as const,
    'exportar-pdf': ['analista', 'administrador', 'observador'] as const,

    // Notificaciones
    'ver-notificaciones': ['analista', 'administrador'] as const,
    'gestionar-notificaciones': ['administrador'] as const,
};

/**
 * Hook para verificar permisos del usuario
 */
export function usePermissions() {
    const { user, isLoading } = useAuth();

    /**
     * Verifica si el usuario tiene acceso a una ruta específica
     */
    const canAccessRoute = (route: string): boolean => {
        if (isLoading || !user) return false;

        // Buscar la ruta exacta o la ruta padre
        const routeKey = Object.keys(ROUTE_PERMISSIONS).find(key =>
            route === key || route.startsWith(key + '/')
        );

        if (!routeKey) {
            // Si no hay restricción definida, permitir por defecto (o cambiar a false para ser más restrictivo)
            return true;
        }

        const allowedRoles = ROUTE_PERMISSIONS[routeKey as keyof typeof ROUTE_PERMISSIONS];
        return (allowedRoles as readonly string[]).includes(user.role);
    };

    /**
     * Verifica si el usuario tiene permiso para una característica/acción específica
     */
    const canUseFeature = (feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
        if (isLoading || !user) return false;

        const allowedRoles = FEATURE_PERMISSIONS[feature];
        if (!allowedRoles) return false;

        return (allowedRoles as readonly string[]).includes(user.role);
    };

    /**
     * Verifica si el usuario tiene un rol específico
     */
    const hasRole = (role: 'analista' | 'administrador' | 'observador'): boolean => {
        if (isLoading || !user) return false;
        return user.role === role;
    };

    /**
     * Verifica si el usuario es administrador
     */
    const isAdmin = (): boolean => {
        return hasRole('administrador');
    };

    /**
     * Verifica si el usuario es analista
     */
    const isAnalista = (): boolean => {
        return hasRole('analista');
    };

    /**
     * Verifica si el usuario es observador
     */
    const isObservador = (): boolean => {
        return hasRole('observador');
    };

    return {
        user,
        isLoading,
        canAccessRoute,
        canUseFeature,
        hasRole,
        isAdmin,
        isAnalista,
        isObservador,
    };
}
