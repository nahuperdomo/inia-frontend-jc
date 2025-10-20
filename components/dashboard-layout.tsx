"use client"

import type { ReactNode } from "react"
import { useState } from "react"
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
  SheetTrigger,
} from "@/components/ui/sheet"
import { Leaf, Plus, List, BarChart3, Settings, LogOut, Shield, Bell, Menu } from "lucide-react"
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

  // Componente reutilizable para el contenido de navegación
  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center flex-shrink-0 px-4 mb-8">
        <div className="bg-primary rounded-full p-2">
          <Leaf className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-bold">Sistema INIA</h1>
          <p className="text-xs text-muted-foreground">Gestión Agropecuaria</p>
        </div>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors relative",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {/* Badge para notificaciones no leídas */}
            {item.href === "/notificaciones" && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="flex-shrink-0 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start mt-2 text-destructive hover:text-destructive"
          onClick={() => {
            setShowLogoutDialog(true)
            if (isMobile) setMobileMenuOpen(false)
          }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
          <NavigationContent />
        </div>
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full pt-5">
            <NavigationContent isMobile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu button and Title */}
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))?.name || "Dashboard"}
              </h2>
            </div>

            {/* Right side - Notifications and user menu */}
            <div className="flex items-center gap-4">
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

              {/* User info/avatar placeholder */}
              <div className="text-sm text-gray-600 hidden sm:block">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual y serás redirigido a la página de inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
