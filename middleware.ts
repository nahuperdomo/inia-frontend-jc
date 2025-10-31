import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // El backend usa JSESSIONID (no JWT), así que verificamos esa cookie
    const jsessionid = request.cookies.get('JSESSIONID')?.value

    // Si la ruta es /login y hay JSESSIONID, redirigimos al dashboard
    if (request.nextUrl.pathname === '/login' && jsessionid) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ['/login', '/registro/usuario'];

    // Si no hay JSESSIONID y no estamos en una ruta pública, redirigimos a /login
    if (!jsessionid && !publicRoutes.includes(request.nextUrl.pathname)) {
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
