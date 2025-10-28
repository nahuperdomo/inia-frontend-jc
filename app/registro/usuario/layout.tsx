import type React from "react"

export default function UsuarioRegistroLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Este layout es específico para el registro de usuario y no utiliza DashboardLayout
    return <>{children}</>
}
