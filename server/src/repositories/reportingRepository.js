import { db } from '../db.js';

export const reportingRepository = {
  listUsers() {
    return db.user.findMany();
  },
  listCheckIns({ includeUser = false } = {}) {
    return db.checkIn.findMany(includeUser ? { include: { user: true } } : undefined);
  },
  listDocumentSummaries() {
    return db.document.findMany({
      select: { id: true, type: true, title: true, status: true, createdAt: true, updatedAt: true },
    });
  },
};
