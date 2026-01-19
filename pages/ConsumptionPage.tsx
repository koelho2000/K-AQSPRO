
import React, { useMemo, useState, useRef } from 'react';
import { Project, Activity } from '../types';
import { OCCUPANCY_PROFILES } from '../constants';
import { Plus, Trash2, Clock, BarChart3, Ban, Info, Calculator, X, Calendar, Zap, Flame, Sigma, Thermometer, Droplets, FileSpreadsheet, Download, Printer, Copy, Layout, Activity as ActivityIcon } from 'lucide-react';
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
      hours: custom?.hours || [8],
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

  const handleCalculate = () => {
    const totalVolume = calcProfile.value * calcQuantity;
    addActivity({
      name: `${calcProfile.label} (${calcQuantity} ${calcProfile.unit})`,
      volume: totalVolume,
      tempRequired: 45,
      hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      activeDays: [1, 2, 3, 4, 5]
    });
    setIsCalcOpen(false);
  };

  const export8760CSV = () => {
    const data = [];
    for (let h = 0; h < 8760; h++) {
      const dayOfYear = Math.floor(h / 24);
      const hourOfDay = h % 24;
      const dayOfWeek = dayOfYear % 7;
      let hourlyDemand_L = 0;
      project.activities.forEach(act => {
        if (act.activeDays?.includes(dayOfWeek) && act.hours.includes(hourOfDay)) {
          hourlyDemand_L += act.volume / (act.hours.length || 1);
        }
      });
      data.push({
        Hora_Anual: h,
        Dia_Semana: DAYS[dayOfWeek],
        Hora_Dia: hourOfDay,
        Consumo_Litros: hourlyDemand_L.toFixed(2)
      });
    }
    const headers = Object.keys(data[0]);
    const csvContent = [headers.join(','), ...data.map(row => headers.map(h => row[h as keyof typeof row]).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8760h_Consumo_${project.admin.client || 'Projeto'}.csv`;
    link.click();
  };

  const handleExport = (type: 'pdf' | 'html' | 'word') => {
    if (type === 'pdf') {
      window.print();
    } else {
      const htmlContent = contentRef.current?.innerHTML || "";
      const fullHtml = `<html><head><meta charset="utf-8"><style>body { font-family: sans-serif; padding: 40px; } .header { border-bottom: 3px solid #f97316; margin-bottom: 30px; } .card { border: 1px solid #eee; padding: 20px; border-radius: 20px; margin-bottom: 20px; } h1, h2 { color: #f97316; text-transform: uppercase; } .metric { font-size: 24px; font-weight: bold; }</style></head><body><div class="header"><h1>ANÁLISE DE CONSUMO E DEMANDA TÉRMICA</h1><p>Cliente: ${project.admin.client || 'N/A'}</p></div>${htmlContent}</body></html>`;
      const blob = new Blob([fullHtml], { type: type === 'html' ? 'text/html' : 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Analise_Consumo_KAQSPRO_${project.admin.client || 'Projeto'}.${type === 'html' ? 'html' : 'doc'}`;
      link.click();
    }
  };

  const handleCopy = async () => {
    if (!contentRef.current) return;
    try {
      const html = contentRef.current.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      await navigator.clipboard.write(data);
      alert("Análise de consumo copiada com formatação rica!");
    } catch (err) {
      const text = contentRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert("Texto da análise de consumo copiado.");
    }
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
    const allHours = new Set<number>();
    const allDays = new Set<number>();
    project.activities.forEach(act => {
      totalVol += act.volume;
      weightedTempSum += (act.volume * act.tempRequired);
      act.hours.forEach(h => allHours.add(h));
      (act.activeDays || []).forEach(d => allDays.add(d));
    });
    const avgTemp = totalVol > 0 ? weightedTempSum / totalVol : 0;
    return { totalVol, avgTemp, hoursCount: allHours.size, daysCount: allDays.size };
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
          const energykWh = (act.volume * CP_WATER * deltaT) / 1000;
          totalWeeklykWh += energykWh;
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
        if (powerkW > maxHourlykWh) {
          maxHourlykWh = powerkW;
          peakLiters = vol;
          peakTemp = avgTemp;
        }
      }
    });
    return { daykWh: totalWeeklykWh / 7, weekkWh: totalWeeklykWh, yearkWh: totalWeeklykWh * 52.14, peakPowerkW: maxHourlykWh, peakLiters, peakTemp };
  }, [project.activities]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 print:p-0">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Calendar className="text-orange-500" /> Perfil de Consumo e Demanda
          </h2>
          <p className="text-slate-500 font-medium">Dimensionamento de carga térmica e volumetria baseada em ocupação.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200"><Copy size={14}/> COPIAR</button>
          <button onClick={() => handleExport('html')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200"><Layout size={14}/> HTML</button>
          <button onClick={() => handleExport('word')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all border border-blue-100"><Download size={14}/> DOC</button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all shadow-lg active:scale-95"><Printer size={16}/> PDF / IMPRIMIR</button>
          <button onClick={export8760CSV} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"><FileSpreadsheet size={16} className="text-green-600"/> EXPORTAR CSV</button>
          <button onClick={() => setIsCalcOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"><Calculator size={16}/> OCUPAÇÃO</button>
        </div>
      </div>

      {isCalcOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><Calculator className="text-orange-500" size={20}/> Ocupação</h3>
               <button onClick={() => setIsCalcOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Perfil</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700" onChange={(e) => setCalcProfile(OCCUPANCY_PROFILES.find(p => p.label === e.target.value)!)}>
                    {OCCUPANCY_PROFILES.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantidade ({calcProfile.unit}s)</label>
                  <input type="number" value={calcQuantity} onChange={(e) => setCalcQuantity(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700" />
               </div>
               <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Total Calculado</p>
                  <p className="text-4xl font-black text-orange-600">{(calcProfile.value * calcQuantity).toLocaleString('pt-PT')} <span className="text-sm">L/dia</span></p>
               </div>
               <button onClick={handleCalculate} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">ADICIONAR</button>
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap size={14} className="text-yellow-500"/> Nec. Térmica Dia</p>
            <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-slate-800">{metrics.daykWh.toFixed(1)}</span><span className="text-sm font-bold text-slate-400 uppercase">kWh</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap size={14} className="text-orange-500"/> Nec. Térmica Semana</p>
            <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-slate-800">{metrics.weekkWh.toFixed(0)}</span><span className="text-sm font-bold text-slate-400 uppercase">kWh</span></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2 text-white">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1"><Zap size={14} className="text-orange-400"/> Nec. Térmica Anual</p>
            <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-white">{metrics.yearkWh.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</span><span className="text-sm font-bold text-slate-400 uppercase">kWh</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-orange-500 shadow-lg space-y-2 ring-2 ring-orange-100">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1"><Flame size={14} className="text-orange-500"/> Potência de Pico</p>
            <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-slate-800">{metrics.peakPowerkW.toFixed(1)}</span><span className="text-sm font-bold text-slate-400 uppercase">kWt</span></div>
            <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
               <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><Droplets size={10} className="text-blue-500"/> Caudal</span>
                  <span className="text-slate-900">{metrics.peakLiters.toFixed(0)} L/h</span>
               </div>
               <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><Thermometer size={10} className="text-orange-500"/> Setpoint</span>
                  <span className="text-slate-900">{metrics.peakTemp.toFixed(1)} ºC</span>
               </div>
            </div>
          </div>
        </div>

        {project.activities.length > 0 && (
          <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-l-[12px] border-orange-500 space-y-8 animate-in slide-in-from-left-4 duration-700">
             <div className="flex items-start justify-between">
                <div>
                   <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Perfil Total Consolidado</h4>
                   <p className="text-orange-400/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Soma Integrada de todas as Atividades</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Diário</p>
                      <p className="text-3xl font-black text-white">{consolidatedStats.totalVol.toLocaleString('pt-PT')} <span className="text-sm font-medium opacity-50">L</span></p>
                   </div>
                   <div className="w-px h-12 bg-white/10"></div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Temp. Média Ponderada</p>
                      <p className="text-3xl font-black text-orange-500">{consolidatedStats.avgTemp.toFixed(1)} <span className="text-sm font-medium opacity-50">ºC</span></p>
                   </div>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
              <ActivityIcon size={18} className="text-blue-500" /> Perfil de Caudal Horário (L/h)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProfile}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} unit="L" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" /> Variação Semanal (L/dia)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProfile}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} unit="L" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center no-print">
            <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter flex items-center gap-2">
               <Sigma className="text-orange-500"/> Atividades e Cronogramas
            </h3>
            <button onClick={() => addActivity()} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-black text-xs hover:bg-orange-500 transition-all shadow-md"><Plus size={16}/> NOVA ATIVIDADE</button>
          </div>

          <div className="space-y-6">
            {project.activities.map(act => (
              <div key={act.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 group transition-all hover:shadow-md print:border-none print:shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 no-print">Atividade</label>
                    <input type="text" value={act.name} onChange={(e) => updateActivity(act.id, 'name', e.target.value)} className="w-full text-lg font-black text-slate-800 bg-transparent border-b-2 border-slate-100 focus:border-orange-500 outline-none transition-all print:border-none" />
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">L/dia</label>
                      <input type="number" value={act.volume} onChange={(e) => updateActivity(act.id, 'volume', parseInt(e.target.value) || 0)} className="w-24 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-black text-slate-800 outline-none print:bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Temp (ºC)</label>
                      <input type="number" value={act.tempRequired} onChange={(e) => updateActivity(act.id, 'tempRequired', parseInt(e.target.value) || 0)} className="w-24 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-black text-slate-800 outline-none print:bg-transparent" />
                    </div>
                    <button onClick={() => removeActivity(act.id)} className="mt-7 p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 no-print"><Trash2 size={20}/></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock size={14}/> Horário</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: 24 }).map((_, h) => (
                        <button key={h} onClick={() => {
                          const newHours = act.hours.includes(h) ? act.hours.filter(hour => hour !== h) : [...act.hours, h].sort((a,b) => a-b);
                          updateActivity(act.id, 'hours', newHours);
                        }} className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${act.hours.includes(h) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}>{h}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Ban size={14}/> Dias Semana</label>
                    <div className="flex gap-1.5">
                      {DAYS.map((name, i) => (
                        <button key={name} onClick={() => toggleDay(act.id, i)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${act.activeDays.includes(i) ? 'bg-slate-800 text-white shadow-md' : 'bg-red-50 text-red-300 border-2 border-dashed border-red-100'}`}>{name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8 no-print">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Parecer Técnico</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
            O Perfil Consolidado ({consolidatedStats.totalVol.toLocaleString('pt-PT')} L/dia a {consolidatedStats.avgTemp.toFixed(1)}ºC) exige um pico térmico de {metrics.peakPowerkW.toFixed(2)} kW ({metrics.peakLiters.toFixed(0)} L/h). Use as opções de exportação para gerar relatórios de consumo detalhados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionPage;
