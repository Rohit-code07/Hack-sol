import { HTTP_STATUS } from "./ApiError.js";

/**
 * Sends a success envelope: { success: true, data, meta? }.
 *
 * @param {import("express").Response} res
 * @param {unknown} data
 * @param {{ status?: number, meta?: unknown }} [options]
 */
export function sendSuccess(res, data, options = {}) {
  const { status = HTTP_STATUS.OK, meta } = options;
  const body = { success: true, data };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(status).json(body);
}

/**
 * Sends an error envelope: { success: false, error: { code, message } }.
 *
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