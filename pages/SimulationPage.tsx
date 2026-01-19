
import React, { useMemo, useState } from 'react';
import { HourlySimResult } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { aggregateResults } from '../services/simulationEngine';
import { TrendingUp, Battery, CreditCard, Droplets, Play, CalendarDays, Thermometer, LayoutGrid, Info, Zap, Flame, Sun, FileSpreadsheet } from 'lucide-react';

interface SimulationPageProps {
  title: string;
  results: HourlySimResult[];
  onRunSimulation: () => void;
}

const SimulationPage: React.FC<SimulationPageProps> = ({ title, results, onRunSimulation }) => {
  const [activeTab, setActiveTab] = useState<'annual' | 'typical-day' | 'typical-week'>('annual');
  const annual = useMemo(() => aggregateResults(results), [results]);

  const monthlyData = useMemo(() => {
    if (results.length === 0) return [];
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      demand: 0, cost: 0, solar: 0, elec: 0, gas: 0
    }));
    results.forEach((r, i) => {
      const m = Math.floor(i / (8760/12));
      const monthIdx = Math.min(m, 11);
      if (months[monthIdx]) {
        months[monthIdx].demand += r.demand_kWh;
        months[monthIdx].cost += r.cost;
        months[monthIdx].solar += r.solar_gain_kWh;
        months[monthIdx].elec += r.consumed_elec_kWh;
        months[monthIdx].gas += r.consumed_gas_kWh;
      }
    });
    return months;
  }, [results]);

  const typicalDayData = useMemo(() => {
    if (results.length === 0) return [];
    return results.slice(500, 524).map(r => ({
      hour: r.hour % 24,
      temp: r.temp_tank,
      demand: r.demand_kWh,
      solar: r.solar_gain_kWh
    }));
  }, [results]);

  const typicalWeekData = useMemo(() => {
    if (results.length === 0) return [];
    // Slice a week (168 hours) starting from Monday in typical month
    return results.slice(1000, 1000 + 168).map((r, i) => ({
      hourIdx: i,
      day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][r.dayOfWeek],
      temp: r.temp_tank,
      demand: r.demand_kWh,
      solar: r.solar_gain_kWh
    }));
  }, [results]);

  const export8760CSV = () => {
    if (results.length === 0) return;
    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(','),
      ...results.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8760h_${title.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  if (results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><TrendingUp size={40}/></div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-slate-800">Simulação não executada</p>
          <button onClick={onRunSimulation} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-xl flex items-center gap-2 mt-4"><Play size={18} fill="currentColor"/> EXECUTAR AGORA</button>
        </div>
      </div>
    );
  }

  const totalConsumption = annual.elec_kWh + annual.gas_kWh;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{title}</h2>
          <p className="text-slate-500 font-medium">Análise de balanço térmico e custos horários (8760h).</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={export8760CSV} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"><FileSpreadsheet size={16} className="text-green-600"/> EXPORTAR 8760H (CSV)</button>
          <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner">
            {['annual', 'typical-day', 'typical-week'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab === 'annual' ? 'Anual' : tab === 'typical-day' ? 'Dia Típico' : 'Semana Típica'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-blue-500 mb-2 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center"><Droplets size={20}/></div>
          <div className="text-2xl font-black text-slate-800">{annual.demand_kWh.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} <span className="text-xs font-bold text-slate-400">kWh/ano</span></div>
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Demanda Térmica</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-500 border-b-4 ring-2 ring-orange-50">
          <div className="text-orange-500 mb-2 bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center"><Zap size={20}/></div>
          <div className="text-2xl font-black text-slate-800">{totalConsumption.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} <span className="text-xs font-bold text-slate-400">kWh/ano</span></div>
          <div className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">Consumo Energético Total</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex gap-2 mb-2">
            <div className="text-yellow-500 bg-yellow-50 w-8 h-8 rounded-lg flex items-center justify-center"><Sun size={14}/></div>
            <div className="text-slate-400 bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center"><Flame size={14}/></div>
          </div>
          <div className="text-lg font-black text-slate-800">
            {annual.elec_kWh.toFixed(0)} <span className="text-[10px] text-slate-400 uppercase">Elec</span> | {annual.gas_kWh.toFixed(0)} <span className="text-[10px] text-slate-400 uppercase">Gás</span>
          </div>
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Consumo por Vetor</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
          <div className="text-green-400 mb-2 bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center"><CreditCard size={20}/></div>
          <div className="text-2xl font-black text-white">{annual.cost.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Custo Operacional (OPEX)</div>
        </div>
      </div>

      {activeTab === 'annual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8">Evolução Mensal de Custos (€)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="cost" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8">Demanda vs Solar (kWh)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="demand" name="Demanda" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={3} />
                <Area type="monotone" dataKey="solar" name="Solar" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'typical-day' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8">Temperatura Depósito (Dia Inverno)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={typicalDayData}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis domain={[10, 85]} unit="ºC" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8">Fluxos Energia Horários (kWh)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typicalDayData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="demand" name="Demanda" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solar" name="Solar" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'typical-week' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[550px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <LayoutGrid size={18} className="text-orange-500"/> Comportamento Semanal (168h)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={typicalWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hourIdx" axisLine={false} tickLine={false} tickFormatter={(v) => v % 24 === 0 ? `Dia ${Math.floor(v/24)+1}` : ''} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis yAxisId="temp" domain={[10, 80]} hide />
              <YAxis yAxisId="energy" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Tooltip 
                labelFormatter={(v) => `Hora ${v} | ${typicalWeekData[v]?.day}`} 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Area yAxisId="energy" name="Demanda" dataKey="demand" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              <Area yAxisId="energy" name="Solar" dataKey="solar" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
              <Area yAxisId="temp" name="Temp Depósito" dataKey="temp" stroke="#ef4444" fill="none" strokeWidth={3} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Technical Footer */}
      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Análise Técnica da Simulação ({title})</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
            {title.includes('Baseline') ? (
              `O sistema atual apresenta um consumo total de ${totalConsumption.toFixed(0)} kWh para suprir uma carga térmica de ${annual.demand_kWh.toFixed(0)} kWh. A eficiência sazonal observada reflete as perdas por acumulação e o rendimento degradado do equipamento existente. Observa-se que nos meses de inverno a demanda atinge o seu expoente máximo, testando a capacidade de recuperação térmica do sistema.`
            ) : (
              `A solução proposta reduz o consumo total para ${totalConsumption.toFixed(0)} kWh, beneficiando do aporte solar de ${annual.solar_kWh.toFixed(0)} kWh. A utilização de tecnologia de alto rendimento permite uma cobertura otimizada da curva de demanda, mantendo o depósito em níveis estáveis de conforto com uma redução drástica dos custos operacionais anuais.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
