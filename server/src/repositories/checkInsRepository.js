import { db } from '../db.js';

const INCLUDE = { user: true, document: { select: { id: true, title: true } } };

export const checkInsRepository = {
  list(where, { skip, take }) {
    return Promise.all([
      db.checkIn.findMany({ where, include: INCLUDE, orderBy: { date: 'desc' }, skip, take }),
      db.checkIn.count({ where }),
    ]);
  },
  findDocument(id) {
    return db.document.findUnique({ where: { id }, select: { id: true } });
  },
  findUser(id) {
    return db.user.findUnique({ where: { id }, select: { id: true } });
  },
  create(data) {
    return db.checkIn.create({ data, include: INCLUDE });
  },
  update(id, data) {
    return db.checkIn.update({ where: { id }, data, include: INCLUDE });
  },
  delete(id) {
    return db.checkIn.delete({ where: { id } });
  },
};
