/**
 * Wraps an async route handler so rejected promises are passed to next(err).
 *
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>} handler
 * @returns {import("express").RequestHandler}
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}