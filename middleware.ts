import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Obtenemos el token de las cookies
    const token = request.cookies.get('token')?.value

    // Si la ruta es /login y hay token, redirigimos al dashboard
    if (request.nextUrl.pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si no hay token y no estamos en /login, redirigimos a /login
    if (!token && request.nextUrl.pathname !== '/login') {
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