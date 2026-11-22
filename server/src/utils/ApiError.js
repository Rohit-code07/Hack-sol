/**
 * Application error jo HTTP status code aur machine-readable code ke saath aata hai.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} code Machine-readable error code
   * @param {string} message Human-readable message
   */
  constructor(statusCode, code, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }

  /**
   * @param {string} message
   * @param {string} [code="BAD_REQUEST"]
   */
  static badRequest(message, code = "BAD_REQUEST") {
    return new ApiError(400, code, message);
  }

  /**
   * @param {string} message
   * @param {string} [code="NOT_FOUND"]
   */
  static notFound(message, code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }

  /**
   * @param {string} [message="Internal server error"]
   * @param {string} [code="INTERNAL_ERROR"]
   */
  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new ApiError(500, code, message);
  }
}