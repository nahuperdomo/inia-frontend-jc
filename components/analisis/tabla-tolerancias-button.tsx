"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Table2 } from "lucide-react"
import { PdfViewerModal } from "@/components/pdf-viewer-modal"

interface TablaToleranciasButtonProps {
  pdfPath: string
  title: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function TablaToleranciasButton({
  pdfPath,
  title,
  variant = "outline",
  size = "sm",
  className,
}: TablaToleranciasButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Table2 className="h-4 w-4 mr-2" />
        {title}
      </Button>

      <PdfViewerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pdfUrl={pdfPath}
        title={title}
      />
    </>
  )
}

// Alias para compatibilidad con código anterior
export const GuiaPdfButton = TablaToleranciasButton
