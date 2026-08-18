export function authMiddleware(req, res, next) {
  const id = Number(req.headers['x-user-id']);
  req.userId = Number.isInteger(id) && id > 0 ? id : 1;
  next();
}
