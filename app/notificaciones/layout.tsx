import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Notificaciones - Sistema INIA",
    description: "Gestin de notificaciones del sistema INIA",
}

export default function NotificationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}