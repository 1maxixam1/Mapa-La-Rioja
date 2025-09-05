import React, { useEffect, useState } from 'react'
import { MapPin, User, Plus } from 'lucide-react'

import MapView from './components/MapView'
import MarkerList from './components/MarkerList'
import AddMarkerModal from './components/AddMarkerModal'
import MarkerDetailModal from './components/MarkerDetailModal'
import LoginModal from './components/LoginModal'
import HelpPanel from './components/HelpPanel'
import BottomSheet from './components/BottomSheet'
import { fetchMarkers as apiFetchMarkers, createMarker as apiCreateMarker, voteMarkerApi as apiVoteMarker, deleteMarkerApi as apiDeleteMarker } from './lib/api'

import { loadMarkers, saveMarkers, loadVotes, saveVotes, getCreateCount, incCreateCount, saveUser, loadUser, clearUser } from './lib/storage'
import { DAILY_CREATE_LIMIT, MAX_MARKER_LIFETIME_MS, NEW_MARKER_BASE_MS, EXTENSION_MS, MAX_ACTIVE_MARKERS } from './lib/limits'
import { LA_RIOJA_BOUNDS } from './lib/geo'

function isoDateToday() { return new Date().toISOString().slice(0,10) }

export default function App() {
  const [currentUser, setCurrentUser] = useState(loadUser() || null)
  const [showLogin, setShowLogin] = useState(!loadUser())
  const [markers, setMarkers] = useState([])
  const [showPanel, setShowPanel] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [placeMode, setPlaceMode] = useState(false)

  const [newMarkerData, setNewMarkerData] = useState({ lat:null, lng:null, streetName:'', description:'' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null)

  // Geolock
  const [geoAllowed, setGeoAllowed] = useState(false)
  const [geoChecked, setGeoChecked] = useState(false)

  useEffect(() => {
    const loaded = loadMarkers()
    setMarkers(loaded.filter(m => m.expiresAt > Date.now()))
  }, [])

  useEffect(() => { saveMarkers(markers) }, [markers])

  useEffect(() => {
    const t = setInterval(() => { setMarkers(prev => prev.filter(m => m.expiresAt > Date.now())) }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!('geolocation' in navigator)) { setGeoChecked(true); setGeoAllowed(false); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const [sw, ne] = LA_RIOJA_BOUNDS
        const inside =
          latitude  >= Math.min(sw[0], ne[0]) &&
          latitude  <= Math.max(sw[0], ne[0]) &&
          longitude >= Math.min(sw[1], ne[1]) &&
          longitude <= Math.max(sw[1], ne[1])
        setGeoAllowed(!!inside); setGeoChecked(true)
      },
      () => { setGeoAllowed(false); setGeoChecked(true) },
      { enableHighAccuracy:true, timeout:8000 }
    )
  }, [])

  const handleLogin = (username) => { setCurrentUser(username); setShowLogin(false); saveUser(username) }
  const handleLogout = () => { setCurrentUser(null); setShowLogin(true); setSelectedMarker(null); setShowAddForm(false); setShowPanel(false); setPlaceMode(false); clearUser() }

  const addMarker = () => {
    if (!currentUser) return
    if (!newMarkerData.streetName.trim() || newMarkerData.lat==null || newMarkerData.lng==null) { alert('Por favor completa todos los campos requeridos'); return }
    const today = isoDateToday()
    const used = getCreateCount(currentUser, today)
    if (used >= DAILY_CREATE_LIMIT) { alert(`Límite alcanzado: solo 2 publicaciones por día (ya hiciste ${used}).`); return }
    const now = Date.now()
    const activeCount = markers.filter(m => m.expiresAt > now).length
    if (activeCount >= MAX_ACTIVE_MARKERS) { alert(`Se alcanzó el máximo de ${MAX_ACTIVE_MARKERS} marcadores activos.`); return }

    const newMarker = {
      id: `${now}-${Math.random().toString(36).slice(2,8)}`,
      lat: newMarkerData.lat, lng: newMarkerData.lng,
      streetName: newMarkerData.streetName, description: newMarkerData.description,
      createdAt: now, expiresAt: Math.min(now + NEW_MARKER_BASE_MS, now + MAX_MARKER_LIFETIME_MS),
      createdBy: currentUser, votes: { confirmations: [currentUser], denials: [] }
    }
    setMarkers(prev => [...prev, newMarker])
    incCreateCount(currentUser, today)
    setNewMarkerData({ lat:null, lng:null, streetName:'', description:'' })
    setShowAddForm(false)
  }

  const hasUserVoted = (marker) => {
    if (!currentUser) return false
    const votes = loadVotes(currentUser)
    return Boolean(votes[marker.id])
  }

  const getTimeRemaining = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const voteMarker = (markerId, isConfirm) => {
    if (!currentUser) return
    const votes = loadVotes(currentUser)
    if (votes[markerId]) { alert('Ya has votado en esta publicación. (1 voto por usuario)'); return 
    if (import.meta.env.VITE_API_URL) { (async () => { try { await apiCreateMarker(newMarker) } catch (e) { console.warn('API create failed', e) } })() }
  }

    setMarkers(prev => prev.map(marker => {
      if (marker.id !== markerId) return marker
      const updated = { ...marker, votes: { confirmations:[...marker.votes.confirmations], denials:[...marker.votes.denials] } }
      if (isConfirm) {
        if (marker.createdBy === currentUser) {
          if (!updated.votes.confirmations.includes(currentUser)) updated.votes.confirmations.push(currentUser)
          return updated
        }
        if (!updated.votes.confirmations.includes(currentUser)) updated.votes.confirmations.push(currentUser)
        const currentDuration = updated.expiresAt - updated.createdAt
        if (currentDuration < MAX_MARKER_LIFETIME_MS) {
          updated.expiresAt = Math.min(updated.expiresAt + EXTENSION_MS, updated.createdAt + MAX_MARKER_LIFETIME_MS)
        }
      } else {
        if (!updated.votes.denials.includes(currentUser)) updated.votes.denials.push(currentUser)
      }
      return updated
    }))

    votes[markerId] = isConfirm ? 'up' : 'down'
    saveVotes(currentUser, votes)
    setSelectedMarker(null)
  }

  const deleteMarker = (markerId) => {
    const marker = markers.find(m => m.id === markerId)
    if (marker && marker.createdBy !== currentUser) { alert('Solo puedes eliminar tus propias publicaciones'); return }
    setMarkers(prev => prev.filter(m => m.id !== markerId))
    setSelectedMarker(null)
  
    if (import.meta.env.VITE_API_URL) { (async () => { try { await apiVoteMarker(markerId, currentUser, !!isConfirm) } catch (e) { console.warn('API vote failed', e) } })() }
  
    if (import.meta.env.VITE_API_URL) { (async () => { try { await apiDeleteMarker(markerId) } catch (e) { console.warn('API delete failed', e) } })() }
  }

  // Guards geoloc
  if (!geoChecked) return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-6 text-center"><p className="text-gray-700">Verificando ubicación…</p></div>
    </div>
  )
  if (!geoAllowed) return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-6 text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Zona restringida</h2>
        <p className="text-gray-600">Esta aplicación solo funciona dentro de <strong>La Rioja (Argentina)</strong>.</p>
        <p className="text-gray-600 mt-2">Activá la ubicación y recargá si estás en la zona.</p>
      </div>
    </div>
  )
  if (showLogin) return <LoginModal onLogin={handleLogin} defaultUser={currentUser || ''} />

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* MAPA DE FONDO */}
      <div className="absolute inset-0 z-0">
        <MapView
          markers={markers}
          placeMode={placeMode}
          onMapClick={(latlng) => {
            setNewMarkerData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }))
            setShowAddForm(true)
            setPlaceMode(false)
          }}
          onMarkerClick={(m) => setSelectedMarker(m)}
        />
      </div>

      {/* HUD SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow">
              <User className="text-white" size={16} />
            </div>
            <span className="font-medium text-white drop-shadow">Bienvenido, {currentUser}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-white drop-shadow">Marcadores activos: {markers.length}</span>
            <button onClick={() => setShowHelp(v => !v)} className="btn btn-ghost">Ayuda</button>
            <button onClick={() => setShowPanel(p => !p)} className="btn btn-solid"><MapPin size={16} /></button>
            <button onClick={handleLogout} className="btn btn-danger">Salir</button>
          </div>
        </div>
      </div>

      {/* Gradiente para legibilidad del HUD */}
      <div className="absolute top-0 left-0 right-0 h-20 z-40 pointer-events-none bg-gradient-to-b from-black/30 to-transparent" />

      {/* FAB Agregar + chip animado */}
      <div className="absolute bottom-6 right-6 z-50 safe-bottom md:right-6 md:bottom-6">
        <button onClick={() => setPlaceMode(p => !p)} className={`btn btn-icon ${placeMode ? 'btn-warn' : 'btn-success'}`} title={placeMode ? 'Cancelar ubicación' : 'Agregar marcador'}>
          <Plus size={20} />
        </button>
      </div>
      {placeMode && (
        <div className="absolute bottom-20 left-6 z-40 hint-chip">
          <div className="bg-black/70 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            Haga click en el mapa para marcar un punto
          </div>
        </div>
      )}

      {/* Panel de ayuda */}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      {/* Panel lateral */}
      {showPanel && (
        <div className="absolute right-0 top-16 bottom-0 z-40">
          <MarkerList markers={markers} currentUser={currentUser} onDelete={deleteMarker} getTimeRemaining={getTimeRemaining} hasUserVoted={hasUserVoted} />
        </div>
      )}

      {/* Modales */}
      {showAddForm && (
        <AddMarkerModal newMarkerData={newMarkerData} setNewMarkerData={setNewMarkerData} onConfirm={addMarker} onCancel={() => setShowAddForm(false)} />
      )}
      {selectedMarker && (
        <MarkerDetailModal marker={selectedMarker} onClose={() => setSelectedMarker(null)} onVote={voteMarker} getTimeRemaining={getTimeRemaining} hasUserVoted={hasUserVoted} />
      )}
    </div>
  )
}
