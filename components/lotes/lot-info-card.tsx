"use client"

interface LotInfoCardProps {
  lot: any
}

export function LotInfoCard({ lot }: LotInfoCardProps) {
  if (!lot) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">Información del Lote</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-blue-600">Lote:</span>
          <span className="ml-2 font-medium">{lot.lote}</span>
        </div>
        <div>
          <span className="text-blue-600">Especie:</span>
          <span className="ml-2 font-medium">{lot.especie}</span>
        </div>
        <div>
          <span className="text-blue-600">Cultivar:</span>
          <span className="ml-2 font-medium">{lot.cultivar}</span>
        </div>
        <div>
          <span className="text-blue-600">Origen:</span>
          <span className="ml-2 font-medium">{lot.origen}</span>
        </div>
      </div>
    </div>
  )
}
