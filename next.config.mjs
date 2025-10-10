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
    // Para desarrollo local (frontend local, backend en Docker) usamos localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Aseguramos que las rutas API se redirijan correctamente al backend
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      // Añadimos una redirección específica para la API de autenticación
      {
        source: '/api/v1/auth/:path*',
        destination: `${apiBaseUrl}/api/v1/auth/:path*`,
      },
    ]
  },
}

export default nextConfig
