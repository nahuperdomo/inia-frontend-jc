import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema INIA - Gestión Agropecuaria",
  description: "Sistema de gestión para el Instituto Nacional de Innovación Agropecuaria",
  generator: "v0.app",
  authors: [
    { name: "INIA" }
  ],
  applicationName: "INIA - Sistema de Gestión de Análisis de Semillas",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
