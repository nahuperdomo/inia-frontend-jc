// Importamos next-pwa
import NextPWA from 'next-pwa';

const withPWA = NextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // Deshabilitamos en desarrollo para evitar recargas
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Aseguramos que las rutas API se redirijan correctamente al backend
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.18:8080/api/:path*',
      },
      // Añadimos una redirección específica para la API de autenticación
      {
        source: '/api/v1/auth/:path*',
        destination: 'http://192.168.1.18:8080/api/v1/auth/:path*',
      },
    ]
  },
}

export default withPWA(nextConfig)
