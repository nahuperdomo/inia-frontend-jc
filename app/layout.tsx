import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import PWAProvider from "@/components/pwa-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema INIA - Gestión Agropecuaria",
  description: "Sistema de gestión para el Instituto Nacional de Innovación Agropecuaria",
  generator: "v0.app",
  manifest: "/manifest.json",
  authors: [
    { name: "INIA" }
  ],
  applicationName: "INIA - Sistema de Gestión de Análisis de Semillas",
  appleWebApp: {
    capable: true,
    title: "INIA",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="application-name" content="INIA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="INIA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <PWAProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
        </PWAProvider>
        <Analytics />
      </body>
    </html>
  )
}
