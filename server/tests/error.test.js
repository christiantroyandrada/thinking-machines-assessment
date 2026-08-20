import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

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

  it.each([
    ['/api/checkins?from=not-a-date', 'from'],
    ['/api/checkins?userId=abc', 'userId'],
    ['/api/checkins?page=1.5', 'page'],
    ['/api/checkins?page=Infinity', 'page'],
    ['/api/documents/not-a-number', 'id'],
  ])('returns 400 for malformed input at %s', async (url, field) => {
    const res = await request(app).get(url);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain(field);
  });

  it('rejects check-ins longer than a day', async () => {
    const res = await request(app).post('/api/checkins').send({
      hours: 25,
      tag: 'ops',
      activities: 'Impossible duration',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('24');
  });

  it('rejects unsupported document types', async () => {
    const res = await request(app)
      .post('/api/documents')
      .field('type', 'EXECUTABLE')
      .attach('file', Buffer.from('content'), 'document.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('type');
  });

  it('rejects non-string check-in tags', async () => {
    const res = await request(app).patch('/api/checkins/1').send({ tag: { nested: true } });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tag');
  });

  it('rejects a nonexistent linked document when editing a check-in', async () => {
    const user = await db.user.create({
      data: { name: 'Validation User', email: 'validation@meridian.com', department: 'QA', role: 'user' },
    });
    const checkIn = await db.checkIn.create({
      data: { userId: user.id, hours: 1, date: new Date(), tag: 'qa', activities: 'Validate' },
    });

    const res = await request(app).patch(`/api/checkins/${checkIn.id}`).send({ documentId: 999999 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('document');
    await db.user.delete({ where: { id: user.id } });
  });

  it('rejects a check-in for an unknown mock user', async () => {
    const res = await request(app)
      .post('/api/checkins')
      .set('x-user-id', '999999')
      .send({ hours: 1, tag: 'qa', activities: 'Validate' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('User');
  });
});
