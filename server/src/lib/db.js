import { Pool } from 'pg'

const url = process.env.DATABASE_URL || ''
// Usa SSL si la URL lo pide o si DB_SSL=true
const needsSSL = /sslmode=require|ssl=true/i.test(url) || String(process.env.DB_SSL).toLowerCase() === 'true'

export const pool = new Pool({
  connectionString: url,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
  max: 10,
})
