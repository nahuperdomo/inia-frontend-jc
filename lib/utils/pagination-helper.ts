

export interface PageMetadata<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  isFirst: boolean
  isLast: boolean
}


export function extractPageMetadata<T>(data: any, fallbackPage: number = 0): PageMetadata<T> {
  // Extraer contenido
  const content = data.content || []
  
  // Soportar dos formas que puede devolver el backend
  const pageMeta = data.page ? data.page : data
  
  // Extraer metadata con valores por defecto seguros
  const totalPages = pageMeta.totalPages ?? 1
  const totalElements = pageMeta.totalElements ?? content.length
  const currentPage = pageMeta.number ?? fallbackPage
  
  return {
    content,
    totalPages,
    totalElements,
    currentPage,
    isFirst: currentPage === 0,
    isLast: currentPage >= totalPages - 1
  }
}
