const API_URL = import.meta.env.VITE_API_URL || ''

async function http(path, opts = {}) {
  if (!API_URL) throw new Error('VITE_API_URL no configurada')
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts
  })
  if (!res.ok) {
    let err = await res.text().catch(()=>'')
    throw new Error(err || res.statusText)
  }
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text()
}

export async function fetchMarkers() { return http('/api/markers') }
export async function createMarker(m) { return http('/api/markers', { method: 'POST', body: JSON.stringify(m) }) }
export async function voteMarkerApi(id, user, isConfirm) { return http(`/api/markers/${id}/vote`, { method: 'POST', body: JSON.stringify({ user, isConfirm }) }) }
export async function deleteMarkerApi(id) { return http(`/api/markers/${id}`, { method: 'DELETE' }) }
