"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevenir que el mini-infobar aparezca en móvil
            e.preventDefault()
            // Guardar el evento para que pueda ser disparado más tarde
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Mostrar nuestro propio prompt de instalación
            setShowInstallPrompt(true)
        }

        window.addEventListener("beforeinstallprompt", handler)

        // Verificar si ya está instalado
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowInstallPrompt(false)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return
        }

        // Mostrar el prompt de instalación
        deferredPrompt.prompt()

        // Esperar a que el usuario responda al prompt
        const { outcome } = await deferredPrompt.userChoice

        // Limpiar el prompt ya que solo puede ser usado una vez
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        // Guardar en localStorage que el usuario cerró el prompt
        localStorage.setItem("pwa-install-dismissed", "true")
    }

    // No mostrar si ya fue cerrado anteriormente
    useEffect(() => {
        const dismissed = localStorage.getItem("pwa-install-dismissed")
        if (dismissed === "true") {
            setShowInstallPrompt(false)
        }
    }, [])

    if (!showInstallPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
            <Card className="border-2 border-primary/20 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Download className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">
                                Instalar INIA App
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Instala nuestra aplicación para acceso rápido y funciones offline
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleInstallClick}
                                    className="flex-1"
                                >
                                    Instalar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDismiss}
                                    className="flex-shrink-0"
                                >
                                    Ahora no
                                </Button>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }

        window.addEventListener("beforeinstallprompt", handler)

        // Verificar si ya está instalado
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstallable(false)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return
        }

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        setDeferredPrompt(null)
        setIsInstallable(false)
    }

    if (!isInstallable) {
        return null
    }

    return (
        <Button
            onClick={handleInstallClick}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            <Download className="h-4 w-4" />
            Instalar App
        </Button>
    )
}