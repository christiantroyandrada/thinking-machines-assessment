import { usersRepository } from '../repositories/usersRepository.js';
import { notFound } from '../utils/errors.js';

export async function getCurrentUser(id) {
  const user = await usersRepository.findById(id);
  if (!user) throw notFound('User');
  return user;
}

export function listUsers(department) {
  return usersRepository.list(department);
}
