
export interface StudentProfile {
  name: string;
  university: string;
  major: string;
  graduationYear: string;
  targetCity: string;
  targetIndustry: string;
  targetRole: string;
  targetTier: string;
  resumeText: string;
  additionalNotes: string;
}

export interface RadarDataPoint {
  subject: string;
  current: number; // Before Signup
  potential: number; // After Signup
  fullMark: number;
}

export interface GapAnalysisItem {
  skill: string;
  currentScore: number;
  targetScore: number;
  description: string;
}

export interface CompanyTier {
  category: string;
  companies: string[];
  description: string;
}

export interface TimelinePhase {
  phase: string;
  time: string;
  diyRisks: string[]; // Before Signup: Risks/Pain points
  hmSolutions: string[]; // After Signup: Critical Solutions
}

export interface FinancialAnalysis {
  diySalaryVal: number; // Annual in Wan
  highmarkSalaryVal: number; // Annual in Wan
  investmentCost: number; // Total cost of services
  recoupPeriod: string; // Calculated string
}

export interface SuccessStory {
  name: string;
  background: string;
  difficulty: string;
  offer: string;
  comment: string;
}

// New Interface for Resume Deep Dive
export interface ResumeAnalysis {
  highlights: string[];
  smartPrediction: {
    marketSalary: string;
    turnoverRisk: string;
  };
  tags: {
    basic: string[];
    education: string[];
    career: string[];
    skills: string[];
  };
}

export interface Verdict {
  title: string;
  content: string; // "Identity Decoding" content
  tags: string[]; // Keep for compatibility or legacy summary
  gapSummary: string; // Tuobuhua style pitch
}

export interface AnalysisResult {
  atsScore: number;
  verdict: Verdict;
  resumeAnalysis?: ResumeAnalysis; // New Section
  radarChart: RadarDataPoint[];
  gapAnalysis: GapAnalysisItem[]; 
  companyList: CompanyTier[]; 
  financialAnalysis: FinancialAnalysis;
  timeline: TimelinePhase[];
  similarSuccessStories: SuccessStory[];
  suggestedPlanName: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features?: string[];
  isBonus?: boolean; // New: Mark as "Free Gift"
  selected: boolean;
}
