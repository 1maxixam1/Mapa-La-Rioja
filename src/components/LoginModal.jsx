import React, { useState } from 'react'
import { MapPin, LogIn, UserPlus } from 'lucide-react'
import { loadUsers, saveUsers, getLastSignupAt, setLastSignupAt } from '../lib/storage'
import { SIGNUP_WINDOW_MS } from '../lib/limits'

export default function LoginModal({ onLogin, defaultUser }) {
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const username = e.currentTarget.username.value.trim()
    if (!username) return
    const users = loadUsers()
    if (!users.includes(username)) {
      setMsg('El usuario no existe. Crea una cuenta o elige uno existente.')
      return
    }
    onLogin(username)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    const username = e.currentTarget.username.value.trim()
    if (!username) return
    const users = loadUsers()
    if (users.includes(username)) {
      setMsg('El usuario ya existe. Elegí otro nombre o iniciá sesión.')
      return
    }
    const now = Date.now()
    const last = getLastSignupAt()
    if (last && (now - last) < SIGNUP_WINDOW_MS) {
      const remain = Math.ceil((SIGNUP_WINDOW_MS - (now - last)) / (60*60*1000))
      setMsg(`Solo se puede crear 1 usuario cada 16 horas. Intentalo en ~${remain}h.`)
      return
    }
    saveUsers([...users, username])
    setLastSignupAt(now)
    setMsg('Usuario creado. Ya podés iniciar sesión.')
    setMode('login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">MapAlert</h1>
          <p className="text-gray-600">Reportá y confirmá eventos en tiempo real</p>
        </div>

        <div className="flex mb-4 gap-2">
          <button onClick={() => { setMode('login'); setMsg('') }} className={'flex-1 py-2 rounded-lg text-sm ' + (mode==='login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700')}>Ingresar</button>
          <button onClick={() => { setMode('signup'); setMsg('') }} className={'flex-1 py-2 rounded-lg text-sm ' + (mode==='signup' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700')}>Crear cuenta</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de usuario</label>
              <input type="text" name="username" defaultValue={defaultUser || ''} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ingresa tu nombre de usuario" required />
            </div>
            <button type="submit" className="btn btn-success w-full"><LogIn className="mr-2" size={20} /> Iniciar Sesión</button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo usuario</label>
              <input type="text" name="username" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Elige un nombre único" required />
            </div>
            <button type="submit" className="btn btn-solid w-full"><UserPlus className="mr-2" size={20} /> Crear cuenta</button>
          </form>
        )}

        {!!msg && <p className="mt-4 text-center text-sm text-red-600">{msg}</p>}
        <div className="mt-4 text-center text-xs text-gray-500"><p>Regla: 1 cuenta nueva cada 16 horas. Nombres únicos.</p></div>
      </div>
    </div>
  )
}
