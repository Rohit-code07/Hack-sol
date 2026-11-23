export type UserRole = 'FARMER' | 'BANK_OFFICER';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  farmerName: string;
  mobileNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  preferredLanguage?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  role: UserRole;
  farmerId?: string; // UUID
}

export interface AuthSession {
  role: 'farmer' | 'bank' | null;
  farmerId: string | null;
  farmerName: string | null;
  officerName: string | null;
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
}
