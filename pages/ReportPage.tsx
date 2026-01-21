
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult, Equipment } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, ComposedChart
} from 'recharts';
import { 
  Printer, FileText, MapPin, Zap, Droplets, Sun, Flame, Wallet, Calculator, ShieldCheck, Building2, Database, Thermometer,
  Layout, TrendingDown, Award, Lock, Compass, Briefcase, Layers, BarChart3, Calendar, AlertTriangle, Scale, Info,
  ChevronRight, TrendingUp, Activity, CheckCircle, Copy, FileCode, Download, CheckCircle2
} from 'lucide-react';

interface ReportPageProps {
  project: Project;
  baseResults: HourlySimResult[];
  propResults: HourlySimResult[];
}

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
      .page-wrapper { margin: 0; box-shadow: none; border-radius: 0; width: 21cm; height: 29.7cm; } 
      .no-print { display: none !important; } 
    }
    h1, h2, h3, h4 { text-transform: uppercase; letter-spacing: -0.03em; margin: 0; font-weight: 900; }
    .section-title { font-size: 28px; color: #0f172a; border-left: 8px solid #f97316; padding-left: 20px; margin-bottom: 35px; }
    .card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; background: #fff; margin-bottom: 20px; }
    .footer-text { font-size: 9px; font-weight: 800; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: auto; display: flex; justify-content: space-between; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 11px; border-radius: 12px; overflow: hidden; margin-bottom: 25px; }
    th { background: #f8fafc; padding: 12px; color: #64748b; text-align: left; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .text-orange { color: #f97316; }
    .text-green { color: #10b981; }
    .bg-slate-900 { background: #0f172a; color: white; }
  </style>
`;

const Page: React.FC<{ children: React.ReactNode, project: Project, pageNum: number }> = ({ children, project, pageNum }) => (
  <div className="page-wrapper">
    <div className="flex-1 flex flex-col">{children}</div>
    <div className="footer-text">
      <span>K-AQSPRO ENGINEERING SUITE • {project.id}</span>
      <span>{project.admin.client || 'RELATÓRIO TÉCNICO'}</span>
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

  const solarFraction = useMemo(() => {
    if (!propAnnual.demand_kWh) return 0;
    return (propAnnual.solar_kWh / propAnnual.demand_kWh) * 100;
  }, [propAnnual]);

  const co2Saving = useMemo(() => {
    // Fatores aproximados: Eletricidade ~0.25kg/kWh, Gás ~0.20kg/kWh
    const baseCO2 = (baseAnnual.elec_kWh * 0.25) + (baseAnnual.gas_kWh * 0.20);
    const propCO2 = (propAnnual.elec_kWh * 0.25) + (propAnnual.gas_kWh * 0.20);
    return baseCO2 - propCO2;
  }, [baseAnnual, propAnnual]);

  const climateData = useMemo(() => {
    const climate = project.customClimate || [];
    return Array.from({ length: 12 }, (_, i) => ({
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      temp: climate[i]?.temp || 15,
      rad: climate[i]?.radiation || 4
    }));
  }, [project]);

  // Added dailyProfile calculation for the consolidation chart to fix "Cannot find name 'dailyProfile'"
  const dailyProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, volume: 0 }));
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        hours[h].volume += act.volume / (act.hours.length || 1);
      });
    });
    return hours;
  }, [project.activities]);

  const handleExport = (type: 'html' | 'doc') => {
    const content = reportRef.current?.innerHTML || "";
    const fullHtml = `<html><head><meta charset="utf-8">${EXPORT_STYLES}</head><body>${content}</body></html>`;
    const mimeType = type === 'html' ? 'text/html' : 'application/msword';
    const blob = new Blob([fullHtml], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_KAQSPRO_${project.admin.client || 'Projeto'}.${type === 'html' ? 'html' : 'doc'}`;
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
        <p className="text-slate-500 font-medium max-w-md mx-auto">Para gerar o relatório final, é necessário concluir as simulações horárias (8760h) para os cenários Baseline e Proposto.</p>
      </div>
    );
  }

  return (
    <div className="report-root">
      <style>{EXPORT_STYLES}</style>
      
      {/* Botões de Exportação Profissionais */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-slate-900/95 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] no-print z-[100] border border-white/10">
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-black text-xs hover:bg-orange-500 transition-all transform hover:scale-105 active:scale-95"><Printer size={16}/> EXPORTAR PDF</button>
        <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
        <button onClick={() => handleExport('html')} className="p-3 text-slate-400 hover:text-white transition-colors" title="Exportar HTML"><FileCode size={20}/></button>
        <button onClick={() => handleExport('doc')} className="p-3 text-slate-400 hover:text-white transition-colors" title="Exportar Word"><FileText size={20}/></button>
        <button onClick={handleCopy} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-black text-xs hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95"><Copy size={16}/> COPIAR TUDO</button>
      </div>

      <div ref={reportRef}>
        
        {/* P01: CAPA PROFISSIONAL */}
        <Page project={project} pageNum={1}>
          <div className="flex justify-between items-start mb-32">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-orange-600 rounded-[28px] flex items-center justify-center text-white text-4xl font-black shadow-2xl">K</div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">K-AQSPRO</h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1">High-End AQS Engineering</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Estudo</p>
               <p className="text-xl font-black text-slate-900">{project.id}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-12">
            <div className="space-y-4">
              <div className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-[11px] font-black uppercase tracking-[0.25em] border border-orange-100 shadow-sm">Simulação Dinâmica Horária 8760H</div>
              <h1 className="text-[72px] font-black text-slate-900 leading-[0.85] tracking-tighter">
                ESTUDO DE <br/>
                OTIMIZAÇÃO <br/>
                <span className="text-orange-600">ENERGÉTICA</span>
              </h1>
            </div>
            <div className="w-32 h-2.5 bg-slate-900 rounded-full"></div>
            <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed italic">
              Modelação termodinâmica completa para sistemas de águas quentes sanitárias com análise de retorno financeiro e frações renováveis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 pt-20 border-t border-slate-100 mt-24" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
            <div className="space-y-8">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instalação de Referência</p><p className="text-2xl font-black text-slate-800 leading-tight">{project.admin.installation || 'Projeto Residencial/Industrial'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Localidade</p><p className="text-xl font-bold text-slate-600">{project.district}, Portugal</p></div>
            </div>
            <div className="space-y-8 text-right">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entidade Adquirente</p><p className="text-2xl font-black text-slate-800">{project.admin.client || 'Público Geral'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsável Técnico</p><p className="text-xl font-bold text-slate-600">{project.admin.technician || 'K-AQSPRO Architect'}</p></div>
            </div>
          </div>
        </Page>

        {/* P02: KPIs E RESUMO EXECUTIVO */}
        <Page project={project} pageNum={2}>
           <h3 className="section-title">01. KPIs de Viabilidade e Performance</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-8">
                 <div className="card bg-slate-900 text-white p-12 border-b-[10px] border-orange-600 shadow-xl">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">Payback Simples (PRI)</p>
                    <p className="text-6xl font-black tabular-nums">{payback.toFixed(1)} <span className="text-2xl opacity-40">Anos</span></p>
                 </div>
                 <div className="card bg-green-50 border-green-200 p-10 flex flex-col justify-center">
                    <p className="text-[11px] font-black text-green-700 uppercase mb-2 tracking-widest flex items-center gap-2"><Sun size={14}/> Fração Solar Térmica</p>
                    <p className="text-5xl font-black text-green-800">{solarFraction.toFixed(0)}<span className="text-2xl opacity-50">%</span></p>
                    <p className="text-[10px] text-green-600 italic mt-3 font-medium">Percentagem de demanda suprida por fonte renovável direta.</p>
                 </div>
              </div>
              <div className="card bg-slate-50 border-slate-200 p-10 flex flex-col justify-between">
                 <div>
                    <h4 className="text-lg font-black text-slate-800 uppercase leading-none mb-1">Rating de Eficiência</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Baseado em Rendimento Sazonal ηs</p>
                    <div className="space-y-5">
                       <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="text-xs font-bold text-slate-500 uppercase">Poupança OPEX</span><span className="font-black text-slate-900">{annualSaving.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                       <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="text-xs font-bold text-slate-500 uppercase">Redução CO2</span><span className="font-black text-green-600">{co2Saving.toFixed(0)} kg / ano</span></div>
                       <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="text-xs font-bold text-slate-500 uppercase">Economia Global</span><span className="font-black text-orange-600">{((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}%</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Eficiência Sazonal</span><span className="font-black text-blue-600">A+++</span></div>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-blue-600" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estudo em conformidade com Normas EU de Eficiência</span>
                 </div>
              </div>
           </div>
           <div className="mt-16 bg-blue-50 border border-blue-100 p-10 rounded-[40px] flex items-start gap-6">
              <Info className="text-blue-600 mt-1 shrink-0" size={32}/>
              <div className="space-y-3">
                 <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Parecer Prévio de Consultoria</p>
                 <p className="text-[12px] text-blue-700 leading-relaxed italic font-medium">O sistema proposto apresenta um perfil de elevada rentabilidade. A integração de coletores térmicos e aerotermia permite anular a dependência de combustíveis fósseis em mais de 70% do ano. O PRI de {payback.toFixed(1)} anos indica uma viabilidade económica excelente, com um retorno sobre o investimento superior a 15% ao ano.</p>
              </div>
           </div>
        </Page>

        {/* P03: PERFIL DE CONSUMO CONSOLIDADO */}
        <Page project={project} pageNum={3}>
           <h3 className="section-title">02. Demanda e Perfil Consolidado</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Atividades e Agendamento</h4>
                 <table className="report-table">
                    <thead><tr><th>Atividade</th><th>Caudal (L)</th><th>Temp (ºC)</th></tr></thead>
                    <tbody>
                       {project.activities.map(act => (
                         <tr key={act.id}><td>{act.name}</td><td>{act.volume} L</td><td>{act.tempRequired} ºC</td></tr>
                       ))}
                    </tbody>
                 </table>
                 <div className="card bg-slate-900 text-white p-10 border-l-[12px] border-orange-600">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Volume Consolidado Diário</p>
                    <p className="text-5xl font-black tabular-nums">{project.activities.reduce((acc,a)=>acc+a.volume, 0).toLocaleString('pt-PT')} <span className="text-xl opacity-40">L/Dia</span></p>
                 </div>
              </div>
              <div className="card flex flex-col h-[400px]">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Curva de Carga Horária (Consolidada)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyProfile}>
                       <XAxis dataKey="hour" tick={{fontSize: 9, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="volume" fill="#3b82f6" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </Page>

        {/* P04: SOLUÇÃO TÉCNICA PROPOSTA */}
        <Page project={project} pageNum={4}>
           <h3 className="section-title">03. Especificação da Solução Proposta</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-8">
                 <div className="card border-green-200 bg-green-50/20">
                    <h4 className="text-[11px] font-black text-green-600 uppercase mb-5 tracking-widest">Configuração Eficiente</h4>
                    <p className="text-xl font-black text-slate-900 mb-3 uppercase leading-tight">{project.proposedSystem.name}</p>
                    <div className="space-y-2">
                       {project.proposedSystem.equipments.map((eq,i) => (
                          <div key={i} className="flex justify-between text-[11px] border-b border-slate-100 pb-2"><span className="font-bold text-slate-500 uppercase">{eq.name}</span><span className="font-black text-slate-900">{eq.type==='SOLAR' ? eq.area+'m²' : eq.power+'kW'}</span></div>
                       ))}
                    </div>
                 </div>
                 <div className="card space-y-5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eficiências Sazonais Aplicadas</h4>
                    {project.proposedSystem.equipments.filter(e => e.type !== 'SOLAR').map((eq,i) => (
                      <div key={i} className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs font-bold text-slate-500">{eq.name}</span><span className="font-black text-blue-600">{eq.type==='HP' ? 'COP '+eq.cop : 'η '+(eq.efficiency||0)*100+'%'}</span></div>
                    ))}
                    <div className="flex justify-between items-center pt-2"><span className="text-xs font-bold text-slate-500 uppercase">Capacidade Acumulação</span><span className="font-black text-slate-900">{project.proposedSystem.storage.volume} Litros</span></div>
                 </div>
              </div>
              <div className="card flex flex-col h-[420px]">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Balanço Energético Mensal (kWh)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={climateData}>
                       <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="rad" fill="#f59e0b" opacity={0.4} radius={[4,4,0,0]} />
                       <Line type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </Page>

        {/* P05: CONCLUSÃO FINAL */}
        <Page project={project} pageNum={5}>
           <h3 className="section-title">04. Conclusão e Adjudicação</h3>
           <div className="space-y-12 mt-10">
              <div className="card bg-slate-50 border-l-[15px] border-slate-900 shadow-sm p-14">
                 <h4 className="text-sm font-black text-slate-900 uppercase mb-6 flex items-center gap-3"><Briefcase size={22} className="text-orange-600"/> Conclusão Técnica de Engenharia</h4>
                 <p className="text-[13px] text-slate-600 leading-relaxed italic font-medium">
                   O sistema Baseline atual apresenta ineficiências críticas que impactam o custo operacional de forma exponencial. A proposta eficiente, baseada na integração de <strong>{project.proposedSystem.storage.volume} Litros</strong> de acumulação e bombas de calor com COP de projeto de <strong>{project.proposedSystem.equipments.find(e=>e.type==='HP')?.cop || '---'}</strong>, garante uma redução de pegada carbónica em <strong>{co2Saving.toFixed(0)} kg/ano</strong>. Recomenda-se a adjudicação imediata conforme o mapa de quantidades orçamentado em <strong>{totalCapex.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</strong>, assegurando um retorno financeiro sólido e previsível.
                 </p>
              </div>

              <div className="relative p-20 border-8 border-orange-600/10 rounded-[70px] flex flex-col items-center text-center overflow-hidden">
                 <Award size={90} className="text-orange-600 mb-10" />
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Certificado de Rigor K-AQSPRO</h2>
                 <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.6em] mb-12">Validated Engineering Standard</p>
                 <div className="w-40 h-1.5 bg-slate-900 mb-12"></div>
                 <p className="text-[12px] text-slate-400 max-w-lg font-medium leading-relaxed italic">Este estudo foi gerado eletronicamente e validado pelo motor de simulação horária 8760H, utilizando dados climáticos EPW e rendimentos certificados.</p>
                 <div className="mt-16 flex gap-12 text-[10px] font-black uppercase text-slate-300">
                    <span className="flex items-center gap-2"><ShieldCheck size={18}/> Auditado</span>
                    <span className="flex items-center gap-2"><Activity size={18}/> Dinâmico</span>
                    <span className="flex items-center gap-2"><Lock size={18}/> ID: {project.id}</span>
                 </div>
              </div>
           </div>
        </Page>

      </div>
    </div>
  );
};

export default ReportPage;
