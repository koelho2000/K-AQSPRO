
import React, { useState, useEffect } from 'react';
import { 
  Home, User, Zap, Cloud, ShoppingCart, Activity as ActivityIcon, 
  Settings, Play, BarChart3, FileText, Plus, Save, Upload, Copy, TrendingUp, BarChart, Wallet
} from 'lucide-react';
import { ModuleType, Project, HourlySimResult } from './types';
import { INITIAL_PROJECT } from './constants';
import { runSimulation, aggregateResults } from './services/simulationEngine';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import EnergyPage from './pages/EnergyPage';
import ClimatePage from './pages/ClimatePage';
import ConsumptionPage from './pages/ConsumptionPage';
import SystemPage from './pages/SystemPage';
import SimulationPage from './pages/SimulationPage';
import FinancePage from './pages/FinancePage';
import ReportPage from './pages/ReportPage';
import ComparativePage from './pages/ComparativePage';
import BudgetPage from './pages/BudgetPage';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.LANDING);
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [baselineResults, setBaselineResults] = useState<HourlySimResult[]>([]);
  const [proposedResults, setProposedResults] = useState<HourlySimResult[]>([]);

  const handleNewProject = () => {
    if (confirm("Tem a certeza que deseja iniciar um novo projeto? Todos os dados não guardados serão perdidos.")) {
      setProject(INITIAL_PROJECT);
      setBaselineResults([]);
      setProposedResults([]);
      setActiveModule(ModuleType.ADMIN);
    }
  };

  const saveProject = () => {
    const data = JSON.stringify(project);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KAQSPRO_${project.admin.client || 'Projeto'}.json`;
    link.click();
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          setProject(parsed);
          alert("Projeto carregado com sucesso!");
        } catch (err) {
          alert("Erro ao ler ficheiro.");
        }
      };
      reader.readAsText(file);
    }
  };

  const runAllSimulations = () => {
    const resBase = runSimulation(project, project.existingSystem);
    const resProp = runSimulation(project, project.proposedSystem);
    setBaselineResults(resBase);
    setProposedResults(resProp);
  };

  const menuItems = [
    { id: ModuleType.ADMIN, label: 'Administrativo', icon: User },
    { id: ModuleType.ENERGY, label: 'Energia', icon: Zap },
    { id: ModuleType.CLIMATE, label: 'Clima', icon: Cloud },
    { id: ModuleType.CONSUMPTION, label: 'Consumo', icon: ActivityIcon },
    { id: ModuleType.EXISTING_SYSTEM, label: 'Sist. Existente', icon: Settings },
    { id: ModuleType.PROPOSED_SYSTEM, label: 'Sist. Proposto', icon: Plus },
    { id: ModuleType.SIMULATION_BASELINE, label: 'Simul. Base', icon: Play },
    { id: ModuleType.SIMULATION_PROPOSED, label: 'Simul. Proposta', icon: TrendingUp },
    { id: ModuleType.COMPARATIVE, label: 'Comparativo', icon: BarChart },
    { id: ModuleType.BUDGET, label: 'Orçamento', icon: Wallet },
    { id: ModuleType.FINANCE, label: 'Financeiro', icon: BarChart3 },
    { id: ModuleType.REPORT, label: 'Relatório', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      {activeModule !== ModuleType.LANDING && (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold">K</div>
            <h1 className="text-xl font-bold tracking-tight">K-AQSPRO</h1>
          </div>
          
          <div className="p-4 flex gap-2 border-b border-slate-800">
            <button onClick={handleNewProject} title="Novo" className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex-1 flex justify-center"><Plus size={18}/></button>
            <button onClick={saveProject} title="Guardar" className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex-1 flex justify-center"><Save size={18}/></button>
            <label className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex-1 flex justify-center cursor-pointer">
              <Upload size={18}/>
              <input type="file" className="hidden" onChange={loadProject} accept=".json" />
            </label>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                  activeModule === item.id 
                    ? 'bg-orange-500 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={runAllSimulations}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Play size={16} fill="currentColor" /> EXECUTAR SIMULAÇÃO
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {activeModule === ModuleType.LANDING && <LandingPage onStart={() => setActiveModule(ModuleType.ADMIN)} />}
        {activeModule === ModuleType.ADMIN && <AdminPage project={project} setProject={setProject} />}
        {activeModule === ModuleType.ENERGY && <EnergyPage project={project} setProject={setProject} />}
        {activeModule === ModuleType.CLIMATE && <ClimatePage project={project} setProject={setProject} />}
        {activeModule === ModuleType.CONSUMPTION && <ConsumptionPage project={project} setProject={setProject} />}
        {activeModule === ModuleType.EXISTING_SYSTEM && <SystemPage systemType="existing" project={project} setProject={setProject} />}
        {activeModule === ModuleType.PROPOSED_SYSTEM && <SystemPage systemType="proposed" project={project} setProject={setProject} />}
        {activeModule === ModuleType.SIMULATION_BASELINE && (
          <SimulationPage 
            title="Cenário Baseline" 
            results={baselineResults} 
            onRunSimulation={runAllSimulations}
          />
        )}
        {activeModule === ModuleType.SIMULATION_PROPOSED && (
          <SimulationPage 
            title="Cenário Proposto" 
            results={proposedResults} 
            onRunSimulation={runAllSimulations}
          />
        )}
        {activeModule === ModuleType.COMPARATIVE && (
          <ComparativePage
            project={project}
            baseResults={baselineResults}
            propResults={proposedResults}
            onRunSimulation={runAllSimulations}
          />
        )}
        {activeModule === ModuleType.BUDGET && (
          <BudgetPage
            project={project}
            setProject={setProject}
          />
        )}
        {activeModule === ModuleType.FINANCE && (
          <FinancePage 
            project={project} 
            baseResults={baselineResults} 
            propResults={proposedResults} 
          />
        )}
        {activeModule === ModuleType.REPORT && (
          <ReportPage 
            project={project} 
            baseResults={baselineResults} 
            propResults={proposedResults} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
