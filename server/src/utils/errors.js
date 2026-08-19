export function isPrismaNotFound(err) {
  return err?.code === 'P2025';
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function badRequest(message) {
  return new ApiError(400, message);
}

export function notFound(resource) {
  return new ApiError(404, `${resource} not found`);
}

export function runPrisma(operation, resource) {
  return Promise.resolve()
    .then(operation)
    .catch((err) => {
      if (isPrismaNotFound(err)) throw notFound(resource);
      throw err;
    });
}