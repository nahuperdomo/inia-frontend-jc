"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Leaf, Plus, List, BarChart3, Settings, LogOut, Shield, Bell, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { NotificationDropdown, useNotificationBadge } from "@/components/notificaciones"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: "Registro", href: "/registro", icon: Plus },
  { name: "Listado", href: "/listado", icon: List },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Notificaciones", href: "/notificaciones", icon: Bell },
  { name: "Administración", href: "/administracion", icon: Shield },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hook para badge de notificaciones en el sidebar
  const { unreadCount } = useNotificationBadge()

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    try {
      // Eliminar token de las cookies
      if (typeof document !== 'undefined') {
        // Eliminar cookie del token
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // También eliminar cualquier otra información de sesión que pueda estar almacenada
        localStorage.removeItem('user')
        sessionStorage.clear()
      }

      // Mostrar mensaje de confirmación
      toast.success("Sesión cerrada exitosamente", {
        description: "Has sido desconectado del sistema"
      })

      // Redirigir al login
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error("Error al cerrar sesión", {
        description: "Hubo un problema al cerrar la sesión"
      })
    }
  }

  const confirmLogout = () => {
    setShowLogoutDialog(false)
    handleLogout()
  }

  // Componente reutilizable para el contenido del menú
  const MenuContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <nav className="flex-1 px-2 sm:px-3 space-y-1.5 sm:space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "group flex items-center px-4 sm:px-3 py-3.5 sm:py-3 text-sm sm:text-base lg:text-sm font-medium rounded-xl sm:rounded-lg smooth-transition relative touch-target",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] sm:scale-105"
                : "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] active:scale-[0.98]",
            )}
          >
            <item.icon className="mr-3 sm:mr-3 h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="flex-1 font-semibold">{item.name}</span>
            {/* Badge para notificaciones no leídas */}
            {item.href === "/notificaciones" && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center font-bold shadow-md animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="flex-shrink-0 p-2 sm:p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 sm:px-3 py-3.5 sm:py-3 text-sm sm:text-base lg:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 smooth-transition touch-target rounded-xl sm:rounded-lg active:scale-95"
          onClick={() => {
            onItemClick?.()
            setShowLogoutDialog(true)
          }}
        >
          <LogOut className="mr-3 sm:mr-3 h-5 w-5 sm:h-5 sm:w-5" />
          <span className="font-semibold">Cerrar Sesión</span>
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="bg-primary rounded-full p-2 shadow-lg">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold">Sistema INIA</h1>
              <p className="text-xs text-muted-foreground">Gestión Agropecuaria</p>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <MenuContent />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] sm:w-[300px] p-0 md:hidden">
          <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
            {/* Header del Sheet */}
            <SheetHeader className="px-5 sm:px-6 py-6 sm:py-7 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-2.5 sm:p-3 shadow-xl flex-shrink-0">
                  <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <SheetTitle className="text-lg sm:text-xl font-bold truncate">Sistema INIA</SheetTitle>
                  <SheetDescription className="text-xs sm:text-sm">Gestión Agropecuaria</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Contenido del menú */}
            <div className="flex-grow flex flex-col overflow-y-auto py-4 sm:py-5">
              <MenuContent onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-3.5 sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-card/95">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Mobile menu button + Title */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Botón hamburguesa - solo en mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0 hover:bg-accent smooth-transition touch-target rounded-xl active:scale-95 z-20"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>

              {/* Title/Breadcrumb */}
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">
                {navigation.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))?.name || "Dashboard"}
              </h2>
            </div>

            {/* Right side - Notifications and user menu */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              <div className="touch-target">
                <NotificationDropdown
                  onNotificationClick={(notification) => {
                    toast.info(`Notificación: ${notification.nombre}`, {
                      description: notification.mensaje
                    });
                  }}
                  onViewAll={() => {
                    router.push('/notificaciones');
                  }}
                />
              </div>

              {/* User info - hidden on small mobile */}
              <div className="text-xs sm:text-sm text-muted-foreground hidden lg:block font-medium">
                Usuario INIA
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">¿Estás seguro de cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Se cerrará tu sesión actual y serás redirigido a la página de inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel className="mt-0 touch-target rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-target rounded-xl"
            >
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
