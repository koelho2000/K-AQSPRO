
import React from 'react';
import { Project } from '../types';
import { Zap, Flame, Droplets } from 'lucide-react';

interface EnergyPageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const EnergyPage: React.FC<EnergyPageProps> = ({ project, setProject }) => {
  const handleChange = (name: string, value: string) => {
    setProject(prev => ({
      ...prev,
      energy: { ...prev.energy, [name]: parseFloat(value) || 0 }
    }));
  };

  const inputs = [
    { name: 'electricity', label: 'Eletricidade (€/kWh)', icon: Zap, color: 'text-yellow-500' },
    { name: 'gas', label: 'Gás Natural (€/kWh)', icon: Flame, color: 'text-orange-500' },
    { name: 'water', label: 'Água (€/m³)', icon: Droplets, color: 'text-blue-500' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dados de Energia</h2>
        <p className="text-slate-500">Defina os custos unitários dos vetores energéticos para o cálculo do OPEX.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inputs.map(input => (
          <div key={input.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-slate-50 ${input.color}`}>
                <input.icon size={20} />
              </div>
              <span className="font-semibold text-slate-700">{input.label.split(' ')[0]}</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={(project.energy as any)[input.name]}
                onChange={(e) => handleChange(input.name, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
            </div>
            <p className="mt-2 text-xs text-slate-400 italic">Custo por {input.label.split('(')[1].replace(')', '')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyPage;
