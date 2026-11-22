/**
 * Success response envelope bhejta hai.
 * @param {import("express").Response} res
 * @param {unknown} data
 * @param {{ status?: number, meta?: object }} [options]
 */
export function sendSuccess(res, data, options = {}) {
  const { status = 200, meta } = options;
  const body = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return res.status(status).json(body);
}

/**
 * Error response envelope bhejta hai.
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {string} code
 * @param {string} message
 */
export function sendError(res, statusCode, code, message) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}