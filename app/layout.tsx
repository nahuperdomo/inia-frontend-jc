import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/components/auth-provider"
// Suspense y características avanzadas pueden causar problemas de hidratación en Docker
// Simplificando importaciones
import "./globals.css"
// Importar script de estabilidad para Next.js
import "../lib/stability-patch.js"

export const metadata: Metadata = {
  title: "Sistema INIA - Gestión Agropecuaria",
  description: "Sistema de gestión para el Instituto Nacional de Innovación Agropecuaria",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        {/* Meta tag para forzar la recarga de cachés */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Desactivar Service Workers */}
        <script src="/disable-sw.js" />
        {/* Script de diagnóstico de entorno */}
        <script src="/browser-check.js" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
