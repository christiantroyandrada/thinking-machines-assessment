import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('error handling', () => {
  it('returns 404 json for unknown api routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
  it('returns 400 for invalid check-in', async () => {
    const res = await request(app).post('/api/checkins').send({ hours: 'abc' });
    expect(res.status).toBe(400);
  });
  it('returns 400 for invalid document status', async () => {
    const res = await request(app).patch('/api/documents/1').send({ status: 'bogus' });
    expect(res.status).toBe(400);
  });
});
