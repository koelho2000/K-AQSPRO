
import { ClimateDataPoint, Activity, Project, BudgetItem } from './types';

export const OCCUPANCY_PROFILES = [
  { label: 'Hospital e Clínica', value: 55, unit: 'cama' },
  { label: 'Hotel 4+*', value: 70, unit: 'cama' },
  { label: 'Hotel 3*', value: 55, unit: 'cama' },
  { label: 'Hotel/ Residencial 2*', value: 40, unit: 'cama' },
  { label: 'Residencial/ Pensão *', value: 35, unit: 'cama' },
  { label: 'Campismo', value: 40, unit: 'lugar' },
  { label: 'Lar de Idosos', value: 55, unit: 'cama' },
  { label: 'Escola', value: 3, unit: 'refeição' },
  { label: 'Quartel', value: 20, unit: 'pessoa' },
  { label: 'Fabrica ou Oficina', value: 15, unit: 'pessoa' },
  { label: 'Escritório', value: 3, unit: 'pessoa' },
  { label: 'Ginásio', value: 25, unit: 'pessoa' },
  { label: 'Lavandaria', value: 5, unit: 'kg roupa' },
  { label: 'Restaurante', value: 10, unit: 'refeição' },
];

export const DISTRICTS_CLIMATE: Record<string, ClimateDataPoint[]> = {
  "Aveiro": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 11 + Math.sin(i/2)*8, radiation: 2 + Math.sin(i/2)*5 })),
  "Beja": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 10 + Math.sin(i/2)*14, radiation: 2.5 + Math.sin(i/2)*6 })),
  "Braga": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 9 + Math.sin(i/2)*10, radiation: 1.8 + Math.sin(i/2)*6 })),
  "Bragança": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 5 + Math.sin(i/2)*15, radiation: 2 + Math.sin(i/2)*5.5 })),
  "Castelo Branco": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 8 + Math.sin(i/2)*16, radiation: 2.2 + Math.sin(i/2)*6 })),
  "Coimbra": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 10 + Math.sin(i/2)*12, radiation: 2 + Math.sin(i/2)*5.5 })),
  "Évora": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 10 + Math.sin(i/2)*15, radiation: 2.4 + Math.sin(i/2)*6 })),
  "Faro": [
    { month: 1, temp: 12.0, radiation: 2.8 }, { month: 2, temp: 12.9, radiation: 3.7 },
    { month: 3, temp: 14.8, radiation: 5.3 }, { month: 4, temp: 16.4, radiation: 6.6 },
    { month: 5, temp: 19.0, radiation: 7.9 }, { month: 6, temp: 22.4, radiation: 8.8 },
    { month: 7, temp: 24.6, radiation: 9.2 }, { month: 8, temp: 24.8, radiation: 8.3 },
    { month: 9, temp: 22.9, radiation: 6.4 }, { month: 10, temp: 19.6, radiation: 4.4 },
    { month: 11, temp: 15.6, radiation: 3.0 }, { month: 12, temp: 13.0, radiation: 2.5 },
  ],
  "Guarda": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 4 + Math.sin(i/2)*14, radiation: 1.9 + Math.sin(i/2)*6 })),
  "Leiria": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 11 + Math.sin(i/2)*10, radiation: 2.1 + Math.sin(i/2)*5.5 })),
  "Lisboa": [
    { month: 1, temp: 11.6, radiation: 2.3 }, { month: 2, temp: 12.7, radiation: 3.1 },
    { month: 3, temp: 14.9, radiation: 4.8 }, { month: 4, temp: 15.9, radiation: 5.9 },
    { month: 5, temp: 18.0, radiation: 7.2 }, { month: 6, temp: 21.2, radiation: 7.9 },
    { month: 7, temp: 23.1, radiation: 8.3 }, { month: 8, temp: 23.5, radiation: 7.6 },
    { month: 9, temp: 22.1, radiation: 5.8 }, { month: 10, temp: 18.8, radiation: 3.8 },
    { month: 11, temp: 15.0, radiation: 2.6 }, { month: 12, temp: 12.4, radiation: 2.0 },
  ],
  "Portalegre": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 9 + Math.sin(i/2)*15, radiation: 2.3 + Math.sin(i/2)*6 })),
  "Porto": [
    { month: 1, temp: 9.5, radiation: 1.8 }, { month: 2, temp: 10.4, radiation: 2.7 },
    { month: 3, temp: 12.5, radiation: 4.2 }, { month: 4, temp: 14.1, radiation: 5.3 },
    { month: 5, temp: 16.5, radiation: 6.8 }, { month: 6, temp: 19.4, radiation: 7.5 },
    { month: 7, temp: 21.2, radiation: 7.8 }, { month: 8, temp: 21.4, radiation: 7.1 },
    { month: 9, temp: 19.8, radiation: 5.3 }, { month: 10, temp: 16.6, radiation: 3.4 },
    { month: 11, temp: 12.8, radiation: 2.1 }, { month: 12, temp: 10.5, radiation: 1.6 },
  ],
  "Santarém": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 11 + Math.sin(i/2)*13, radiation: 2.2 + Math.sin(i/2)*6 })),
  "Setúbal": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 12 + Math.sin(i/2)*11, radiation: 2.4 + Math.sin(i/2)*6 })),
  "Viana do Castelo": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 10 + Math.sin(i/2)*9, radiation: 1.7 + Math.sin(i/2)*5.5 })),
  "Vila Real": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 8 + Math.sin(i/2)*13, radiation: 1.9 + Math.sin(i/2)*5.5 })),
  "Viseu": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 9 + Math.sin(i/2)*13, radiation: 2.0 + Math.sin(i/2)*6 })),
  "Funchal (Madeira)": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 16 + Math.sin(i/2)*6, radiation: 3 + Math.sin(i/2)*4 })),
  "Ponta Delgada (Açores)": Array.from({length: 12}, (_, i) => ({ month: i+1, temp: 14 + Math.sin(i/2)*7, radiation: 2.2 + Math.sin(i/2)*4.5 })),
};

export const DEFAULT_BUDGET: BudgetItem[] = [
  { id: 'b1', category: 'V - MÃO DE OBRA E SERVIÇOS', description: 'Desmontagem e remoção do sistema antigo para vazadouro autorizado', quantity: 1, unit: 'un', unitPrice: 450 },
  { id: 'b2', category: 'III - HIDRÁULICA E DISTRIBUIÇÃO', description: 'Tubagem Multicamada isolada com coquilha e acessórios', quantity: 20, unit: 'm', unitPrice: 15 },
  { id: 'b3', category: 'V - MÃO DE OBRA E SERVIÇOS', description: 'Instalação, ensaios e comissionamento do sistema completo', quantity: 1, unit: 'vg', unitPrice: 1500 },
  { id: 'b4', category: 'IV - ELETRICIDADE E CONTROLO', description: 'Quadro elétrico de proteção e cablagem de sinal/potência', quantity: 1, unit: 'un', unitPrice: 350 },
  { id: 'b5', category: 'III - HIDRÁULICA E DISTRIBUIÇÃO', description: 'Válvula Misturadora Termostática e Grupos de Segurança', quantity: 1, unit: 'un', unitPrice: 280 }
];

export const PRESET_ACTIVITIES: Record<string, Activity[]> = {
  "Residencial T2 (3 pessoas)": [
    { id: '1', name: 'Duche Manhã', volume: 50, tempRequired: 40, hours: [7, 8], activeDays: [1, 2, 3, 4, 5] },
    { id: '2', name: 'Cozinha', volume: 15, tempRequired: 45, hours: [13, 20], activeDays: [0, 1, 2, 3, 4, 5, 6] },
    { id: '3', name: 'Duche Noite', volume: 50, tempRequired: 40, hours: [21, 22], activeDays: [1, 2, 3, 4, 5] }
  ],
  "Restaurante Médio": [
    { id: '4', name: 'Preparação', volume: 100, tempRequired: 45, hours: [10, 11, 12], activeDays: [1, 2, 3, 4, 5, 6] },
    { id: '5', name: 'Lavagem Loiça', volume: 300, tempRequired: 55, hours: [14, 15, 22, 23], activeDays: [1, 2, 3, 4, 5, 6] }
  ]
};

export const INITIAL_PROJECT: Project = {
  id: `PRJ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  admin: { installation: '', client: '', technician: '' },
  company: { name: 'K-ENGINEERING SOLUTIONS', nif: '500 000 000', alvara: '00000-PUB', contacts: 'info@kengineering.pt' },
  energy: { electricity: 0.22, gas: 0.12, water: 2.5 },
  district: 'Lisboa',
  activities: PRESET_ACTIVITIES["Residencial T2 (3 pessoas)"],
  existingSystem: {
    name: 'Sistema Base',
    storage: { volume: 200, lossFactor: 1.5 },
    equipments: [
      { type: 'BOILER', name: 'Esquentador Gás', efficiency: 0.85 }
    ]
  },
  proposedSystem: {
    name: 'Sistema Eficiente',
    storage: { volume: 300, lossFactor: 1.2 },
    equipments: [
      { type: 'HP', name: 'Bomba de Calor', cop: 3.5, power: 2 },
      { type: 'SOLAR', name: 'Painéis Solares', area: 4, opticalEfficiency: 0.75 }
    ]
  },
  budget: DEFAULT_BUDGET
};
