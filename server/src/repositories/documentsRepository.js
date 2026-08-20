import { db } from '../db.js';

const LIST_SELECT = {
  id: true,
  type: true,
  title: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  checkIns: { select: { hours: true } },
};
const DETAIL_INCLUDE = { checkIns: { include: { user: true } } };

export const documentsRepository = {
  list(where, { skip, take }) {
    return Promise.all([
      db.document.findMany({ where, select: LIST_SELECT, orderBy: { updatedAt: 'desc' }, skip, take }),
      db.document.count({ where }),
    ]);
  },
  findDetail(id) {
    return db.document.findUnique({ where: { id }, include: DETAIL_INCLUDE });
  },
  findById(id) {
    return db.document.findUnique({ where: { id } });
  },
  create(data) {
    return db.document.create({ data });
  },
  update(id, data) {
    return db.document.update({ where: { id }, data, include: { checkIns: { select: { hours: true } } } });
  },
  saveAnalysis(id, analysis) {
    return db.document.update({ where: { id }, data: { analysis } });
  },
  delete(id) {
    return db.document.delete({ where: { id } });
  },
};
