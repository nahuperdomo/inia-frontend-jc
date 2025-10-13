import type React from "react"
import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata: Metadata = {
    title: "Lotes - Sistema INIA",
    description: "Gestión de lotes del sistema INIA",
}

export default function LotesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>
}