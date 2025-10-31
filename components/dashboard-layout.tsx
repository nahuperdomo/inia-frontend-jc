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
import { Leaf, Plus, List, BarChart3, Settings, LogOut, Shield, Bell, Menu, X, Home } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { NotificationDropdown, useNotificationBadge } from "@/components/notificaciones"
import { useAuth } from "@/components/auth-provider"
import { RouteGuard } from "@/components/route-guard"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home, roles: ["analista", "administrador", "observador"] },
  { name: "Registro", href: "/registro", icon: Plus, roles: ["analista", "administrador"] },
  { name: "Listado", href: "/listado", icon: List, roles: ["analista", "administrador", "observador"] },
  { name: "Reportes", href: "/reportes", icon: BarChart3, roles: ["analista", "administrador", "observador"] },
  { name: "Notificaciones", href: "/notificaciones", icon: Bell, roles: ["analista", "administrador"] }, // 🚫 Oculto para observadores
  { name: "Administración", href: "/administracion", icon: Shield, roles: ["administrador"] },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hooks de autenticación y notificaciones
  const { user } = useAuth()
  const { unreadCount } = useNotificationBadge()

  // Filtrar navegación según el rol del usuario
  const filteredNavigation = navigation.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout del backend para invalidar la sesión
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      try {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: "POST",
          credentials: "include" // Enviar JSESSIONID para invalidarla
        });
        console.log("✅ Sesión invalidada en el backend");
      } catch (error) {
        console.error('❌ Error al llamar a logout del backend:', error);
        // Continuar con el logout del frontend aunque falle el backend
      }

      // Limpiar datos locales
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usuario');
        localStorage.removeItem('inia-user');
        sessionStorage.clear();

        // Intentar eliminar la cookie JSESSIONID del lado del cliente
        // Nota: Las cookies HttpOnly no se pueden eliminar desde JS, 
        // pero el backend ya la invalidó
        document.cookie = 'JSESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        console.log("🧹 Cookies y storage limpiados");
      }

      // Mostrar mensaje de confirmación
      toast.success("Sesión cerrada exitosamente", {
        description: "Has sido desconectado del sistema"
      })

      // Redirigir al login
      console.log("🚪 Redirigiendo a /login...");
      router.push('/login')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      toast.error("Error al cerrar sesión", {
        description: "Hubo un problema al cerrar la sesión"
      })
    }
  }

  const confirmLogout = () => {
    setShowLogoutDialog(false)
    handleLogout()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay para menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-90 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop (> 800px) */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto h-full">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="bg-primary rounded-full p-2">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold">Sistema INIA</h1>
              <p className="text-xs text-muted-foreground">Gestión Agropecuaria</p>
            </div>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
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
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile (< 800px) - Menú hamburguesa */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full pt-5 overflow-y-auto">
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center">
              <div className="bg-primary rounded-full p-2">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold">Sistema INIA</h1>
                <p className="text-xs text-muted-foreground">Gestión Agropecuaria</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
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
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Botón hamburguesa para móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Title/Breadcrumb area */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredNavigation.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))?.name || "Dashboard"}
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
              <div className="text-sm text-gray-600">
                Usuario INIA
              </div>
            </div>
          </div>
        </header>

        {/* Content area with route protection */}
        <main className="flex-1 overflow-x-hidden">
          <RouteGuard>
            {children}
          </RouteGuard>
        </main>
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
