export type RateBasis = 'per_purity' | '24k_reference';

export interface CustomerDetails {
  name: string;
  address: string;
  mobile: string;
  valuationDate: string; // YYYY-MM-DD
}

export interface JewelleryItem {
  id: string;
  srNo: number;
  description: string;
  articlesCount: number;
  grossWeight: number; // in grams (up to 3 decimal places)
  impurityWeight: number; // in grams
  netWeight: number; // grossWeight - impurityWeight
  purityCarat: number; // 0 to 24 (e.g. 22, 18, 24)
  goldRate: number; // ₹ per gram
  ornamentValue: number; // in ₹
  notes?: string;
}

export interface ReportTotals {
  articlesCount: number;
  grossWeight: number;
  impurityWeight: number;
  netWeight: number;
  totalValue: number;
}

export interface ValuationReport {
  id: string;
  reportNumber: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerDetails;
  items: JewelleryItem[];
  rateBasis: RateBasis;
  goldRateDefault: number;
  totals: ReportTotals;
  remarks: string;
  termsAccepted: boolean;
  termsList: string[];
  isDraft: boolean;
  letterheadMode: 'full' | 'content_only';
}

export interface ShopSettings {
  businessName: string;
  tagline: string;
  proprietor: string;
  mobile: string;
  address: string;
  email?: string;
  gstNumber?: string;
  letterheadImageUrl: string;
  defaultGoldRate: number;
  defaultRateBasis: RateBasis;
  reportPrefix: string;
  nextReportSeq: number;
  defaultTerms: string[];
  signatureTitle: string;
  defaultPrintMode: 'full' | 'content_only';
}
