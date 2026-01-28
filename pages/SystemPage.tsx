
import React, { useMemo, useState, useEffect } from 'react';
import { Project, System, Equipment, HourlySimResult } from '../types';
import { DISTRICTS_CLIMATE } from '../constants';
import { 
  Plus, Trash2, Database, Sun, Flame, Thermometer, Zap, 
  Info, CheckCircle2, Activity as ActivityIcon,
  Maximize2, X, Scale, ToggleRight, ToggleLeft, Wand2, Play, Eye, Copy, LineChart as LineChartIcon, Ruler, RotateCcw, Zap as ZapIcon, Cpu, Clock, TrendingUp, PackageCheck, PackageX, CheckSquare, BarChart as BarChartIcon, Layout, ShieldAlert, ShieldCheck, ZapOff, Activity, Droplets, ShowerHead, Calendar, FastForward, Rewind, Pause, Sparkles, AlertTriangle, History
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

const PIDDiagram: React.FC<{ system: System, simState?: HourlySimResult }> = ({ system, simState }) => {
  const tankTemp = simState?.temp_tank ?? 45;
  const tDelivered = simState?.t_delivered ?? 45;
  const flowLh = simState?.demand_L ?? 0;
  const hasStorage = system.hasStorage !== false;
  const hasValve = system.hasMixingValve;
  const tCold = 15;

  const getTempColor = (temp: number) => {
    if (temp > 55) return '#ef4444'; 
    if (temp > 40) return '#f97316'; 
    return '#3b82f6'; 
  };

  const isGenerating = (eq: Equipment) => {
    if (!simState) return false;
    if (eq.type === 'SOLAR') return (simState.solar_gain_kWh ?? 0) > 0;
    if (eq.type === 'HP' || eq.type === 'ELECTRIC_TANK') return (simState.consumed_elec_kWh ?? 0) > 0;
    return (simState.consumed_gas_kWh ?? 0) > 0;
  };

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-[40px] border border-slate-800 overflow-hidden p-8 flex items-center justify-center shadow-2xl">
      <svg viewBox="0 0 800 500" className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <rect width="800" height="500" fill="url(#grid-dark)" />

        {/* Linha de Água Fria (Rede) */}
        <path d="M 0 420 L 300 420" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="20" y="410" className="text-[10px] font-black fill-blue-400 uppercase tracking-widest">Rede Pública: {tCold}ºC</text>
        
        {/* Ramal para Válvula Misturadora */}
        {hasValve && (
          <path d="M 150 420 L 150 60 L 485 60" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="8 4" opacity="0.4" />
        )}

        {/* Elemento Terminal (Consumo) */}
        <g transform="translate(720, 390)">
          <rect x="0" y="0" width="60" height="60" rx="15" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <path d="M 15 45 Q 30 35 45 45" stroke="#3b82f6" strokeWidth={flowLh > 0 ? 3 : 1} fill="none" className={flowLh > 0 ? "animate-bounce" : ""} />
          <path d="M 20 50 L 20 55 M 30 50 L 30 55 M 40 50 L 40 55" stroke="#3b82f6" strokeWidth="1" />
          <text x="30" y="-10" textAnchor="middle" className="text-[9px] font-black fill-slate-500 uppercase tracking-widest">Consumidor</text>
        </g>

        {/* Linha de Saída / Consumo */}
        <path d="M 450 180 L 720 180 L 720 390" stroke={getTempColor(tDelivered)} strokeWidth="6" fill="none" strokeLinecap="round" />
        {flowLh > 0 && (
          <g>
            <circle r="4" fill="#fff" filter="url(#glow)">
              <animateMotion dur="1.5s" repeatCount="indefinite" path="M 450 180 L 720 180 L 720 390" />
            </circle>
            <text x="580" y="170" textAnchor="middle" className="text-[12px] font-black fill-white uppercase animate-pulse">Fluxo: {flowLh.toFixed(0)} L/h</text>
            <text x="580" y="200" textAnchor="middle" className="text-[14px] font-black fill-orange-500 uppercase tracking-tighter">Entrega: {tDelivered.toFixed(1)}ºC</text>
          </g>
        )}

        {/* Válvula Misturadora */}
        {hasValve && (
          <g transform="translate(485, 45)">
            <circle cx="15" cy="15" r="25" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
            <path d="M 5 5 L 25 25 M 5 25 L 25 5" stroke="#f97316" strokeWidth="4" />
            <text x="15" y="55" textAnchor="middle" className="text-[9px] font-black fill-orange-500 uppercase">Misturadora</text>
          </g>
        )}

        {/* Depósito / Acumulador */}
        <g opacity={hasStorage ? 1 : 0.2}>
          <rect x="300" y="100" width="150" height="320" rx="25" fill="#0f172a" stroke="#475569" strokeWidth="4" />
          {hasStorage && (
            <rect 
              x="305" 
              y={105 + (310 * (1 - Math.min(1, (tankTemp - 15) / 70)))} 
              width="140" 
              height={Math.max(0, 310 * ((tankTemp - 15) / 70))} 
              rx="20" 
              fill={getTempColor(tankTemp)} 
              fillOpacity="0.3" 
            />
          )}
          <text x="375" y="240" textAnchor="middle" className="text-3xl font-black fill-white tracking-tighter shadow-lg">
            {hasStorage ? `${tankTemp.toFixed(1)}ºC` : 'INSTANTÂNEO'}
          </text>
          <text x="375" y="130" textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-widest">
            {hasStorage ? `Tanque ${system.storage.volume}L` : 'Sem Depósito'}
          </text>
        </g>

        {/* Equipamentos */}
        {system.equipments.map((eq, i) => {
          const yPos = 130 + (i * 85);
          const active = isGenerating(eq);
          const eqColor = eq.type === 'SOLAR' ? '#f59e0b' : '#ef4444';
          
          return (
            <g key={i}>
              <path d={`M 600 ${yPos} L 450 ${yPos}`} stroke={active ? eqColor : "#334155"} strokeWidth="4" fill="none" strokeDasharray={active ? "none" : "4 2"} className={active ? "animate-pulse" : ""} />
              <path d={`M 600 ${yPos + 20} L 450 ${yPos + 20}`} stroke="#334155" strokeWidth="4" fill="none" opacity="0.3" />
              
              <g transform={`translate(600, ${yPos - 30})`}>
                <rect x="0" y="0" width="180" height="75" rx="15" fill="#1e293b" stroke={active ? eqColor : "#334155"} strokeWidth={active ? 3 : 2} />
                <text x="15" y="25" className="text-[10px] font-black uppercase fill-white">{eq.name}</text>
                <text x="15" y="45" className="text-[9px] font-bold fill-slate-400">
                   {eq.type === 'SOLAR' ? `Coletor: ${eq.area}m²` : `Potência: ${eq.power}kW`}
                </text>
                
                {active && (
                  <>
                    <circle cx="160" cy="20" r="5" fill={eqColor} className="animate-ping" />
                    <text x="-70" y="15" textAnchor="middle" className={`text-[10px] font-black fill-${eq.type === 'SOLAR' ? 'orange' : 'red'}-500`}>
                      {eq.maxOutputTemp}ºC
                    </text>
                  </>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const SystemPage: React.FC<SystemPageProps> = ({ systemType, project, setProject, results = [], isDirty, onRunSimulation }) => {
  const [showPID, setShowPID] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showComfortDetails, setShowComfortDetails] = useState(false);
  const [showAnnualStats, setShowAnnualStats] = useState(false);
  const [showSolarAssistant, setShowSolarAssistant] = useState<number | null>(null);
  const [optSelection, setOptSelection] = useState({ storage: true, solar: true, hp: true });
  const [selectedDay, setSelectedDay] = useState<number>(-1); 
  const [playbackHour, setPlaybackHour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackHour(prev => (prev + 1) % 8760);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const system = systemType === 'existing' ? project.existingSystem : project.proposedSystem;
  
  const dailyResults = useMemo(() => {
    if (results.length === 0) return [];
    return Array.from({ length: 24 }, (_, hour) => {
      const filtered = results.filter(r => (r.hour % 24 === hour) && (selectedDay === -1 || r.dayOfWeek === selectedDay));
      if (filtered.length === 0) return null;
      const count = filtered.length;
      return {
        ...filtered[0], 
        hour,
        hourLabel: `${hour}:00`,
        demand_L: filtered.reduce((acc, r) => acc + r.demand_L, 0) / count,
        t_required: filtered.reduce((acc, r) => acc + r.t_required, 0) / count,
        t_delivered: filtered.reduce((acc, r) => acc + r.t_delivered, 0) / count,
        temp_tank: filtered.reduce((acc, r) => acc + r.temp_tank, 0) / count,
        solar_gain_kWh: filtered.reduce((acc, r) => acc + r.solar_gain_kWh, 0) / count,
        consumed_elec_kWh: filtered.reduce((acc, r) => acc + r.consumed_elec_kWh, 0) / count,
        consumed_gas_kWh: filtered.reduce((acc, r) => acc + r.consumed_gas_kWh, 0) / count,
        demand_kWh: filtered.reduce((acc, r) => acc + r.demand_kWh, 0) / count,
      };
    }).filter((r): r is any => r !== null);
  }, [results, selectedDay]);

  const playbackDateLabel = useMemo(() => {
    const d = new Date(2025, 0, 1 + Math.floor(playbackHour / 24), playbackHour % 24);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} - ${playbackHour % 24}:00`;
  }, [playbackHour]);

  const stressTestData = useMemo(() => {
    if (results.length === 0) return null;
    let maxDayDemand = -1;
    let criticalDayIdx = -1;

    for (let d = 0; d < 365; d++) {
      const dayData = results.slice(d * 24, (d + 1) * 24);
      const totalDemand = dayData.reduce((acc, r) => acc + r.demand_kWh, 0);
      if (totalDemand > maxDayDemand) {
        maxDayDemand = totalDemand;
        criticalDayIdx = d;
      }
    }

    const criticalDayData = results.slice(criticalDayIdx * 24, (criticalDayIdx + 1) * 24);
    const minTempReached = Math.min(...criticalDayData.map(r => r.temp_tank));
    const maxFailureInDay = Math.max(...criticalDayData.map(r => r.t_required - r.t_delivered));

    return {
      dayIndex: criticalDayIdx,
      totalDemandkWh: maxDayDemand,
      minTemp: minTempReached,
      maxDeltaT: maxFailureInDay,
      chartData: criticalDayData.map(r => ({
        hour: `${r.hour % 24}:00`,
        temp: r.temp_tank,
        required: r.t_required,
        demand: r.demand_L,
        status: r.t_delivered >= r.t_required - 0.5 ? 1 : 0
      }))
    };
  }, [results]);

  const annualDayStats = useMemo(() => {
    if (results.length === 0) return [];
    const stats = [];
    for (let day = 0; day < 365; day++) {
      const dayData = results.slice(day * 24, (day + 1) * 24);
      if (dayData.length === 0) continue;
      const temps = dayData.map(r => r.temp_tank);
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      stats.push({ day, label: `Dia ${day + 1}`, avg, min, max });
    }
    return stats;
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
    const failures = results.filter(r => r.demand_L > 0 && r.t_delivered < r.t_required - 0.5);
    const failureHours = failures.length;

    const failuresByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: failures.filter(f => f.hour % 24 === hour).length
    }));

    const failuresByDay = Array.from({ length: 7 }, (_, day) => ({
      day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day],
      count: failures.filter(f => f.dayOfWeek === day).length
    }));

    return { failureHours, designSetpoint, peakLh, peakKW, failuresByHour, failuresByDay };
  }, [results, project.activities]);

  const solarScenarios = useMemo(() => {
    const climate = project.customClimate || DISTRICTS_CLIMATE[project.district] || DISTRICTS_CLIMATE['Lisboa'];
    const avgRad = climate.reduce((acc, d) => acc + d.radiation, 0) / 12;
    const maxRad = Math.max(...climate.map(d => d.radiation));
    
    let dailyDemandkWh = 0;
    project.activities.forEach(act => {
      dailyDemandkWh += (act.volume * CP_WATER * (act.tempRequired - 15)) / 1000;
    });

    // Eficiência típica do coletor: 0.75 ótica * 0.6 operacional ~ 0.45
    const eff = 0.45;
    
    // Injeção 0: Cobre 100% num dia de Verão (pico radiação)
    const areaInjecao0 = dailyDemandkWh / (maxRad * eff);
    
    // Equilíbrio: Cobre 70% da média anual
    const areaEquilibrio = (dailyDemandkWh * 0.7) / (avgRad * eff);
    
    // Consumo 0: Cobre 100% da média anual
    const areaConsumo0 = dailyDemandkWh / (avgRad * eff);

    return {
      inj0: Math.round(areaInjecao0 * 10) / 10,
      eq: Math.round(areaEquilibrio * 10) / 10,
      cons0: Math.round(areaConsumo0 * 10) / 10,
      dailyDemandkWh
    };
  }, [project]);

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
    let name = ''; let power = 2; let maxOutputTemp = 60;
    if (type === 'HP') { name = 'Bomba de Calor'; power = 5; maxOutputTemp = 55; }
    else if (type === 'SOLAR') { name = 'Painel Solar'; maxOutputTemp = 80; }
    else { name = 'Equipamento de Apoio'; }
    const newEq: Equipment = { type, name, power, maxOutputTemp, isExisting: false };
    updateSystem({ equipments: [...system.equipments, newEq] });
  };

  const removeEquipment = (index: number) => {
    updateSystem({ equipments: system.equipments.filter((_, i) => i !== index) });
  };

  const handleCopyFromExisting = () => {
    if (confirm("Deseja copiar todos os dados do Sistema Base para o Sistema Proposto? Esta ação substituirá os dados atuais da proposta.")) {
      setProject(prev => ({
        ...prev,
        proposedSystem: JSON.parse(JSON.stringify(prev.existingSystem))
      }));
    }
  };

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
                onClick={handleCopyFromExisting} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Copy size={18} className="text-blue-500" /> CLONAR BASELINE
              </button>
              <button 
                onClick={() => setShowOptimizer(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-200 transition-all active:scale-95"
              >
                <Wand2 size={18} /> OTIMIZADOR SMART
              </button>
            </>
          )}
          <button onClick={() => setShowPID(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"><Maximize2 size={18} className="text-orange-500"/> P&ID DINÂMICO</button>
          <button onClick={onRunSimulation} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-500 transition-all active:scale-95"><Play size={18} fill="currentColor"/> EXECUTAR SIMULAÇÃO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-start">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Thermometer size={14} className="text-orange-500"/> Setpoint Projeto</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.designSetpoint.toFixed(0)} <span className="text-sm font-bold text-slate-400">ºC</span></div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><ActivityIcon size={14} className="text-blue-500"/> Pico Caudal</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.peakLh.toFixed(0)} <span className="text-sm font-bold text-slate-400">L/h</span></div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><TrendingUp size={14} className="text-red-500"/> Pico Potência</div>
            <div className="text-2xl font-black text-slate-800">{technicalKPIs.peakKW.toFixed(1)} <span className="text-sm font-bold text-slate-400">kWt</span></div>
         </div>
         <div className={`p-6 rounded-3xl border shadow-sm transition-all group relative overflow-hidden h-full ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <Clock size={14}/> {results.length > 0 && technicalKPIs.failureHours > 0 ? 'Falhas Térmicas' : 'Status Conforto'}
            </div>
            <div className="flex flex-col gap-2">
              <div className={`text-2xl font-black ${results.length > 0 && technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {results.length > 0 ? technicalKPIs.failureHours : '---'} <span className="text-sm font-bold opacity-60">h/ano</span>
              </div>
              <div className="flex gap-2">
                {results.length > 0 && technicalKPIs.failureHours > 0 && (
                  <button onClick={() => setShowComfortDetails(true)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-md hover:bg-red-500 transition-all active:scale-95">
                    <Eye size={12}/> Falhas
                  </button>
                )}
                {results.length > 0 && (
                  <button onClick={() => setShowAnnualStats(true)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-md transition-all active:scale-95 ${technicalKPIs.failureHours > 0 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                    <BarChartIcon size={12}/> Estabilidade
                  </button>
                )}
              </div>
            </div>
         </div>
         <div className={`p-6 rounded-3xl border shadow-sm transition-all h-full flex flex-col justify-between ${results.length > 0 ? (stressTestData && stressTestData.minTemp > 40 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-orange-50 border-orange-200 text-orange-900') : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
              {stressTestData && stressTestData.minTemp > 40 ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>} Status Resiliência
            </div>
            <div className="space-y-1">
              <div className="text-xl font-black uppercase tracking-tighter">
                {results.length > 0 ? (stressTestData && stressTestData.minTemp > 40 ? 'ROBUSTO' : 'VULNERÁVEL') : '---'}
              </div>
              {stressTestData && (
                <div className="text-[10px] font-bold opacity-70">
                  Mínima Crítica: {stressTestData.minTemp.toFixed(1)}ºC
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`bg-white p-8 rounded-[40px] shadow-sm border space-y-6 transition-all ${systemType === 'proposed' && system.storage.isExisting ? 'border-slate-300 opacity-80' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <Database size={16} className={systemType === 'proposed' && system.storage.isExisting ? 'text-slate-400' : 'text-blue-500'}/> Acumulação
            </h3>
            {systemType === 'proposed' && (
              <button 
                onClick={() => updateSystem({ storage: { ...system.storage, isExisting: !system.storage.isExisting }})} 
                className={`p-2 rounded-lg transition-all ${system.storage.isExisting ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                title={system.storage.isExisting ? "Depósito Reutilizado (Não Orçar)" : "Depósito Novo (Orçar)"}
              >
                <History size={16} />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Modo Depósito</label>
              <button onClick={() => updateSystem({ hasStorage: system.hasStorage === false })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${system.hasStorage !== false ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-3">{system.hasStorage !== false ? <PackageCheck size={20}/> : <PackageX size={20}/>} <span className="text-xs font-black uppercase tracking-tight">{system.hasStorage !== false ? 'Ativo' : 'Instantâneo'}</span></div>
                {system.hasStorage !== false ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
            </div>
            <div className={`relative ${system.hasStorage === false ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Volume Útil (Litros)</label>
              <input type="number" value={system.storage.volume} onChange={(e) => updateSystem({ storage: { ...system.storage, volume: parseInt(e.target.value) || 0 }})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Válvula Termostática</label>
              <button onClick={() => updateSystem({ hasMixingValve: !system.hasMixingValve })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${system.hasMixingValve ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-3"><Scale size={20} className={system.hasMixingValve ? 'text-orange-500' : 'text-slate-400'}/> <span className="text-xs font-black uppercase tracking-tight">Misturadora</span></div>
                {system.hasMixingValve ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4"><h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Geração e Apoio Térmico</h3>
            <div className="flex gap-2">
              {['HP', 'SOLAR', 'BOILER', 'ELECTRIC_TANK'].map(type => (
                <button key={type} onClick={() => addEquipment(type as any)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] hover:bg-slate-200 uppercase tracking-tight transition-colors">{type}</button>
              ))}
            </div>
          </div>
          {system.equipments.map((eq, i) => (
            <div key={i} className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-start gap-6 border-l-8 transition-all hover:shadow-md ${eq.isExisting ? 'opacity-80 border-slate-300' : ''}`} style={{ borderLeftColor: eq.isExisting ? '#94a3b8' : (eq.type === 'SOLAR' ? '#f59e0b' : '#3b82f6') }}>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <input className="text-lg font-black bg-transparent outline-none focus:text-orange-600 w-full uppercase" value={eq.name} onChange={(e) => updateEquipment(i, { name: e.target.value })} />
                  <div className="flex items-center gap-2">
                    {eq.type === 'SOLAR' && (
                       <button 
                        onClick={() => setShowSolarAssistant(i)}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                        title="Assistente de Área Solar"
                       >
                         <Sparkles size={20}/>
                       </button>
                    )}
                    {systemType === 'proposed' && (
                      <button 
                        onClick={() => updateEquipment(i, { isExisting: !eq.isExisting })}
                        className={`p-2 rounded-lg transition-all ${eq.isExisting ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                        title={eq.isExisting ? "Equipamento Reutilizado (Não Orçar)" : "Equipamento Novo (Orçar)"}
                      >
                        <History size={20}/>
                      </button>
                    )}
                    <button onClick={() => removeEquipment(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eq.type !== 'SOLAR' && (
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Potência (kW)</label><input type="number" step="0.1" value={eq.power} onChange={(e) => updateEquipment(i, { power: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800" /></div>
                  )}
                  {eq.type === 'SOLAR' && (
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Área (m²)</label><input type="number" step="0.1" value={eq.area} onChange={(e) => updateEquipment(i, { area: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800" /></div>
                  )}
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Temp. Máx (ºC)</label><input type="number" value={eq.maxOutputTemp} onChange={(e) => updateEquipment(i, { maxOutputTemp: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-slate-200">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter"><LineChartIcon className="text-blue-600" /> Análise Dinâmica</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 {[-1, 1, 2, 3, 4, 5, 6, 0].map(d => (
                   <button key={d} onClick={() => setSelectedDay(d)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedDay === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                     {d === -1 ? 'Ano' : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]}
                   </button>
                 ))}
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={dailyResults}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="hourLabel" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                      <YAxis yAxisId="temp" domain={[10, 85]} unit="ºC" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Bar yAxisId="temp" dataKey="demand_L" fill="#3b82f6" fillOpacity={0.05} />
                      <Line yAxisId="temp" type="monotone" dataKey="temp_tank" stroke="#ef4444" strokeWidth={3} dot={false} />
                      <Line yAxisId="temp" type="monotone" dataKey="t_required" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                   </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={dailyResults}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="hourLabel" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                      <YAxis yAxisId="flow" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Bar yAxisId="flow" dataKey="demand_L" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Area yAxisId="flow" type="monotone" dataKey="solar_gain_kWh" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={2} />
                   </ComposedChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* MODAL SOLAR ASSISTANT */}
      {showSolarAssistant !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50">
                <h3 className="text-xl font-black text-orange-800 uppercase flex items-center gap-3"><Sun className="text-orange-500" /> Assistente Solar Heliotérmico</h3>
                <button onClick={() => setShowSolarAssistant(null)} className="p-2 hover:bg-orange-200 rounded-full transition-colors"><X size={24}/></button>
             </div>
             
             <div className="p-10 space-y-8">
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center border-l-8 border-orange-500">
                   <div>
                     <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Demanda Térmica Média Diária</p>
                     <p className="text-3xl font-black">{solarScenarios.dailyDemandkWh.toFixed(1)} <span className="text-sm opacity-50">kWh/dia</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Radiação Média ({project.district})</p>
                      <p className="text-xl font-black">{(solarScenarios.dailyDemandkWh / (solarScenarios.eq * 0.45)).toFixed(1)} <span className="text-xs">kWh/m²</span></p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <button 
                    onClick={() => { updateEquipment(showSolarAssistant, { area: solarScenarios.inj0 }); setShowSolarAssistant(null); }}
                    className="p-6 rounded-3xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all text-left space-y-3 group"
                   >
                      <div className="text-[10px] font-black text-slate-400 uppercase group-hover:text-orange-600">Injeção 0</div>
                      <div className="text-2xl font-black text-slate-800">{solarScenarios.inj0} m²</div>
                      <p className="text-[9px] text-slate-500 font-medium leading-tight">Cobertura 100% Verão. Minimiza sobreaquecimento e estagnação do fluído.</p>
                   </button>
                   
                   <button 
                    onClick={() => { updateEquipment(showSolarAssistant, { area: solarScenarios.eq }); setShowSolarAssistant(null); }}
                    className="p-6 rounded-3xl border-2 border-orange-200 bg-orange-50/30 hover:bg-orange-50 transition-all text-left space-y-3 group relative overflow-hidden"
                   >
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-600 text-[8px] font-black text-white rounded-full">IDEAL</div>
                      <div className="text-[10px] font-black text-orange-600 uppercase">Equilíbrio</div>
                      <div className="text-2xl font-black text-slate-800">{solarScenarios.eq} m²</div>
                      <p className="text-[9px] text-slate-500 font-medium leading-tight">Cobre 70% da carga anual. Ponto ótimo de ROI e eficiência sazonal.</p>
                   </button>

                   <button 
                    onClick={() => { updateEquipment(showSolarAssistant, { area: solarScenarios.cons0 }); setShowSolarAssistant(null); }}
                    className="p-6 rounded-3xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all text-left space-y-3 group"
                   >
                      <div className="text-[10px] font-black text-slate-400 uppercase group-hover:text-orange-600">Consumo 0</div>
                      <div className="text-2xl font-black text-slate-800">{solarScenarios.cons0} m²</div>
                      <p className="text-[9px] text-slate-500 font-medium leading-tight">Cobre 100% da carga anual. Requer dissipação ativa no Verão.</p>
                   </button>
                </div>

                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start gap-4 animate-pulse">
                   <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24}/>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-red-900 uppercase tracking-widest">Alerta de Engenharia: Regra dos 50L/m²</p>
                      <p className="text-[10px] text-red-700 leading-relaxed font-bold">
                        IMPORTANTE: Deve ser previsto um volume de acumulação de pelo menos 50 Litros por cada m² de área solar instalada.
                        <br/>
                        Para a área selecionada, recomenda-se um depósito de {(solarScenarios.eq * 50).toFixed(0)}L a {(solarScenarios.cons0 * 50).toFixed(0)}L.
                      </p>
                   </div>
                </div>

                <div className="pt-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>* Cálculos baseados no distrito de {project.district}</span>
                   <span className="flex items-center gap-1 text-orange-500"><Sun size={12}/> Protocolo K2000 Solar</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL PID COM PLAYBACK 8760H */}
      {showPID && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden animate-in zoom-in duration-300 h-[95vh] flex flex-col border border-white/10">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900 shadow-lg relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Maximize2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">P&ID Dinâmico de Engenharia</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Navegação Temporal Integrada (8.760 Horas)</p>
                  </div>
                </div>
                <button onClick={() => setShowPID(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"><X size={28}/></button>
             </div>
             
             <div className="p-8 flex-1 flex flex-col items-center gap-8 overflow-y-auto">
                <div className="w-full bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} text-white`}
                        >
                          {isPlaying ? <Pause size={24} fill="white"/> : <Play size={24} fill="white" className="ml-1"/>}
                        </button>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                             <Calendar size={12}/> {playbackDateLabel}
                          </p>
                          <p className="text-2xl font-black text-white tabular-nums">
                             Instantâneo t = {playbackHour} <span className="text-xs opacity-40">h</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-white/5">
                        <div className="flex flex-col items-center px-4 border-r border-white/10">
                           <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Carga</span>
                           <span className="text-sm font-black text-blue-400">{results[playbackHour]?.demand_L.toFixed(0)} L/h</span>
                        </div>
                        <div className="flex flex-col items-center px-4 border-r border-white/10">
                           <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Temp.</span>
                           <span className="text-sm font-black text-red-500">{results[playbackHour]?.temp_tank.toFixed(1)} ºC</span>
                        </div>
                        <div className="flex flex-col items-center px-4">
                           <span className="text-[8px] font-black text-slate-500 uppercase mb-1">Solar</span>
                           <span className="text-sm font-black text-orange-500">{(results[playbackHour]?.solar_gain_kWh ?? 0).toFixed(2)} kWh</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="relative pt-6">
                      <input 
                        type="range" 
                        min="0" 
                        max="8759" 
                        value={playbackHour} 
                        onChange={(e) => setPlaybackHour(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600"
                      />
                      <div className="flex justify-between mt-2 px-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase">Janeiro</span>
                         <span className="text-[9px] font-black text-slate-600 uppercase">Junho</span>
                         <span className="text-[9px] font-black text-slate-600 uppercase">Dezembro</span>
                      </div>
                   </div>
                </div>

                <div className="w-full flex justify-center pb-12">
                   <PIDDiagram system={system} simState={results[playbackHour]} />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL DIAGNÓSTICO ESTABILIDADE ANUAL */}
      {showAnnualStats && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-7xl h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-blue-50 sticky top-0 z-10">
               <div>
                  <h3 className="text-xl font-black text-blue-900 uppercase flex items-center gap-3"><BarChartIcon className="text-blue-500" /> Diagnóstico de Estabilidade e Stress Test</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Análise de Resiliência Térmica Sazonal (365 Dias / 8.760 Horas)</p>
               </div>
               <button onClick={() => setShowAnnualStats(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-10 space-y-12">
               <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                     <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Layout size={16} className="text-slate-400"/> Panorama de Flutuação Térmica</h4>
                     <div className="flex gap-4 text-[9px] font-black uppercase">
                        <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Max Dia</span>
                        <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Min Dia</span>
                        <span className="flex items-center gap-1 text-slate-900"><div className="w-2 h-2 rounded-full bg-slate-900"></div> Média</span>
                     </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={annualDayStats}>
                          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(v) => v % 30 === 0 ? `Mês ${Math.floor(v/30) + 1}` : ''} tick={{fontSize: 9, fontWeight: 700}} />
                          <YAxis domain={[10, 85]} axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                          <Tooltip labelFormatter={(v) => `Dia ${v + 1}`} contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Area type="monotone" dataKey="min" stroke="transparent" fill="#3b82f6" fillOpacity={0.1} />
                          <Area type="monotone" dataKey="max" stroke="transparent" fill="#ef4444" fillOpacity={0.1} />
                          <Line type="monotone" dataKey="avg" stroke="#0f172a" strokeWidth={1} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </section>

               {stressTestData && (
                 <section className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldAlert size={200}/></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                       <div className="space-y-6">
                          <div>
                             <div className="inline-block px-3 py-1 bg-red-600 text-[10px] font-black uppercase rounded-full mb-3 shadow-lg animate-pulse">Stress Test Ativo</div>
                             <h4 className="text-3xl font-black uppercase tracking-tighter">Perfil de Resiliência</h4>
                             <p className="text-slate-400 text-xs font-medium leading-relaxed mt-2 italic">Identificação automática do Dia Crítico: maior esforço térmico acumulado nas últimas 8.760 horas.</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Dia do Ano</p>
                                <p className="text-2xl font-black">{stressTestData.dayIndex + 1}</p>
                             </div>
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Carga de Pico</p>
                                <p className="text-2xl font-black text-orange-500">{stressTestData.totalDemandkWh.toFixed(1)} <span className="text-xs">kWh</span></p>
                             </div>
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Min. Térmica</p>
                                <p className={`text-2xl font-black ${stressTestData.minTemp < 40 ? 'text-red-500' : 'text-green-500'}`}>{stressTestData.minTemp.toFixed(1)} ºC</p>
                             </div>
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Resiliência</p>
                                <p className="text-xs font-black uppercase tracking-tight mt-1">{stressTestData.minTemp > 40 ? 'SISTEMA ROBUSTO' : 'RISCO DE QUEBRA'}</p>
                             </div>
                          </div>
                       </div>

                       <div className="lg:col-span-2 bg-white/5 rounded-3xl p-6 border border-white/10 h-[350px]">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={14} className="text-orange-500"/> Comportamento Térmico no Pico de Demanda</h5>
                          <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={stressTestData.chartData}>
                                <CartesianGrid vertical={false} stroke="#ffffff10" strokeDasharray="3 3" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} />
                                <YAxis domain={[10, 85]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px'}} />
                                <Bar dataKey="demand" fill="#3b82f630" radius={[2,2,0,0]} />
                                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="required" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                             </ComposedChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </section>
               )}

               <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conclusão do Stress Test</p>
                  <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                    {technicalKPIs.failureHours === 0 
                      ? `Diagnóstico Final: Sistema aprovado com Distinção de Resiliência. Mesmo no Dia Crítico (#${stressTestData?.dayIndex + 1}), com uma demanda de ${stressTestData?.totalDemandkWh.toFixed(1)} kWh, a inércia térmica e a potência instalada mantiveram a temperatura mínima em ${stressTestData?.minTemp.toFixed(1)}ºC, assegurando conforto pleno ininterrupto.`
                      : `Diagnóstico Final: Vulnerabilidade Detetada. O sistema colapsa sob carga máxima, atingindo uma temperatura mínima de ${stressTestData?.minTemp.toFixed(1)}ºC no dia #${stressTestData?.dayIndex + 1}. É imperativo rever o volume de acumulação ou a potência de apoio para mitigar falhas térmicas em cenários de pico de procura.`}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DE FALHAS */}
      {showComfortDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-red-50 text-red-900">
                <h3 className="text-xl font-black uppercase flex items-center gap-3"><Clock size={20}/> Distribuição de Falhas Térmicas</h3>
                <button onClick={() => setShowComfortDetails(false)} className="p-2 hover:bg-red-100 rounded-full transition-colors"><X size={24}/></button>
             </div>
             <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Falhas por Hora do Dia</h4>
                   <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={technicalKPIs.failuresByHour}>
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                            <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Falhas por Dia da Semana</h4>
                   <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={technicalKPIs.failuresByDay}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                            <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL OPTIMIZER (SMART) */}
      {showOptimizer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50">
                <h3 className="text-xl font-black text-orange-800 uppercase flex items-center gap-3"><Wand2 className="text-orange-500" /> Otimizador Smart K2000</h3>
                <button onClick={() => setShowOptimizer(false)} className="p-2 hover:bg-orange-200 rounded-full transition-colors"><X size={24}/></button>
             </div>
             <div className="p-10 space-y-8 text-center">
                <p className="text-slate-500 font-medium">O algoritmo analisou o perfil de consumo e clima. Selecione os componentes a atualizar para máxima eficiência técnica.</p>
                <div className="flex justify-center gap-6">
                   {['Storage', 'Solar', 'HP'].map(k => (
                     <button 
                      key={k} 
                      onClick={() => setOptSelection(prev => ({ ...prev, [k.toLowerCase()]: !((prev as any)[k.toLowerCase()]) }))}
                      className={`px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase ${ (optSelection as any)[k.toLowerCase()] ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400' }`}
                     >
                       {k}
                     </button>
                   ))}
                </div>
                <button onClick={() => setShowOptimizer(false)} className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95">Aplicar Otimização</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPage;
