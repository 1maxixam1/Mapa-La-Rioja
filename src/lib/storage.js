const KEY = {
  markers: 'mapalert:markers',
  votes: (user) => `mapalert:votes:${user}`,
  creates: (user, date) => `mapalert:creates:${user}:${date}`,
  user: 'mapalert:user',
  users: 'mapalert:users',
  lastSignupAt: 'mapalert:lastSignupAt'
};

export function loadMarkers() { try { return JSON.parse(localStorage.getItem(KEY.markers) || '[]') } catch { return [] } }
export function saveMarkers(markers) { localStorage.setItem(KEY.markers, JSON.stringify(markers)) }

export function loadVotes(user) { try { return JSON.parse(localStorage.getItem(KEY.votes(user)) || '{}') } catch { return {} } }
export function saveVotes(user, v) { localStorage.setItem(KEY.votes(user), JSON.stringify(v)) }

export function getCreateCount(user, isoDate) { const v = localStorage.getItem(KEY.creates(user, isoDate)); return v ? parseInt(v,10) : 0 }
export function incCreateCount(user, isoDate) { const c = getCreateCount(user, isoDate); localStorage.setItem(KEY.creates(user, isoDate), String(c+1)) }

export function saveUser(username) { localStorage.setItem(KEY.user, username) }
export function loadUser() { return localStorage.getItem(KEY.user) }
export function clearUser() { localStorage.removeItem(KEY.user) }

export function loadUsers() { try { return JSON.parse(localStorage.getItem(KEY.users) || '[]') } catch { return [] } }
export function saveUsers(arr) { localStorage.setItem(KEY.users, JSON.stringify(arr)) }

export function getLastSignupAt() { const v = localStorage.getItem(KEY.lastSignupAt); return v ? parseInt(v,10) : 0 }
export function setLastSignupAt(ts) { localStorage.setItem(KEY.lastSignupAt, String(ts)) }

export function keys() { return KEY }
