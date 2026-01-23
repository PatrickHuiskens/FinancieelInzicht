
export enum ToolId {
  DASHBOARD = 'dashboard',
  CASHFLOW = 'cashflow',
  BUDGET = 'budget',
  KOSTENVERDELER = 'kostenverdeler',
  MIN_BALANCE = 'min_balance',
  ZZP_TAX = 'zzp_tax',
  VAKANTIE = 'vakantie',
  BELEGGEN = 'beleggen',
  HYPOTHEEK = 'hypotheek',
  VERMOGEN = 'vermogen',
  PENSIOEN = 'pensioen',
  AFLOSSEN = 'aflossen',
  STUDIESCHULD = 'studieschuld',
  SCHULDEN = 'schulden',
}

export type AppMode = 'standard' | 'debt_counseling';

export interface MenuItem {
  id: ToolId;
  label: string;
  icon: string;
  category: 'Overzicht' | 'Calculators' | 'Toekomst' | 'Schulden';
  restrictedTo?: AppMode[]; // If undefined, available to all
}

export interface ChartDataPoint {
  name: string;
  value: number;
  amt?: number;
}

export interface GeminiResponse {
  analysis: string;
  tips: string[];
}