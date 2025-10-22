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

        // Obtener token de autenticación
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Enviar suscripción al backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Error from backend:', error);
            return NextResponse.json(
                { error: 'Error al guardar suscripción' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(
            { success: true, message: 'Suscripción guardada', data },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in push subscribe:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
