import { Pool } from 'pg'

// Fuerza SSL en producción (Render) o si DB_SSL=true
const url = process.env.DATABASE_URL || ''
const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || process.env.RENDER
const force = String(process.env.DB_SSL || '').toLowerCase() === 'true'
const useSSL = isProd || force

export const pool = new Pool({
  connectionString: url,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 10,
})
