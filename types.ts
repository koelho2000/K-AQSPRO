
export enum ModuleType {
  LANDING = 'landing',
  ADMIN = 'admin',
  ENERGY = 'energy',
  CLIMATE = 'climate',
  CONSUMPTION = 'consumption',
  EXISTING_SYSTEM = 'existing',
  PROPOSED_SYSTEM = 'proposed',
  SIMULATION_BASELINE = 'sim_baseline',
  SIMULATION_PROPOSED = 'sim_proposed',
  COMPARATIVE = 'comparative',
  BUDGET = 'budget',
  FINANCE = 'finance',
  REPORT = 'report'
}

export interface ClientData {
  buildingName: string;
  projectDesignation: string;
  projectNumber: string;
  variantName: string;
  address: string;
  client: string;
  technician: string;
}

export interface CompanyInfo {
  name: string;
  nif: string;
  alvara: string;
  website: string;
  email: string;
  phone: string;
  logoUrl?: string;
}

export interface EnergyCosts {
  electricity: number; // €/kWh
  gas: number; // €/kWh
  water: number; // €/m3
}

export interface ClimateDataPoint {
  month: number;
  temp: number; // Avg Celsius
  radiation: number; // Avg kWh/m2/day
}

export interface Activity {
  id: string;
  name: string;
  volume: number; // Liters
  tempRequired: number; // Celsius
  hours: number[]; // 0-23
  activeDays: number[]; // 0-6 (Sun-Sat)
}

export interface Equipment {
  type: 'HP' | 'BOILER' | 'SOLAR' | 'HEATER' | 'ELECTRIC_TANK';
  name: string;
  cop?: number;
  efficiency?: number;
  power?: number; // kW
  area?: number; // m2
  opticalEfficiency?: number; // η0
  isExisting?: boolean; // If true, equipment won't be budgeted in proposed system
  maxOutputTemp?: number; // Maximum temperature the equipment can reach
}

export interface Storage {
  volume: number; // Liters
  lossFactor: number; // W/K
  isExisting?: boolean; // New property to exclude from proposed budget
}

export interface System {
  equipments: Equipment[];
  storage: Storage;
  name: string;
  description?: string;
  hasMixingValve?: boolean;
  hasStorage?: boolean; // New property to enable/disable accumulation
}

export type BudgetChapter = 
  | 'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA'
  | 'II - ACUMULAÇÃO E INÉRCIA'
  | 'III - HIDRÁULICA E DISTRIBUIÇÃO'
  | 'IV - ELETRICIDADE E CONTROLO'
  | 'V - MÃO DE OBRA E SERVIÇOS'
  | 'VI - CUSTOS INDIRETOS / DIVERSOS';

export interface BudgetItem {
  id: string;
  description: string;
  category: BudgetChapter;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Project {
  id: string;
  admin: ClientData;
  company: CompanyInfo;
  energy: EnergyCosts;
  district: string;
  activities: Activity[];
  existingSystem: System;
  proposedSystem: System;
  customClimate?: ClimateDataPoint[];
  budget: BudgetItem[];
}

export interface HourlySimResult {
  hour: number;
  dayOfWeek: number;
  demand_kWh: number;
  demand_L: number;
  temp_tank: number;
  t_required: number;
  t_delivered: number;
  consumed_elec_kWh: number;
  consumed_gas_kWh: number;
  solar_gain_kWh: number;
  cost: number;
}
