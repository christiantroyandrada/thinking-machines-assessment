import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceRoot = new URL('../src/', import.meta.url);

async function source(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, sourceRoot)), 'utf8');
}

describe('server layer boundaries', () => {
  it.each(['analytics.js', 'admin.js', 'ai.js', 'users.js'])('%s route delegates database work', async (route) => {
    expect(await source(`routes/${route}`)).not.toMatch(/from ['"]\.\.\/db\.js['"]/);
  });

  it.each(['checkins.js', 'documents.js'])('%s service delegates persistence to a repository', async (service) => {
    expect(await source(`services/${service}`)).not.toMatch(/from ['"]\.\.\/db\.js['"]/);
  });
});
