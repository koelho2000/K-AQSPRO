
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Project, System, Equipment, HourlySimResult } from '../types';
import { runSimulation } from '../services/simulationEngine';
import { 
  Plus, Trash2, Database, ShieldCheck, Sun, Flame, Thermometer, Zap, 
  Info, FlameKindling, Waves, Play, Pause, CheckCircle2, AlertCircle, BarChart2, Activity,
  Maximize2, X, Gauge, Timer, Droplets, FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface SystemPageProps {
  systemType: 'existing' | 'proposed';
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const CP_WATER = 1.163;
const T_COLD = 15;

const PIDDiagram: React.FC<{ system: System, simState?: HourlySimResult, hourOfDay: number }> = ({ system, simState, hourOfDay }) => {
  const tankTemp = simState?.temp_tank || 45;
  const isHeating = (simState?.consumed_elec_kWh || 0) + (simState?.consumed_gas_kWh || 0) > 0;
  const solarPower = simState?.solar_gain_kWh || 0;

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
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />

        <path d="M 50 400 L 300 400" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray={simState && simState.demand_kWh > 0 ? "8,4" : "0"} className={simState && simState.demand_kWh > 0 ? "animate-[dash_1s_linear_infinite]" : "transition-all duration-500"} />
        <text x="60" y="390" className="text-[10px] font-black fill-blue-500 uppercase tracking-widest">Entrada Rede (15ºC)</text>

        <rect x="300" y="100" width="150" height="320" rx="20" fill="#fff" stroke="#94a3b8" strokeWidth="4" />
        <rect x="305" y={105 + (310 * (1 - Math.min(1, (tankTemp - 15) / 70)))} width="140" height={Math.max(0, 310 * ((tankTemp - 15) / 70))} rx="15" fill={getTempColor(tankTemp)} fillOpacity="0.2" className="transition-all duration-1000" />
        
        <text x="375" y="240" textAnchor="middle" className="text-3xl font-black fill-slate-900 transition-all duration-500">{tankTemp.toFixed(1)}ºC</text>
        <text x="375" y="265" textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">Depósito {system.storage.volume}L</text>

        {system.equipments.map((eq, i) => {
          const yPos = 130 + (i * 70);
          const isActive = eq.type === 'SOLAR' ? solarPower > 0 : (isHeating && eq.power && eq.power > 0);
          
          return (
            <g key={i}>
              <path d={`M 600 ${yPos} L 450 ${yPos}`} stroke={isActive ? "#ef4444" : "#cbd5e1"} strokeWidth="3" fill="none" className="transition-colors duration-500" />
              <rect x="600" y={yPos - 25} width="160" height="50" rx="12" fill={isActive ? "#fff" : "#f1f5f9"} stroke={isActive ? "#ef4444" : "#cbd5e1"} strokeWidth="2" className="transition-all duration-500 shadow-sm" />
              <text x="610" y={yPos + 5} className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'fill-slate-900' : 'fill-slate-400'}`}>
                {eq.name.substring(0, 20)}
              </text>
              {isActive && (
                <g filter="url(#glow)">
                   <circle cx="745" cy={yPos} r="5" fill="#ef4444" className="animate-pulse" />
                </g>
              )}
            </g>
          );
        })}

        <path d="M 375 100 L 375 50 L 50 50" stroke={getTempColor(tankTemp)} strokeWidth="4" fill="none" strokeDasharray={simState && simState.demand_kWh > 0 ? "8,4" : "0"} className={simState && simState.demand_kWh > 0 ? "animate-[dash_1s_linear_infinite]" : "transition-all duration-500"} />
        <text x="60" y="40" className="text-[10px] font-black fill-orange-600 uppercase tracking-widest">Saída Consumo ({tankTemp.toFixed(1)}ºC)</text>
        
        {simState && simState.demand_kWh > 0 && (
          <g transform="translate(60, 50)" className="animate-in fade-in zoom-in duration-300">
            <circle r="22" fill="#fff" stroke="#ef4444" strokeWidth="2" className="shadow-sm" />
            <path d="M -8 -8 L 8 8 M -8 8 L 8 -8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <text y="40" textAnchor="middle" className="text-[9px] font-black fill-red-600 uppercase tracking-tight">DEMANDA ATIVA</text>
          </g>
        )}

        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -24; }
          }
        `}</style>
      </svg>

      <div className="absolute top-8 right-8 space-y-3">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[24px] shadow-2xl border border-slate-200 min-w-[200px] animate-in slide-in-from-right-10 duration-500">
           <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Painel de Operação {hourOfDay}h</p>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center group">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Pot. Térmica</span>
                 <span className="text-base font-black text-slate-900 tabular-nums">
                   {((simState?.consumed_elec_kWh || 0) + (simState?.consumed_gas_kWh || 0) + (simState?.solar_gain_kWh || 0)).toFixed(2)} kW
                 </span>
              </div>
              <div className="flex justify-between items-center group">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Caudal Est.</span>
                 <span className="text-base font-black text-blue-600 tabular-nums">
                   {simState ? (simState.demand_kWh * 10).toFixed(0) : 0} L/h
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SystemPage: React.FC<SystemPageProps> = ({ systemType, project, setProject }) => {
  const [localResults, setLocalResults] = useState<HourlySimResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPID, setShowPID] = useState(false);
  const [simHour, setSimHour] = useState(8); 
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<number | null>(null);

  const system = systemType === 'existing' ? project.existingSystem : project.proposedSystem;

  const updateSystem = (updated: Partial<System>) => {
    setProject(prev => ({
      ...prev,
      [systemType === 'existing' ? 'existingSystem' : 'proposedSystem']: { ...system, ...updated }
    }));
  };

  const updateEquipment = (index: number, updatedEq: Partial<Equipment>) => {
    const newEqs = [...system.equipments];
    newEqs[index] = { ...newEqs[index], ...updatedEq };
    updateSystem({ equipments: newEqs });
  };

  const addEquipment = (type: Equipment['type']) => {
    let name = '';
    let power: number | undefined = 2;
    switch(type) {
      case 'HP': name = 'Bomba de Calor'; break;
      case 'SOLAR': name = 'Painel Solar'; power = undefined; break;
      case 'BOILER': name = 'Caldeira'; power = 24; break;
      case 'HEATER': name = 'Esquentador'; power = 11; break;
      case 'ELECTRIC_TANK': name = 'Termoacumulador Elétrico'; power = 1.5; break;
    }

    const newEq: Equipment = {
      type,
      name,
      power,
      cop: type === 'HP' ? 3.5 : undefined,
      efficiency: (type === 'BOILER' || type === 'HEATER') ? 0.85 : (type === 'ELECTRIC_TANK' ? 0.98 : undefined),
      area: type === 'SOLAR' ? 4 : undefined,
      opticalEfficiency: type === 'SOLAR' ? 0.75 : undefined
    };
    updateSystem({ equipments: [...system.equipments, newEq] });
  };

  const removeEquipment = (index: number) => {
    updateSystem({ equipments: system.equipments.filter((_, i) => i !== index) });
  };

  const cloneExisting = () => {
    setProject(prev => ({ ...prev, proposedSystem: JSON.parse(JSON.stringify(prev.existingSystem)) }));
  };

  const runLocalSim = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runSimulation(project, system);
      setLocalResults(res);
      setIsSimulating(false);
    }, 100);
  };

  const exportResultsCSV = () => {
    if (localResults.length === 0) return;
    const headers = Object.keys(localResults[0]);
    const csvContent = [
      headers.join(','),
      ...localResults.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8760h_${systemType === 'existing' ? 'Baseline' : 'Proposto'}_${project.admin.client || 'Projeto'}.csv`;
    link.click();
  };

  useEffect(() => {
    if (isPlaying) {
      playRef.current = window.setInterval(() => {
        setSimHour(prev => (prev + 1) % 24);
      }, 800);
    } else if (playRef.current) {
      clearInterval(playRef.current);
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying]);

  const peakMetrics = useMemo(() => {
    const hourlyLiters = Array.from({ length: 24 }, () => 0);
    const hourlyWeightedTemp = Array.from({ length: 24 }, () => 0);

    project.activities.forEach(act => {
      act.hours.forEach(h => {
        const hVol = act.volume / (act.hours.length || 1);
        hourlyLiters[h] += hVol;
        hourlyWeightedTemp[h] += hVol * act.tempRequired;
      });
    });

    let maxPower = 0;
    let peakLiters = 0;
    let peakTemp = 0;

    hourlyLiters.forEach((vol, h) => {
      if (vol > 0) {
        const avgTemp = hourlyWeightedTemp[h] / vol;
        const deltaT = Math.max(0, avgTemp - T_COLD);
        const power = (vol * CP_WATER * deltaT) / 1000;
        if (power > maxPower) {
          maxPower = power;
          peakLiters = vol;
          peakTemp = avgTemp;
        }
      }
    });
    return { maxPower, peakLiters, peakTemp };
  }, [project.activities]);

  const simStats = useMemo(() => {
    if (!localResults.length) return null;
    
    const daySample = localResults.slice(504, 528).map((r, i) => {
      let hourlyDemand_L = 0;
      let weightedTempSum = 0;
      project.activities.forEach(act => {
        const dayOfYear = Math.floor(r.hour / 24);
        const dayOfWeek = dayOfYear % 7;
        const isDayActive = act.activeDays?.includes(dayOfWeek) ?? true;
        if (isDayActive && act.hours.includes(i)) {
          const hVol = act.volume / (act.hours.length || 1);
          hourlyDemand_L += hVol;
          weightedTempSum += hVol * act.tempRequired;
        }
      });
      const t_req = hourlyDemand_L > 0 ? weightedTempSum / hourlyDemand_L : 45;
      
      return {
        hour: i,
        tank: r.temp_tank,
        terminal: Math.min(r.temp_tank, t_req),
        setpoint: t_req,
        fullResult: r
      };
    });

    const minTankTemp = Math.min(...localResults.map(r => r.temp_tank));
    let discomfortHours = 0;
    localResults.forEach(r => {
      if (r.demand_kWh > 0 && r.temp_tank < 38) discomfortHours++;
    });

    return { daySample, minTankTemp, discomfortHours };
  }, [localResults, project.activities]);

  const currentSimState = simStats?.daySample[simHour]?.fullResult;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            {systemType === 'existing' ? 'Sistema Existente (Baseline)' : 'Sistema Proposto (Eficiente)'}
          </h2>
          <p className="text-slate-500 font-medium">Configure os equipamentos e valide a performance operacional.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {localResults.length > 0 && (
            <button onClick={exportResultsCSV} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"><FileSpreadsheet size={16} className="text-green-600"/> EXPORTAR 8760H (CSV)</button>
          )}
          <button 
            onClick={() => {
              if (localResults.length === 0) runLocalSim();
              setShowPID(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Maximize2 size={18} className="text-orange-500"/> ESQUEMA P&ID
          </button>
          {systemType === 'proposed' && (
            <button 
              onClick={cloneExisting}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <ShieldCheck size={18}/> CLONAR EXISTENTE
            </button>
          )}
          <button 
            onClick={runLocalSim}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95 ${
              isSimulating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Play size={18} fill="currentColor"/> {isSimulating ? 'A SIMULAR...' : 'VERIFICAR FUNCIONAMENTO'}
          </button>
        </div>
      </div>

      <div className="bg-orange-600 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-8 border-orange-800">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Thermometer size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Necessidade Térmica de Projeto (Pico)</p>
            <div className="flex items-center gap-6 mt-1">
              <p className="text-4xl font-black">{peakMetrics.maxPower.toFixed(2)} kW</p>
              <div className="flex flex-col border-l border-white/20 pl-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                  <Droplets size={12} className="text-blue-300" /> {peakMetrics.peakLiters.toFixed(0)} L/h
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                  <Thermometer size={12} className="text-orange-300" /> {peakMetrics.peakTemp.toFixed(1)} ºC (Setpoint)
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60">Potência Instalada</p>
              <p className="text-2xl font-black">
                {system.equipments.filter(e => e.type !== 'SOLAR').reduce((acc, e) => acc + (e.power || 0), 0).toFixed(1)} kW
              </p>
           </div>
           <div className="w-px h-12 bg-white/20"></div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60">Status de Cobertura</p>
              <div className="flex items-center justify-end gap-2">
                 <span className="text-xl font-black uppercase tracking-tight">
                    {system.equipments.filter(e => e.type !== 'SOLAR').reduce((acc, e) => acc + (e.power || 0), 0) >= peakMetrics.maxPower ? 'SUFICIENTE' : 'INSUFICIENTE'}
                 </span>
                 {system.equipments.filter(e => e.type !== 'SOLAR').reduce((acc, e) => acc + (e.power || 0), 0) >= peakMetrics.maxPower ? <CheckCircle2 size={24} className="text-green-300"/> : <AlertCircle size={24} className="text-yellow-300"/>}
              </div>
           </div>
        </div>
      </div>

      {showPID && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                   <Gauge className="text-orange-500" /> Esquema Dinâmico P&ID - {system.name}
                 </h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Simulação Visual de Fluxos e Temperaturas de Operação</p>
              </div>
              <button 
                onClick={() => {
                  setShowPID(false);
                  setIsPlaying(false);
                }} 
                className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-slate-200"
              >
                <X size={24}/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
              <PIDDiagram system={system} simState={currentSimState} hourOfDay={simHour} />
              
              <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Timer size={120} className="text-white"/>
                 </div>
                 
                 <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                       <button 
                         onClick={() => setIsPlaying(!isPlaying)}
                         className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                           isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                         }`}
                       >
                         {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                       </button>
                       <div>
                          <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                             <Activity size={16} className="text-orange-500" /> Simulador Horário
                          </h4>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Visualize a variação diária 24h</p>
                       </div>
                    </div>
                    <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/10">
                       <span className="text-orange-400 font-black text-3xl tabular-nums">
                          {simHour.toString().padStart(2, '0')}:00
                       </span>
                       <span className="text-white/40 font-black text-sm uppercase ml-2 tracking-widest">Hora</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                       <span>Madrugada</span>
                       <span>Carga Matinal</span>
                       <span>Pico</span>
                       <span>Solar</span>
                       <span>Carga Noturna</span>
                       <span>Fim Dia</span>
                    </div>
                    <div className="relative h-4 flex items-center">
                       <div className="absolute inset-0 bg-slate-800 rounded-full h-2 my-auto"></div>
                       <div className="absolute inset-y-0 left-0 bg-orange-500/30 rounded-full h-2 my-auto transition-all duration-300" style={{ width: `${(simHour/23)*100}%` }}></div>
                       <input 
                         type="range" 
                         min="0" 
                         max="23" 
                         value={simHour}
                         onChange={(e) => {
                           setSimHour(parseInt(e.target.value));
                           setIsPlaying(false);
                         }}
                         className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer z-20 accent-orange-500"
                       />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {simStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in duration-500">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                 <Activity size={20} className="text-blue-500"/> Comportamento Dinâmico (Dia Típico Inverno)
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Depósito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Terminal</span>
                  </div>
               </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simStats.daySample}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis domain={[10, 70]} unit="ºC" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} labelFormatter={(h) => `Hora ${h}:00`} />
                  <ReferenceLine y={45} stroke="#cbd5e1" strokeDasharray="5 5" label={{ value: 'Setpoint', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                  <Line type="monotone" dataKey="tank" name="Temp. Depósito" stroke="#ef4444" strokeWidth={4} dot={false} />
                  <Line type="stepAfter" dataKey="terminal" name="Temp. Água Utilizada" stroke="#3b82f6" strokeWidth={3} dot={false} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl space-y-6">
               <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                 <BarChart2 size={16}/> KPIs de Funcionamento
               </h3>
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temp. Mínima no Depósito</p>
                    <p className={`text-4xl font-black ${simStats.minTankTemp < 38 ? 'text-red-400' : 'text-white'}`}>
                      {simStats.minTankTemp.toFixed(1)} <span className="text-lg">ºC</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conforto (Horas Disconforto/Ano)</p>
                    <div className="flex items-center gap-3">
                       <p className={`text-4xl font-black ${simStats.discomfortHours > 50 ? 'text-orange-400' : 'text-green-400'}`}>
                         {simStats.discomfortHours} <span className="text-lg">h</span>
                       </p>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black ${simStats.discomfortHours < 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {simStats.discomfortHours < 10 ? 'NÍVEL ÓTIMO' : 'NÍVEL CRÍTICO'}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit space-y-6">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-4">
            <Database className="text-blue-500" size={20} />
            <h3 className="font-black uppercase text-xs tracking-widest">Depósito de Acumulação</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Volume (Litros)</label>
              <input 
                type="number"
                value={system.storage.volume}
                onChange={(e) => updateSystem({ storage: { ...system.storage, volume: parseInt(e.target.value) || 0 }})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Perdas Térmicas (W/K)</label>
              <input 
                type="number"
                step="0.1"
                value={system.storage.lossFactor}
                onChange={(e) => updateSystem({ storage: { ...system.storage, lossFactor: parseFloat(e.target.value) || 0 }})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-800 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Equipamentos de Produção</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => addEquipment('HP')} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] hover:bg-blue-100 transition-colors uppercase tracking-tight"><Zap size={14}/> HP</button>
              <button onClick={() => addEquipment('BOILER')} className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold text-[10px] hover:bg-orange-100 transition-colors uppercase tracking-tight"><Flame size={14}/> Caldeira</button>
              <button onClick={() => addEquipment('HEATER')} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-[10px] hover:bg-red-100 transition-colors uppercase tracking-tight"><FlameKindling size={14}/> Esquentador</button>
              <button onClick={() => addEquipment('ELECTRIC_TANK')} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-[10px] hover:bg-indigo-100 transition-colors uppercase tracking-tight"><Waves size={14}/> Termoacumul.</button>
              <button onClick={() => addEquipment('SOLAR')} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg font-bold text-[10px] hover:bg-yellow-100 transition-colors uppercase tracking-tight"><Sun size={14}/> Solar</button>
            </div>
          </div>

          {system.equipments.map((eq, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-start gap-6 transition-all hover:shadow-md">
              <div className={`p-4 rounded-2xl shadow-inner ${
                eq.type === 'HP' ? 'bg-blue-50 text-blue-600' : 
                eq.type === 'SOLAR' ? 'bg-yellow-50 text-yellow-600' : 
                eq.type === 'HEATER' ? 'bg-red-50 text-red-600' :
                eq.type === 'ELECTRIC_TANK' ? 'bg-indigo-50 text-indigo-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                {eq.type === 'HP' ? <Zap size={28}/> : eq.type === 'SOLAR' ? <Sun size={28}/> : eq.type === 'HEATER' ? <FlameKindling size={28}/> : eq.type === 'ELECTRIC_TANK' ? <Waves size={28}/> : <Flame size={28}/>}
              </div>
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <input className="text-lg font-black text-slate-900 bg-transparent outline-none focus:text-orange-600 w-full" value={eq.name} onChange={(e) => updateEquipment(i, { name: e.target.value })} />
                  <button onClick={() => removeEquipment(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(eq.type !== 'SOLAR') && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potência (kW)</label>
                      <input type="number" step="0.1" value={eq.power} onChange={(e) => updateEquipment(i, { power: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none border border-transparent focus:border-blue-500 transition-all" />
                    </div>
                  )}
                  {eq.type === 'HP' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">COP Nominal</label>
                      <input type="number" step="0.1" value={eq.cop} onChange={(e) => updateEquipment(i, { cop: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none border border-transparent focus:border-blue-500 transition-all" />
                    </div>
                  )}
                  {eq.type === 'SOLAR' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Área (m²)</label>
                        <input type="number" step="0.1" value={eq.area} onChange={(e) => updateEquipment(i, { area: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none border border-transparent focus:border-yellow-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">η0</label>
                        <input type="number" step="0.01" value={eq.opticalEfficiency} onChange={(e) => updateEquipment(i, { opticalEfficiency: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none border border-transparent focus:border-yellow-500 transition-all" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Análise Técnica do Sistema {systemType === 'existing' ? 'Existente' : 'Proposto'}</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
            {systemType === 'existing' ? (
              `O sistema atual deve ser capaz de cobrir o pico de ${peakMetrics.maxPower.toFixed(2)} kW (${peakMetrics.peakLiters.toFixed(0)} L/h a ${peakMetrics.peakTemp.toFixed(1)}ºC) para garantir o serviço em condições de projeto.`
            ) : (
              `A proposta técnica dimensionada para o pico de ${peakMetrics.maxPower.toFixed(2)} kW garante conforto com ${system.storage.volume}L de acumulação.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemPage;
