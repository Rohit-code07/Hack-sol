export interface MortgageItem {
  id: number;
  landRecordId: number;
  bankId: number;
  bankName?: string;
  mortgageReference: string;
  mortgageAmount: number;
  mortgageStatus: string;
  startDate?: string;
  releaseDate?: string;
}

export interface LandRecordResponse {
  id: number;
  khasraNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  landArea: number;
  areaUnit: string;
  ownershipStatus: string;
  ownershipPercentage?: number;
  mortgages?: MortgageItem[];
  fullGeoIdentity?: string;
  createdAt?: string;

  // Frontend UI backward compatibility fields
  surveyNumber?: string;
  khataNumber?: string;
  ownerName?: string;
  coOwnerDetails?: string;
  irrigationStatus?: string;
  landUsage?: string;
  isMortgaged?: boolean;
  isCollateral?: boolean;
  verificationStatus?: string;
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedByOfficerId?: number;
  owners?: any[];
  activeMortgages?: any[];
  areaHectares?: number;
  registeredOwnerName?: string;
  cropType?: string;
  farmerId?: string;
}
