"use client"

import React, { ReactNode } from "react"

interface FormProps {
    onSubmit: (e: React.FormEvent) => void
    children: ReactNode
    className?: string
}


export function Form({ onSubmit, children, className = "space-y-6" }: FormProps) {
    return (
        <form onSubmit={onSubmit} className={className}>
            {children}
        </form>
    )
}

interface FormSectionProps {
    title?: string
    description?: string
    children: ReactNode
    className?: string
}


export function FormSection({ title, description, children, className = "space-y-4" }: FormSectionProps) {
    return (
        <div className={className}>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

interface FormActionsProps {
    children: ReactNode
    className?: string
}


export function FormActions({ children, className = "flex justify-end space-x-3" }: FormActionsProps) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}
