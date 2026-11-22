import { randomUUID } from "node:crypto";

const ID_RANDOM_LENGTH = 8;

// Note: grievance reference numbers are NOT created here.
// They are created in grievanceService using a counter.

/**
 * Creates an ID like "GRV-3F9A1C7B".
 *
 * @param {string} prefix - ID prefix, for example "GRV" or "VER".
 * @returns {string}
 */
export function generateId(prefix) {
  const random = randomUUID().replaceAll("-", "").slice(0, ID_RANDOM_LENGTH).toUpperCase();
  return `${prefix}-${random}`;
}