export interface FarmerProfile {
  id: string; // UUID
  userId?: number;
  farmerName: string;
  mobileNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  preferredLanguage?: string;
  createdAt?: string;

  // Frontend UI backward compatibility fields
  name?: string;
  fatherName?: string;
  fatherSpouseName?: string;
  dob?: string;
  gender?: string;
  alternateMobile?: string;
  aadhaarNumber?: string;
  address?: string;
  pinCode?: string;
  farmerType?: string;
  farmingType?: string;
  primaryCrop?: string;
  secondaryCrops?: string;
  totalLandArea?: number;
  irrigationAvailable?: boolean;
  irrigationType?: string;
  soilType?: string;
  profileCompletionPercentage?: number;
  documentsJson?: any;
  mobileMasked?: string;
  bankAccountMasked?: string;
  status?: string;
  category?: string;
}

export interface FarmerDashboardSummary {
  profile: {
    id: string;
    farmerName: string;
  };
  totalLandParcels: number;
  totalLandAreaInAcres: number;
  activeLoansCount: number;
  totalDisbursedLoanAmount: number;
  detectedDiscrepanciesCount: number;
  totalDiscrepancyDifferenceAmount: number;
  recentDiscrepancies: Array<any>;
}
