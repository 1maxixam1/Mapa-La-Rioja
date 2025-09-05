import request from 'supertest'
import 'dotenv/config'
import { pool } from '../src/lib/db.js'
import express from 'express'
import { router as markersRouter } from '../src/routes/markers.js'

const app = express()
app.use(express.json())
app.use('/api/markers', markersRouter)

beforeAll(async () => {
  const sql = `
  drop table if exists votes;
  drop table if exists markers;
  create table markers (
    id uuid primary key,
    lat double precision not null,
    lng double precision not null,
    street_name text not null,
    details text not null,
    type text not null,
    created_by text not null,
    created_at timestamptz not null,
    expires_at timestamptz not null,
    confirmations text[] not null default array[]::text[],
    denials text[] not null default array[]::text[]
  );
  create table votes (
    marker_id uuid not null references markers(id) on delete cascade,
    user_id text not null,
    value integer not null check (value in (-1, 1)),
    created_at timestamptz not null default now(),
    primary key (marker_id, user_id)
  );`
  await pool.query(sql)
})

afterAll(async () => { await pool.end() })

test('CRUD flow', async () => {
  const base = {
    lat: -29.4131, lng: -66.8558,
    streetName: 'Av. San Martín 123',
    details: 'Control policial',
    type: 'control',
    createdBy: 'tester',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60_000
  }
  const create = await request(app).post('/api/markers').send(base).expect(201)
  expect(create.body.id).toBeDefined()

  const list = await request(app).get('/api/markers').expect(200)
  expect(list.body).toHaveLength(1)

  const vote = await request(app).post(`/api/markers/${create.body.id}/vote`).send({ user: 'tester', isConfirm: true }).expect(200)
  expect(vote.body.votes.confirmations).toContain('tester')

  await request(app).delete(`/api/markers/${create.body.id}`).expect(204)
  const list2 = await request(app).get('/api/markers').expect(200)
  expect(list2.body).toHaveLength(0)
})
