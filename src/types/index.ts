export interface AgendaItem {
  id: string;
  day: number;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface PricingInfo {
  price: string;
  currency: string;
  note: string;
  includes: string[];
  excludes: string[];
}

export interface PaymentMethod {
  id: string;
  label: string;
  currency: string;
  details: string[];
}

export interface CompanionData {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  wantsWhatsApp: boolean;
  bio: string;
  dietaryRestrictions: string[];
  dietaryDetails: string;
  profilePhoto: File | null;
}

export interface GuestOnboardingData {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  wantsWhatsApp: boolean;
  isComingAlone: boolean | null;
  companion: CompanionData;
  dietaryRestrictions: string[];
  dietaryDetails: string;
  idPhoto: File | null;
  profilePhoto: File | null;
  paymentProof: File | null;
  bio: string;
  needsInvoice: boolean;
  paymentMethod: string;
  acceptedTerms: boolean;
}

export interface FileUploadState {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  fileName: string;
}
