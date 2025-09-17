"use client"

import type React from "react"

import { Package } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No se encontraron lotes",
  description = "No se encontraron lotes que coincidan con la búsqueda",
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {icon || <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />}
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p>{description}</p>
    </div>
  )
}
