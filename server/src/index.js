import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './lib/db.js'
import { router as markersRouter } from './routes/markers.js'

const app = express()

// CORS con allowed origins (incluye comodín *.netlify.app)
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
function isAllowed(origin) {
  if (!origin) return true
  if (allowed.length === 0) return true
  for (const a of allowed) {
    if (!a) continue
    if (a === '*') return true
    if (a === origin) return true
    if (a.startsWith('*.')) { const suf = a.slice(1); if (origin.endsWith(suf)) return true }
  }
  return false
}
app.use(cors({ origin: (o, cb) => (isAllowed(o) ? cb(null, true) : cb(new Error('Not allowed'))), credentials: true }))
app.use(express.json({ limit: '1mb' }))

// Salud (debe responder {"ok":true})
app.get('/api/health', async (req, res) => {
  try { await pool.query('select 1'); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ ok: false, error: String(e) }) }
})

// (opcional) ping sin DB (útil para diagnosticar rápido)
app.get('/api/ping', (req, res) => res.json({ ping: 'pong' }))

app.use('/api/markers', markersRouter)

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`[mapalert] listening on port ${port}`))
