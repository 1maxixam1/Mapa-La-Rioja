import { pool } from './lib/db.js'
import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    for (const f of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8')
      console.log('Applying', f)
      await client.query(sql)
    }
    await client.query('COMMIT')
    console.log('Migrations applied ✅')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Migration failed ❌', e)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

run()
