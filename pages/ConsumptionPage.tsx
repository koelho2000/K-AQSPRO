
import React, { useMemo, useState, useRef } from 'react';
import { Project, Activity } from '../types';
import { OCCUPANCY_PROFILES } from '../constants';
import { Plus, Trash2, Clock, BarChart3, Ban, Info, Calculator, X, Calendar, Zap, Flame, Sigma, Thermometer, Droplets, FileSpreadsheet, Download, Printer, Copy, Layout, Activity as ActivityIcon, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';

interface ConsumptionPageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CP_WATER = 1.163; 
const T_COLD = 15; 

const CONSUMPTION_EXPORT_STYLES = `
  <style>
    body { font-family: sans-serif; color: #1e293b; padding: 40px; }
    .header { border-bottom: 5px solid #f97316; margin-bottom: 30px; padding-bottom: 20px; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 20px; text-align: center; }
    .metric-val { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 5px; }
    .consolidated-box { background: #0f172a; color: white; padding: 40px; border-radius: 40px; border-left: 12px solid #f97316; margin: 40px 0; }
    .activity-card { border: 1px solid #e2e8f0; border-radius: 25px; padding: 25px; margin-bottom: 15px; }
    .text-orange { color: #f97316; }
  </style>
`;

const ConsumptionPage: React.FC<ConsumptionPageProps> = ({ project, setProject }) => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcProfile, setCalcProfile] = useState(OCCUPANCY_PROFILES[0]);
  const [calcQuantity, setCalcQuantity] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const addActivity = (custom?: Partial<Activity>) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      name: custom?.name || 'Nova Atividade',
      volume: custom?.volume || 50,
      tempRequired: custom?.tempRequired || 40,
      hours: custom?.hours || [8, 9],
      activeDays: custom?.activeDays || [1, 2, 3, 4, 5]
    };
    setProject(prev => ({ ...prev, activities: [...prev.activities, newAct] }));
  };

  const removeActivity = (id: string) => {
    setProject(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  };

  const updateActivity = (id: string, field: string, value: any) => {
    setProject(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const toggleDay = (actId: string, day: number) => {
    const act = project.activities.find(a => a.id === actId);
    if (!act) return;
    const currentDays = act.activeDays || [];
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    updateActivity(actId, 'activeDays', newDays);
  };

  const toggleHour = (actId: string, hour: number) => {
    const act = project.activities.find(a => a.id === actId);
    if (!act) return;
    const currentHours = act.hours || [];
    const newHours = currentHours.includes(hour)
      ? currentHours.filter(h => h !== hour)
      : [...currentHours, hour].sort((a, b) => a - b);
    updateActivity(actId, 'hours', newHours);
  };

  const handleCalculate = () => {
    const totalVolume = calcProfile.value * calcQuantity;
    addActivity({
      name: `${calcProfile.label} (${calcQuantity} ${calcProfile.unit})`,
      volume: totalVolume,
      tempRequired: 45,
      hours: [7, 8, 12, 13, 19, 20],
      activeDays: [1, 2, 3, 4, 5]
    });
    setIsCalcOpen(false);
  };

  const dailyProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, volume: 0 }));
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        hours[h].volume += act.volume / (act.hours.length || 1);
      });
    });
    return hours;
  }, [project.activities]);

  const weeklyProfile = useMemo(() => {
    return DAYS.map((name, dayIndex) => {
      let totalLiters = 0;
      project.activities.forEach(act => {
        if ((act.activeDays || []).includes(dayIndex)) {
          totalLiters += act.volume;
        }
      });
      return { name, volume: totalLiters };
    });
  }, [project.activities]);

  const consolidatedStats = useMemo(() => {
    let totalVol = 0;
    let weightedTempSum = 0;
    project.activities.forEach(act => {
      totalVol += act.volume;
      weightedTempSum += (act.volume * act.tempRequired);
    });
    const avgTemp = totalVol > 0 ? weightedTempSum / totalVol : 0;
    return { totalVol, avgTemp };
  }, [project.activities]);

  const metrics = useMemo(() => {
    let totalWeeklykWh = 0;
    let maxHourlykWh = 0;
    let peakLiters = 0;
    let peakTemp = 0;
    DAYS.forEach((_, dayIndex) => {
      project.activities.forEach(act => {
        if ((act.activeDays || []).includes(dayIndex)) {
          const deltaT = Math.max(0, act.tempRequired - T_COLD);
          totalWeeklykWh += (act.volume * CP_WATER * deltaT) / 1000;
        }
      });
    });
    const hourlyLiters = Array.from({ length: 24 }, () => 0);
    const hourlyWeightedTemp = Array.from({ length: 24 }, () => 0);
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        const hVol = act.volume / (act.hours.length || 1);
        hourlyLiters[h] += hVol;
        hourlyWeightedTemp[h] += hVol * act.tempRequired;
      });
    });
    hourlyLiters.forEach((vol, h) => {
      if (vol > 0) {
        const avgTemp = hourlyWeightedTemp[h] / vol;
        const deltaT = Math.max(0, avgTemp - T_COLD);
        const powerkW = (vol * CP_WATER * deltaT) / 1000;
        if (powerkW > maxHourlykWh) { maxHourlykWh = powerkW; peakLiters = vol; peakTemp = avgTemp; }
      }
    });
    return { daykWh: totalWeeklykWh / 7, weekkWh: totalWeeklykWh, yearkWh: totalWeeklykWh * 52.14, peakPowerkW: maxHourlykWh, peakLiters, peakTemp };
  }, [project.activities]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24 print:p-0">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Calendar className="text-orange-500" /> Perfil de Consumo e Demanda
          </h2>
          <p className="text-slate-500 font-medium">Dimensionamento de carga térmica e volumetria de alta fidelidade.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsCalcOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-orange-500 transition-all active:scale-95"><Calculator size={16}/> ESTIMAR POR OCUPAÇÃO</button>
          <button onClick={() => addActivity()} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all active:scale-95"><Plus size={16}/> ADICIONAR CONSUMIDOR</button>
        </div>
      </div>

      <div ref={contentRef} className="space-y-10">
        {/* Statistics Grid */}
        <div className="metric-grid grid grid-cols-4 gap-6" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)'}}>
          <div className="metric-card bg-slate-50 p-6 rounded-[30px] border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nec. Térmica Dia</p>
            <p className="metric-val text-2xl font-black">{metrics.daykWh.toFixed(1)} kWh</p>
          </div>
          <div className="metric-card bg-slate-50 p-6 rounded-[30px] border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nec. Térmica Semana</p>
            <p className="metric-val text-2xl font-black">{metrics.weekkWh.toFixed(0)} kWh</p>
          </div>
          <div className="metric-card bg-slate-900 p-6 rounded-[30px] text-white">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Nec. Térmica Anual</p>
            <p className="metric-val text-white text-2xl font-black">{metrics.yearkWh.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} kWh</p>
          </div>
          <div className="metric-card bg-white p-6 rounded-[30px] border-2 border-orange-500">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Potência de Pico</p>
            <p className="metric-val text-2xl font-black">{metrics.peakPowerkW.toFixed(1)} kWt</p>
          </div>
        </div>

        {/* Consolidated summary box */}
        {project.activities.length > 0 && (
          <div className="consolidated-box bg-slate-900 text-white p-12 rounded-[50px] border-l-[12px] border-orange-500 flex justify-between items-center shadow-xl">
             <div>
                <h4 className="text-3xl font-black uppercase tracking-tighter">Perfil Total Consolidado</h4>
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-2">Soma Integrada de todos os consumidores</p>
             </div>
             <div className="text-right">
                <p className="text-5xl font-black">{consolidatedStats.totalVol.toLocaleString('pt-PT')} <span className="text-xl opacity-50 font-medium">L/dia</span></p>
                <p className="text-orange-500 font-bold text-lg mt-1">{consolidatedStats.avgTemp.toFixed(1)} ºC (Temp. Média Necessária)</p>
             </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-8" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-96">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-widest">Caudal Horário Consolidado (L/h)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProfile}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-96">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-widest">Variação Semanal Estimada (L/dia)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProfile}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Restore Activity Elements (The consumers) */}
        <div className="space-y-6 pt-10">
          <div className="flex justify-between items-center no-print">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detalhamento de Consumidores Ativos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.activities.map((act) => (
              <div key={act.id} className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => removeActivity(act.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                    <ActivityIcon size={24}/>
                  </div>
                  <input 
                    className="text-xl font-black text-slate-800 bg-transparent outline-none focus:text-orange-500 w-full" 
                    value={act.name} 
                    onChange={(e) => updateActivity(act.id, 'name', e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Volume (L/dia)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={act.volume} 
                        onChange={(e) => updateActivity(act.id, 'volume', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 px-4 py-3 rounded-xl font-black text-slate-800 border border-transparent focus:border-blue-500 outline-none" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">L</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Temp. Saída (ºC)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={act.tempRequired} 
                        onChange={(e) => updateActivity(act.id, 'tempRequired', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 px-4 py-3 rounded-xl font-black text-slate-800 border border-transparent focus:border-orange-500 outline-none" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ºC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Agenda de Funcionamento (Horas)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({length: 24}).map((_, h) => (
                      <button 
                        key={h}
                        onClick={() => toggleHour(act.id, h)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                          act.hours.includes(h) ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Dias de Atividade</label>
                  <div className="flex justify-between bg-slate-50 p-1.5 rounded-2xl">
                    {DAYS.map((d, i) => (
                      <button 
                        key={d}
                        onClick={() => toggleDay(act.id, i)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                          act.activeDays.includes(i) ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {isCalcOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                 <Calculator className="text-orange-500" /> Estimativa de Ocupação
               </h3>
               <button onClick={() => setIsCalcOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Tipo de Utilização</label>
                 <select 
                   value={calcProfile.label}
                   onChange={(e) => setCalcProfile(OCCUPANCY_PROFILES.find(p => p.label === e.target.value) || OCCUPANCY_PROFILES[0])}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 outline-none ring-2 ring-transparent focus:ring-orange-500 transition-all"
                 >
                   {OCCUPANCY_PROFILES.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Quantidade ({calcProfile.unit})</label>
                 <input 
                   type="number" 
                   value={calcQuantity}
                   onChange={(e) => setCalcQuantity(parseInt(e.target.value) || 0)}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-slate-800 outline-none ring-2 ring-transparent focus:ring-orange-500 transition-all"
                 />
               </div>
               <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex justify-between items-center">
                  <div className="text-orange-700">
                    <p className="text-[10px] font-black uppercase">Consumo Estimado</p>
                    <p className="text-3xl font-black">{(calcProfile.value * calcQuantity).toLocaleString('pt-PT')} L/dia</p>
                  </div>
                  <Droplets className="text-orange-200" size={40} />
               </div>
               <button 
                 onClick={handleCalculate}
                 className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-sm uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                 Adicionar ao Projeto <CheckCircle2 size={18} />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionPage;
