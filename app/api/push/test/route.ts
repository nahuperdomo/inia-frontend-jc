import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/push/test
 * 
 * Endpoint de prueba para enviar una notificación push de prueba
 * Solo disponible en desarrollo
 */
export async function POST(request: NextRequest) {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint no disponible en producción' },
            { status: 403 }
        );
    }

    try {
        const { title, body, url } = await request.json();

        // Obtener token de autenticación
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Enviar notificación de prueba al backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const response = await fetch(`${API_BASE_URL}/api/push/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: title || 'Notificación de Prueba',
                body: body || 'Esta es una notificación de prueba del sistema INIA',
                url: url || '/notificaciones',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Error from backend:', error);
            return NextResponse.json(
                { error: 'Error al enviar notificación de prueba' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(
            { success: true, message: 'Notificación de prueba enviada', data },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in push test:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
