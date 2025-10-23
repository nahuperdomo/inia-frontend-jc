import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/push/subscribe
 * 
 * Endpoint para suscribirse a notificaciones push
 * Envía la suscripción al backend para ser almacenada
 */
export async function POST(request: NextRequest) {
    try {
        const subscription = await request.json();

        // Validar que la suscripción tiene los campos necesarios
        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Suscripción inválida' },
                { status: 400 }
            );
        }

        // Obtener token de autenticación (priorizar header sobre cookie)
        const authHeader = request.headers.get('authorization');
        const cookieToken = request.cookies.get('token')?.value;
        const token = authHeader?.replace('Bearer ', '') || cookieToken;

        if (!token) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Obtener la URL base del backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        console.log(`[Push Subscribe] Enviando a: ${API_BASE_URL}/api/push/subscribe`);

        // Enviar suscripción al backend con configuración CORS
        const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include', // IMPORTANTE: Incluir cookies en la petición
            body: JSON.stringify(subscription),
        });

        // Manejo detallado de errores HTTP
        if (!response.ok) {
            let errorMessage = 'Error al guardar suscripción';

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                // Si no es JSON, intentar leer como texto
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }

            console.error(`[Push Subscribe] Error ${response.status}:`, errorMessage);

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log('[Push Subscribe] Suscripción guardada exitosamente');

        return NextResponse.json(
            { success: true, message: 'Suscripción guardada', data },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Push Subscribe] Error interno:', error);

        // Diferenciar entre errores de red y otros errores
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { error: 'No se pudo conectar con el servidor backend' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS /api/push/subscribe
 * 
 * Manejo de preflight CORS
 */
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
        },
    });
}