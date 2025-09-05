import React from 'react'

export default function AddMarkerModal({ newMarkerData, setNewMarkerData, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">🗺️ Nuevo Marcador</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la calle *</label>
            <input
              type="text"
              value={newMarkerData.streetName}
              onChange={(e) => setNewMarkerData(prev => ({ ...prev, streetName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Av. San Martín 123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={newMarkerData.description}
              onChange={(e) => setNewMarkerData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe qué está ocurriendo..."
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onConfirm} className="btn btn-success">📍 Confirmar</button>
          <button onClick={onCancel} className="flex-1 btn">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
