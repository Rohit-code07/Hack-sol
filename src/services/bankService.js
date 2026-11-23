// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse } from './apiClient';
import { bankApplications, landRecords, farmers, loans, discrepancies } from '../constants/mockData';

export async function getBankApplications({ status = '', from = '', to = '', search = '', page = 1, limit = 10 } = {}) {
  if (USE_MOCK) {
    let list = [...bankApplications];
    if (status) {
      list = list.filter((a) => a.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((a) => a.id.toLowerCase().includes(q) || a.farmerId.toLowerCase().includes(q));
    }
    if (from) {
      list = list.filter((a) => new Date(a.submittedAt) >= new Date(from));
    }
    if (to) {
      list = list.filter((a) => new Date(a.submittedAt) <= new Date(to));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return mockResponse({
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    });
  }

  const params = new URLSearchParams({
    status,
    from,
    to,
    search,
    page: String(page),
    limit: String(limit)
  });
  return apiClient.get(`/bank/applications?${params.toString()}`);
}

export async function updateApplicationStatus(id, status, remarks = '') {
  if (USE_MOCK) {
    const app = bankApplications.find((a) => a.id === id);
    if (app) {
      app.status = status;
      if (remarks) app.remarks = remarks;
      app.reviewedAt = new Date().toISOString();
    }
    return mockResponse({ success: true, application: app });
  }
  return apiClient.patch(`/bank/applications/${id}`, { status, remarks });
}

export async function getBankDashboardMetrics() {
  if (USE_MOCK) {
    const pendingApps = bankApplications.filter((a) => a.status === 'PENDING' || a.status === 'IN_REVIEW');
    const approvedApps = bankApplications.filter((a) => a.status === 'APPROVED');
    const openDiscrepancies = discrepancies.filter((d) => d.status === 'OPEN');

    // Aggregate district mismatches dynamically
    const districtCounts = {};
    farmers.forEach((f) => {
      if (!districtCounts[f.district]) {
        districtCounts[f.district] = 0;
      }
    });

    discrepancies.forEach((d) => {
      const farmer = farmers.find((f) => f.id === d.farmerId);
      if (farmer && farmer.district) {
        districtCounts[farmer.district] = (districtCounts[farmer.district] || 0) + 1;
      }
    });

    const districtChart = Object.keys(districtCounts).map((dist) => ({
      district: dist,
      mismatches: districtCounts[dist] || 0,
      verified: bankApplications.filter((a) => {
        const f = farmers.find((frm) => frm.id === a.farmerId);
        return f?.district === dist && a.status === 'APPROVED';
      }).length,
    }));

    // Aggregate loan portfolio dynamically
    const loanPortfolio = [
      { name: 'Active', value: loans.filter((l) => l.status === 'ACTIVE').length, fill: '#4D7A5A' },
      { name: 'Closed', value: loans.filter((l) => l.status === 'CLOSED').length, fill: '#6B6558' },
      { name: 'NPA', value: loans.filter((l) => l.status === 'NPA').length, fill: '#B42318' },
    ];

    const npaLoans = loans.filter((l) => l.status === 'NPA');
    const totalNpaExposure = npaLoans.reduce((sum, l) => sum + (Number(l.outstandingAmount) || 0), 0);

    return mockResponse({
      pendingCount: pendingApps.length,
      approvedCount: approvedApps.length,
      openDiscrepanciesCount: openDiscrepancies.length,
      totalNpaExposure,
      totalFarmers: farmers.length,
      totalLoans: loans.length,
      activeProfilesCount: farmers.filter((f) => f.status === 'ACTIVE').length,
      districtChart,
      loanPortfolio,
      totalApplications: bankApplications.length,
    });
  }

  return apiClient.get('/bank/dashboard/metrics');
}

export async function verifyLand({ surveyNumber, farmerId }) {
  if (USE_MOCK) {
    const sNum = (surveyNumber || '').trim();
    const fId = (farmerId || '').trim();

    const farmer = farmers.find((f) => f.id === fId);
    const matches = landRecords.filter((lr) => lr.surveyNumber.toLowerCase() === sNum.toLowerCase());

    if (matches.length === 0) {
      return mockResponse({
        verified: false,
        verdict: 'NOT_FOUND',
        ownerMatch: false,
        areaMatch: false,
        notes: [
          `Survey parcel ${sNum} was not found in the state digital cadastre.`,
          'Recommended physical verification by Talathi / Patwari.'
        ],
        timestamp: new Date().toISOString()
      });
    }

    const recordForFarmer = matches.find((m) => m.farmerId === fId);

    if (matches.length > 1) {
      return mockResponse({
        verified: false,
        verdict: 'MISMATCH',
        ownerMatch: false,
        areaMatch: false,
        notes: [
          `Severe Warning: Duplicate survey ${sNum} actively claimed across multiple farmer IDs.`,
          `Registered to: ${matches.map((m) => m.registeredOwnerName).join(', ')}.`,
          'Boundary dispute inquiry required prior to sanction.'
        ],
        timestamp: new Date().toISOString()
      });
    }

    if (!recordForFarmer) {
      const actualOwner = matches[0].registeredOwnerName;
      return mockResponse({
        verified: false,
        verdict: 'MISMATCH',
        ownerMatch: false,
        areaMatch: true,
        notes: [
          `Survey ${sNum} is registered to '${actualOwner}', not applicant '${farmer?.name || fId}'.`,
          'Discrepancy flagged in revenue registry.'
        ],
        timestamp: new Date().toISOString()
      });
    }

    const farmerNameNormalized = (farmer?.name || '').toLowerCase();
    const ownerNameNormalized = recordForFarmer.registeredOwnerName.toLowerCase();
    const isOwnerMatch = ownerNameNormalized.includes('mismatch')
      ? false
      : ownerNameNormalized.includes(farmerNameNormalized) || farmerNameNormalized.includes(ownerNameNormalized);

    const verdict = isOwnerMatch ? 'VERIFIED' : 'MISMATCH';

    return mockResponse({
      verified: isOwnerMatch,
      verdict,
      ownerMatch: isOwnerMatch,
      areaMatch: true,
      registeredOwner: recordForFarmer.registeredOwnerName,
      areaHectares: recordForFarmer.areaHectares,
      cropType: recordForFarmer.cropType,
      notes: isOwnerMatch
        ? [
            'Digital title clear and active in Bhulekh state registry.',
            'No encumbrance or ceiling violation detected.',
            'Aadhaar e-KYC cross-match confirmed.'
          ]
        : [
            `Name discrepancy: Registered as '${recordForFarmer.registeredOwnerName}'.`,
            `Applicant ID: '${farmer?.name || fId}'.`,
            'Requires revenue mutation endorsement or correction affidavit.'
          ],
      timestamp: new Date().toISOString()
    });
  }

  return apiClient.post('/verification/land', { surveyNumber, farmerId });
}
