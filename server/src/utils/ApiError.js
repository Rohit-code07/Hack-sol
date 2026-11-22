export const HTTP_STATUS = Object.freeze({
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code.
   * @param {string} code - Machine-readable error code.
   * @param {string} message - Human-readable message.
   */
  constructor(statusCode, code, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = "BAD_REQUEST") {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, code, message);
  }

  static notFound(message, code = "NOT_FOUND") {
    return new ApiError(HTTP_STATUS.NOT_FOUND, code, message);
  }

  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, code, message);
  }
}