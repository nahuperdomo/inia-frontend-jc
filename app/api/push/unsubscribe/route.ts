import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/push/unsubscribe
 * 
 * Endpoint para desuscribirse de notificaciones push
 * Elimina la suscripción del backend
 */
export async function POST(request: NextRequest) {
    try {
        // Obtener token de autenticación
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Enviar solicitud de desuscripción al backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const response = await fetch(`${API_BASE_URL}/api/push/unsubscribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Error from backend:', error);
            return NextResponse.json(
                { error: 'Error al eliminar suscripción' },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Suscripción eliminada' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in push unsubscribe:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
