import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ['/login', '/registro/usuario'];

    // Si estamos en una ruta pública, permitir acceso
    if (publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.next()
    }

    // Para rutas protegidas, verificar JSESSIONID
    const jsessionid = request.cookies.get('JSESSIONID')?.value

    // Si no hay JSESSIONID, redirigir a login
    if (!jsessionid) {
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
         * 3. /static (recursos estáticos)
         * 4. Archivos públicos (imágenes, fonts, manifest, etc.)
         */
        '/((?!api|_next|static|.*\\..*|favicon.ico|sitemap.xml|manifest.json|sw.js|workbox-.*).*)',
    ],
}
