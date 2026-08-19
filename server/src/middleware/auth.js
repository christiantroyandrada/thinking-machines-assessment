export function authMiddleware(req, res, next) {
  const id = Number.parseInt(req.headers['x-user-id'], 10);
  req.userId = Number.isInteger(id) && id > 0 ? id : 1;
  next();
}