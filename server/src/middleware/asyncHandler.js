export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function isPrismaNotFound(err) {
  return err?.code === 'P2025';
}
