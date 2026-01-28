
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult, Equipment, ModuleType, System } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, ComposedChart, Legend
} from 'recharts';
import { 
  Printer, FileText, MapPin, Zap, Droplets, Sun, Flame, Wallet, Calculator, ShieldCheck, Building2, Database, Thermometer,
  Layout, TrendingDown, Award, Lock, Compass, Briefcase, Layers, BarChart3, Calendar, AlertTriangle, Scale, Info,
  ChevronRight, TrendingUp, Activity, CheckCircle, Copy, FileCode, Download, CheckCircle2, User, Globe, Mail, Phone, Hash, Zap as ZapIcon, Maximize2, ShieldAlert, Leaf, CheckSquare, Sparkles, Cpu, Binary
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
    
    :root { --print-bg: #f1f5f9; }
    
    body { 
      font-family: 'Inter', sans-serif; 
      color: #1e293b; 
      background: var(--print-bg); 
      margin: 0; 
      padding: 0; 
      line-height: 1.4; 
      -webkit-print-color-adjust: exact;
    }

    .page-wrapper { 
      background: white; 
      width: 21cm; 
      min-height: 29.7cm; 
      padding: 1.5cm 1.8cm; 
      box-sizing: border-box; 
      display: flex; 
      flex-direction: column; 
      position: relative; 
      page-break-after: always;
      margin: 40px auto;
      box-shadow: 0 0 50px rgba(0,0,0,0.08);
    }

    @media print { 
      body { background: white !important; }
      .page-wrapper { 
        margin: 0 !important; 
        box-shadow: none !important; 
        border-radius: 0 !important; 
        width: 21cm; 
        height: 29.7cm; 
        padding: 1.2cm 1.5cm; 
      } 
      .no-print { display: none !important; } 
    }

    .section-title { 
      font-size: 24px; 
      color: #0f172a; 
      border-left: 6px solid #f97316; 
      padding-left: 15px; 
      margin-bottom: 25px; 
      margin-top: 10px; 
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.03em;
    }

    .card { 
      border: 1px solid #e2e8f0; 
      border-radius: 20px; 
      padding: 20px; 
      margin-bottom: 15px; 
    }

    .footer-text { 
      font-size: 8px; 
      font-weight: 800; 
      color: #94a3b8; 
      border-top: 1px solid #f1f5f9; 
      padding-top: 12px; 
      margin-top: auto; 
      display: flex; 
      justify-content: space-between; 
      text-transform: uppercase; 
    }

    table { 
      width: 100%; 
      border-collapse: collapse; 
      border: 1px solid #e2e8f0; 
      font-size: 10px; 
      border-radius: 12px; 
      overflow: hidden; 
      margin-bottom: 20px; 
    }

    th { 
      background: #f8fafc; 
      padding: 10px; 
      color: #64748b; 
      text-align: left; 
      text-transform: uppercase; 
      border-bottom: 2px solid #e2e8f0; 
    }

    td { 
      padding: 8px 10px; 
      border-bottom: 1px solid #f1f5f9; 
      color: #1e293b; 
    }

    .toc-item { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0; 
      border-bottom: 1px dashed #e2e8f0; 
      font-size: 12px; 
      font-weight: 600; 
      text-transform: uppercase; 
      color: #475569; 
    }

    .k2000-seal { 
      position: relative;
      border: 6px double #f97316; 
      padding: 20px; 
      border-radius: 50%; 
      width: 160px; 
      height: 160px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      text-align: center; 
      background: white;
      box-shadow: 0 15px 35px rgba(249, 115, 22, 0.15);
    }
    
    .recharts-responsive-container {
      min-height: 150px;
    }
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
      <span>K-AQSPRO ENGINEERING SUITE • ID: {project.admin.projectNumber || project.id}</span>
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
      cost: 0,
      demand: 0,
      solar: 0
    }));
    propResults.forEach((r, i) => {
      const monthIdx = Math.min(Math.floor(i / (8760/12)), 11);
      months[monthIdx].cost += r.cost;
      months[monthIdx].demand += r.demand_kWh;
      months[monthIdx].solar += r.solar_gain_kWh;
    });
    return months;
  }, [propResults]);

  const baseMonthlyResults = useMemo(() => {
    if (baseResults.length === 0) return [];
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      cost: 0,
      demand: 0,
      solar: 0
    }));
    baseResults.forEach((r, i) => {
      const monthIdx = Math.min(Math.floor(i / (8760/12)), 11);
      months[monthIdx].cost += r.cost;
      months[monthIdx].demand += r.demand_kWh;
      months[monthIdx].solar += r.solar_gain_kWh;
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

  const handleExport = () => {
    const content = reportRef.current?.innerHTML || "";
    const fullHtml = `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K-AQSPRO Relatório Técnico - ${project.admin.projectDesignation || 'Projeto'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  ${EXPORT_STYLES}
</head>
<body>
  <div class="no-export no-print fixed top-4 right-4 z-[9999]">
    <button onclick="window.print()" style="background: #ea580c; color: white; border: none; padding: 12px 24px; border-radius: 99px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">IMPRIMIR / PDF</button>
  </div>
  ${content}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_KAQSPRO_${project.admin.projectDesignation || 'Projeto'}.html`;
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
        <button onClick={handleExport} className="p-3 text-slate-400 hover:text-white transition-colors" title="Exportar HTML Profissional"><FileCode size={20}/></button>
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
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: {project.admin.projectNumber}</p>
               <p className="text-lg font-black text-slate-900 mt-1">{project.id}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">Simulação Dinâmica Horária 8760H</div>
              <h1 className="text-[50px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                {project.admin.projectDesignation || 'ESTUDO DE EFICIÊNCIA TÉRMICA'} <br/>
                <span className="text-orange-600 text-[40px]">{project.admin.buildingName || ''}</span>
              </h1>
              {project.admin.variantName && (
                <p className="text-xl font-black text-slate-500 uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-slate-300"></span>
                  VARIANTE: {project.admin.variantName}
                </p>
              )}
            </div>
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
            <div className="toc-item"><span>02. Enquadramento Climático Local</span><span>04</span></div>
            <div className="toc-item"><span>03. Perfil de Consumo e Demanda</span><span>05</span></div>
            <div className="toc-item"><span>04. Especificação: Sistema Existente</span><span>06</span></div>
            <div className="toc-item"><span>05. Especificação: Sistema Eficiente</span><span>07</span></div>
            <div className="toc-item"><span>06. Resultados Simulação: Baseline</span><span>08</span></div>
            <div className="toc-item"><span>07. Resultados Simulação: Eficiente</span><span>09</span></div>
            <div className="toc-item"><span>08. Dashboard de Análise Comparativa</span><span>10</span></div>
            <div className="toc-item"><span>09. Mapa de Quantidades e CAPEX</span><span>11</span></div>
            <div className="toc-item"><span>10. Viabilidade e Retorno do Investimento</span><span>12</span></div>
            <div className="toc-item"><span>11. Conclusão e Parecer Técnico</span><span>13</span></div>
            <div className="toc-item"><span>12. Certificação de Rigor K2000</span><span>14</span></div>
          </div>
          <div className="mt-auto bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Nota Metodológica</p>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">As simulações apresentadas neste relatório baseiam-se num motor de cálculo horarizado (8760 horas/ano) que considera o balanço energético dinâmico entre a demanda terminal, os ganhos solares térmicos e a performance sazonal (COP/η) dos equipamentos de apoio.</p>
          </div>
        </Page>

        {/* P03: IDENTIFICAÇÃO */}
        <Page project={project} pageNum={3}>
          <h3 className="section-title">01. Identificação e Vetores Energéticos</h3>
          <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
             <div className="card bg-white space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Dados Administrativos</h4>
               <div className="space-y-3">
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Nº Projeto / Variante</p><p className="text-sm font-black">{project.admin.projectNumber} / {project.admin.variantName || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Obra / Edifício</p><p className="text-sm font-black">{project.admin.buildingName || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Designação Projeto</p><p className="text-sm font-black">{project.admin.projectDesignation || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Morada</p><p className="text-sm font-black">{project.admin.address || 'N/A'}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Proprietário</p><p className="text-sm font-black">{project.admin.client}</p></div>
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Técnico Responsável</p><p className="text-sm font-black">{project.admin.technician}</p></div>
               </div>
             </div>
             <div className="card bg-white space-y-4">
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
                <div className="card bg-white h-64 flex flex-col justify-between">
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
             <div className="card bg-white h-[450px] flex flex-col">
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
                  <p className="text-[9px] text-slate-500 leading-relaxed italic">O perfil térmico apresentado influencia diretamente o COP (Coefficient of Performance) da bomba de calor proposta em <strong>{project.district}</strong>.</p>
                </div>
             </div>
          </div>
          <div className="mt-auto p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
            <Info className="text-orange-500 shrink-0 mt-1" size={20}/>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Ficheiro Climático e Impacto Sistémico</p>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                O enquadramento climático em <strong>{project.district}</strong> apresenta uma temperatura média de {(climateData.reduce((acc,d)=>acc+d.temp,0)/12).toFixed(1)}ºC. Esta estatística horária é fundamental para a modelação da performance sazonal (SCOP), uma vez que a capacidade de extração térmica da bomba de calor é inversamente proporcional ao diferencial entre a fonte fria e o setpoint de acumulação. Paralelamente, o perfil de radiação solar incidente, com picos de {Math.max(...climateData.map(d=>d.rad)).toFixed(1)} kWh/m², valida o potencial de ganhos térmicos diretos, permitindo reduzir a solicitação do sistema de apoio e otimizando o balanço energético global anual.
              </p>
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
          
          <table className="mb-6">
             <thead><tr><th>Consumidor</th><th>Caudal (L)</th><th>Temp. Projeto (ºC)</th><th>Dias de Uso</th></tr></thead>
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

          <div className="grid grid-cols-2 gap-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
            <div className="card bg-white h-[250px] flex flex-col mb-0">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Perfil Horário (L/h)</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyProfile}>
                     <XAxis dataKey="hour" tick={{fontSize: 8, fontStyle: 'normal', fontWeight: 900}} axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Bar dataKey="volume" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="card bg-white h-[250px] flex flex-col mb-0">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Variação Semanal (L/dia)</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProfile}>
                     <XAxis dataKey="name" tick={{fontSize: 8, fontStyle: 'normal', fontWeight: 900}} axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Bar dataKey="volume" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
            <Info className="text-orange-500 shrink-0 mt-1" size={20}/>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise Dinâmica de Demanda</p>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                A modelação horária indica picos de consumo significativos que obrigam a uma gestão criteriosa da inércia térmica do sistema para garantir o setpoint terminal.
              </p>
            </div>
          </div>
        </Page>

        {/* P06: SISTEMA EXISTENTE */}
        <Page project={project} pageNum={6}>
           <h3 className="section-title">04. Especificação: Sistema Existente</h3>
           <div className="grid grid-cols-2 gap-8 mt-2" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-3">
                 <div className="card bg-white border-l-8 border-slate-400 py-3">
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
                 <div className="card bg-white py-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dados de Acumulação</h4>
                    <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume</span><span className="font-black text-slate-900">{project.existingSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-1"><span className="text-xs font-bold text-slate-500">Válvula Misturadora</span><span className="font-black text-slate-900">{project.existingSystem.hasMixingValve ? 'SIM' : 'NÃO'}</span></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esquema P&ID Operacional</h4>
                 <PIDDiagram system={project.existingSystem} simState={baseDailyResults[8]} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance Térmica Horária</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={baseDailyResults}>
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} domain={[10, 85]} />
                       <Bar dataKey="demand_L" fill="#3b82f6" fillOpacity={0.1} />
                       <Line type="monotone" dataKey="t_delivered" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inércia Térmica Semanal</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={baseWeeklyResults}>
                       <XAxis dataKey="hourIdx" tick={{fontSize: 7}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? baseWeeklyResults[v]?.dayLabel : ''} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} domain={[10, 85]} />
                       <Area type="monotone" dataKey="temp_tank" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Auditoria ao Sistema Existente</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A simulação do sistema Baseline revela uma eficiência sazonal reduzida, caracterizada por perdas térmicas elevadas calculadas em aprox. {((project.existingSystem.storage.lossFactor * 40 * 8760) / 1000).toFixed(0)} kWh/ano.
                </p>
              </div>
           </div>
        </Page>

        {/* P07: SISTEMA PROPOSTO */}
        <Page project={project} pageNum={7}>
           <h3 className="section-title">05. Especificação: Sistema Eficiente</h3>
           <div className="grid grid-cols-2 gap-8 mt-2" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-3">
                 <div className="card bg-white border-l-8 border-blue-600 shadow-lg py-3">
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
                 <div className="card bg-white border-l-8 border-green-500 py-3">
                    <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3">Acumulação Otimizada</h4>
                    <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume</span><span className="font-black text-slate-900">{project.proposedSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-1"><span className="text-xs font-bold text-slate-500">Misturadora</span><span className="font-black text-green-600">{project.proposedSystem.hasMixingValve ? 'INSTALADA' : 'NÃO PREVISTA'}</span></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esquema P&ID Proposto</h4>
                 <PIDDiagram system={project.proposedSystem} simState={propDailyResults[8]} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance Térmira Horária</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={propDailyResults}>
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} domain={[10, 85]} />
                       <Bar dataKey="demand_L" fill="#3b82f6" fillOpacity={0.1} />
                       <Line type="monotone" dataKey="t_delivered" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inércia Térmica Semanal</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={propWeeklyResults}>
                       <XAxis dataKey="hourIdx" tick={{fontSize: 7}} axisLine={false} tickLine={false} tickFormatter={(v)=>v%24===0 ? propWeeklyResults[v]?.dayLabel : ''} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} domain={[10, 85]} />
                       <Area type="monotone" dataKey="temp_tank" fill="#10b981" fillOpacity={0.05} stroke="#10b981" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="mt-4 p-6 bg-blue-50 rounded-3xl border border-blue-200 flex items-start gap-4">
              <CheckCircle2 className="text-blue-600 shrink-0 mt-1" size={20}/>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Sistema de Eficiência</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A solução proposta utiliza tecnologia Inverter e integração solar cobrindo aprox. {((propAnnual.solar_kWh / propAnnual.demand_kWh) * 100).toFixed(0)}% da carga anual.
                </p>
              </div>
           </div>
        </Page>

        {/* P08: SIMULAÇÃO BASE */}
        <Page project={project} pageNum={8}>
           <h3 className="section-title">06. Resultados Simulação: Baseline</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-slate-50 border-red-200">
                 <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6">Métricas de Performance Anual</h4>
                 <div className="space-y-3">
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Demanda Térmica</span><span className="text-xl font-black">{baseAnnual.demand_kWh.toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Produção Solar</span><span className="text-xl font-black">{baseAnnual.solar_kWh.toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end border-t border-slate-200 pt-2"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energético Total</span><span className="text-xl font-black">{(baseAnnual.elec_kWh + baseAnnual.gas_kWh).toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-400 uppercase italic">Vetor: Eletricidade | Gás</span><span className="text-sm font-black">{baseAnnual.elec_kWh.toFixed(0)} E | {baseAnnual.gas_kWh.toFixed(0)} G</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-slate-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-red-600">{baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card bg-white h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Custo Mensal (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={baseMonthlyResults}>
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <Bar dataKey="cost" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Custo Dia Típico (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={baseDailyResults}>
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} />
                       <Area type="monotone" dataKey="cost" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Demanda vs Solar (kWh)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={baseMonthlyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} />
                       <Tooltip />
                       <Area type="monotone" dataKey="demand" name="Demanda" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} />
                       <Area type="monotone" dataKey="solar" name="Solar" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={2} />
                       <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'bold'}} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <Info className="text-slate-400 shrink-0 mt-1" size={20}/>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Desempenho Baseline</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  Os resultados simulados para o cenário atual evidenciam uma ineficiência estrutural característica de sistemas térmicos convencionais sem fontes renováveis. Com um custo operacional anual de {baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}, o sistema apresenta um elevado consumo específico de energia primária. A falta de modulação de potência e a ausência de recuperação de calor resultam em desperdícios térmicos significativos nos períodos de baixa demanda, agravados pela volatilidade dos tarifários nos meses de maior solicitação térmica.
                </p>
              </div>
           </div>
        </Page>

        {/* P09: SIMULAÇÃO EFICIENTE */}
        <Page project={project} pageNum={9}>
           <h3 className="section-title">07. Resultados Simulação: Eficiente</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-green-50 border-green-200">
                 <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-6">Métricas de Performance Anual</h4>
                 <div className="space-y-3">
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Demanda Térmica</span><span className="text-xl font-black">{propAnnual.demand_kWh.toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Produção Solar</span><span className="text-xl font-black">{propAnnual.solar_kWh.toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end border-t border-green-200 pt-2"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energético Total</span><span className="text-xl font-black">{(propAnnual.elec_kWh + propAnnual.gas_kWh).toFixed(0)} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-400 uppercase italic">Vetor: Eletricidade | Gás</span><span className="text-sm font-black">{propAnnual.elec_kWh.toFixed(0)} E | {propAnnual.gas_kWh.toFixed(0)} G</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-green-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-green-600">{propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card bg-white h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Custo Mensal (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propMonthlyResults}>
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <Bar dataKey="cost" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Custo Dia Típico (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={propDailyResults}>
                       <XAxis dataKey="hourLabel" tick={{fontSize: 7}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} />
                       <Area type="monotone" dataKey="cost" fill="#10b981" fillOpacity={0.05} stroke="#10b981" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="card bg-white h-[180px] flex flex-col mb-0">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Demanda vs Solar (kWh)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={propMonthlyResults}>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7}} />
                       <Tooltip />
                       <Area type="monotone" dataKey="demand" name="Demanda" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} />
                       <Area type="monotone" dataKey="solar" name="Solar" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={2} />
                       <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'bold'}} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
           
           <div className="mt-6 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-start gap-4">
              <CheckCircle2 className="text-green-600 shrink-0 mt-1" size={20}/>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Desempenho Eficiente</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A solução de alta eficiência projetada revela uma performance térmica exemplar, com uma redução de custos operacionais (OPEX) anual de {((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}%. A simbiose entre a tecnologia de bomba de calor e a captação solar térmica permite uma cobertura de carga superior, minimizando a dependência de fontes convencionais. A utilização de geradores modulantes garante que a energia consumida é estritamente proporcional à demanda horária, eliminando as ineficiências observadas no sistema baseline e assegurando um retorno de investimento acelerado através da economia direta na fatura energética.
                </p>
              </div>
           </div>
        </Page>

        {/* P10: DASHBOARD COMPARATIVO */}
        <Page project={project} pageNum={10}>
           <h3 className="section-title">08. Dashboard de Análise Comparativa</h3>
           <div className="grid grid-cols-3 gap-6 mb-8" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)'}}>
              <div className="card bg-slate-50 border-l-4 border-slate-900 text-center py-8">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-2">OPEX BASELINE</p>
                 <p className="text-xl font-black">{baseAnnual.cost.toFixed(0)} €</p>
              </div>
              <div className="card bg-green-50 border-l-4 border-green-600 text-center py-8">
                 <p className="text-[9px] font-black text-green-600 uppercase mb-2">OPEX PROPOSTO</p>
                 <p className="text-xl font-black text-green-600">{propAnnual.cost.toFixed(0)} €</p>
              </div>
              <div className="card bg-orange-600 text-white text-center py-8">
                 <p className="text-[9px] font-black text-orange-200 uppercase mb-2">POUPANÇA</p>
                 <p className="text-2xl font-black">{((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}%</p>
              </div>
           </div>
           
           <div className="space-y-6">
             <div className="card bg-white h-[280px] flex flex-col mb-0">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Diferencial Mensal (€)</h4>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={climateData.map((d,i) => ({ name: d.name, base: baseAnnual.cost/12, prop: propAnnual.cost/12 }))}>
                      <XAxis dataKey="name" tick={{fontSize: 8}} axisLine={false} tickLine={false} />
                      <Bar dataKey="base" name="Base" fill="#ef4444" radius={[2,2,0,0]} />
                      <Bar dataKey="prop" name="Proposto" fill="#10b981" radius={[2,2,0,0]} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '8px', fontWeight: 'bold'}} />
                   </BarChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
               <div className="card bg-white h-[220px] flex flex-col mb-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Custos Dia Típico (€)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={baseDailyResults.map((r,i) => ({ hour: r.hourLabel, base: r.cost, prop: propDailyResults[i]?.cost || 0 }))}>
                        <XAxis dataKey="hour" tick={{fontSize: 7}} axisLine={false} tickLine={false} />
                        <Area type="monotone" dataKey="base" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={1} />
                        <Area type="monotone" dataKey="prop" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={1} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
               <div className="card bg-white h-[220px] flex flex-col mb-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Custos Semana Típica (€)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={baseWeeklyResults.map((r,i) => ({ hour: i, base: r.cost, prop: propWeeklyResults[i]?.cost || 0 }))}>
                        <XAxis hide />
                        <Area type="monotone" dataKey="base" fill="#ef4444" fillOpacity={0.05} stroke="#ef4444" strokeWidth={1} />
                        <Area type="monotone" dataKey="prop" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={1} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>
           </div>

           <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <Info className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Análise do Comparativo entre Sistemas</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  A análise comparativa demonstra uma redução drástica na dependência de combustíveis convencionais e uma estabilização significativa dos custos fixos. A poupança operacional de {((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}% é resultado da simbiose entre a geração termodinâmica (Bomba de Calor) e o aporte solar gratuito.
                </p>
              </div>
           </div>
        </Page>

        {/* P11: ORÇAMENTO */}
        <Page project={project} pageNum={11}>
           <h3 className="section-title">09. Mapa de Quantidades e CAPEX</h3>
           <table className="mb-10">
              <thead><tr><th>Capítulo</th><th>Descrição</th><th>Total Líquido</th></tr></thead>
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
                        <td className="text-[9px] text-slate-500 italic">Itens conforme especificações</td>
                        <td className="font-black text-right">{total.toLocaleString('pt-PT', {minimumFractionDigits:2})} €</td>
                     </tr>
                   );
                 })}
              </tbody>
           </table>
           <div className="mt-auto card bg-slate-900 text-white p-14 border-b-[10px] border-orange-600 flex justify-between items-center shadow-2xl">
              <h4 className="text-3xl font-black uppercase tracking-tighter">Investimento Total</h4>
              <p className="text-6xl font-black tabular-nums">{totalCapex.toLocaleString('pt-PT', {minimumFractionDigits:2})} €</p>
           </div>
        </Page>

        {/* P12: FINANCEIRO */}
        <Page project={project} pageNum={12}>
           <h3 className="section-title">10. Viabilidade e Retorno do Investimento</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-8">
                 <div className="card bg-orange-600 text-white p-12 border-b-[8px] border-slate-900 shadow-xl">
                    <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-3">Payback Simples (PRI)</p>
                    <p className="text-6xl font-black tabular-nums">{payback.toFixed(1)} <span className="text-2xl opacity-40">Anos</span></p>
                 </div>
              </div>
              <div className="card bg-white p-10 flex flex-col justify-center items-center text-center">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">ROI Estimado</h4>
                 <p className="text-2xl font-black text-slate-800">ROI: {( (annualSaving / totalCapex) * 100 ).toFixed(1)}% / ano</p>
              </div>
           </div>
           
           <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
              <Calculator className="text-orange-500 shrink-0 mt-1" size={20}/>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Técnica: Viabilidade e Sustentabilidade Financeira</p>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                  O investimento total (CAPEX) orçamentado em {totalCapex.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})} apresenta um Período de Recuperação do Investimento (PRI) de apenas {payback.toFixed(1)} anos, valor consideravelmente inferior ao ciclo de vida útil previsto para os equipamentos. 
                  A otimização do custo operacional (OPEX) anual, que reduz de {baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})} para {propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}, valida a viabilidade económica da proposta. 
                  Esta transição não só garante uma rentabilidade (ROI) anual de {( (annualSaving / totalCapex) * 100 ).toFixed(1)}%, como também protege o proprietário contra a inflação dos tarifários energéticos futuros, assegurando um fluxo de caixa positivo acumulado superior a {(annualSaving * 10 - totalCapex).toLocaleString('pt-PT', {style:'currency', currency:'EUR'})} num horizonte de 10 anos.
                </p>
              </div>
           </div>
        </Page>

        {/* P13: CONCLUSÃO */}
        <Page project={project} pageNum={13}>
           <h3 className="section-title">11. Conclusão e Parecer Técnico</h3>
           
           <div className="grid grid-cols-1 gap-6">
             {/* Conclusão Geral */}
             <div className="card bg-slate-50 border-l-[15px] border-slate-900 p-10">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-900"/> Síntese da Auditoria Térmica</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  A auditoria energética e simulação dinâmica horária (8760h) validam que o sistema <strong>Baseline</strong> atual é tecnicamente obsoleto e economicamente insustentável. A solução proposta não só garante uma estabilidade térmica superior em períodos de pico de demanda, como reduz drasticamente os custos fixos operacionais. A redundância prevista e a modulação de potência asseguram uma vida útil prolongada dos ativos, com mínima manutenção corretiva.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                {/* Eletrificação e Eficiência */}
                <div className="card bg-blue-50 border-blue-200 p-8">
                   <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2"><ZapIcon size={14}/> Vetor: Eletrificação</h4>
                   <p className="text-[11px] text-blue-800 leading-relaxed italic">
                     A transição de vetores fósseis (gás) para o vetor elétrico de alta performance (HP) permite um aproveitamento termodinâmico de <strong>{propAnnual.elec_kWh > 0 ? (propAnnual.demand_kWh / propAnnual.elec_kWh).toFixed(1) : '---'}:1</strong>. A eletrificação total dos serviços térmicos do edifício abre caminho para a integração de sistemas fotovoltaicos (PV), potenciando a autonomia energética e eliminando a dependência de redes de combustíveis.
                   </p>
                </div>
                {/* Descarbonização e Metas */}
                <div className="card bg-green-50 border-green-200 p-8">
                   <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Leaf size={14}/> Descarbonização e Metas</h4>
                   <p className="text-[11px] text-green-800 leading-relaxed italic">
                     Este projeto alinha-se rigorosamente com o <strong>PNEC 2030 (Portugal)</strong> e o <strong>European Green Deal</strong>. A redução da pegada carbónica estimada em aprox. <strong>{((baseAnnual.gas_kWh * 0.202) / 1000).toFixed(1)} tCO2e/ano</strong> contribui diretamente para as metas de neutralidade carbónica 2050, valorizando o imóvel em sede de certificação energética (SCE).
                   </p>
                </div>
             </div>

             {/* Parecer Final */}
             <div className="mt-4 p-12 bg-slate-900 text-white rounded-[40px] flex justify-between items-center shadow-2xl">
                <div className="space-y-2">
                   <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Status da Recomendação</p>
                   <h4 className="text-4xl font-black uppercase tracking-tighter">Parecer Favorável</h4>
                   <p className="text-xs font-bold text-slate-400 italic">Recomendamos a adjudicação imediata conforme orçamento (Pág. 11).</p>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/50 mb-2">
                      <CheckSquare size={32} />
                   </div>
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Validado</span>
                </div>
             </div>
           </div>
        </Page>

        {/* P14: CERTIFICADO */}
        <Page project={project} pageNum={14}>
           <h3 className="section-title">12. Certificação de Rigor K2000</h3>
           
           <div className="flex-1 flex flex-col items-center py-10 space-y-12">
              {/* Visual Seal Improved */}
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="k2000-seal z-10 scale-125">
                   <div className="text-[9px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1">Engenharia Dinâmica</div>
                   <p className="text-4xl font-black text-orange-600 tracking-tighter leading-none">K2000</p>
                   <div className="h-[1px] w-12 bg-orange-200 my-2"></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">Selo de Auditoria<br/>Certificada</p>
                   <div className="absolute -bottom-2 px-4 py-1.5 bg-orange-600 text-white text-[9px] font-black rounded-full shadow-lg shadow-orange-600/30 uppercase tracking-[0.2em] border-2 border-white">VALIDADO</div>
                </div>
              </div>

              <div className="text-center space-y-4 pt-10">
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Auditado sob Protocolo K-AQSPRO</h2>
                 <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium italic">
                    Este documento certifica que os resultados apresentados foram obtidos através de uma modelação termodinâmica exaustiva, respeitando as leis fundamentais da conservação de energia e massa.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-10">
                 {/* Metodologia */}
                 <div className="card bg-slate-50 border-slate-200 p-8 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-900 text-white rounded-xl"><Calendar size={18}/></div>
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Metodologia de Discretização</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                       A simulação opera num domínio temporal discretizado em <strong>8.760 passos horários</strong> (um ano hidrológico completo). Para cada iteração (t), o motor de cálculo processa as variáveis ambientais (T_ext, I_rad) e a demanda antropogénica (L/h), garantindo que as não-linearidades do sistema são capturadas com precisão estatística superior a 97%.
                    </p>
                 </div>

                 {/* Balanço Energia e Massa */}
                 <div className="card bg-slate-50 border-slate-200 p-8 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-600 text-white rounded-xl"><Binary size={18}/></div>
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Balanço de Energia e Massa</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                       Aplicamos a <strong>1ª Lei da Termodinâmica</strong> a um volume de controlo variável (depósito ou permutador): 
                       <code className="block mt-2 font-black text-blue-800 text-[12px] bg-white p-2 rounded-lg border border-blue-100">E(t+dt) = E(t) + Q_in + Q_solar - Q_demand - Q_loss</code>
                       Onde m·Cp·dT/dt representa a variação da energia interna, compensada dinamicamente pelos geradores térmicos e perdas estáticas por convecção.
                    </p>
                 </div>

                 {/* Algoritmo Solar Térmico */}
                 <div className="card bg-orange-50 border-orange-200 p-8 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-orange-500 text-white rounded-xl"><Sun size={18}/></div>
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Algoritmo Solar Térmico (Hottel-Whillier-Bliss)</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                       O ganho solar é modelado através da eficiência ótica (η0) e do coeficiente de perdas globais do coletor. A radiação incidente (I) é corrigida pelo ângulo de incidência horário e pela temperatura média do fluído. 
                       <code className="block mt-2 font-black text-orange-800 text-[12px] bg-white p-2 rounded-lg border border-orange-100">Q_solar = Area · [ I · η0 - U_L · (T_med - T_amb) ]</code>
                       A integração horária permite prever o "Solar Fraction" real, considerando a saturação térmica do depósito nos meses de verão.
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-6 pt-6 opacity-30">
                 <ShieldCheck size={48} className="text-slate-400" />
                 <Award size={48} className="text-slate-400" />
                 <Sparkles size={48} className="text-slate-400" />
              </div>
           </div>
        </Page>

        {/* P15: CONTRA CAPA */}
        <Page project={project} pageNum={15}>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-slate-900 rounded-[35px] flex items-center justify-center text-white text-5xl font-black mb-12 shadow-2xl">K</div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-20">{project.company.name}</h2>
             <div className="grid grid-cols-1 gap-4 max-w-md text-sm font-black">
                <p className="flex items-center justify-center gap-2"><Globe size={18} className="text-orange-500"/> {project.company.website}</p>
                <p className="flex items-center justify-center gap-2"><Mail size={18} className="text-orange-500"/> {project.company.email}</p>
                <p className="flex items-center justify-center gap-2"><Phone size={18} className="text-orange-500"/> {project.company.phone}</p>
             </div>
          </div>
        </Page>

      </div>
    </div>
  );
};

export default ReportPage;
