import { randomUUID } from "node:crypto";

const ID_SUFFIX_LENGTH = 8;

/**
 * Prefix ke saath unique ID banata hai, jaise "GRV-1A2B3C4D".
 * Grievance reference number yahan nahi banta, grievanceService mein counter se banega.
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix) {
  const suffix = randomUUID().replace(/-/g, "").slice(0, ID_SUFFIX_LENGTH).toUpperCase();
  return `${prefix}-${suffix}`;
}