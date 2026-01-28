
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, User, Zap, Cloud, ShoppingCart, Activity as ActivityIcon, 
  Settings, Play, BarChart3, FileText, Plus, Save, Upload, Copy, TrendingUp, BarChart, Wallet, AlertTriangle
} from 'lucide-react';
import { ModuleType, Project, HourlySimResult } from './types';
import { INITIAL_PROJECT } from './constants';
import { runSimulation } from './services/simulationEngine';
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
  const [isDirty, setIsDirty] = useState(false);
  const initialRender = useRef(true);

  // Effect to track project changes and alert for simulation
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    setIsDirty(true);
  }, [project.activities, project.existingSystem, project.proposedSystem, project.district, project.energy]);

  const handleNewProject = () => {
    if (confirm("Tem a certeza que deseja iniciar um novo projeto? Todos os dados não guardados serão perdidos.")) {
      setProject(INITIAL_PROJECT);
      setBaselineResults([]);
      setProposedResults([]);
      setActiveModule(ModuleType.ADMIN);
      setIsDirty(false);
    }
  };

  const saveProject = () => {
    const data = JSON.stringify(project);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Gerar nome do ficheiro: NomeObra_NomeProjeto_Variante_Data.json
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + 
                    date.getDate().toString().padStart(2, '0');
    
    const obra = project.admin.buildingName || 'Obra';
    const designacao = project.admin.projectDesignation || 'Projeto';
    const variante = project.admin.variantName || 'Variante';
    
    const sanitize = (s: string) => s.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toUpperCase();
    
    const fileName = `${sanitize(obra)}_${sanitize(designacao)}_${sanitize(variante)}_${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
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
          setIsDirty(true);
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
    setIsDirty(false);
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
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold shadow-lg">K</div>
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
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors group relative ${
                  activeModule === item.id 
                    ? 'bg-orange-500 text-white shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
                {activeModule !== item.id && isDirty && (item.id.includes('sim_') || item.id === ModuleType.COMPARATIVE || item.id === ModuleType.EXISTING_SYSTEM || item.id === ModuleType.PROPOSED_SYSTEM) && (
                  <div className="absolute right-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                )}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-800 space-y-3">
            {isDirty && (
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertTriangle size={14} className="text-orange-500 shrink-0" />
                <span className="text-[10px] font-black uppercase text-orange-200 leading-tight">Alterações detetadas. Re-simular necessário.</span>
              </div>
            )}
            <button 
              onClick={runAllSimulations}
              className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                isDirty 
                ? 'bg-orange-600 hover:bg-orange-500 text-white animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Play size={16} fill="currentColor" /> {isDirty ? 'RE-SIMULAR SISTEMA' : 'EXECUTAR SIMULAÇÃO'}
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
        {activeModule === ModuleType.EXISTING_SYSTEM && (
          <SystemPage 
            systemType="existing" 
            project={project} 
            setProject={setProject} 
            results={baselineResults} 
            isDirty={isDirty} 
            onRunSimulation={runAllSimulations}
          />
        )}
        {activeModule === ModuleType.PROPOSED_SYSTEM && (
          <SystemPage 
            systemType="proposed" 
            project={project} 
            setProject={setProject} 
            results={proposedResults} 
            isDirty={isDirty} 
            onRunSimulation={runAllSimulations}
          />
        )}
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
