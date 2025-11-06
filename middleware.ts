import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Obtenemos el accessToken de las cookies HttpOnly
    const accessToken = request.cookies.get('accessToken')?.value

    // Si la ruta es /login y hay accessToken, redirigimos al dashboard
    if (request.nextUrl.pathname === '/login' && accessToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = [
        '/login', 
        '/registro/usuario',
        '/forgot-password',
        '/reset-password',
        '/admin-setup'  // Configuración inicial del admin (sin autenticación previa)
    ];

    // Si no hay accessToken y no estamos en una ruta pública, redirigimos a /login
    if (!accessToken && !publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// Configuramos las rutas en las que se ejecutará el middleware
export const config = {
    matcher: [
        /*
         * Coincide con todas las rutas excepto:
         * 1. /api (rutas API)
         * 2. /_next (archivos de Next.js)
         * 3. /fonts (recursos estáticos)
         * 4. /favicon.ico, /sitemap.xml (archivos públicos)
         */
        '/((?!api|_next|fonts|favicon.ico|sitemap.xml).*)',
    ],
}
