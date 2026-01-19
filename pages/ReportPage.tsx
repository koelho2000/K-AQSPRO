
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell
} from 'recharts';
import { 
  Printer, 
  FileText, 
  Download, 
  CheckCircle, 
  MapPin,
  Zap,
  Droplets,
  Sun,
  Flame,
  Wallet,
  Calculator,
  ShieldCheck,
  Building2,
  Database,
  Thermometer,
  Copy,
  Layout
} from 'lucide-react';

interface ReportPageProps {
  project: Project;
  baseResults: HourlySimResult[];
  propResults: HourlySimResult[];
}

const ReportPage: React.FC<ReportPageProps> = ({ project, baseResults, propResults }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const baseAnnual = useMemo(() => aggregateResults(baseResults), [baseResults]);
  const propAnnual = useMemo(() => aggregateResults(propResults), [propResults]);
  const totalCapex = project.budget.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const opexSaving = baseAnnual.cost - propAnnual.cost;
  const energySaving = (baseAnnual.elec_kWh + baseAnnual.gas_kWh) - (propAnnual.elec_kWh + propAnnual.gas_kWh);

  const monthlyData = useMemo(() => {
    if (propResults.length === 0) return [];
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      demand: 0, cost: 0, solar: 0, elec: 0, gas: 0
    }));
    propResults.forEach((r, i) => {
      const m = Math.floor(i / (8760/12));
      const monthIdx = Math.min(m, 11);
      if (months[monthIdx]) {
        months[monthIdx].demand += r.demand_kWh;
        months[monthIdx].cost += r.cost;
        months[monthIdx].solar += r.solar_gain_kWh;
      }
    });
    return months;
  }, [propResults]);

  const dailyProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, volume: 0 }));
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        hours[h].volume += act.volume / (act.hours.length || 1);
      });
    });
    return hours;
  }, [project.activities]);

  const climateData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      temp: project.customClimate?.[i]?.temp || 15,
      rad: project.customClimate?.[i]?.radiation || 4
    }));
  }, [project]);

  const handleExport = (type: 'pdf' | 'html' | 'word') => {
    if (type === 'pdf') {
      window.print();
    } else {
      const htmlContent = reportRef.current?.innerHTML || "";
      const fullHtml = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; color: #333; }
              .page-break { page-break-after: always; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #eee; padding: 12px; text-align: left; }
              h1, h2, h3 { color: #f97316; }
            </style>
          </head>
          <body>${htmlContent}</body>
        </html>
      `;
      const blob = new Blob([fullHtml], { type: type === 'html' ? 'text/html' : 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_KAQSPRO_${project.admin.client || 'Projeto'}.${type === 'html' ? 'html' : 'doc'}`;
      link.click();
    }
  };

  const handleCopy = async () => {
    if (!reportRef.current) return;
    try {
      const html = reportRef.current.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      await navigator.clipboard.write(data);
      alert("Relatório copiado com formatação rica! Pode colar diretamente no Word ou Google Docs.");
    } catch (err) {
      const text = reportRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert("Conteúdo textual copiado (Formatação rica não suportada pelo browser).");
    }
  };

  const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white mx-auto shadow-2xl print:shadow-none print:m-0 print:border-none border border-slate-100 flex flex-col p-16 md:p-20 relative overflow-hidden page-break mb-12 last:mb-0 rounded-[40px] print:rounded-none" 
         style={{ width: '21cm', minHeight: '29.7cm' }}>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <div className="pt-8 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest mt-8">
        <div>K-AQSPRO • {project.admin.client || 'Estudo Técnico'}</div>
        <div className="text-center">AQS Engineering Suite v2.5</div>
        <div className="text-right">ID: {project.id}</div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[22cm] mx-auto space-y-8 animate-in fade-in duration-700 pb-24 print:p-0 print:max-w-none">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; }
          .page-break { page-break-after: always; break-after: page; }
          main { overflow: visible !important; height: auto !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <FileText className="text-orange-500" /> Relatório Técnico
          </h2>
          <p className="text-sm text-slate-500 font-medium">Documento profissional de alta fidelidade para entrega ao cliente.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200">
            <Copy size={14}/> COPIAR
          </button>
          <button onClick={() => handleExport('html')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200">
            <Layout size={14}/> HTML
          </button>
          <button onClick={() => handleExport('word')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all border border-blue-100">
            <Download size={14}/> DOC
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Printer size={16}/> PDF / IMPRIMIR
          </button>
        </div>
      </div>

      <div ref={reportRef} className="print:w-full">
        
        {/* CAPA PROFISSIONAL */}
        <PageWrapper>
          <div className="flex justify-between items-start mb-24">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-orange-600 rounded-[32px] flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-8 ring-orange-600/10">K</div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">K-AQSPRO</h1>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">Engineering Suite</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Data de Emissão</div>
              <p className="font-bold text-slate-900">{new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-12">
            <div className="space-y-6">
              <div className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100">Estudo de Eficiência Energética</div>
              <h1 className="text-[80px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                Otimização em <br/>
                Sistemas de <br/>
                <span className="text-orange-600">Água Quente</span>
              </h1>
            </div>
            <p className="text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed">
              Relatório detalhado de viabilidade técnica, térmica e financeira para a transição energética em sistemas de AQS.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 pt-16 border-t border-slate-100 mt-20">
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Instalação e Local</div>
                <p className="text-2xl font-black text-slate-800 leading-tight">{project.admin.installation || 'Local Não Definido'}</p>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mt-2">
                   <MapPin size={16} className="text-orange-500"/> {project.district}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Cliente Final</div>
                <p className="text-xl font-black text-slate-600 uppercase">{project.admin.client || 'Proprietário Indisponível'}</p>
              </div>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Engenheiro / Técnico</div>
                <p className="text-2xl font-black text-slate-800">{project.admin.technician || 'Eng. Responsável'}</p>
              </div>
              <div className="pt-4">
                <p className="text-xs font-black text-slate-900 tracking-tighter uppercase">{project.company.name}</p>
                <p className="text-[10px] text-slate-400 font-bold">NIF: {project.company.nif}</p>
              </div>
            </div>
          </div>
        </PageWrapper>

        {/* 01. ENQUADRAMENTO ENERGÉTICO */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">01. Enquadramento Energético</h3>
          <div className="space-y-12">
            <div className="grid grid-cols-3 gap-8">
              <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-4">
                <Zap className="mx-auto text-yellow-500" size={40} />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eletricidade</p>
                   <p className="text-3xl font-black text-slate-800">{project.energy.electricity.toFixed(3)}€/kWh</p>
                </div>
              </div>
              <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-4">
                <Flame className="mx-auto text-orange-500" size={40} />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gás Natural</p>
                   <p className="text-3xl font-black text-slate-800">{project.energy.gas.toFixed(3)}€/kWh</p>
                </div>
              </div>
              <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-4">
                <Droplets className="mx-auto text-blue-500" size={40} />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Abastecimento</p>
                   <p className="text-3xl font-black text-slate-800">{project.energy.water.toFixed(2)}€/m³</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5"><Building2 size={150} /></div>
               <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.4em] mb-10">Entidade Responsável pela Instalação</h4>
               <div className="grid grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-6">
                     <p className="text-3xl font-black uppercase leading-none tracking-tight">{project.company.name}</p>
                     <p className="text-sm text-slate-400 font-bold">NIF {project.company.nif} | Alvará {project.company.alvara}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-16 space-y-4">
                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Apoio Técnico e Comercial</p>
                     <p className="text-lg font-bold text-slate-200 leading-snug">{project.company.contacts}</p>
                  </div>
               </div>
            </div>
          </div>
        </PageWrapper>

        {/* 02. ANÁLISE CLIMÁTICA */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">02. Contexto Climático Local</h3>
          <div className="space-y-20">
            <div className="grid grid-cols-2 gap-12">
               <div className="h-80 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                     <Thermometer size={14} className="text-blue-500"/> Evolução de Temperatura Ambiente (ºC)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={climateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                      <YAxis unit="ºC" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                      <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <div className="h-80 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                     <Sun size={14} className="text-orange-500"/> Recurso Solar Disponível (kWh/m²/dia)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={climateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                      <Bar dataKey="rad" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-slate-100 p-12 rounded-[50px] border-l-[12px] border-blue-500">
               <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Parecer Climático</p>
               <p className="text-lg text-slate-600 leading-relaxed italic font-medium">
                  A análise efetuada para o distrito de <strong>{project.district}</strong> demonstra um perfil térmico favorável à utilização de aerotermia (Bombas de Calor). A radiação solar média justifica o investimento em coletores solares térmicos para suporte à carga base, permitindo uma redução substancial no consumo dos equipamentos de apoio durante os meses de maior insolação.
               </p>
            </div>
          </div>
        </PageWrapper>

        {/* 03. PERFIL DE DEMANDA TÉRMICA */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">03. Perfil de Demandas</h3>
          <div className="space-y-16">
            <div className="bg-slate-50 p-12 rounded-[50px] border border-slate-100">
              <div className="flex justify-between items-center mb-10">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Caudal Horário Consolidado (L/h)</h4>
                 <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-slate-800 uppercase shadow-sm border border-slate-200">Total Diário: {project.activities.reduce((acc, a) => acc + a.volume, 0)} Litros</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyProfile}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} unit="L" tick={{fontSize: 10}} />
                    <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               {project.activities.map(act => (
                  <div key={act.id} className="p-10 border border-slate-100 bg-white rounded-[40px] shadow-sm flex items-center justify-between transition-all">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.name}</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tighter">{act.volume} <span className="text-sm font-medium text-slate-400">L</span></p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setpoint</p>
                        <p className="text-3xl font-black text-orange-600 tracking-tighter">{act.tempRequired}ºC</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </PageWrapper>

        {/* 04. PROPOSTA DE SISTEMA PROPOSTO */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">04. Configuração da Solução</h3>
          <div className="space-y-12">
            <div className="grid grid-cols-2 gap-8">
               <div className="bg-slate-900 p-12 rounded-[50px] text-white space-y-8 shadow-2xl">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500"><Database size={28}/></div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Armazenamento Térmico</h4>
                  </div>
                  <div>
                     <p className="text-6xl font-black tracking-tighter">{project.proposedSystem.storage.volume} <span className="text-2xl font-medium text-slate-500">L</span></p>
                     <p className="text-xs text-orange-500 font-bold uppercase mt-2 tracking-widest">Capacidade Nominal de Inércia</p>
                  </div>
               </div>
               <div className="bg-orange-600 p-12 rounded-[50px] text-white space-y-8 shadow-2xl">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Thermometer size={28}/></div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100">Potência Requerida</h4>
                  </div>
                  <div>
                     <p className="text-6xl font-black tracking-tighter">{(propAnnual.demand_kWh / (365 * 1.5)).toFixed(1)} <span className="text-2xl font-medium text-orange-200">kWt</span></p>
                     <p className="text-xs text-white font-bold uppercase mt-2 tracking-widest">Carga Térmica Média de Projeto</p>
                  </div>
               </div>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pl-4">Equipamentos de Produção Térmica</h4>
               {project.proposedSystem.equipments.map((eq, i) => (
                  <div key={i} className="p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm flex items-center gap-10 hover:border-orange-200 transition-all">
                     <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-orange-600 shadow-inner">
                        {eq.type === 'HP' ? <Zap size={32}/> : eq.type === 'SOLAR' ? <Sun size={32}/> : <Flame size={32}/>}
                     </div>
                     <div className="flex-1">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{eq.name}</p>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Tecnologia de Classe {eq.type === 'HP' ? 'A+++' : 'Premium'}</p>
                     </div>
                     <div className="text-right border-l border-slate-50 pl-10">
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">{eq.power || eq.area} <span className="text-base font-medium text-slate-400">{eq.type === 'SOLAR' ? 'm²' : 'kW'}</span></p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </PageWrapper>

        {/* 05. RESULTADOS DE SIMULAÇÃO DINÂMICA */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">05. Performance Dinâmica (8760h)</h3>
          <div className="space-y-20">
            <div className="h-[450px] bg-slate-50 p-12 rounded-[50px] border border-slate-100">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Balanço Energético Mensal - Cenário Eficiente (kWh)</h4>
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="demand" name="Demanda Requerida" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={5} />
                  <Area type="monotone" dataKey="solar" name="Aporte Renovável" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
               <div className="p-12 bg-white rounded-[50px] border-b-8 border-orange-500 shadow-xl space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Produção Renovável Anual</p>
                  <p className="text-5xl font-black text-orange-600 text-center tracking-tighter">{propAnnual.solar_kWh.toFixed(0)} <span className="text-xl font-medium text-slate-300 uppercase">kWh</span></p>
               </div>
               <div className="p-12 bg-white rounded-[50px] border-b-8 border-blue-500 shadow-xl space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Redução de Emissões Est.</p>
                  <p className="text-5xl font-black text-blue-600 text-center tracking-tighter">{(energySaving * 0.2).toFixed(1)} <span className="text-xl font-medium text-slate-300 uppercase">kg CO₂</span></p>
               </div>
            </div>
          </div>
        </PageWrapper>

        {/* 06. COMPARATIVO ECONÓMICO */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">06. Viabilidade Económica</h3>
          <div className="space-y-16">
            <div className="grid grid-cols-2 gap-16 items-center">
               <div className="h-[450px] p-8 bg-slate-50 rounded-[50px] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-12 text-center">Custos Operacionais (€/ano)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Baseline', val: baseAnnual.cost}, {name: 'Proposto', val: propAnnual.cost}]}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 'black', fontSize: 12}} />
                      <Bar dataKey="val" radius={[12, 12, 0, 0]} barSize={80}>
                         <Cell fill="#ef4444" /><Cell fill="#10b981" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-10">
                  <div className="p-12 bg-green-50 rounded-[50px] border border-green-100 shadow-sm text-center">
                     <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">Economia OPEX Garantida</p>
                     <p className="text-6xl font-black text-green-700 tracking-tighter">{opexSaving.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                     <p className="text-xs font-bold text-green-600 uppercase mt-4">Redução de {((opexSaving/baseAnnual.cost)*100).toFixed(0)}% nos custos</p>
                  </div>
                  <div className="p-12 bg-slate-900 rounded-[50px] shadow-2xl text-center">
                     <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Payback Simples (PRI)</p>
                     <p className="text-7xl font-black text-white tracking-tighter">{(totalCapex / (opexSaving || 1)).toFixed(1)} <span className="text-2xl font-medium text-slate-500 uppercase">Anos</span></p>
                  </div>
               </div>
            </div>
            
            <div className="p-12 bg-white rounded-[50px] border border-slate-100 shadow-inner flex gap-8 items-center">
               <Calculator size={48} className="text-orange-600" />
               <div>
                  <p className="text-xl font-black text-slate-800">Cálculo de Rentabilidade (ROI)</p>
                  <p className="text-lg text-slate-500 font-medium italic">O investimento apresenta um retorno sobre o capital de <strong>{((opexSaving / totalCapex) * 100).toFixed(1)}% ao ano</strong>, tornando-o significativamente superior a qualquer aplicação financeira convencional de baixo risco.</p>
               </div>
            </div>
          </div>
        </PageWrapper>

        {/* 07. CONCLUSÃO E PARECER TÉCNICO */}
        <PageWrapper>
          <h3 className="text-3xl font-black text-slate-900 border-l-[12px] border-orange-500 pl-10 uppercase tracking-tighter mb-16">07. Conclusão e Parecer</h3>
          <div className="space-y-16">
            <div className="bg-orange-600 p-20 rounded-[70px] text-white shadow-2xl relative overflow-hidden">
               <ShieldCheck className="absolute -right-24 -bottom-24 text-white/10" size={450}/>
               <div className="relative z-10 space-y-8">
                  <h4 className="text-4xl font-black uppercase tracking-widest">Viabilidade Técnica Confirmada</h4>
                  <p className="text-2xl leading-relaxed font-medium opacity-90">
                    Com base na modelação horária efetuada, conclui-se que a solução proposta apresenta uma robustez térmica superior ao sistema existente, garantindo o conforto total dos utilizadores. O binómio aerotermia/solar permite atingir uma eficiência sazonal extremamente elevada, protegendo o imóvel contra a volatilidade dos preços da energia e valorizando o património imobiliário através de uma melhor classe energética.
                  </p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-32 pt-32">
               <div className="space-y-8 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-2 border-slate-50 pb-6">Engenheiro Responsável</p>
                  <div className="h-40 w-full bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[40px] flex items-center justify-center">
                     <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">Espaço para Assinatura Digital</p>
                  </div>
                  <p className="text-2xl font-black text-slate-800 uppercase tracking-tight">{project.admin.technician}</p>
               </div>
               <div className="space-y-8 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-2 border-slate-50 pb-6">Validação da Empresa</p>
                  <div className="w-56 h-56 border-[12px] border-slate-50 rounded-full mx-auto flex items-center justify-center shadow-inner">
                     <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em] rotate-12">Selo de Qualidade <br/> {project.company.name.split(' ')[0]}</p>
                  </div>
               </div>
            </div>
          </div>
        </PageWrapper>

        {/* CONTRA-CAPA DE IMPACTO */}
        <div className="bg-slate-900 flex flex-col items-center justify-center p-24 text-center space-y-24 page-break mx-auto rounded-[60px] print:rounded-none" style={{ width: '21cm', minHeight: '29.7cm' }}>
          <div className="w-56 h-56 bg-orange-600 rounded-[64px] flex items-center justify-center text-white text-9xl font-black shadow-2xl ring-[16px] ring-white/5 animate-pulse">K</div>
          <div className="space-y-10">
            <h3 className="text-7xl font-black text-white tracking-tighter">K-AQSPRO</h3>
            <div className="h-2 w-48 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-slate-500 font-black uppercase tracking-[0.8em] text-lg">Excellence in Thermal Engineering</p>
          </div>
          <div className="pt-40 text-white/20 border-t border-white/5 w-full max-w-lg text-[11px] font-black uppercase tracking-widest leading-loose">
             Documento gerado eletronicamente por K-AQSPRO Suite Pro <br/>
             Todos os direitos reservados • {new Date().getFullYear()} <br/>
             {project.company.name} • {project.id}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportPage;
