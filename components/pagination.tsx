"use client"

import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
  showRange?: number; // how many page buttons to show around current
  alwaysShow?: boolean;
}

function createPageRange(current: number, total: number, show: number) {
  const pages: (number | "...")[] = [];
  if (total <= 1) return pages;

  const left = Math.max(0, current - show);
  const right = Math.min(total - 1, current + show);

  if (left > 0) pages.push(0);
  if (left > 1) pages.push("...");

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 2) pages.push("...");
  if (right < total - 1) pages.push(total - 1);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange, showRange = 1, alwaysShow = false }: PaginationProps) {
  if (totalPages <= 1 && !alwaysShow) return null;

  const pages = createPageRange(currentPage, totalPages, showRange);
  const pagesToRender = pages.length > 0 ? pages : (alwaysShow ? [0] : []);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
      >
        {/* previous */}
        <span className="sr-only">Anterior</span>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </Button>

      {pagesToRender.map((p, idx) =>
        p === "..." ? (
          <div key={`e-${idx}`} className="px-3 py-1 text-sm text-muted-foreground">...</div>
        ) : (
          <Button
            key={`p-${p}`}
            size="sm"
            variant={Number(p) === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(Number(p))}
          >
            {Number(p) + 1}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        <span className="sr-only">Siguiente</span>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </Button>
    </div>
  );
}
