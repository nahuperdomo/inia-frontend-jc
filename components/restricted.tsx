"use client"

import { usePermissions } from '@/lib/hooks/usePermissions';
import type { FEATURE_PERMISSIONS } from '@/lib/hooks/usePermissions';

interface RestrictedProps {
    children: React.ReactNode;
    feature?: keyof typeof FEATURE_PERMISSIONS;
    roles?: Array<'analista' | 'administrador' | 'observador'>;
    fallback?: React.ReactNode;
}

/**
 * Componente que muestra su contenido solo si el usuario tiene los permisos necesarios
 * 
 * @example
 * // Por característica
 * <Restricted feature="aprobar-analisis">
 *   <Button>Aprobar</Button>
 * </Restricted>
 * 
 * @example
 * // Por roles
 * <Restricted roles={['administrador']}>
 *   <AdminPanel />
 * </Restricted>
 * 
 * @example
 * // Con fallback
 * <Restricted feature="editar-analisis" fallback={<p>No tienes permisos</p>}>
 *   <Button>Editar</Button>
 * </Restricted>
 */
export function Restricted({ children, feature, roles, fallback = null }: RestrictedProps) {
    const { canUseFeature, hasRole, isLoading } = usePermissions();

    // Mientras carga, no mostrar nada
    if (isLoading) {
        return null;
    }

    // Verificar por característica
    if (feature) {
        if (!canUseFeature(feature)) {
            return <>{fallback}</>;
        }
        return <>{children}</>;
    }

    // Verificar por roles
    if (roles && roles.length > 0) {
        const hasRequiredRole = roles.some(role => hasRole(role));
        if (!hasRequiredRole) {
            return <>{fallback}</>;
        }
        return <>{children}</>;
    }

    // Si no se especificó ni feature ni roles, mostrar el contenido
    return <>{children}</>;
}

/**
 * Componente que oculta su contenido para roles específicos
 */
interface HideForRolesProps {
    children: React.ReactNode;
    roles: Array<'analista' | 'administrador' | 'observador'>;
}

export function HideForRoles({ children, roles }: HideForRolesProps) {
    const { hasRole, isLoading } = usePermissions();

    if (isLoading) return null;

    const shouldHide = roles.some(role => hasRole(role));
    if (shouldHide) return null;

    return <>{children}</>;
}

/**
 * Componente que solo muestra su contenido para administradores
 */
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <Restricted roles={['administrador']} fallback={fallback}>{children}</Restricted>;
}

/**
 * Componente que solo muestra su contenido para analistas
 */
export function AnalistaOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <Restricted roles={['analista']} fallback={fallback}>{children}</Restricted>;
}

/**
 * Componente que solo muestra su contenido para observadores
 */
export function ObservadorOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <Restricted roles={['observador']} fallback={fallback}>{children}</Restricted>;
}
