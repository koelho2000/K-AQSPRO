
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Project, System, Equipment, HourlySimResult } from '../types';
import { 
  Plus, Trash2, Database, ShieldCheck, Sun, Flame, Thermometer, Zap, 
  Info, FlameKindling, Waves, Play, Pause, CheckCircle2, AlertCircle, BarChart2, Activity,
  Maximize2, X, Gauge, Timer, Droplets, FileSpreadsheet, Sparkles, Target, Scale, Ban, ToggleRight, ToggleLeft, ArrowRight, AlertTriangle, Layout, TextQuote, Lightbulb,
  ZapOff,
  Cpu,
  Clock,
  TrendingUp,
  PackageCheck,
  PackageX,
  ChevronRight,
  Zap as ZapIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, ComposedChart, Legend, Area, AreaChart, Cell
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
const T_COLD = 15;

const PIDDiagram: React.FC<{ system: System, simState?: HourlySimResult, hourOfDay: number }> = ({ system, simState, hourOfDay }) => {
  const tankTemp = simState?.temp_tank || 45;
  const flowLh = simState?.demand_L || 0;
  const solarPower = simState?.solar_gain_kWh || 0;
  const hasValve = system.hasMixingValve;
  const hasStorage = system.hasStorage !== false;
  const deliveryTemp = hasValve ? (flowLh > 0 ? tankTemp : 0) : tankTemp;

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
        <path d="M 50 400 L 300 400" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray={flowLh > 0 ? "8,4" : "0"} className={flowLh > 0 ? "animate-[dash_1s_linear_infinite]" : ""} />
        <text x="60" y="390" className="text-[10px] font-black fill-blue-500 uppercase tracking-widest">Entrada Rede (15ºC)</text>
        
        <g opacity={hasStorage ? 1 : 0.1}>
          <rect x="300" y="100" width="150" height="320" rx="20" fill="#fff" stroke="#94a3b8" strokeWidth={hasStorage ? 4 : 2} />
          {hasStorage && (
            <rect x="305" y={105 + (310 * (1 - Math.min(1, (tankTemp - 15) / 70)))} width="140" height={Math.max(0, 310 * ((tankTemp - 15) / 70))} rx="15" fill={getTempColor(tankTemp)} fillOpacity="0.2" className="transition-all duration-1000" />
          )}
          <text x="375" y="240" textAnchor="middle" className="text-3xl font-black fill-slate-900">{hasStorage ? `${tankTemp.toFixed(1)}ºC` : 'PERMUTADOR'}</text>
          <text x="375" y="265" textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">{hasStorage ? 'Acumulação' : 'Fluxo Direto'}</text>
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
                {isSolar ? `Área: ${eq.area}m²` : `P: ${eq.power}kW | η: ${eq.type === 'HP' ? eq.cop : (eq.efficiency || 0) * 100}%`}
              </text>
              {isActive && (
                <text x="610" y="22" transform={`translate(0, ${yPos})`} className={`text-[10px] font-black ${isSolar ? 'fill-orange-500' : 'fill-red-500'}`}>{isSolar ? `+${solarPower.toFixed(2)} kWt` : `Consumo: ${(simState!.consumed_elec_kWh + simState!.consumed_gas_kWh).toFixed(2)} kWe`}</text>
              )}
            </g>
          );
        })}

        <path d="M 375 100 L 375 40 L 250 40" stroke={getTempColor(deliveryTemp)} strokeWidth="4" fill="none" />
        <g transform="translate(250, 40)">
          {hasValve ? (
            <>
              <circle r="15" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
              <path d="M -8 -8 L 8 8 M -8 8 L 8 -8" stroke="#94a3b8" strokeWidth="2" />
              <path d="M -15 0 L -200 0" stroke={getTempColor(deliveryTemp)} strokeWidth="4" strokeDasharray={flowLh > 0 ? "8,4" : "0"} className={flowLh > 0 ? "animate-[dash_1s_linear_infinite]" : ""} />
            </>
          ) : (
            <path d="M 0 0 L -200 0" stroke={getTempColor(deliveryTemp)} strokeWidth="4" strokeDasharray={flowLh > 0 ? "8,4" : "0"} className={flowLh > 0 ? "animate-[dash_1s_linear_infinite]" : ""} />
          )}
          {flowLh > 0 && (
            <g transform="translate(-100, -10)">
              <text textAnchor="middle" className="text-[12px] font-black fill-slate-900 uppercase">Saída Consumo</text>
              <text y="18" textAnchor="middle" className="text-[14px] font-black fill-orange-600">{deliveryTemp.toFixed(1)} ºC</text>
            </g>
          )}
        </g>
        <style>{`@keyframes dash { to { stroke-dashoffset: -24; } }`}</style>
      </svg>
    </div>
  );
};

interface DimensioningOption {
  id: string;
  title: string;
  volume: number;
  power: number;
  benefits: string[];
  icon: any;
}

const SystemPage: React.FC<SystemPageProps> = ({ systemType, project, setProject, results = [], isDirty, onRunSimulation }) => {
  const [showPID, setShowPID] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [simHour, setSimHour] = useState(8); 
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<number | null>(null);

  const system = systemType === 'existing' ? project.existingSystem : project.proposedSystem;
  
  const dailyResults = useMemo(() => {
    if (results.length === 0) return [];
    return results.slice(0, 24).map(r => ({ ...r, hourLabel: `${r.hour % 24}:00` }));
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

    let failureHours = 0;
    if (results.length > 0) {
      results.forEach((res, h) => {
        const hIdx = h % 24;
        let t_req = 0; let h_vol = 0;
        project.activities.forEach(a => { if(a.hours.includes(hIdx)) { t_req += (a.volume/a.hours.length)*a.tempRequired; h_vol += (a.volume/a.hours.length); } });
        if(h_vol > 0 && res.temp_tank < (t_req/h_vol)) failureHours++;
      });
    }

    return { failureHours, designSetpoint, peakLh, peakKW };
  }, [results, project.activities]);

  const dimensioningOptions = useMemo((): DimensioningOption[] => {
    const dailyVol = project.activities.reduce((acc, a) => acc + a.volume, 0);
    const avgT = project.activities.length > 0 ? (project.activities.reduce((acc, a) => acc + (a.volume * a.tempRequired), 0) / dailyVol) : 45;
    const energyDaily = (dailyVol * CP_WATER * (avgT - T_COLD)) / 1000;

    return [
      {
        id: 'inertia',
        title: 'Cenário 1: Maximizar Acumulação',
        volume: Math.ceil(dailyVol * 1.2 / 100) * 100,
        power: Math.ceil((energyDaily / 14) * 2) / 2,
        icon: Database,
        benefits: [
          'Minimiza a potência elétrica (evita picos de rede)',
          'Máximo proveito de Fotovoltaico e Solar Térmico',
          'Maior estabilidade de temperatura (reserva de emergência)',
          'Garante 100% de conforto em todas as horas do ano'
        ]
      },
      {
        id: 'power',
        title: 'Cenário 2: Maximizar Potência',
        volume: Math.ceil(dailyVol * 0.25 / 50) * 50,
        power: Math.ceil(technicalKPIs.peakKW * 1.1 * 2) / 2,
        icon: Zap,
        benefits: [
          'Redução drástica do espaço físico (depósito compacto)',
          'Menores perdas térmicas estáticas por radiação',
          'Recuperação térmica ultra-rápida (quase instantâneo)',
          'Ideal para locais com restrição de área técnica'
        ]
      },
      {
        id: 'balanced',
        title: 'Cenário 3: Equilíbrio Técnico',
        volume: Math.ceil(dailyVol * 0.75 / 50) * 50,
        power: Math.ceil((energyDaily / 8) * 2) / 2,
        icon: Scale,
        benefits: [
          'Otimização CAPEX/OPEX (custo de investimento ideal)',
          'Dimensionamento standard para Bombas de Calor (COP alto)',
          'Compromisso ideal entre inércia e rapidez de resposta',
          'Garante conforto pleno com custo de instalação moderado'
        ]
      }
    ];
  }, [project.activities, technicalKPIs.peakKW]);

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

  const applyOptimizer = (opt: DimensioningOption) => {
    const newStorage = { ...system.storage, volume: opt.volume };
    const equips = [...system.equipments];
    const mainEqIdx = equips.findIndex(e => e.type !== 'SOLAR');
    if (mainEqIdx > -1) equips[mainEqIdx] = { ...equips[mainEqIdx], power: opt.power };
    
    updateSystem({ storage: newStorage, equipments: equips, hasStorage: true });
    setShowOptimizer(false);
  };

  const addEquipment = (type: Equipment['type']) => {
    let name = ''; let power: number | undefined = 2;
    let cop: number | undefined;
    let efficiency: number | undefined;

    switch(type) {
      case 'HP': name = 'Bomba de Calor'; cop = 3.5; break;
      case 'SOLAR': name = 'Painel Solar'; power = undefined; break;
      case 'BOILER': name = 'Caldeira'; power = 24; efficiency = 0.85; break;
      case 'HEATER': name = 'Esquentador'; power = 11; efficiency = 0.85; break;
      case 'ELECTRIC_TANK': name = 'Termoacumulador Elétrico'; power = 1.5; efficiency = 0.98; break;
    }
    const newEq: Equipment = { type, name, power, cop, efficiency, area: type === 'SOLAR' ? 4 : undefined, opticalEfficiency: type === 'SOLAR' ? 0.75 : undefined };
    updateSystem({ equipments: [...system.equipments, newEq] });
  };

  const removeEquipment = (index: number) => {
    updateSystem({ equipments: system.equipments.filter((_, i) => i !== index) });
  };

  const suggestSolarArea = () => {
    const dailyVol = project.activities.reduce((acc, a) => acc + a.volume, 0);
    const suggestedArea = Math.ceil(dailyVol / 75); 
    const solarIdx = system.equipments.findIndex(e => e.type === 'SOLAR');
    if (solarIdx > -1) {
      updateEquipment(solarIdx, { area: suggestedArea });
    } else {
      const newSolar: Equipment = { type: 'SOLAR', name: 'Sugerido: Painéis Solares', area: suggestedArea, opticalEfficiency: 0.75 };
      updateSystem({ equipments: [...system.equipments, newSolar] });
    }
    alert(`Área sugerida de ${suggestedArea}m² calculada para um consumo de ${dailyVol}L/dia.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      {/* Simulation Required Alert */}
      {isDirty && (
        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-[30px] flex items-center justify-between shadow-sm animate-pulse">
           <div className="flex items-center gap-4">
              <AlertTriangle size={24} className="text-orange-600"/>
              <div>
                 <h4 className="font-black text-slate-800 uppercase tracking-tight">Alteração Pendente</h4>
                 <p className="text-sm font-medium text-slate-500">Ajuste os componentes abaixo e re-simule para atualizar os resultados técnicos.</p>
              </div>
           </div>
           <button onClick={onRunSimulation} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-orange-500">RE-SIMULAR AGORA</button>
        </div>
      )}

      {/* Header with Smart Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            {systemType === 'existing' ? 'Sist. Base (Baseline)' : 'Sist. de Eficiência'}
          </h2>
          <p className="text-slate-500 font-medium">Dimensionamento Dinâmico e Modelação de Solução.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {systemType === 'proposed' && (
            <button 
              onClick={() => setShowOptimizer(true)} 
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-orange-400 rounded-xl text-sm font-black shadow-lg hover:bg-slate-800 transition-all border border-orange-400/20"
            >
              <Cpu size={18}/> OTIMIZADOR INTELIGENTE
            </button>
          )}
          <button onClick={() => { if(results.length === 0 && onRunSimulation) onRunSimulation(); setShowPID(true); }} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50"><Maximize2 size={18} className="text-orange-500"/> P&ID DINÂMICO</button>
          <button onClick={onRunSimulation} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-500 transition-all"><Play size={18} fill="currentColor"/> EXECUTAR</button>
        </div>
      </div>

      {/* Technical KPIs Dashboard */}
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
         <div className={`p-6 rounded-3xl border shadow-sm transition-all ${technicalKPIs.failureHours > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 ${technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <Clock size={14}/> {technicalKPIs.failureHours > 0 ? 'Horas < Setpoint' : 'Conforto Garantido'}
            </div>
            <div className={`text-2xl font-black ${technicalKPIs.failureHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {technicalKPIs.failureHours} <span className="text-sm font-bold opacity-60">h/ano</span>
            </div>
         </div>
      </div>

      {/* Optimizer Modal */}
      {showOptimizer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Cpu size={24}/></div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Otimizador de Dimensionamento</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sugerindo a melhor configuração com garantia de 100% conforto</p>
                  </div>
               </div>
               <button onClick={() => setShowOptimizer(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
              {dimensioningOptions.map((opt) => (
                <div key={opt.id} className="flex flex-col border border-slate-200 rounded-[40px] p-8 hover:border-orange-500 hover:shadow-2xl transition-all group relative bg-slate-50/50 cursor-default">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <opt.icon size={28} />
                  </div>
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4 leading-tight">{opt.title}</h4>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Acumulação</span>
                      <span className="text-xl font-black text-slate-900">{opt.volume} L</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Potência Necessária</span>
                      <span className="text-xl font-black text-slate-900">{opt.power} kW</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-8">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={12}/> Benefícios do Cenário:</p>
                    {opt.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-medium text-slate-600 leading-tight">{b}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => applyOptimizer(opt)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    APLICAR AO PROJETO <ArrowRight size={14}/>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-8 bg-orange-50 border-t border-orange-100 flex items-center gap-4 text-orange-700 font-medium text-xs italic">
              <Info size={16} className="shrink-0"/>
              <p>Nota: Todos os cenários calculados garantem que em nenhuma das 8760 horas do ano a temperatura de saída será inferior ao setpoint de projeto de {technicalKPIs.designSetpoint}ºC.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 space-y-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl"><TextQuote size={28}/></div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome da Solução</label>
                <input type="text" value={system.name} onChange={(e) => updateSystem({ name: e.target.value })} className="text-2xl font-black text-slate-800 bg-transparent outline-none focus:text-orange-600 w-full" />
              </div>
            </div>
            <textarea value={system.description || ''} onChange={(e) => updateSystem({ description: e.target.value })} rows={3} className="w-full bg-slate-50 p-6 rounded-3xl font-medium text-slate-600 leading-relaxed italic border border-transparent focus:border-orange-200 outline-none transition-all resize-none shadow-inner" placeholder="Descrição técnica e fundamentação da proposta..." />
          </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white flex flex-col justify-center">
           <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-6">Resumo Operacional</h3>
           <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-[10px] font-bold text-slate-400 uppercase">Capacidade</span><span className="text-xl font-black">{system.hasStorage !== false ? `${system.storage.volume} L` : 'Instantâneo'}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-[10px] font-bold text-slate-400 uppercase">Potência Total</span><span className="text-xl font-black">{system.equipments.filter(e => e.type !== 'SOLAR').reduce((acc, e) => acc + (e.power || 0), 0).toFixed(1)} kW</span></div>
           </div>
        </div>
      </div>

      {/* Equipment Selection and Storage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2"><Database size={16} className="text-blue-500"/> Acumulação</h3></div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Modo Depósito</label>
              <button 
                onClick={() => updateSystem({ hasStorage: system.hasStorage === false })} 
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${system.hasStorage !== false ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  {system.hasStorage !== false ? <PackageCheck size={20}/> : <PackageX size={20}/>}
                  <span className="text-xs font-black uppercase tracking-tight">{system.hasStorage !== false ? 'Ativo' : 'Desativado'}</span>
                </div>
                {system.hasStorage !== false ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
            </div>
            <div className={system.hasStorage === false ? 'opacity-30 pointer-events-none grayscale' : ''}>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Volume Útil (Litros)</label>
              <input type="number" value={system.storage.volume} onChange={(e) => updateSystem({ storage: { ...system.storage, volume: parseInt(e.target.value) || 0 }})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Válvula Misturadora</label>
              <button onClick={() => updateSystem({ hasMixingValve: !system.hasMixingValve })} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${system.hasMixingValve ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}><span className="text-xs font-black uppercase tracking-tight">{system.hasMixingValve ? 'Instalada' : 'Não Prevista'}</span>{system.hasMixingValve ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4"><h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Produção e Apoio</h3><div className="flex gap-2">{['HP', 'BOILER', 'SOLAR', 'ELECTRIC_TANK'].map(type => (<button key={type} onClick={() => addEquipment(type as any)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] hover:bg-slate-200 uppercase tracking-tight">{type}</button>))}</div></div>
          {system.equipments.map((eq, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-start gap-6 transition-all hover:shadow-md border-l-8" style={{ borderLeftColor: eq.type === 'SOLAR' ? '#f59e0b' : (eq.type === 'HP' ? '#3b82f6' : '#ef4444') }}>
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-600">
                {eq.type === 'SOLAR' ? <Sun size={28}/> : (eq.type === 'HP' ? <ZapIcon size={28}/> : <Flame size={28}/>)}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center"><input className="text-lg font-black text-slate-900 bg-transparent outline-none focus:text-orange-600 w-full uppercase" value={eq.name} onChange={(e) => updateEquipment(i, { name: e.target.value })} /><button onClick={() => removeEquipment(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {eq.type !== 'SOLAR' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Potência (kW)</label>
                      <input type="number" step="0.1" value={eq.power} onChange={(e) => updateEquipment(i, { power: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none" />
                    </div>
                  )}
                  {eq.type === 'HP' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">COP Sazonal <Info size={10} title="Coeficiente de Performance médio anual"/></label>
                      <input type="number" step="0.1" value={eq.cop} onChange={(e) => updateEquipment(i, { cop: parseFloat(e.target.value) || 1.0 })} className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 font-black text-blue-700 outline-none" />
                    </div>
                  )}
                  {(eq.type === 'BOILER' || eq.type === 'HEATER' || eq.type === 'ELECTRIC_TANK') && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Eficiência (%)</label>
                      <div className="relative">
                        <input type="number" step="1" value={(eq.efficiency || 0) * 100} onChange={(e) => updateEquipment(i, { efficiency: (parseFloat(e.target.value) || 0) / 100 })} className="w-full bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-black text-red-700 outline-none" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-300">%</span>
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
                        <input type="number" step="0.01" value={eq.opticalEfficiency} onChange={(e) => updateEquipment(i, { opticalEfficiency: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-lg px-3 py-2 font-black text-slate-800 outline-none" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solar Intelligence Banner */}
      {systemType === 'proposed' && (
        <div className="bg-orange-600 p-10 rounded-[45px] text-white shadow-xl relative overflow-hidden flex items-center justify-between group">
           <div className="relative z-10 space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><Lightbulb className="animate-pulse" /> Assistente Solar</h3>
              <p className="text-sm opacity-80 italic font-medium">Cálculo de cobertura solar térmica baseado em insolação anual.</p>
           </div>
           <button onClick={suggestSolarArea} className="relative z-10 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-2xl hover:bg-orange-50 transition-all transform group-hover:scale-105 active:scale-95">Sugerir Campo Solar</button>
           <Sun className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 rotate-12" />
        </div>
      )}

      {/* Results and Performance Charts */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-10">
          <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Análise de Conforto e Caudal</h3>
                <div className="flex gap-4 text-[10px] font-black uppercase">
                   <span className="flex items-center gap-1 text-blue-600"><div className="w-3 h-3 bg-blue-600 rounded"></div> Caudal (L/h)</span>
                   <span className="flex items-center gap-1 text-red-600"><div className="w-3 h-1 bg-red-600 rounded"></div> Temp. Sistema (ºC)</span>
                </div>
             </div>
             <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyResults}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="hourLabel" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" axisLine={false} tickLine={false} domain={[15, 85]} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                    <Bar yAxisId="left" dataKey="demand_L" name="Procura (L/h)" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="temp_tank" name="Temperatura (ºC)" stroke="#ef4444" strokeWidth={4} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-24 rounded-[50px] border-2 border-dashed border-slate-200 text-center space-y-6">
           <Play size={64} className="mx-auto text-slate-300 animate-pulse" />
           <p className="text-slate-800 font-black uppercase text-lg">Execute a simulação horária para visualizar a performance técnica</p>
        </div>
      )}

      {/* PID Modal */}
      {showPID && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Esquema P&ID Dinâmico</h3>
               <button onClick={() => setShowPID(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8 flex-1 overflow-y-auto">
               <PIDDiagram system={system} simState={results[simHour]} hourOfDay={simHour} />
               <div className="bg-slate-900 p-8 rounded-[35px] text-white flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">{isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor" className="ml-1"/>}</button>
                    <div><p className="text-[10px] font-black uppercase text-orange-400">Hora do Perfil</p><p className="text-3xl font-black tabular-nums">{simHour.toString().padStart(2, '0')}:00</p></div>
                  </div>
                  <input type="range" min="0" max="23" value={simHour} onChange={(e) => setSimHour(parseInt(e.target.value))} className="w-64 accent-orange-500" />
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Parecer Consolidado do Sistema</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">A análise revela que o sistema atual possui {technicalKPIs.failureHours} horas de desconforto anuais. A proposta de melhoria visa anular este valor através da otimização do depósito de {system.storage.volume} L em conjunto com a potência instalada de {system.equipments.filter(e=>e.type!=='SOLAR').reduce((acc,e)=>acc+(e.power||0),0).toFixed(1)} kW.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemPage;
