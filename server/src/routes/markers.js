import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../lib/db.js'
import { randomUUID } from 'crypto'

export const router = Router()

const MarkerSchema = z.object({
  id: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
  streetName: z.string().min(1),
  details: z.string().min(1),
  type: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.number(),
  expiresAt: z.number(),
  votes: z.object({
    confirmations: z.array(z.string()),
    denials: z.array(z.string())
  })
})

// GET /api/markers
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    select id, lat, lng, street_name as "streetName", details, type, created_by as "createdBy",
           extract(epoch from created_at)*1000 as "createdAt",
           extract(epoch from expires_at)*1000 as "expiresAt",
           confirmations, denials
    from markers
    where expires_at > now()
    order by created_at desc
  `)
  res.json(rows.map(r => ({
    ...r,
    votes: { confirmations: r.confirmations || [], denials: r.denials || [] }
  })))
})

// POST /api/markers
const CreateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  streetName: z.string().min(1),
  details: z.string().min(1),
  type: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.number(),
  expiresAt: z.number()
})
router.post('/', async (req, res) => {
  const data = CreateSchema.parse(req.body)
  const id = randomUUID()
  const { rows } = await pool.query(`
    insert into markers (id, lat, lng, street_name, details, type, created_by, created_at, expires_at, confirmations, denials)
    values ($1,$2,$3,$4,$5,$6,$7, to_timestamp($8/1000.0), to_timestamp($9/1000.0), array[]::text[], array[]::text[])
    returning id, lat, lng, street_name as "streetName", details, type, created_by as "createdBy",
              extract(epoch from created_at)*1000 as "createdAt",
              extract(epoch from expires_at)*1000 as "expiresAt",
              confirmations, denials
  `, [id, data.lat, data.lng, data.streetName, data.details, data.type, data.createdBy, data.createdAt, data.expiresAt])
  const r = rows[0]
  res.status(201).json({ ...r, votes: { confirmations: r.confirmations, denials: r.denials } })
})

// POST /api/markers/:id/vote
const VoteSchema = z.object({ user: z.string().min(1), isConfirm: z.boolean() })
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params
  const { user, isConfirm } = VoteSchema.parse(req.body)
  try {
    await pool.query('BEGIN')
    // prevent double vote
    const vq = await pool.query('select value from votes where marker_id = $1 and user_id = $2', [id, user])
    if (vq.rowCount > 0) return res.status(400).json({ error: 'Ya votaste en esta publicación' })

    if (isConfirm) {
      await pool.query('update markers set confirmations = array_append(confirmations, $2) where id=$1', [id, user])
    } else {
      await pool.query('update markers set denials = array_append(denials, $2) where id=$1', [id, user])
    }
    await pool.query('insert into votes(marker_id, user_id, value) values ($1,$2,$3)', [id, user, isConfirm ? 1 : -1])

    const { rows } = await pool.query(`
      select id, lat, lng, street_name as "streetName", details, type, created_by as "createdBy",
             extract(epoch from created_at)*1000 as "createdAt",
             extract(epoch from expires_at)*1000 as "expiresAt",
             confirmations, denials
      from markers where id=$1
    `, [id])
    await pool.query('COMMIT')
    const r = rows[0]
    res.json({ ...r, votes: { confirmations: r.confirmations, denials: r.denials } })
  } catch (e) {
    await pool.query('ROLLBACK')
    res.status(500).json({ error: String(e) })
  }
})

// DELETE /api/markers/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await pool.query('delete from markers where id = $1', [id])
  res.status(204).end()
})
