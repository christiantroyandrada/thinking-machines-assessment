import { db } from '../db.js';

const PUBLIC_FIELDS = { id: true, name: true, department: true, role: true, email: true };

export const usersRepository = {
  findById(id) {
    return db.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
  },
  list(department) {
    return db.user.findMany({
      where: department ? { department } : {},
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: PUBLIC_FIELDS,
    });
  },
};
