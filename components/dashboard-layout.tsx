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
import { Leaf, Plus, List, BarChart3, Settings, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: "Registro", href: "/registro", icon: Plus },
  { name: "Listado", href: "/listado", icon: List },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Administración", href: "/administracion", icon: Shield },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
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
      <div className="flex flex-col flex-1 overflow-y-auto">{children}</div>

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
