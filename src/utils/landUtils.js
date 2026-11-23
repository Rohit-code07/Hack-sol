/**
 * Land record validation and mismatch utilities.
 */

/**
 * Normalizes an Indian name for comparison by removing common prefixes,
 * extra punctuation, and casing.
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/\b(shri|smt|shrimati|mr|mrs|late|dr)\b/gi, '')
    .replace(/[^a-z\u0900-\u097F]/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether the registered owner name in the land revenue record
 * mismatches with the farmer's verified profile name.
 *
 * @param {string} farmerName - Profile name of the farmer
 * @param {string} registeredOwnerName - Registered name in government land record
 * @returns {boolean} - True if there is a detected name discrepancy
 */
export function isOwnerMismatch(farmerName, registeredOwnerName) {
  if (!farmerName || !registeredOwnerName) return false;

  const rawReg = String(registeredOwnerName).toLowerCase();
  if (rawReg.includes('mismatch')) return true;

  const normFarmer = normalizeName(farmerName);
  const normReg = normalizeName(registeredOwnerName);

  if (!normFarmer || !normReg) return false;
  if (normFarmer === normReg) return false;

  // Check if one contains the other (e.g. Ramesh Kumar vs Ramesh Kumar Sharma)
  const farmerParts = normFarmer.split(' ');
  const regParts = normReg.split(' ');

  // If first name doesn't match at all, it's definitely a mismatch
  if (farmerParts[0] && regParts[0] && farmerParts[0] !== regParts[0]) {
    return true;
  }

  // Cross-containment check
  return !normReg.includes(normFarmer) && !normFarmer.includes(normReg);
}

/**
 * Calculates summary metrics for an array of land records.
 *
 * @param {Array<any>} records
 * @param {string} farmerName
 * @returns {{ totalPlots: number, totalAreaHectares: number, mismatchCount: number, disputedCount: number }}
 */
export function getLandRecordsSummary(records = [], farmerName = '') {
  let totalArea = 0;
  let mismatchCount = 0;
  let disputedCount = 0;

  for (const rec of records) {
    totalArea += Number(rec.areaHectares) || 0;
    if (isOwnerMismatch(farmerName, rec.registeredOwnerName)) {
      mismatchCount += 1;
    }
    if (rec.status === 'DISPUTED') {
      disputedCount += 1;
    }
  }

  return {
    totalPlots: records.length,
    totalAreaHectares: Number(totalArea.toFixed(2)),
    mismatchCount,
    disputedCount,
  };
}
