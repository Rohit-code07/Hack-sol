// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse } from './apiClient';
import { entitlements, kccRates, mspTable } from '../constants/mockData';

export async function getEntitlements(farmerId) {
  if (USE_MOCK) {
    const list = entitlements.filter((e) => e.farmerId === farmerId);
    return mockResponse(list);
  }
  return apiClient.get(`/entitlements/${farmerId}`);
}

export async function calculateKCC({ landArea, cropType, season }) {
  if (USE_MOCK) {
    const area = parseFloat(landArea) || 0;
    const benchmarkRate = kccRates[cropType] || 40000;
    const seasonMult = season === 'Kharif' ? 1.05 : 1.0;
    const baseCropCost = area * benchmarkRate * seasonMult;
    
    // Scale of finance standard components:
    // +10% post-harvest/household, +20% farm maintenance/machinery (total +30%)
    const eligibleLimit = Math.round(baseCropCost * 1.30);
    
    return mockResponse({
      landArea: area,
      cropType,
      season,
      benchmarkRate,
      baseCropCost: Math.round(baseCropCost),
      householdProvision: Math.round(baseCropCost * 0.10),
      maintenanceProvision: Math.round(baseCropCost * 0.20),
      eligibleLimit,
      calculatedAt: new Date().toISOString()
    });
  }
  return apiClient.post('/entitlements/kcc/calculate', { landArea, cropType, season });
}

export async function verifyMSP({ cropType, quantity, claimedAmount }) {
  if (USE_MOCK) {
    const qty = parseFloat(quantity) || 0;
    const claimed = parseFloat(claimedAmount) || 0;
    const officialRate = mspTable[cropType] || 2275;
    const expectedMSP = Math.round(qty * officialRate);
    const difference = claimed - expectedMSP;
    const isFair = difference >= 0;

    return mockResponse({
      cropType,
      quantity: qty,
      claimedAmount: claimed,
      officialRate,
      expectedMSP,
      difference,
      isFair,
      status: isFair ? 'VERIFIED' : 'MISMATCH'
    });
  }
  return apiClient.post('/entitlements/msp/verify', { cropType, quantity, claimedAmount });
}

export async function reconcileInsurance({ farmerId, policyId, paidAmount }) {
  if (USE_MOCK) {
    const amt = parseFloat(paidAmount) || 0;
    const isReconciled = amt > 0;
    return mockResponse({
      farmerId,
      policyId: policyId || 'POL-PMFBY-2026-9901',
      paidAmount: amt,
      status: isReconciled ? 'PAID' : 'PENDING',
      reconciled: isReconciled,
      statePortalRef: 'MH-PMFBY-VER-88219',
      estimatedClaim: 42000,
      timestamp: new Date().toISOString()
    });
  }
  return apiClient.post('/entitlements/insurance/reconcile', { farmerId, policyId, paidAmount });
}
