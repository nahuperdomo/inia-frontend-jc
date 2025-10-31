import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/components/auth-provider"
import { LoadingProvider } from "@/components/loading-provider"
import { NotificationProvider } from "@/components/notificaciones"
import { QueryProvider } from "@/components/providers/query-provider"
import { PWAInstallPrompt } from "@/components/pwa-install"
import { PushNotificationManager } from "@/components/push-notification-manager"
import { NetworkStatusIndicator } from "@/components/network-status"
import { ToastContainer } from "@/components/ui/toast-container"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "INIA",
  },
  openGraph: {
    type: "website",
    siteName: "INIA",
    title: "Sistema INIA - Gestión Agropecuaria",
    description: "Sistema de gestión para el Instituto Nacional de Innovación Agropecuaria",
  },
  twitter: {
    card: "summary",
    title: "Sistema INIA - Gestión Agropecuaria",
    description: "Sistema de gestión para el Instituto Nacional de Innovación Agropecuaria",
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0066cc',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="INIA" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <QueryProvider>
            <LoadingProvider>
              <AuthProvider>
                <NotificationProvider
                  autoRefreshInterval={30000}
                  enableAutoRefresh={true}
                >
                  {children}
                  <PWAInstallPrompt />
                  <PushNotificationManager />
                  <NetworkStatusIndicator />
                  <ToastContainer />
                  <ConfirmDialog />
                </NotificationProvider>
              </AuthProvider>
            </LoadingProvider>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  )
}
