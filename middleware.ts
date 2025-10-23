import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // SOLUCIÓN DEFINITIVA PARA NGROK:
    // Con ngrok, las cookies HttpOnly del backend pueden no estar disponibles
    // inmediatamente en el middleware de Next.js debido a que:
    // 1. Backend está en localhost:8080 (HTTP)
    // 2. Frontend/ngrok está en https (HTTPS)
    // 3. Las cookies Secure solo funcionan en HTTPS
    // 4. El middleware se ejecuta en Edge, antes que el navegador maneje las cookies
    //
    // ESTRATEGIA: Solo redirigir de /login a /dashboard si HAY token.
    // NO bloquear acceso a rutas protegidas desde el middleware.
    // Dejar que los componentes manejen la autenticación (client-side).
    
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    console.log('🔍 Middleware - Path:', request.nextUrl.pathname)
    console.log('🔍 Middleware - accessToken:', accessToken ? 'presente' : 'ausente')
    console.log('🔍 Middleware - refreshToken:', refreshToken ? 'presente' : 'ausente')

    // ÚNICA REGLA: Si estás en /login y tienes token, ir al dashboard
    if (request.nextUrl.pathname === '/login' && (accessToken || refreshToken)) {
        console.log('✅ Middleware - Redirigiendo de /login a /dashboard (token presente)')
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Permitir acceso a TODAS las demás rutas
    // La validación de autenticación se hará en cada página/componente
    console.log('✅ Middleware - Permitiendo acceso (validación en componente)')
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
