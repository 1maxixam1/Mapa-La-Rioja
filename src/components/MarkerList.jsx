import React from 'react'
import { Clock, Trash2 } from 'lucide-react'

export default function MarkerList({ markers, currentUser, onDelete, getTimeRemaining, hasUserVoted, variant = 'side' }) {
  return (
    <div className={`${variant === "side" ? "bg-white/95 backdrop-blur shadow-lg border-l border-gray-200 rounded-l-xl h-full max-h-[calc(100vh-4rem)] w-[min(18rem,90vw)] sm:w-72 md:w-80 lg:w-96 overflow-y-auto" : "bg-transparent h-full w-full"}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Marcadores</h2>
        <p className="text-xs text-gray-500 mt-1">Publicaciones activas y acciones disponibles</p>
      </div>
      <div className="p-4 space-y-4">
        {markers.map(marker => (
          <div key={marker.id} className="bg-white rounded-lg p-3 border shadow-sm">
            <div className="mb-2">
              <h3 className="font-medium text-sm text-gray-800">{marker.streetName}</h3>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Clock size={12} className="opacity-70" />
                <span>{getTimeRemaining(marker.expiresAt)}</span>
                <span>• Por: {marker.createdBy}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">{marker.description}</p>
            <div className="space-y-2">
              <div className="flex gap-3 text-xs">
                <span className="text-green-600">👍 {marker.votes.confirmations.length}</span>
                <span className="text-red-600">👎 {marker.votes.denials.length}</span>
                {hasUserVoted(marker) && (
                  <span className="text-blue-600 bg-blue-100 px-1 rounded">✓ Votaste</span>
                )}
              </div>
              {marker.createdBy === currentUser && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(marker.id)}
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Trash2 size={12} /> Eliminar
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {markers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay marcadores activos</p>
            <p className="text-xs mt-2">Hacé click en “+” y luego en el mapa para agregar uno</p>
          </div>
        )}
      </div>
    </div>
  )
}
