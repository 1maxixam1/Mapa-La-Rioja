import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router as markersRouter } from './routes/markers.js'
import { pool } from './lib/db.js'

const app = express()

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
// permite wildcard *.dominio (ej: *.netlify.app)
function isAllowed(origin) {
  if (!origin) return true
  if (allowed.length === 0) return true
  for (const a of allowed) {
    if (!a) continue
    if (a === '*') return true
    if (a === origin) return true
    if (a.startsWith('*.')) {
      const suf = a.slice(1) // '.netlify.app'
      if (origin.endsWith(suf)) return true
    }
  }
  return false
}
app.use(cors({
  origin: (origin, cb) => {
    if (isAllowed(origin)) return cb(null, true)
    return cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('select 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

app.use('/api/markers', markersRouter)

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`[mapalert] server listening on port ${port}`))
