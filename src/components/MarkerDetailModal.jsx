import React from 'react'
import { Clock, ThumbsUp, ThumbsDown, X } from 'lucide-react'

export default function MarkerDetailModal({ marker, onClose, onVote, getTimeRemaining, hasUserVoted }) {
  if (!marker) return null
  const voted = hasUserVoted(marker)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl">
        <div className="px-1 py-1 border-b border-gray-200">
          <div className="grid grid-cols-[1fr_auto] items-start gap-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{marker.streetName}</h3>
              <p className="text-sm text-gray-500">Reportado por: {marker.createdBy}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={24} />
            </button>
          </div>
        </div>

        <p className="mt-4 text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">{marker.description}</p>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Tiempo restante</div>
          <div className="flex items-center gap-2 font-medium">
            <Clock size={14} className="text-gray-500" /> {getTimeRemaining(marker.expiresAt)}
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-green-600 font-medium">👍 {marker.votes.confirmations.length}</span>
            <span className="text-red-600 font-medium">👎 {marker.votes.denials.length}</span>
          </div>
          {voted && <span className="mt-2 inline-block text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Ya votaste</span>}
        </div>

        {!voted ? (
          <div className="flex gap-3">
            <button onClick={() => onVote(marker.id, true)} className="flex-1 btn btn-success">
              <ThumbsUp size={18} className="mr-2" /> Confirmar
            </button>
            <button onClick={() => onVote(marker.id, false)} className="flex-1 btn btn-danger">
              <ThumbsDown size={18} className="mr-2" /> Negar
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <button onClick={onClose} className="mt-2 btn">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}
