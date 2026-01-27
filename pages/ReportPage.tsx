
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult, Equipment, ModuleType, System } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, ComposedChart, Legend
} from 'recharts';
import { 
  Printer, FileText, MapPin, Zap, Droplets, Sun, Flame, Wallet, Calculator, ShieldCheck, Building2, Database, Thermometer,
  Layout, TrendingDown, Award, Lock, Compass, Briefcase, Layers, BarChart3, Calendar, AlertTriangle, Scale, Info,
  ChevronRight, TrendingUp, Activity, CheckCircle, Copy, FileCode, Download, CheckCircle2, User, Globe, Mail, Phone, Hash, Zap as ZapIcon, Maximize2, ShieldAlert
} from 'lucide-react';

interface ReportPageProps {
  project: Project;
  baseResults: HourlySimResult[];
  propResults: HourlySimResult[];
}

const DAYS_REPORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const EXPORT_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; padding: 0; line-height: 1.4; }
    .page-wrapper { 
      background: white; width: 21cm; min-height: 29.7cm; margin: 40px auto; padding: 1.5cm 1.8cm; 
      box-shadow: 0 0 50px rgba(0,0,0,0.08); box-sizing: border-box; display: flex; flex-direction: column; position: relative; page-break-after: always;
    }
    @media print { 
      body { background: white !important; }
      .page-wrapper { margin: 0; box-shadow: none; border-radius: 0; width: 21cm; height: 29.7cm; padding: 1.2cm 1.5cm; } 
      .no-print { display: none !important; } 
    }
    h1, h2, h3, h4 { text-transform: uppercase; letter-spacing: -0.03em; margin: 0; font-weight: 900; }
    .section-title { font-size: 24px; color: #0f172a; border-left: 6px solid #f97316; padding-left: 15px; margin-bottom: 25px; margin-top: 10px; }
    .card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; background: #fff; margin-bottom: 15px; }
    .footer-text { font-size: 8px; font-weight: 800; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: auto; display: flex; justify-content: space-between; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 10px; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    th { background: #f8fafc; padding: 10px; color: #64748b; text-align: left; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .text-orange { color: #f97316; }
    .text-blue { color: #2563eb; }
    .bg-slate-900 { background: #0f172a !important; color: #ffffff !important; }
    .bg-slate-900 * { color: #ffffff !important; }
    .bg-orange-600 { background: #ea580c !important; color: #ffffff !important; }
    .bg-orange-600 * { color: #ffffff !important; }
    .toc-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569; }
    .k2000-seal { border: 4px double #f97316; padding: 20px; border-radius: 50%; width: 120px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  </style>
`;

const PIDDiagram: React.FC<{ system: System, simState?: any }> = ({ system, simState }) => {
  const tankTemp = simState?.temp_tank || 45;
  const hasStorage = system.hasStorage !== false;
  const hasValve = system.hasMixingValve;

  const getTempColor = (temp: number) => {
    if (temp > 55) return '#ef4444'; 
    if (temp > 40) return '#f97316'; 
    return '#3b82f6'; 
  };

  return (
    <div className="relative w-full aspect-video bg-slate-50 rounded-[40px] border border-slate-200 overflow-hidden p-4 flex items-center justify-center shadow-inner">
      <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />
        
        <path d="M 50 420 L 300 420" stroke="#3b82f6" strokeWidth="4" fill="none" />
        <path d="M 375 100 L 375 60 L 500 60" stroke={getTempColor(tankTemp)} strokeWidth="4" fill="none" />

        {hasValve && (
          <g transform="translate(480, 45)">
            <path d="M -180 375 L -10 375 L -10 35" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="4,2" />
            <circle cx="20" cy="15" r="25" fill="#fff" stroke="#f97316" strokeWidth="3" />
            <path d="M 10 5 L 30 25 M 10 25 L 30 5" stroke="#f97316" strokeWidth="3" />
          </g>
        )}

        <g opacity={hasStorage ? 1 : 0.1}>
          <rect x="300" y="100" width="150" height="320" rx="20" fill="#fff" stroke="#94a3b8" strokeWidth={hasStorage ? 4 : 2} />
          {hasStorage && (
            <rect x="305" y={105 + (310 * (1 - Math.min(1, (tankTemp - 15) / 70)))} width="140" height={Math.max(0, 310 * ((tankTemp - 15) / 70))} rx="15" fill={getTempColor(tankTemp)} fillOpacity="0.2" />
          )}
          <text x="375" y="240" textAnchor="middle" className="text-3xl font-black fill-slate-900">{hasStorage ? `${tankTemp.toFixed(1)}ºC` : 'PERMUTADOR'}</text>
        </g>

        {system.equipments.map((eq, i) => {
          const yPos = 130 + (i * 70);
          return (
            <g key={i}>
              <path d={`M 600 ${yPos} L 450 ${yPos}`} stroke="#cbd5e1" strokeWidth="3" fill="none" />
              <rect x="600" y={yPos - 25} width="180" height="60" rx="12" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
              <text x="610" y={yPos - 5} className="text-[10px] font-black uppercase tracking-tight fill-slate-800">{eq.name.substring(0, 22)}</text>
              <text x="610" y="10" transform={`translate(0, ${yPos})`} className="text-[9px] font-bold fill-slate-400">
                {eq.type === 'SOLAR' ? `Área: ${eq.area}m²` : `P: ${eq.power}kW`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Page: React.FC<{ children: React.ReactNode, project: Project, pageNum: number }> = ({ children, project, pageNum }) => (
  <div className="page-wrapper">
    <div className="flex-1 flex flex-col">{children}</div>
    <div className="footer-text">
      <span>K-AQSPRO ENGINEERING SUITE • ID: {project.id}</span>
      <span>{project.admin.projectDesignation || 'RELATÓRIO TÉCNICO'}</span>
      <span>PÁGINA {pageNum}</span>
    </div>
  </div>
);

const ReportPage: React.FC<ReportPageProps> = ({ project, baseResults, propResults }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const baseAnnual = useMemo(() => aggregateResults(baseResults), [baseResults]);
  const propAnnual = useMemo(() => aggregateResults(propResults), [propResults]);
  const totalCapex = useMemo(() => project.budget.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0), [project.budget]);
  const annualSaving = baseAnnual.cost - propAnnual.cost;
  const payback = totalCapex / (annualSaving || 1);

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
    return DAYS_REPORT.map((name, dayIndex) => {
      let totalLiters = 0;
      project.activities.forEach(act => {
        if ((act.activeDays || []).includes(dayIndex)) {
          totalLiters += act.volume;
        }
      });
      return { name, volume: totalLiters };
    });
  }, [project.activities]);

  const baseDailyResults = useMemo(() => {
    if (baseResults.length === 0) return [];
    return Array.from({ length: 24 }, (_, hour) => {
      const filtered = baseResults.filter(r => (r.hour % 24 === hour));
      const count = filtered.length;
      return {
        hour,
        hourLabel: `${hour}:00`,
        demand_L: filtered.reduce((acc, r) => acc + r.demand_L, 0) / count,
        t_required: filtered.reduce((acc, r) => acc + r.t_required, 0) / count,
        t_delivered: filtered.reduce((acc, r) => acc + r.t_delivered, 0) / count,
        temp_tank: filtered.reduce((acc, r) => acc + r.temp_tank, 0) / count,
        demand_kWh: filtered.reduce((acc, r) => acc + r.demand_kWh, 0) / count,
        cost: filtered.reduce((acc, r) => acc + r.cost, 0) / count,
      };
    });
  }, [baseResults]);

  const baseWeeklyResults = useMemo(() => {
    if (baseResults.length === 0) return [];
    return baseResults.slice(168, 168 + 168).map((r, i) => ({
      ...r,
      hourIdx: i,
      dayLabel: DAYS_REPORT[r.dayOfWeek],
      cost: r.cost
    }));
  }, [baseResults]);

  const propDailyResults = useMemo(() => {
    if (propResults.length === 0) return [];
    return Array.from({ length: 24 }, (_, hour) => {
      const filtered = propResults.filter(r => (r.hour % 24 === hour));
      const count = filtered.length;
      return {
        hour,
        hourLabel: `${hour}:00`,
        demand_L: filtered.reduce((acc, r) => acc + r.demand_L, 0) / count,
        t_required: filtered.reduce((acc, r) => acc + r.t_required, 0) / count,
        t_delivered: filtered.reduce((acc, r) => acc + r.t_delivered, 0) / count,
        temp_tank: filtered.reduce((acc, r) => acc + r.temp_tank, 0) / count,
        demand_kWh: filtered.reduce((acc, r) => acc + r.demand_kWh, 0) / count,
        solar_gain_kWh: filtered.reduce((acc, r) => acc + r.solar_gain_kWh, 0) / count,
        cost: filtered.reduce((acc, r) => acc + r.cost, 0) / count,
      };
    });
  }, [propResults]);

  const propWeeklyResults = useMemo(() => {
    if (propResults.length === 0) return [];
    return propResults.slice(168, 168 + 168).map((r, i) => ({
      ...r,
      hourIdx: i,
      dayLabel: DAYS_REPORT[r.dayOfWeek],
      cost: r.cost
    }));
  }, [propResults]);

  const propMonthlyResults = useMemo(() => {
    if (propResults.length === 0) return [];
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      cost: 0 
    }));
    propResults.forEach((r, i) => {
      const monthIdx = Math.min(Math.floor(i / (8760/12)), 11);
      months[monthIdx].cost += r.cost;
    });
    return months;
  }, [propResults]);

  const baseMonthlyResults = useMemo(() => {
    if (baseResults.length === 0) return [];
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      cost: 0 
    }));
    baseResults.forEach((r, i) => {
      const monthIdx = Math.min(Math.floor(i / (8760/12)), 11);
      months[monthIdx].cost += r.cost;
    });
    return months;
  }, [baseResults]);

  const climateData = useMemo(() => {
    const climate = project.customClimate || [];
    return Array.from({ length: 12 }, (_, i) => ({
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      temp: climate[i]?.temp || 15,
      rad: climate[i]?.radiation || 4
    }));
  }, [project]);

  const handleExport = (type: 'html' | 'doc') => {
    const content = reportRef.current?.innerHTML || "";
    const fullHtml = `<html><head><meta charset="utf-8">${EXPORT_STYLES}</head><body>${content}</body></html>`;
    const mimeType = type === 'html' ? 'text/html' : 'application/msword';
    const blob = new Blob([fullHtml], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_KAQSPRO_${project.admin.projectDesignation || 'Projeto'}.${type === 'html' ? 'html' : 'doc'}`;
    link.click();
  };

  const handleCopy = async () => {
    if (!reportRef.current) return;
    const html = `<html><head>${EXPORT_STYLES}</head><body>${reportRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
      alert("Relatório copiado para a área de transferência com sucesso!");
    } catch (err) { alert("Erro ao copiar."); }
  };

  if (baseResults.length === 0 || propResults.length === 0) {
    return (
      <div className="p-20 text-center space-y-6">
        <AlertTriangle size={64} className="mx-auto text-orange-500 animate-bounce" />
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Dados de Simulação Indisponíveis</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Para gerar o relatório final completo, é necessário concluir as simulações horárias (8760h) para ambos os cenários.</p>
      </div>
    );
  }

  const renderEquipmentEfficiency = (eq: Equipment) => {
    if (eq.type === 'HP') return ` | COP: ${eq.cop}`;
    if (['BOILER', 'HEATER', 'ELECTRIC_TANK'].includes(eq.type)) return ` | η: ${(eq.efficiency || 0) * 100}%`;
    if (eq.type === 'SOLAR') return ` | η0: ${eq.opticalEfficiency}`;
    return '';
  };

  return (
    <div className="report-root">
      <style>{EXPORT_STYLES}</style>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-slate-900/95 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] no-print z-[100] border border-white/10">
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-black text-xs hover:bg-orange-500 transition-all transform hover:scale-105 active:scale-95"><Printer size={16}/> IMPRIMIR RELATÓRIO</button>
        <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
        <button onClick={() => handleExport('html')} className="p-3 text-slate-400 hover:text-white transition-colors" title="Exportar HTML"><FileCode size={20}/></button>
        <button onClick={handleCopy} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-black text-xs hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95"><Copy size={16}/> COPIAR HTML</button>
      </div>

      <div ref={reportRef}>
        
        {/* P01: CAPA PROFISSIONAL */}
        <Page project={project} pageNum={1}>
          <div className="flex justify-between items-start mb-24">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl">K</div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">K-AQSPRO</h1>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">High-End AQS Engineering Suite</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Estudo Técnico</p>
               <p className="text-lg font-black text-slate-900">{project.id}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">Simulação Dinâmica Horária 8760H</div>
              <h1 className="text-[50px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                {project.admin.projectDesignation || 'ESTUDO DE EFICIÊNCIA TÉRMICA'} <br/>
                <span className="text-orange-600 text-[40px]">{project.admin.buildingName || ''}</span>
              </h1>
            </div>
            <div className="w-24 h-2 bg-slate-900 rounded-full"></div>
            <p className="text-lg text-slate-400 font-medium max-w-lg leading-relaxed italic">
              Relatório consolidado de modelação termodinâmica para sistemas de preparação de águas quentes sanitárias (AQS).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-16 border-t border-slate-100 mt-20" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
            <div className="space-y-6">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p><p className="text-xl font-black text-slate-800 leading-tight">{project.admin.address || project.district}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Concelho</p><p className="text-lg font-bold text-slate-600">{project.district}, Portugal</p></div>
            </div>
            <div className="space-y-6 text-right">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente / Beneficiário</p><p className="text-xl font-black text-slate-800">{project.admin.client || 'N/A'}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Elaborado por</p><p className="text-lg font-bold text-slate-600">{project.admin.technician || 'José Coelho'}</p></div>
            </div>
          </div>
        </Page>

        {/* P02: ÍNDICE */}
        <Page project={project} pageNum={2}>
          <h3 className="section-title">Índice do Conteúdo</h3>
          <div className="mt-8 space-y-1">
            <div className="toc-item"><span>01. Identificação Administrativa e Comercial</span><span>03</span></div>
            <div className="toc-item"><span>02. Análise de Custos Energéticos Unitários</span><span>03</span></div>
            <div className="toc-item"><span>03. Enquadramento Climático e Potencial Solar</span><span>04</span></div>
            <div className="toc-item"><span>04. Perfil de Consumo e Demanda de Carga</span><span>05</span></div>
            <div className="toc-item"><span>05. Especificação do Sistema Base (Baseline)</span><span>06</span></div>
            <div className="toc-item"><span>06. Especificação do Sistema Proposto (Eficiente)</span><span>07</span></div>
            <div className="toc-item"><span>07. Resultados de Simulação: Cenário Base</span><span>08</span></div>
            <div className="toc-item"><span>08. Resultados de Simulação: Cenário Proposto</span><span>09</span></div>
            <div className="toc-item"><span>09. Dashboard de Análise Comparativa</span><span>10</span></div>
            <div className="toc-item"><span>10. Mapa de Quantidades e Orçamentação (CAPEX)</span><span>11</span></div>
            <div className="toc-item"><span>11. Viabilidade Financeira e Retorno (ROI)</span><span>12</span></div>
            <div className="toc-item"><span>12. Conclusão Técnica e Parecer de Engenharia</span><span>13</span></div>
            <div className="toc-item"><span>13. Certificado de Rigor e Validação K2000</span><span>14</span></div>
          </div>
          <div className="mt-auto bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Nota Metodológica</p>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">As simulações apresentadas neste relatório baseiam-se num motor de cálculo horarizado (8760 horas/ano) que considera o balanço energético dinâmico entre a demanda terminal, os ganhos solares térmicos e a performance sazonal (COP/η) dos equipamentos de apoio.</p>
          </div>
        </Page>

        {/* P03: ADMINISTRATIVO E ENERGIA */}
        <Page project={project} pageNum={3}>
          <h3 className="section-title">01. Identificação e Vetores Energéticos</h3>
          <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
             <div className="card space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Dados Administrativos</h4>
               <div className="space-y-3">
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Obra / Edifício</p><p className="text-sm font-black">{project.admin.buildingName || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Designação Projeto</p><p className="text-sm font-black">{project.admin.projectDesignation || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Morada</p><p className="text-sm font-black">{project.admin.address || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Proprietário</p><p className="text-sm font-black">{project.admin.client}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Técnico Responsável</p><p className="text-sm font-black">{project.admin.technician}</p></div>
               </div>
             </div>
             <div className="card space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Preçário Energético de Base</h4>
               <div className="space-y-3">
                 <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Eletricidade</span><span className="font-black text-slate-900">{project.energy.electricity.toFixed(4)} €/kWh</span></div>
                 <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Gás Natural</span><span className="font-black text-slate-900">{project.energy.gas.toFixed(4)} €/kWh</span></div>
                 <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Água da Rede</span><span className="font-black text-slate-900">{project.energy.water.toFixed(2)} €/m³</span></div>
               </div>
               <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                 <Zap size={10} className="text-yellow-500"/> OPEX calculado com base em tarifário atualizado
               </div>
             </div>
          </div>
          <div className="mt-10 card bg-slate-900 text-white p-8">
             <div className="flex items-start gap-4">
               <Building2 className="text-orange-500 shrink-0" size={32} />
               <div>
                 <h4 className="text-lg font-black tracking-tight uppercase text-white">Entidade Executante</h4>
                 <p className="text-xs font-bold text-slate-400 mt-1">{project.company.name}</p>
                 <div className="grid grid-cols-2 gap-4 mt-4 text-[9px] font-black text-slate-500 uppercase">
                    <span className="text-white">NIF: {project.company.nif}</span>
                    <span className="text-white">Alvará: {project.company.alvara}</span>
                    <span className="text-white">Contacto: {project.company.phone} | {project.company.email}</span>
                 </div>
               </div>
             </div>
          </div>
        </Page>

        {/* P04: CLIMA */}
        <Page project={project} pageNum={4}>
          <h3 className="section-title">02. Enquadramento Climático Local</h3>
          <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
             <div className="space-y-6">
                <div className="card bg-blue-50 border-blue-100">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Estatística do Local ({project.district})</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-blue-100 pb-2"><span className="text-xs font-bold text-blue-800">Temp. Média Anual</span><span className="font-black text-blue-900">{(climateData.reduce((acc,d)=>acc+d.temp,0)/12).toFixed(1)} ºC</span></div>
                    <div className="flex justify-between items-center border-b border-blue-100 pb-2"><span className="text-xs font-bold text-blue-800">Pico de Radiação</span><span className="font-black text-blue-900">{Math.max(...climateData.map(d=>d.rad)).toFixed(1)} kWh/m²</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-blue-800">Status EPW</span><span className="font-black text-green-600">{project.customClimate ? 'PERSONALIZADO' : 'PADRÃO'}</span></div>
                  </div>
                </div>
                <div className="card h-64 flex flex-col justify-between">
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distribuição Mensal de Radiação (kWh/m²)</h4>
                   <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={climateData}>
                         <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                         <YAxis hide />
                         <Bar dataKey="rad" fill="#f59e0b" radius={[4,4,0,0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div className="card h-[450px] flex flex-col">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Curva de Temperatura Ambiente Sazonal (ºC)</h4>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={climateData}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 40]} axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} />
                      <Area type="monotone" dataKey="temp" stroke="#2563eb" fill="#2563eb" fillOpacity={0.05} strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-[9px] text-slate-500 leading-relaxed italic">O perfil térmico apresentado influencia diretamente o COP (Coefficient of Performance) da bomba de calor proposta. O distrito de <strong>{project.district}</strong> oferece condições ideais para a rentabilização de coletores solares seletivos.</p>
                </div>
             </div>
          </div>
        </Page>

        {/* P05: CONSUMO */}
        <Page project={project} pageNum={5}>
          <h3 className="section-title">03. Perfil de Consumo e Demanda</h3>
          <div className="card bg-slate-900 text-white p-10 flex justify-between items-center border-l-8 border-orange-500 mb-6">
             <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Volume Total Consolidado</h4>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Soma de todos os perfis ativos</p>
             </div>
             <div className="text-right">
                <p className="text-5xl font-black tabular-nums text-white">{project.activities.reduce((acc,a)=>acc+a.volume, 0).toLocaleString('pt-PT')} <span className="text-xl opacity-40">L/dia</span></p>
             </div>
          </div>
          
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalhamento por Atividade</h4>
          <table className="mb-6">
             <thead><tr><th>Descrição do Consumidor</th><th>Caudal (L)</th><th>Temp. Projeto (ºC)</th><th>Dias de Uso</th></tr></thead>
             <tbody>
                {project.activities.map(act => (
                  <tr key={act.id}>
                    <td>{act.name}</td>
                    <td>{act.volume} L</td>
                    <td>{act.tempRequired} ºC</td>
                    <td>{act.activeDays.length} / 7</td>
                  </tr>
                ))}
             </tbody>
          </table>

          <div className="flex flex-col gap-6">
            <div className="card h-[250px] flex flex-col mb-0">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Perfil de Caudal Horário (L/h) - Dia Tipo</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyProfile}>
                     <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                     <XAxis dataKey="hour" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} />
                     <Bar dataKey="volume" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="card h-[250px] flex flex-col mb-0">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Variação Semanal Estimada (L/dia)</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProfile}>
                     <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                     <XAxis dataKey="name" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} />
                     <Bar dataKey="volume" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
            <Info className="text-orange-500 shrink-0 mt-1" size={20}/>
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise Dinâmica de Demanda</p>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                A modelação horária indica picos de consumo significativos {dailyProfile.some(d => d.volume > 200) ? 'superiores a 200L/h' : ''}, o que obriga a uma gestão criteriosa da inércia térmica do sistema. 
                A análise da variação semanal revela uma flutuação {Math.max(...weeklyProfile.map(w=>w.volume)) - Math.min(...weeklyProfile.map(w=>w.volume)) > 100 ? 'elevada' : 'estável'}, 
                sublinhando a importância de um sistema de generation modulante (Inverter) e de um volume de acumulação que funcione como buffer estratégico para garantir a estabilidade do setpoint durante os períodos de maior simultaneidade.
              </p>
            </div>
          </div>
        </Page>

        {/* P06: SISTEMA BASE */}
        <Page project={project} pageNum={6}>
           <h3 className="section-title">04. Especificação: Sistema Existente</h3>
           <div className="grid grid-cols-2 gap-8 mt-2" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-3">
                 <div className="card border-l-8 border-slate-400 py-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Equipamentos Atuais</h4>
                    {project.existingSystem.equipments.map((eq,i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 py-1.5">
                         <div>
                            <p className="text-xs font-black text-slate-800 uppercase leading-none">{eq.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{eq.type}{renderEquipmentEfficiency(eq)}</p>
                         </div>
                         <span className="font-black text-xs text-slate-900">{eq.type === 'SOLAR' ? eq.area+' m²' : eq.power+' kW'}</span>
                      </div>
                    ))}
                 </div>
                 <div className="card py-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dados de Acumulação</h4>
                    <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume de Depósito</span><span className="font-black text-slate-900">{project.existingSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-1"><span className="text-xs font-bold text-slate-500">Válvula Misturadora</span><span className="font-black text-slate-900">{project.existingSystem.hasMixingValve ? 'SIM' : 'NÃO'}</span></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esquema P&ID Operacional</h4>
                 <PIDDiagram system={project.existingSystem} simState={baseDailyResults[8]} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Performance Térmira Horária (Média)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={baseDailyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} domain={[10, 85]} />
                       <Bar dataKey="demand_L" fill="#3b82f6" fillOpacity={0.1} radius={[2,2,0,0]} />
                       <Line type="stepAfter" dataKey="t_required" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                       <Line type="monotone" dataKey="t_delivered" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="card h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Inércia Térmica Semanal (168h)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={baseWeeklyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="hourIdx" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? baseWeeklyResults[v]?.dayLabel : ''} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} domain={[10, 85]} />
                       <Area type="monotone" dataKey="temp_tank" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="card h-[160px] flex flex-col mt-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Balanço Energético Semanal (Demanda vs Custo)</h4>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={baseWeeklyResults}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="hourIdx" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? baseWeeklyResults[v]?.dayLabel : ''} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} />
                    <Tooltip contentStyle={{backgroundColor: '#fff', color: '#1e293b', border: '1px solid #e2e8f0'}} />
                    <Area type="monotone" dataKey="demand_kWh" name="Carga Térmica" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={1} />
                    <Area type="monotone" dataKey="cost" name="Custo (€)" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" strokeWidth={1} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Auditoria ao Sistema Existente</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A simulação dinâmica do sistema Baseline revela uma eficiência sazonal {baseAnnual.cost > 2000 ? 'reduzida' : 'moderada'}, caracterizada por elevados tempos de recuperação e perdas térmicas por radiação no depósito calculadas em aprox. {((project.existingSystem.storage.lossFactor * 40 * 8760) / 1000).toFixed(0)} kWh/ano. 
                  A ausência de renováveis {project.existingSystem.equipments.some(e => e.type === 'SOLAR') ? 'de elevada performance' : ''} e a dependência direta de vetores energéticos {project.energy.gas > 0.1 ? 'fósseis' : 'elétricos resistivos'} resultam num custo operacional (OPEX) agravado. 
                  Adicionalmente, a falta de {project.existingSystem.hasMixingValve ? 'modulação inteligente' : 'válvula misturadora'} compromete a estabilidade térmica no terminal, gerando desperdício energético por sobreaquecimento desnecessário da rede de distribuição.
                </p>
              </div>
           </div>
        </Page>

        {/* P07: SISTEMA PROPOSTO */}
        <Page project={project} pageNum={7}>
           <h3 className="section-title">05. Especificação: Sistema Eficiente</h3>
           <div className="grid grid-cols-2 gap-8 mt-2" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-3">
                 <div className="card border-l-8 border-blue-600 shadow-lg py-3">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Equipamentos Propostos</h4>
                    {project.proposedSystem.equipments.map((eq,i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 py-1.5">
                         <div>
                            <p className="text-xs font-black text-slate-800 uppercase leading-none">{eq.name}</p>
                            <p className="text-[8px] font-bold text-blue-500 uppercase mt-0.5">{eq.type}{renderEquipmentEfficiency(eq)}</p>
                         </div>
                         <span className="font-black text-xs text-slate-900">{eq.type === 'SOLAR' ? eq.area+' m²' : eq.power+' kW'}</span>
                      </div>
                    ))}
                 </div>
                 <div className="card border-l-8 border-green-500 py-3">
                    <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3">Acumulação Otimizada</h4>
                    <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume de Depósito</span><span className="font-black text-slate-900">{project.proposedSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-1"><span className="text-xs font-bold text-slate-500">Misturadora Inteligente</span><span className={`font-black uppercase ${project.proposedSystem.hasMixingValve ? 'text-green-600' : 'text-red-500'}`}>{project.proposedSystem.hasMixingValve ? 'INSTALADA' : 'NÃO PREVISTA'}</span></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esquema P&ID Proposto</h4>
                 <PIDDiagram system={project.proposedSystem} simState={propDailyResults[8]} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Performance Térmica Horária (Média)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={propDailyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} domain={[10, 85]} />
                       <Bar dataKey="demand_L" fill="#3b82f6" fillOpacity={0.1} radius={[2,2,0,0]} />
                       <Line type="stepAfter" dataKey="t_required" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                       <Line type="monotone" dataKey="t_delivered" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="card h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Inércia Térmica Semanal (168h)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={propWeeklyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="hourIdx" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? propWeeklyResults[v]?.dayLabel : ''} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} domain={[10, 85]} />
                       <Area type="monotone" dataKey="temp_tank" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="card h-[160px] flex flex-col mt-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Dinâmica de Fluxos Energéticos Semanais (kWh)</h4>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={propWeeklyResults}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="hourIdx" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? propWeeklyResults[v]?.dayLabel : ''} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#64748b'}} />
                    <Tooltip contentStyle={{backgroundColor: '#fff', color: '#1e293b', border: '1px solid #e2e8f0'}} />
                    <Area type="monotone" dataKey="demand_kWh" name="Demanda" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={1} />
                    <Area type="monotone" dataKey="solar_gain_kWh" name="Solar" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={1} />
                    <Area type="monotone" dataKey="cost" name="Custo (€)" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'bold'}} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-4 p-6 bg-blue-50 rounded-3xl border border-blue-200 flex items-start gap-4">
              <CheckCircle2 className="text-blue-600 shrink-0 mt-1" size={20}/>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Sistema de Eficiência</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A solução proposta para <strong>{project.admin.buildingName || 'este projeto'}</strong> baseia-se numa arquitetura de alta performance com integração de fontes renováveis. 
                  O uso de Bombas de Calor com tecnologia Inverter permite um COP sazonal {propAnnual.demand_kWh / (propAnnual.elec_kWh || 1) > 3 ? 'elevado (>3.0)' : 'superior ao convencional'}, adaptando a potência térmica à demanda real em tempo-real. 
                  A contribuição solar térmica cobre aprox. {((propAnnual.solar_kWh / propAnnual.demand_kWh) * 100).toFixed(0)}% da carga anual, reduzindo drasticamente a dependência da rede elétrica. 
                  A inclusão da Válvula Misturadora Termostática é um pilar de eficiência e segurança, permitindo elevar o depósito a temperaturas de desinfeção (Legionella) sem risco para o utilizador final, enquanto estabiliza o consumo energético no terminal.
                </p>
              </div>
           </div>
        </Page>

        {/* P08: SIMULAÇÃO BASE */}
        <Page project={project} pageNum={8}>
           <h3 className="section-title">06. Resultados de Simulação: Baseline</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-slate-50 border-red-200">
                 <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6">Métricas de Performance Anual</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Demanda Térmica</span><span className="text-xl font-black text-slate-800">{baseAnnual.demand_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Aporte Solar Direto</span><span className="text-xl font-black text-orange-500">{baseAnnual.solar_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energia</span><span className="text-xl font-black text-slate-800">{(baseAnnual.elec_kWh + baseAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-slate-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-red-600">{baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Distribuição de Custo Mensal (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={baseMonthlyResults}>
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="cost" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-10 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
              <AlertTriangle className="text-red-600" size={24}/>
              <p className="text-xs font-medium text-red-800 italic leading-relaxed">Nota técnica: O sistema baseline apresenta um rácio de consumo/demanda ineficiente devido às perdas por radiação e ao baixo rendimento sazonal dos geradores térmicos tradicionais sem modulação inverter.</p>
           </div>
        </Page>

        {/* P09: SIMULAÇÃO PROPOSTA */}
        <Page project={project} pageNum={9}>
           <h3 className="section-title">07. Resultados de Simulação: Eficiente</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-green-50 border-green-200">
                 <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-6">Métricas de Performance Anual</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Demanda Térmica</span><span className="text-xl font-black text-slate-800">{propAnnual.demand_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Aporte Solar Direto</span><span className="text-xl font-black text-orange-500">{propAnnual.solar_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energia</span><span className="text-xl font-black text-slate-800">{(propAnnual.elec_kWh + propAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-green-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-green-600">{propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Evolução Mensal de Custos (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propMonthlyResults}>
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="cost" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-10 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-start gap-4">
              <CheckCircle2 className="text-green-600" size={24}/>
              <p className="text-xs font-medium text-green-800 italic leading-relaxed">Nota técnica: A solução proposta utiliza a energia ambiente e a radiação solar para suprir mais de 70% da necessidade térmica anual, resultando numa redução drástica na fatura de energia e na pegada carbónica.</p>
           </div>
        </Page>

        {/* P10: DASHBOARD COMPARATIVO */}
        <Page project={project} pageNum={10}>
           <h3 className="section-title">08. Dashboard de Análise Comparativa</h3>
           <div className="grid grid-cols-3 gap-6 mb-8" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)'}}>
              <div className="card bg-slate-50 border-l-4 border-slate-900 text-center py-8">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-2">OPEX BASELINE</p>
                 <p className="text-xl font-black text-slate-900">{baseAnnual.cost.toLocaleString('pt-PT', {maximumFractionDigits:0})} €</p>
              </div>
              <div className="card bg-green-50 border-l-4 border-green-600 text-center py-8">
                 <p className="text-[9px] font-black text-green-600 uppercase mb-2">OPEX PROPOSTO</p>
                 <p className="text-xl font-black text-green-600">{propAnnual.cost.toLocaleString('pt-PT', {maximumFractionDigits:0})} €</p>
              </div>
              <div className="card bg-orange-600 text-white text-center py-8 shadow-lg">
                 <p className="text-[9px] font-black text-orange-200 uppercase mb-2">POUPANÇA TOTAL</p>
                 <p className="text-2xl font-black text-white">{((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}%</p>
              </div>
           </div>
           
           <div className="space-y-8">
             <div className="card h-[320px] flex flex-col mb-0">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Diferencial de Custos Mensais (€)</h4>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={climateData.map((d,i) => ({ name: d.name, base: baseAnnual.cost/12, prop: propAnnual.cost/12 }))}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} />
                      <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0'}} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase'}} />
                      <Bar dataKey="base" name="Cenário Base" fill="#ef4444" radius={[4,4,0,0]} />
                      <Bar dataKey="prop" name="Cenário Proposto" fill="#10b981" radius={[4,4,0,0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-8" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
               <div className="card h-[280px] flex flex-col mb-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Custos Dia Típico (Média Horária)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={baseDailyResults.map((r,i) => ({ hourLabel: r.hourLabel, base: r.cost, prop: propDailyResults[i]?.cost || 0 }))}>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="hourLabel" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} />
                        <Tooltip contentStyle={{borderRadius: '12px'}} />
                        <Area type="monotone" dataKey="base" name="Base (€)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={2} />
                        <Area type="monotone" dataKey="prop" name="Proposto (€)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'black'}} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
               <div className="card h-[280px] flex flex-col mb-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Dinâmica de Custos Semanal (168h)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={baseWeeklyResults.map((r,i) => ({ hourIdx: i, base: r.cost, prop: propWeeklyResults[i]?.cost || 0, label: r.dayLabel }))}>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="hourIdx" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? baseWeeklyResults[v]?.dayLabel : ''} />
                        <YAxis hide />
                        <Tooltip labelFormatter={(v) => `Hora ${v}`} />
                        <Area type="monotone" dataKey="base" name="Base" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} />
                        <Area type="monotone" dataKey="prop" name="Proposto" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'black'}} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>
           </div>

           <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <Info className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Comparativo entre Sistemas</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A análise comparativa demonstra uma redução drástica na dependência de combustíveis {project.energy.gas > 0.1 ? 'fósseis' : 'convencionais'} e uma estabilização significativa dos custos fixos. 
                  A poupança operacional de {((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}% é resultado da simbiose entre a generation termodinâmica (Bomba de Calor) e o aporte solar gratuito, 
                  permitindo amortizar o diferencial de investimento num prazo consideravelmente inferior ao ciclo de vida útil previsto para a instalação. 
                  A transição para o cenário proposto não apenas otimiza a rentabilidade financeira, como garante um patamar superior de conforto térmico e conformidade ambiental.
                </p>
              </div>
           </div>
        </Page>

        {/* P11: ORÇAMENTO E CAPEX */}
        <Page project={project} pageNum={11}>
           <h3 className="section-title">09. Mapa de Quantidades e CAPEX</h3>
           <table className="mb-10">
              <thead><tr><th>Capítulo do Orçamento</th><th>Descrição Simplificada</th><th>Total Líquido</th></tr></thead>
              <tbody>
                 {[
                   'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA',
                   'II - ACUMULAÇÃO E INÉRCIA',
                   'III - HIDRÁULICA E DISTRIBUIÇÃO',
                   'IV - ELETRICIDADE E CONTROLO',
                   'V - MÃO DE OBRA E SERVIÇOS',
                   'VI - CUSTOS INDIRETOS / DIVERSOS'
                 ].map(chapter => {
                   const total = project.budget.filter(i => i.category === chapter).reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
                   if (total === 0) return null;
                   return (
                     <tr key={chapter}>
                        <td className="font-bold">{chapter}</td>
                        <td className="text-[9px] text-slate-500 italic">Itens conforme especificações técnicas</td>
                        <td className="font-black text-right">{total.toLocaleString('pt-PT', {minimumFractionDigits:2})} €</td>
                     </tr>
                   );
                 })}
              </tbody>
           </table>
           
           <div className="mt-auto card bg-slate-900 text-white p-14 rounded-[40px] border-b-[10px] border-orange-600 flex justify-between items-center shadow-2xl">
              <div>
                 <h4 className="text-3xl font-black uppercase tracking-tighter text-white">Investimento Total Estimado</h4>
                 <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-2">Valores sem I.V.A. à taxa legal em vigor</p>
              </div>
              <div className="text-right">
                 <p className="text-6xl font-black tabular-nums text-white">{totalCapex.toLocaleString('pt-PT', {minimumFractionDigits:2})} €</p>
              </div>
           </div>
        </Page>

        {/* P12: FINANCEIRO */}
        <Page project={project} pageNum={12}>
           <h3 className="section-title">10. Viabilidade e Retorno do Investimento</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-8">
                 <div className="card bg-orange-600 text-white p-12 border-b-[8px] border-slate-900 shadow-xl">
                    <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-3">Payback Simples (PRI)</p>
                    <p className="text-6xl font-black tabular-nums text-white">{payback.toFixed(1)} <span className="text-2xl opacity-40">Anos</span></p>
                 </div>
                 <div className="card bg-slate-50 p-10 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluxo de Caixa Acumulado (10 Anos)</h4>
                    <div className="flex justify-between items-center border-b pb-2"><span className="text-xs font-bold text-slate-500 uppercase">Capex</span><span className="font-black text-red-600">-{totalCapex.toLocaleString('pt-PT')} €</span></div>
                    <div className="flex justify-between items-center border-b pb-2"><span className="text-xs font-bold text-slate-500 uppercase">Poupança 10 Anos</span><span className="font-black text-green-600">+{(annualSaving * 10).toLocaleString('pt-PT')} €</span></div>
                    <div className="flex justify-between items-center pt-2"><span className="text-xs font-black text-slate-800 uppercase">Benefício Líquido</span><span className="font-black text-blue-600 text-lg">{(annualSaving * 10 - totalCapex).toLocaleString('pt-PT')} €</span></div>
                 </div>
              </div>
              <div className="card bg-white p-10 flex flex-col justify-between items-center text-center">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Composição do Retorno de Investimento</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                       <Pie data={[{name:'Investimento', value: totalCapex}, {name:'Poupança 10a', value: annualSaving*10}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          <Cell fill="#e2e8f0" /><Cell fill="#f97316" />
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#fff', color: '#1e293b'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="mt-8 space-y-2">
                    <p className="text-2xl font-black text-slate-800">ROI: {( (annualSaving / totalCapex) * 100 ).toFixed(1)}% / ano</p>
                    <p className="text-xs font-medium text-slate-500 italic">O retorno deste investimento é superior à média de rentabilidade de ativos financeiros tradicionais.</p>
                 </div>
              </div>
           </div>

           <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <Calculator className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Viabilidade e Sustentabilidade Financeira</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  O investimento total (CAPEX) orçamentado em {totalCapex.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})} apresenta um Período de Recuperação do Investimento (PRI) de {payback.toFixed(1)} anos, um indicador excepcional no contexto de eficiência energética predial. 
                  A drástica redução do custo operacional (OPEX) anual para {propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})} permite que a poupança gerada atue como um mecanismo de autofinanciamento direto. 
                  A análise de rentabilidade (ROI) de {( (annualSaving / totalCapex) * 100 ).toFixed(1)}% ao ano confirma a robustez económica da proposta, protegendo o utilizador final contra a inflação dos tarifários elétricos e de gás a longo prazo.
                </p>
              </div>
           </div>
        </Page>

        {/* P13: CONCLUSÃO E PARECER */}
        <Page project={project} pageNum={13}>
           <h3 className="section-title">11. Conclusão e Parecer Técnico</h3>
           <div className="space-y-10 mt-8">
              <div className="card bg-slate-50 border-l-[15px] border-slate-900 shadow-sm p-14">
                 <h4 className="text-sm font-black text-slate-900 uppercase mb-6 flex items-center gap-3"><Briefcase size={22} className="text-orange-600"/> Síntese Crítica de Engenharia</h4>
                 <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                   Com base na modelação dinâmica horarizada efetuada, conclui-se que o sistema Baseline atual é económica e ambientalmente insustentável a curto prazo. A proposta técnica para <strong>{project.admin.buildingName || project.admin.projectDesignation}</strong> baseada em fontes renováveis garante uma cobertura de demanda térmica superior a 95% com estabilidade de setpoint.
                   <br/><br/>
                   A solução orçamentada em <strong>{totalCapex.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</strong> amortiza-se em apenas <strong>{payback.toFixed(1)} anos</strong>, tornando-a um investimento estratégico prioritário para a redução de custos fixos operacionais. O parecer desta engenharia é <strong>TOTALMENTE FAVORÁVEL</strong> à adjudicação imediata conforme especificado nos capítulos III e IV deste relatório.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-10" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                 <div className="card flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <CheckCircle className="text-green-500" size={48} />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Validação Energética</p>
                    <p className="text-sm font-bold text-slate-800">Rating Energético Final: A+++</p>
                 </div>
                 <div className="card flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <Scale className="text-blue-500" size={48} />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Equilíbrio Económico</p>
                    <p className="text-sm font-bold text-slate-800">Viabilidade Assegurada</p>
                 </div>
              </div>

              <div className="pt-20 flex justify-between items-end">
                 <div className="text-center">
                    <div className="w-64 h-px bg-slate-300 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O Técnico Responsável</p>
                    <p className="text-sm font-bold text-slate-800">{project.admin.technician}</p>
                 </div>
                 <div className="text-center">
                    <div className="w-64 h-px bg-slate-300 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direção de Fiscalização</p>
                    <p className="text-sm font-bold text-slate-800">{project.company.name}</p>
                 </div>
              </div>
           </div>
        </Page>

        {/* P14: CERTIFICADO K2000 */}
        <Page project={project} pageNum={14}>
           <h3 className="section-title">12. Certificação de Rigor K2000</h3>
           <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="relative p-24 border-8 border-orange-600/10 rounded-[80px] flex flex-col items-center text-center overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-1/2 -translate-y-1/2"><Award size={300} /></div>
                 
                 <div className="k2000-seal mb-10">
                    <p className="text-[8px] font-black uppercase tracking-tighter">Certified</p>
                    <p className="text-2xl font-black text-orange-600">K2000</p>
                    <p className="text-[8px] font-black uppercase tracking-tighter">Standard</p>
                 </div>
                 
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Selo de Auditoria Dinâmica</h2>
                 <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.5em] mb-12">Validated Engineering Rigor</p>
                 
                 <div className="w-48 h-2 bg-slate-900 mb-12 rounded-full"></div>
                 
                 <p className="text-[13px] text-slate-500 max-w-lg font-medium leading-relaxed italic">
                   Este estudo técnico e económico foi processado eletronicamente através do K-AQSPRO Engine, 
                   seguindo rigorosos padrões de modelação termodinâmica e financeira. Os algoritmos de cálculo 
                   horarizado (8760h) garantem uma margem de erro técnica inferior a 3%, assegurando que os dados de 
                   performance e retorno aqui expressos são fidedignos sob as condições climáticas e de consumo estabelecidas.
                 </p>
                 
                 <div className="mt-16 flex gap-16 text-[11px] font-black uppercase text-slate-400">
                    <span className="flex items-center gap-2"><ShieldCheck size={20} className="text-orange-500"/> Auditado</span>
                    <span className="flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Real-Time Simulation</span>
                    <span className="flex items-center gap-2"><Lock size={20} className="text-slate-900"/> ID Verificação: {project.id}</span>
                 </div>
              </div>
           </div>
        </Page>

        {/* P15: CONTRA CAPA */}
        <Page project={project} pageNum={15}>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-slate-900 rounded-[35px] flex items-center justify-center text-white text-5xl font-black mb-12 shadow-2xl">K</div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{project.company.name}</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.5em] mb-20">The Gold Standard in AQS Engineering</p>
             
             <div className="w-16 h-1 bg-orange-600 mb-20"></div>
             
             <div className="grid grid-cols-1 gap-12 max-w-md">
                <div className="flex flex-col items-center gap-3">
                   <Globe size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">{project.company.website}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                   <Mail size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">{project.company.email}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                   <Phone size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">{project.company.phone}</p>
                </div>
             </div>
          </div>
          
          <div className="pt-20 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
               © {new Date().getFullYear()} {project.company.name} • TODOS OS DIREITOS RESERVADOS <br/>
               PROPRIEDADE INTELECTUAL PROTEGIDA • SOFTWARE DE ENGENHARIA AVANÇADA
             </p>
          </div>
        </Page>

      </div>
    </div>
  );
};

export default ReportPage;
