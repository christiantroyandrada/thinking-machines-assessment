import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000';

test('end-to-end flow: parse → create → list → upload → analyze → search → insights → cleanup', async ({ request }) => {
  // 1. Parse a check-in text
  const parse = await request.post(`${API}/api/checkins/parse`, {
    data: { text: '3 hrs #procurement vendor negotiation' },
  });
  expect(parse.ok()).toBeTruthy();
  const parsed = await parse.json();
  expect(parsed.parsed.tag).toBe('procurement');

  // 2. Create the check-in (server defaults userId to 1)
  const create = await request.post(`${API}/api/checkins`, {
    data: { hours: 3, tag: 'procurement', activities: 'vendor negotiation' },
  });
  expect(create.status()).toBe(201);
  const ci = await create.json();
  expect(ci.id).toBeTruthy();

  // 3. List check-ins — total should be > 0 (seeded data present)
  const list = await request.get(`${API}/api/checkins?pageSize=1`);
  const listJson = await list.json();
  expect(listJson.total).toBeGreaterThan(0);

  // 4. Upload a procurement document (multipart)
  const upload = await request.post(`${API}/api/documents`, {
    multipart: {
      file: {
        name: 'po.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Vendor: Acme Industrial\nTotal: php 500000\nPO-2024-001\nDate: 2026-08-01'),
      },
      title: 'PO Test',
      type: 'PO',
    },
  });
  expect(upload.ok()).toBeTruthy();
  const doc = await upload.json();
  expect(doc.id).toBeTruthy();

  // 5. Analyze the document (mock field extraction)
  const analyze = await request.post(`${API}/api/documents/${doc.id}/analyze`);
  expect(analyze.ok()).toBeTruthy();
  const analysis = await analyze.json();
  expect(analysis.analysis).toBeTruthy();
  expect(analysis.analysis.fields).toBeTruthy();

  // 6. Natural-language search
  const search = await request.get(
    `${API}/api/ai/search?q=${encodeURIComponent('how much time on procurement')}`,
  );
  const sjson = await search.json();
  expect(sjson.answer).toBeTruthy();

  // 7. Time insights
  const insights = await request.get(`${API}/api/ai/insights`);
  const ijson = await insights.json();
  expect(ijson.insights.length).toBeGreaterThan(0);

  // 8. Cleanup the rows we created
  await request.delete(`${API}/api/checkins/${ci.id}`);
  await request.delete(`${API}/api/documents/${doc.id}`);
});
