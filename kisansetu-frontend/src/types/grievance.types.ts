export interface GrievanceGenerateRequest {
  farmerId: string;
  discrepancyId: number;
  language?: string;
  additionalNotes?: string;
}

export interface GrievanceResponse {
  id: number;
  farmerId: string;
  discrepancyId?: number;
  subject: string;
  grievanceContent: string;
  language: string;
  recordedDifferenceAmount?: number;
  evidenceChecklist: string[];
  status: string;
  createdAt?: string;

  // Frontend UI backward compatibility fields
  referenceNumber?: string;
  category?: string;
  description?: string;
}
