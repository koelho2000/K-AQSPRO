
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Project, System, Equipment, HourlySimResult } from '../types';
import { 
  Plus, Trash2, Database, ShieldCheck, Sun, Flame, Thermometer, Zap, 
  Info, CheckCircle2, AlertCircle, BarChart2, Activity,
  Maximize2, X, Gauge, Timer, Droplets, Sparkles, Scale, ToggleRight, ToggleLeft, ArrowRight, AlertTriangle, TextQuote, Lightbulb,
  Zap as ZapIcon, Cpu, Clock, TrendingUp, PackageCheck, PackageX, ChevronRight, Award, Play, Pause, Calendar, Wand2, ArrowUpRight, ExternalLink, ShieldAlert,
  Search, Eye, BarChart as BarChartIcon, Copy
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell, Area, AreaChart, Legend
} from 'recharts';

interface SystemPageProps {
  systemType: 'existing' | 'proposed';
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  results?: HourlySimResult[];
  isDirty?: boolean;
  onRunSimulation?: () => void;
}

const CP_WATER = 1.163;

const PIDDiagram: React.FC<{ system: System, simState?: any, hourOfDay: number }> = ({ system, simState, hourOfDay }) => {
  const tankTemp = simState?.temp_tank || 45;
  const flowLh = simState?.demand_L || 0;
  const solarPower = simState?.solar_gain_kWh || 0;
  const hasStorage = system.hasStorage !== false;
  const hasValve = system.hasMixingValve;

  const getTempColor = (temp: number) => {
    if (temp > 55) return '#ef4444'; 
    if (temp > 40) return '#f97316'; 
    return '#3b82f6'; 
  };

  return (
    <div className="relative w-full aspect-video bg-slate-50 rounded-[40px] border border-slate-200 overflow-hidden p-8 flex items-center justify-center shadow-inner">
      <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />
        
        {/* Cold Water Line */}
        <path d="M 50 420 L 300 420" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray={flowLh > 0 ? "8,4" : "0"} className={flowLh > 0 ? "animate-[dash_1s_linear_infinite]" : ""} />
        
        {/* Hot Water Exit */}
        <path d="M 375 100 L 375 60 L 500 60" stroke={getTempColor(tankTemp)} strokeWidth="4" fill="none" strokeDasharray={flowLh > 0 ? "8,4" : "0"} className={flowLh > 0 ? "animate-[dash_1s_linear_infinite]" : ""} />

        {/* Mixing Valve Representation */}
        {hasValve && (
          <g transform="translate(480, 45)">
            <path d="M -180 375 L -10 375 L -10 35" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="4,2" />
            <circle cx="20" cy="15" r="25" fill="#fff" stroke="#f97316" strokeWidth="3" />
            <path d="M 10 5 L 30 25 M 10 25 L 30 5" stroke="#f97316" strokeWidth="3" />
            <text x="20" y="55" textAnchor="middle" className="text-[10px] font-black fill-orange-600 uppercase">V. Termostática</text>
          </g>
        )}

        <g opacity={hasStorage ? 1 : 0.1}>
          <rect x="300" y="100" width="150" height="320" rx="20" fill="#fff" stroke="#94a3b8" strokeWidth={hasStorage ? 4 : 2} />
          {hasStorage && (
            <rect x="305" y={105 + (310 * (1 - Math.min(1, (tankTemp - 15) / 70)))} width="140" height={Math.max(0, 310 * ((tankTemp - 15) / 70))} rx="15" fill={getTempColor(tankTemp)} fillOpacity="0.2" className="transition-all duration-1000" />
          )}
          <text x="375" y="240" textAnchor="middle" className="text-3xl font-black fill-slate-900">{hasStorage ? `${tankTemp.toFixed(1)}ºC` : 'PERMUTADOR'}</text>
        </g>

        {system.equipments.map((eq, i) => {
          const yPos = 130 + (i * 70);
          const isSolar = eq.type === 'SOLAR';
          const isActive = isSolar ? solarPower > 0 : (simState && (simState.consumed_elec_kWh + simState.consumed_gas_kWh) > 0);
          return (
            <g key={i}>
              <path d={`M 600 ${yPos} L 450 ${yPos}`} stroke={isActive ? "#ef4444" : "#cbd5e1"} strokeWidth="3" fill="none" />
              <rect x="600" y={yPos - 25} width="180" height="60" rx="12" fill={isActive ? "#fff" : "#f8fafc"} stroke={isActive ? (isSolar ? "#f59e0b" : "#ef4444") : "#cbd5e1"} strokeWidth="2" />
              <text x="610" y={yPos - 5} className="text-[10px] font-black uppercase tracking-tight fill-slate-800">{eq.name.substring(0, 22)}</text>
              <text x="610" y="10" transform={`translate(0, ${yPos})`} className="text-[9px] font-bold fill-slate-400">
                {isSolar ? `Área: ${eq.area}m²` : `P: ${eq.power}kW | η: ${eq.type === 'HP' ? 'COP '+eq.cop : (eq.efficiency || 0) * 100+'%'}`}
              </text>
            </g>
          );
        })}
        <style>{`@keyframes dash { to { stroke-dashoffset: -24; } }`}</style>
      </svg>
    </div>
  );
};

const SystemPage: React.FC<SystemPageProps> = ({ systemType, project, setProject, results = [], isDirty, onRunSimulation }) => {
  const [showPID, setShowPID] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showComfortDetails, setShowComfortDetails] = useState(false);
  const [optSelection, setOptSelection] = useState({ storage: true, solar: true, hp: true });
  const [simHour, setSimHour] = useState(8); 
  const [chartTab, setChartTab] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState<number>(-1); 

  const system = systemType === 'existing' ? project.existingSystem : project.proposedSystem;
  
  const dailyResults = useMemo(() => {
    if (results.length === 0) return [];
    
    const dayResults = Array.from({ length: 24 }, (_, hour) => {
      const filtered = results.filter(r => 
        (r.hour % 24 === hour) && (selectedDay === -1 || r.dayOfWeek === selectedDay)
      );
      
      if (filtered.length === 0) return null;

      const count = filtered.length;
      return {
        hour,
        hourLabel: `${hour}:00`,
        demand_L: filtered.reduce((acc, r) => acc + r.demand_L, 0) / count,
        t_required: filtered.reduce((acc, r) => acc + r.t_required, 0) / count,
        t_delivered: filtered.reduce((acc, r) => acc + r.t_delivered, 0) / count,
        temp_tank: filtered.reduce((acc, r) => acc + r.temp_tank, 0) / count,
        solar_gain_kWh: filtered.reduce((acc, r) => acc + r.solar_gain_kWh, 0) / count,
        consumed_elec_kWh: filtered.reduce((acc, r) => acc + r.consumed_elec_kWh, 0) / count,
        consumed_gas_kWh: filtered.reduce((acc, r) => acc + r.consumed_gas_kWh, 0) / count,
      };
    }).filter((r): r is any => r !== null);

    return dayResults;
  }, [results, selectedDay]);

  const weeklyResults = useMemo(() => {
    if (results.length === 0) return [];
    return results.slice(168, 168 + 168).map((r, i) => ({
      ...r,
      hourIdx: i,
      dayLabel: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][r.dayOfWeek]
    }));
  }, [results]);

  const technicalKPIs = useMemo(() => {
    const hourlyLiters = Array.from({ length: 24 }, () => 0);
    const hourlyWeightedTemp = Array.from({ length: 24 }, () => 0);
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        const hVol = act.volume / (act.hours.length || 1);
        hourlyLiters[h] += hVol;
        hourlyWeightedTemp[h] += hVol * act.tempRequired;
      });
    });

    let peakLh = 0; let peakKW = 0;
    hourlyLiters.forEach((vol, h) => {
      if (vol > peakLh) peakLh = vol;
      const avgT = vol > 0 ? hourlyWeightedTemp[h] / vol : 15;
      const kw = (vol * CP_WATER * (avgT - 15)) / 1000;
      if (kw > peakKW) peakKW = kw;
    });

    const designSetpoint = project.activities.length > 0 ? Math.max(...project.activities.map(a => a.tempRequired)) : 45;
    const failures = results.filter(r => r.demand_L > 0 && r.temp_tank < r.t_required - 0.5);
    const failureHours = failures.length;

    // Estatísticas para o modal de conforto
    const failuresByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: failures.filter(f => f.hour % 24 === hour).length
    }));

    const failuresByDay = Array.from({ length: 7 }, (_, day) => ({
      day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day],
      count: failures.filter(f => f.dayOfWeek === day).length
    }));

    const avgFailureTemp = failures.length > 0 ? failures.reduce((acc, f) => acc + f.temp_tank, 0) / failures.length : 0;

    return { 
      failureHours, 
      designSetpoint, 
      peakLh, 
      peakKW, 
      failuresByHour, 
      failuresByDay,
      avgFailureTemp
    };
  }, [results, project.activities]);

  const optimization = useMemo(() => {
    const dailyVol = project.activities.reduce((acc, a) => acc + a.volume, 0);
    if (dailyVol === 0) return null;

    // ALGORITMO PARA 0H DE FALHA:
    // 1. Storage: deve cobrir 150% do pico horário ou 70% da demanda diária (conforme qual for maior)
    const recStorage = Math.max(200, Math.ceil(Math.max(technicalKPIs.peakLh * 1.5, dailyVol * 0.7) / 50) * 50);
    
    // 2. Solar: rácio otimizado para manutenção térmica
    const recSolarArea = Math.round((recStorage / 75) * 2) / 2; 
    
    // 3. Power: Deve ser capaz de cobrir o pico de demanda + margem de 20% OU recuperar o tanque em 4h
    const energyNeeded = (dailyVol * CP_WATER * (technicalKPIs.designSetpoint - 15)) / 1000;
    const recHPPower = Math.max(2, Math.round(Math.max(technicalKPIs.peakKW * 1.2, energyNeeded / 5) * 2) / 2); 

    return { recStorage, recSolarArea, recHPPower, dailyVol };
  }, [project.activities, technicalKPIs.designSetpoint, technicalKPIs.peakLh, technicalKPIs.peakKW]);

  const applyOptimization = () => {
    if (!optimization) return;
    const newEquips = system.equipments.map(eq => {
      if (eq.type === 'HP' && optSelection.hp) return { ...eq, power: optimization.recHPPower };
      if (eq.type === 'SOLAR' && optSelection.solar) return { ...eq, area: optimization.recSolarArea };
      return eq;
    });
    
    updateSystem({ 
      storage: optSelection.storage ? { ...system.storage, volume: optimization.recStorage } : system.storage,
      equipments: newEquips,
      hasMixingValve: true // Otimização sempre sugere válvula para conforto
    });
    setShowOptimizer(false);
  };

  const copyFromBaseline = () => {
    if (confirm("Deseja copiar integralmente as configurações do Sistema Base para o Sistema de Eficiência? Esta ação substituirá os dados atuais.")) {
      setProject(prev => ({
        ...prev,
        proposedSystem: {
          ...JSON.parse(JSON.stringify(prev.existingSystem)),
          name: 'Sistema Eficiente' // Mantemos o nome de destino para clareza
        }
      }));
    }
  };

  const updateSystem = (updated: Partial<System>) => {
    setProject(prev => ({
      ...prev,
      [systemType === 'existing' ? 'existingSystem' : 'proposedSystem']: { ...system, ...updated }
    }));
  };

  const updateEquipment = (index: number, updated: Partial<Equipment>) => {
    const newEquips = system.equipments.map((eq, i) => i === index ? { ...eq, ...updated } : eq);
    updateSystem({ equipments: newEquips });
  };

  const addEquipment = (type: Equipment['type']) => {
    let name = ''; let power: number | undefined = 2;
    let cop: number | undefined;
    let efficiency: number | undefined;

    switch(type) {
      case 'HP': name = 'Bomba de Calor'; cop = 3.5; break;
      case 'SOLAR': name = 'Painel Solar'; power = undefined; break;
      case 'BOILER': name = 'Caldeira Gás'; power = 24; efficiency = 1.05; break;
      case 'HEATER': name = 'Esquentador'; power = 11; efficiency = 0.88; break;
      case 'ELECTRIC_TANK': name = 'Termoacumulador Elétrico'; power = 1.5; efficiency = 0.98; break;
    }
    const newEq: Equipment = { type, name, power, cop, efficiency, area: type === 'SOLAR' ? 4 : undefined, opticalEfficiency: type === 'SOLAR' ? 0.75 : undefined };
    updateSystem({ equipments: [...system.equipments, newEq] });
  };

  const removeEquipment = (index: number) => {
    updateSystem({ equipments: system.equipments.filter((_, i) => i !== index) });
  };

  const getEquipmentIcon = (type: Equipment['type']) => {
    switch(type) {
      case 'SOLAR': return <Sun size={28}/>;
      case 'HP': return <ZapIcon size={28}/>;
      case 'ELECTRIC_TANK': return <Database size={28}/>;
      default: return <Flame size={28}/>;
    }
  };

  const getEquipmentColor = (type: Equipment['type']) => {
    switch(type) {
      case 'SOLAR': return '#f59e0b';
      case 'HP': return '#3b82f6';
      case 'ELECTRIC_TANK': return '#6366f1';
      default: return '#ef4444';
    }
  };

  const equipmentTypesList: {type: Equipment['type'], label: string}[] = [
    { type: 'HP', label: 'BC' },
    { type: 'SOLAR', label: 'Solar' },
    { type: 'BOILER', label: 'Caldeira' },
    { type: 'HEATER', label: 'Esquentador' },
    { type: 'ELECTRIC_TANK', label: 'Termo' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            {systemType === 'existing' ? 'Sist. Base (Baseline)' : 'Sist. de Eficiência'}
          </h2>
          <p className="text-slate-500 font-medium">Dimensionamento e Especificação Técnica de Equipamentos.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {systemType === 'proposed' && (
            <>
              <button 
                onClick={copyFromBaseline} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Copy size={18} /> COPIAR BASELINE
              </button>
              <button 
                onClick={() => setShowOptimizer(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-200 transition-all active:scale-95"
              >
                <Wand2 size={18} /> OTIMIZADOR SMART
              </button>
            </>
          )}
          <a 
            href="https://k-chbcselect-50850505662.us-west1.run.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 transition-all active:scale-95"
          >
            <Cpu size={18} /> SELECIONAR EQUIPAMENTOS BC
          </a>
          <button onClick={() => setShowPID(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"><Maximize2 size={18} className="text-orange-500"/> P&ID DINÂMICO</button>
          <button onClick={onRunSimulation} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-500 transition-all active:scale-95"><Play size={18} fill="currentColor"/> EXECUTAR</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Thermometer size={14} className="text-orange-500"/> Setpoint Projeto</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.designSetpoint.toFixed(0)} <span className="text-sm font-bold text-slate-400">ºC</span></div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Activity size={14} className="text-blue-500"/> Pico Caudal</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.peakLh.toFixed(0)} <span className="text-sm font-bold text-slate-400">L/h</span></div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><TrendingUp size={14} className="text-red-500"/> Pico Potência</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.peakKW.toFixed(1)} <span className="text-sm font-bold text-slate-400">kWt</span></div>
         </div>
         <div className={`p-6 rounded-3xl border shadow-sm transition-all group relative overflow-hidden ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <Clock size={14}/> {results.length > 0 && technicalKPIs.failureHours > 0 ? 'Falhas Térmicas' : 'Status Conforto'}
            </div>
            <div className="flex justify-between items-end">
              <div className={`text-2xl font-black ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {results.length > 0 ? technicalKPIs.failureHours : '---'} <span className="text-sm font-bold opacity-60">h/ano</span>
              </div>
              {results.length > 0 && technicalKPIs.failureHours > 0 && (
                <button 
                  onClick={() => setShowComfortDetails(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-md hover:bg-red-500 transition-all active:scale-95"
                >
                  <Eye size={12}/> Detalhes
                </button>
              )}
            </div>
            {results.length > 0 && technicalKPIs.failureHours === 0 && (
              <div className="absolute -right-4 -bottom-4 opacity-10 text-green-600 rotate-12">
                <CheckCircle2 size={100} />
              </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2"><Database size={16} className="text-blue-500"/> Acumulação e Controlo</h3></div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Modo Depósito</label>
              <button 
                onClick={() => updateSystem({ hasStorage: system.hasStorage === false })} 
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${system.hasStorage !== false ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  {system.hasStorage !== false ? <PackageCheck size={20}/> : <PackageX size={20}/>}
                  <span className="text-xs font-black uppercase tracking-tight">{system.hasStorage !== false ? 'Ativo' : 'Instantâneo'}</span>
                </div>
                {system.hasStorage !== false ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
            </div>
            
            <div className={system.hasStorage === false ? 'opacity-30 pointer-events-none grayscale' : ''}>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Volume Útil (Litros)</label>
              <input type="number" value={system.storage.volume} onChange={(e) => updateSystem({ storage: { ...system.storage, volume: parseInt(e.target.value) || 0 }})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Válvula Termostática</label>
              <button 
                onClick={() => updateSystem({ hasMixingValve: !system.hasMixingValve })} 
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${system.hasMixingValve ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <Scale size={20} className={system.hasMixingValve ? 'text-orange-500' : 'text-slate-400'}/>
                  <span className="text-xs font-black uppercase tracking-tight">Válvula Misturadora</span>
                </div>
                {system.hasMixingValve ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
              <p className="text-[9px] text-slate-400 italic mt-2 leading-relaxed">Garante temperatura constante no terminal e reduz extração desnecessária de energia do depósito.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Geração e Apoio Térmico</h3>
            <div className="flex gap-2">
              {equipmentTypesList.map(eq => (
                <button 
                  key={eq.type} 
                  onClick={() => addEquipment(eq.type)} 
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] hover:bg-slate-200 uppercase tracking-tight transition-colors"
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>
          {system.equipments.map((eq, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-start gap-6 border-l-8 transition-all hover:shadow-md" style={{ borderLeftColor: getEquipmentColor(eq.type) }}>
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-600">
                {getEquipmentIcon(eq.type)}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center"><input className="text-lg font-black text-slate-900 bg-transparent outline-none focus:text-orange-600 w-full uppercase" value={eq.name} onChange={(e) => updateEquipment(i, { name: e.target.value })} /><button onClick={() => removeEquipment(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {eq.type !== 'SOLAR' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Potência (kW)</label>
                      <input type="number" step="0.1" value={eq.power} onChange={(e) => updateEquipment(i, { power: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  )}
                  {eq.type === 'HP' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">COP Nominal <Info size={10} title="Coeficiente de Performance nominal do fabricante"/></label>
                      <input type="number" step="0.1" value={eq.cop} onChange={(e) => updateEquipment(i, { cop: parseFloat(e.target.value) || 1.0 })} className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 font-black text-blue-700 outline-none" />
                    </div>
                  )}
                  {(eq.type === 'BOILER' || eq.type === 'HEATER' || eq.type === 'ELECTRIC_TANK') && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Eficiência (η)</label>
                      <div className="relative">
                        <input type="number" step="1" value={(eq.efficiency || 0) * 100} onChange={(e) => updateEquipment(i, { efficiency: (parseFloat(e.target.value) || 0) / 100 })} className="w-full bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-black text-red-700 outline-none" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-300">%</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                         <button onClick={() => updateEquipment(i, { efficiency: 0.92 })} className="text-[7px] bg-slate-100 px-1 rounded font-bold uppercase">Standard (92%)</button>
                         <button onClick={() => updateEquipment(i, { efficiency: 1.07 })} className="text-[7px] bg-slate-100 px-1 rounded font-bold uppercase">Condens. (107%)</button>
                      </div>
                    </div>
                  )}
                  {eq.type === 'SOLAR' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Área (m²)</label>
                        <input type="number" step="0.1" value={eq.area} onChange={(e) => updateEquipment(i, { area: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">η0 (Ótico)</label>
                        <input type="number" step="0.01" value={eq.opticalEfficiency} onChange={(e) => updateEquipment(i, { opticalEfficiency: parseFloat(e.target.value) || 0.75 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-slate-200 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><BarChart2 size={24}/></div>
               <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Desempenho Térmico e Caudal</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Análise Dinâmica de Conforto Terminal</p>
               </div>
             </div>
             
             <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
               <button onClick={() => setChartTab('daily')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all ${chartTab === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Timer size={14}/> DIA TÍPICO</button>
               {chartTab === 'daily' && (
                 <select 
                   value={selectedDay} 
                   onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                   className="ml-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                 >
                   <option value="-1">Média Semanal</option>
                   <option value="1">Segunda-feira</option>
                   <option value="2">Terça-feira</option>
                   <option value="3">Quarta-feira</option>
                   <option value="4">Quinta-feira</option>
                   <option value="5">Sexta-feira</option>
                   <option value="6">Sábado</option>
                   <option value="0">Domingo</option>
                 </select>
               )}
               <div className="w-[1px] h-6 bg-slate-300 mx-2"></div>
               <button onClick={() => setChartTab('weekly')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all ${chartTab === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Calendar size={14}/> SEMANA TÍPICA</button>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-[500px]">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Droplets size={14} className="text-blue-500"/> {chartTab === 'daily' ? (selectedDay === -1 ? 'Perfil Médio Anual (Consolidado)' : `Perfil: ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][selectedDay]}`) : 'Variação Semanal'}
                </h4>
                <div className="flex gap-6">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Caudal L/h</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Temp. Atingida</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-slate-300 border-dashed rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Temp. Requerida</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartTab === 'daily' ? dailyResults : weeklyResults}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={chartTab === 'daily' ? "hourLabel" : "hourIdx"} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontStyle: 'normal', fontWeight: 'bold'}} 
                    tickFormatter={(v) => chartTab === 'weekly' ? (v % 24 === 0 ? weeklyResults[v].dayLabel : '') : v}
                  />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} unit=" L/h" tick={{fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} unit="ºC" domain={[10, 85]} tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(v) => chartTab === 'weekly' ? `Hora ${v} | ${weeklyResults[v].dayLabel}` : `Hora ${v}`}
                  />
                  <Bar yAxisId="left" dataKey="demand_L" name="Caudal (L/h)" fill="#3b82f6" fillOpacity={0.15} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="stepAfter" dataKey="t_required" name="Temp. Requerida" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="t_delivered" name="Temp. Atingida" stroke="#ef4444" strokeWidth={4} dot={false} animationDuration={1000} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperatura de Acumulação (Depósito)</h4>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-red-500"><Thermometer size={20}/></div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartTab === 'daily' ? dailyResults : weeklyResults}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={chartTab === 'daily' ? "hourLabel" : "hourIdx"} 
                    axisLine={false} tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold'}}
                    tickFormatter={(v) => chartTab === 'weekly' ? (v % 24 === 0 ? weeklyResults[v].dayLabel : '') : v}
                  />
                  <YAxis axisLine={false} tickLine={false} unit="ºC" domain={[10, 85]} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="temp_tank" name="Temp. Depósito" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balanço de Geração Térmica (kWh)</h4>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-orange-500"><Zap size={20}/></div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartTab === 'daily' ? dailyResults : weeklyResults}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={chartTab === 'daily' ? "hourLabel" : "hourIdx"} 
                    axisLine={false} tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold'}}
                    tickFormatter={(v) => chartTab === 'weekly' ? (v % 24 === 0 ? weeklyResults[v].dayLabel : '') : v}
                  />
                  <YAxis axisLine={false} tickLine={false} unit=" kWh" tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="solar_gain_kWh" name="Solar" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="consumed_elec_kWh" name="Eletricidade" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="consumed_gas_kWh" name="Gás" stackId="a" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Otimizador Inteligente */}
      {showOptimizer && optimization && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20"><Wand2 size={24}/></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Otimizador Inteligente de Dimensionamento</h3>
                    <div className="flex items-center gap-1 mt-1">
                       <ShieldCheck size={14} className="text-green-600" />
                       <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Algoritmo de Conforto Garantido (0h Falha)</span>
                    </div>
                 </div>
               </div>
               <button onClick={() => setShowOptimizer(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Demanda Diária Analisada</p>
                  <p className="text-3xl font-black text-blue-900">{optimization.dailyVol.toLocaleString('pt-PT')} L/dia</p>
                </div>
                <Droplets className="text-blue-200" size={48} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setOptSelection(prev => ({ ...prev, storage: !prev.storage }))}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden ${optSelection.storage ? 'bg-orange-50 border-orange-500 shadow-md ring-4 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${optSelection.storage ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'}`}><Database size={24}/></div>
                    <div>
                      <p className={`text-[10px] font-black uppercase ${optSelection.storage ? 'text-orange-600' : 'text-slate-400'}`}>Volume de Acumulação</p>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 line-through text-sm font-bold">{system.storage.volume}L</span>
                        <ArrowRight size={14} className="text-slate-300"/>
                        <span className={`text-xl font-black ${optSelection.storage ? 'text-orange-900' : 'text-slate-800'}`}>{optimization.recStorage}L</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${optSelection.storage ? 'bg-orange-500 text-white' : 'bg-green-100 text-green-700'}`}>
                    {optSelection.storage ? 'SELECIONADO' : 'NECESSÁRIO'}
                  </div>
                </button>

                <button 
                  onClick={() => setOptSelection(prev => ({ ...prev, solar: !prev.solar }))}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden ${optSelection.solar ? 'bg-orange-50 border-orange-500 shadow-md ring-4 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${optSelection.solar ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'}`}><Sun size={24}/></div>
                    <div>
                      <p className={`text-[10px] font-black uppercase ${optSelection.solar ? 'text-orange-600' : 'text-slate-400'}`}>Área Coletora Solar</p>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 line-through text-sm font-bold">{system.equipments.find(e=>e.type==='SOLAR')?.area || 0}m²</span>
                        <ArrowRight size={14} className="text-slate-300"/>
                        <span className={`text-xl font-black ${optSelection.solar ? 'text-orange-900' : 'text-slate-800'}`}>{optimization.recSolarArea}m²</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${optSelection.solar ? 'bg-orange-500 text-white' : 'bg-green-100 text-green-700'}`}>
                    {optSelection.solar ? 'SELECIONADO' : 'OTIMIZADO'}
                  </div>
                </button>

                <button 
                  onClick={() => setOptSelection(prev => ({ ...prev, hp: !prev.hp }))}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden ${optSelection.hp ? 'bg-orange-50 border-orange-500 shadow-md ring-4 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${optSelection.hp ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'}`}><ZapIcon size={24}/></div>
                    <div>
                      <p className={`text-[10px] font-black uppercase ${optSelection.hp ? 'text-orange-600' : 'text-slate-400'}`}>Potência Bomba Calor</p>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 line-through text-sm font-bold">{system.equipments.find(e=>e.type==='HP')?.power || 0}kW</span>
                        <ArrowRight size={14} className="text-slate-300"/>
                        <span className={`text-xl font-black ${optSelection.hp ? 'text-orange-900' : 'text-slate-800'}`}>{optimization.recHPPower}kW</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${optSelection.hp ? 'bg-orange-500 text-white' : 'bg-green-100 text-green-700'}`}>
                    {optSelection.hp ? 'SELECIONADO' : 'CONFORTO TOTAL'}
                  </div>
                </button>
              </div>

              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-start gap-4">
                 <div className="bg-white p-2 rounded-xl text-green-600 shadow-sm"><Sparkles size={18}/></div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-green-800 uppercase tracking-widest">Compromisso Térmico</p>
                    <p className="text-[11px] text-green-700 font-medium leading-relaxed italic">Estas dimensões foram calculadas para suportar o maior pico horário simultâneo detectado no seu perfil, garantindo que a temperatura nunca desça do setpoint exigido.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowOptimizer(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all active:scale-95">CANCELAR</button>
                <button 
                  onClick={applyOptimization} 
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  APLICAR DIMENSIONAMENTO <ArrowUpRight size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Análise de Conforto Térmico */}
      {showComfortDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-600 rounded-xl text-white shadow-lg shadow-red-500/20"><ShieldAlert size={24}/></div>
                 <div>
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Análise de Défice Térmico (Conforto)</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnóstico detalhado de falhas no terminal</p>
                 </div>
               </div>
               <button onClick={() => setShowComfortDetails(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-10 flex-1 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Horas Falha</p>
                  <p className="text-3xl font-black text-red-600">{technicalKPIs.failureHours} <span className="text-sm">h/ano</span></p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temp. Média em Falha</p>
                  <p className="text-3xl font-black text-slate-800">{technicalKPIs.avgFailureTemp.toFixed(1)} <span className="text-sm">ºC</span></p>
                </div>
                <div className="bg-red-900 p-6 rounded-3xl text-white">
                  <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Status Severidade</p>
                  <p className="text-xl font-black uppercase tracking-tight">
                    {technicalKPIs.failureHours > 500 ? 'Crítico' : (technicalKPIs.failureHours > 100 ? 'Moderado' : 'Aceitável')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 h-80">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Timer size={14} className="text-red-500"/> Frequência Horária (Onde Falha?)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={technicalKPIs.failuresByHour}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" name="Horas Falha" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 h-80">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Calendar size={14} className="text-red-500"/> Frequência Semanal (Que Dias?)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={technicalKPIs.failuresByDay}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" name="Horas Falha" fill="#991b1b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="text-orange-500" />
                  <p className="text-xs font-black text-slate-900 uppercase">Sugestões de Otimização de Conforto</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Cenário A: Falhas na Manhã</p>
                    <p className="text-[11px] text-slate-500 italic">Aumentar volume de acumulação ou antecipar o período de aquecimento (setpoint dinâmico) para garantir estoque térmico antes do primeiro duche.</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-red-600 uppercase mb-1">Cenário B: Falhas Contínuas</p>
                    <p className="text-[11px] text-slate-500 italic">A potência de geração é insuficiente para o caudal instantâneo solicitado. Recomenda-se aumentar a potência da Bomba de Calor ou Caldeira de Apoio.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowComfortDetails(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95">Fechar Análise</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: P&ID Dinâmico */}
      {showPID && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Esquema P&ID Dinâmico (Configuração de Fluxo)</h3>
               <button onClick={() => setShowPID(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-10 flex-1 overflow-y-auto">
               <PIDDiagram system={system} hourOfDay={simHour} simState={dailyResults[simHour]} />
               <div className="mt-8 px-10">
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Hora da Simulação Visual: {simHour}:00</label>
                 <input 
                   type="range" min="0" max="23" value={simHour} 
                   onChange={(e) => setSimHour(parseInt(e.target.value))} 
                   className="w-full accent-blue-600"
                 />
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Parecer Técnico de Desempenho</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">Os gráficos acima demonstram a capacidade de resposta do sistema às solicitações de consumo. A temperatura <strong>atingida</strong> no terminal é o indicador crítico de conforto: se a linha vermelha cair abaixo da linha tracejada cinzenta, o sistema falhou em garantir a temperatura de projeto naquele período horário. A utilização da <strong>Válvula Termostática</strong> é essencial para estabilizar a temperatura de entrega, aumentar a segurança e reduzir perdas térmicas por sobreaquecimento desnecessário nas tubagens.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemPage;
