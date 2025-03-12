
export interface Technology {
  name: string;
  category: string;
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  revenue?: string;
  traffic?: string;
  threats?: string[];
  technologies?: Technology[];
  website?: string;
  speedIndex?: number;
}

export interface CompanyData {
  description: string;
  mainCompany?: Competitor | null;
  competitors: Competitor[];
}

export type AnalysisType = "PDP" | "PLP" | "Homepage" | "Cart" | "Checkout";
