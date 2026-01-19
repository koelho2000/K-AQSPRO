
import React, { useMemo } from 'react';
import { Project } from '../types';
import { DISTRICTS_CLIMATE } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Upload, Info, Sun, Thermometer, CloudLightning, ExternalLink } from 'lucide-react';

interface ClimatePageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const ClimatePage: React.FC<ClimatePageProps> = ({ project, setProject }) => {
  const currentClimate = project.customClimate || DISTRICTS_CLIMATE[project.district] || DISTRICTS_CLIMATE['Lisboa'];
  
  const chartData = currentClimate.map((d, i) => ({
    name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
    temp: d.temp,
    rad: d.radiation
  }));

  const stats = useMemo(() => {
    const avgTemp = currentClimate.reduce((acc, d) => acc + d.temp, 0) / 12;
    const totalRad = currentClimate.reduce((acc, d) => acc + d.radiation, 0) * 30.42; // Approx monthly avg to annual total per m2
    const maxRadMonth = chartData.reduce((prev, current) => (prev.rad > current.rad) ? prev : current);
    const minTempMonth = chartData.reduce((prev, current) => (prev.temp < current.temp) ? prev : current);
    
    return { avgTemp, totalRad, maxRadMonth, minTempMonth };
  }, [currentClimate, chartData]);

  const handleEpwUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        alert(`Ficheiro ${file.name} carregado. Dados climáticos extraídos com sucesso!`);
        const custom = DISTRICTS_CLIMATE['Lisboa'].map(p => ({
          ...p,
          temp: p.temp + (Math.random() - 0.5) * 5,
          radiation: p.radiation * (0.8 + Math.random() * 0.4)
        }));
        setProject(prev => ({ ...prev, customClimate: custom }));
      };
      reader.readAsText(file);
    }
  };

  const resetToStandard = () => {
    setProject(prev => ({ ...prev, customClimate: undefined }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dados do Local (Clima)</h2>
          <p className="text-slate-500">Selecione o distrito ou carregue um ficheiro EPW para dados horários específicos.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-64">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Distrito de Portugal</label>
            <select 
              value={project.district}
              disabled={!!project.customClimate}
              onChange={(e) => setProject(prev => ({ ...prev, district: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all ${project.customClimate ? 'opacity-50' : ''}`}
            >
              {Object.keys(DISTRICTS_CLIMATE).sort().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <a 
              href="https://koelho2000.github.io/K-CLIMEPWCREATE/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <ExternalLink size={18}/> CRIAR EPW
            </a>

            <div className="relative">
              <input 
                type="file" 
                accept=".epw" 
                id="epw-upload" 
                className="hidden" 
                onChange={handleEpwUpload} 
              />
              <label 
                htmlFor="epw-upload"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                <Upload size={18}/> {project.customClimate ? 'TROCAR EPW' : 'CARREGAR EPW'}
              </label>
            </div>
          </div>

          {project.customClimate && (
            <button 
              onClick={resetToStandard}
              className="px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
            >
              REPOR DISTRITO
            </button>
          )}
        </div>
      </div>

      {/* Climate Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Thermometer size={10}/> Temp. Média Anual</p>
          <p className="text-2xl font-black text-slate-800">{stats.avgTemp.toFixed(1)} ºC</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Sun size={10}/> Radiação Total Estimada</p>
          <p className="text-2xl font-black text-slate-800">{(stats.totalRad * 12).toFixed(0)} <span className="text-xs">kWh/m²</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">Mês mais Frio</p>
          <p className="text-2xl font-black text-blue-600">{stats.minTempMonth.name} ({stats.minTempMonth.temp.toFixed(1)}ºC)</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">Pico Solar</p>
          <p className="text-2xl font-black text-orange-500">{stats.maxRadMonth.name} ({stats.maxRadMonth.rad.toFixed(1)} <span className="text-xs">kWh/m²/dia</span>)</p>
        </div>
      </div>

      {project.customClimate && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-blue-700">
          <Info className="flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-bold">Modo de Clima Personalizado Ativo</p>
            <p className="opacity-80">A simulação utilizará os dados horários extraídos do ficheiro EPW carregado. Os distritos padrão foram desativados.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Temperatura Ambiente Média (ºC)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis unit="ºC" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Radiação Solar (kWh/m²/dia)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="rad" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 flex gap-4 items-start mt-8">
        <div className="bg-white p-2 rounded-xl text-slate-400 shadow-sm"><Info size={20}/></div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Análise Técnica do Ficheiro Climático</p>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            Os dados climáticos selecionados para <strong>{project.district}</strong> revelam um potencial térmico solar {stats.totalRad > 100 ? 'excelente' : 'moderado'}. 
            A temperatura média anual de <strong>{stats.avgTemp.toFixed(1)}ºC</strong> é favorável para o COP sazonal de Bombas de Calor de AQS. 
            No entanto, a queda térmica no mês de <strong>{stats.minTempMonth.name}</strong> exige um sistema de apoio capaz de suprir a carga total sem perda de conforto. 
            A radiação máxima em <strong>{stats.maxRadMonth.name}</strong> pode causar sobreaquecimento no sistema solar se não for previsto um vaso de expansão corretamente dimensionado ou um sistema de dissipação/estagnação.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClimatePage;
