import React from 'react'
import { Info, X } from 'lucide-react'

export default function HelpPanel({ onClose }) {
  return (
    <div className="fixed top-24 left-4 z-[5500] w-[360px] max-w-[92vw] pointer-events-auto">
      <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Info className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-800">Reglas y funcionamiento</h3>
            <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-4 py-3 text-sm text-gray-700 space-y-3">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Publicaciones por día:</strong> cada usuario puede crear <strong>hasta 2 marcadores por día</strong>.</li>
            <li><strong>Votos:</strong> cada usuario puede votar <strong>una sola vez por publicación</strong> (Confirmar o Negar).</li>
            <li><strong>Tiempo del marcador:</strong> inicia con <strong>15 minutos</strong>. Cada <strong>confirmación</strong> de otro usuario suma <strong>+15 min</strong>, hasta <strong>1 hora</strong>. El creador no extiende.</li>
            <li><strong>Zona:</strong> funciona solo dentro de <strong>La Rioja</strong>. Se valida con tu ubicación.</li>
            <li><strong>Tope:</strong> máximo de <strong>70 marcadores activos</strong>.</li>
            <li>Para agregar un marcador: tocá el botón <strong>“+”</strong> y luego hacé <strong>clic en el mapa</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
