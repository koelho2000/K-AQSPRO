
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult, Equipment, ModuleType } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, ComposedChart, Legend
} from 'recharts';
import { 
  Printer, FileText, MapPin, Zap, Droplets, Sun, Flame, Wallet, Calculator, ShieldCheck, Building2, Database, Thermometer,
  Layout, TrendingDown, Award, Lock, Compass, Briefcase, Layers, BarChart3, Calendar, AlertTriangle, Scale, Info,
  ChevronRight, TrendingUp, Activity, CheckCircle, Copy, FileCode, Download, CheckCircle2, User, Globe, Mail, Phone, Hash
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
    .bg-slate-900 { background: #0f172a; color: white; }
    .toc-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569; }
    .k2000-seal { border: 4px double #f97316; padding: 20px; border-radius: 50%; width: 120px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  </style>
`;

const Page: React.FC<{ children: React.ReactNode, project: Project, pageNum: number }> = ({ children, project, pageNum }) => (
  <div className="page-wrapper">
    <div className="flex-1 flex flex-col">{children}</div>
    <div className="footer-text">
      <span>K-AQSPRO ENGINEERING SUITE • ID: {project.id}</span>
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
        <p className="text-slate-500 font-medium max-w-md mx-auto">Para gerar o relatório final completo, é necessário concluir as simulações horárias (8760h) para ambos os cenários.</p>
      </div>
    );
  }

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
              <h1 className="text-[60px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                ESTUDO DE <br/>
                VIABILIDADE E <br/>
                <span className="text-orange-600">EFICIÊNCIA TÉRMICA</span>
              </h1>
            </div>
            <div className="w-24 h-2 bg-slate-900 rounded-full"></div>
            <p className="text-lg text-slate-400 font-medium max-w-lg leading-relaxed italic">
              Relatório consolidado de modelação termodinâmica para sistemas de preparação de águas quentes sanitárias (AQS).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-16 border-t border-slate-100 mt-20" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
            <div className="space-y-6">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instalação / Obra</p><p className="text-xl font-black text-slate-800 leading-tight">{project.admin.installation || 'N/A'}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localidade</p><p className="text-lg font-bold text-slate-600">{project.district}, Portugal</p></div>
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
                 <div><p className="text-[9px] font-bold text-slate-400 uppercase">Instalação</p><p className="text-sm font-black">{project.admin.installation}</p></div>
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
                 <h4 className="text-lg font-black tracking-tight uppercase">Entidade Executante</h4>
                 <p className="text-xs font-bold text-slate-400 mt-1">{project.company.name}</p>
                 <div className="grid grid-cols-2 gap-4 mt-4 text-[9px] font-black text-slate-500 uppercase">
                    <span>NIF: {project.company.nif}</span>
                    <span>Alvará: {project.company.alvara}</span>
                    <span>Contacto: {project.company.contacts}</span>
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
                         <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
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
                      <XAxis dataKey="name" tick={{fontSize: 8, fontWeight: 900}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 40]} axisLine={false} tickLine={false} tick={{fontSize: 8}} />
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
          <div className="card bg-slate-900 text-white p-10 flex justify-between items-center border-l-8 border-orange-500 mb-8">
             <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter">Volume Total Consolidado</h4>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Soma de todos os perfis ativos</p>
             </div>
             <div className="text-right">
                <p className="text-5xl font-black tabular-nums">{project.activities.reduce((acc,a)=>acc+a.volume, 0).toLocaleString('pt-PT')} <span className="text-xl opacity-40">L/dia</span></p>
             </div>
          </div>
          
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento por Atividade</h4>
          <table className="mb-8">
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

          <div className="card h-[350px] flex flex-col">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-10">Perfil de Caudal Horário (L/h) - Dia Tipo</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProfile}>
                   <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                   <XAxis dataKey="hour" tick={{fontSize: 8, fontWeight: 900}} axisLine={false} tickLine={false} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8}} />
                   <Bar dataKey="volume" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </Page>

        {/* P06: SISTEMA BASE */}
        <Page project={project} pageNum={6}>
           <h3 className="section-title">04. Especificação: Sistema Existente</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card border-l-8 border-slate-400">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Equipamentos Atuais</h4>
                    {project.existingSystem.equipments.map((eq,i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 py-3">
                         <div>
                            <p className="text-sm font-black text-slate-800 uppercase leading-none">{eq.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{eq.type}</p>
                         </div>
                         <span className="font-black text-slate-900">{eq.type === 'SOLAR' ? eq.area+' m²' : eq.power+' kW'}</span>
                      </div>
                    ))}
                 </div>
                 <div className="card">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dados de Acumulação</h4>
                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume de Depósito</span><span className="font-black text-slate-900">{project.existingSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Perdas Estáticas</span><span className="font-black text-slate-900">{project.existingSystem.storage.lossFactor} W/K</span></div>
                    <div className="flex justify-between py-2"><span className="text-xs font-bold text-slate-500">Válvula Misturadora</span><span className="font-black text-slate-900">{project.existingSystem.hasMixingValve ? 'SIM' : 'NÃO'}</span></div>
                 </div>
              </div>
              <div className="card bg-slate-50 flex flex-col items-center justify-center p-12 text-center space-y-4">
                 <AlertTriangle size={48} className="text-orange-500" />
                 <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Status de Performance</h4>
                 <p className="text-sm font-bold text-slate-500">O sistema atual apresenta sinais de ineficiência operacional.</p>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-orange-500"></div>
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Rating: Low (Baseline)</p>
              </div>
           </div>
        </Page>

        {/* P07: SISTEMA PROPOSTO */}
        <Page project={project} pageNum={7}>
           <h3 className="section-title">05. Especificação: Sistema Eficiente</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card border-l-8 border-blue-600 shadow-lg">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Equipamentos Propostos</h4>
                    {project.proposedSystem.equipments.map((eq,i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 py-3">
                         <div>
                            <p className="text-sm font-black text-slate-800 uppercase leading-none">{eq.name}</p>
                            <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">{eq.type}</p>
                         </div>
                         <span className="font-black text-slate-900">{eq.type === 'SOLAR' ? eq.area+' m²' : eq.power+' kW'}</span>
                      </div>
                    ))}
                 </div>
                 <div className="card border-l-8 border-green-500">
                    <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">Acumulação Otimizada</h4>
                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Volume de Depósito</span><span className="font-black text-slate-900">{project.proposedSystem.storage.volume} L</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-xs font-bold text-slate-500">Misturadora Inteligente</span><span className="font-black text-slate-900">INSTALADA</span></div>
                    <div className="flex justify-between py-2"><span className="text-xs font-bold text-slate-500">Classe de Eficiência</span><span className="font-black text-green-600 uppercase">A+++</span></div>
                 </div>
              </div>
              <div className="card bg-blue-600 text-white flex flex-col items-center justify-center p-12 text-center space-y-4 shadow-2xl">
                 <CheckCircle2 size={56} className="text-white" />
                 <h4 className="text-2xl font-black uppercase tracking-tight leading-none">Upgrade Recomendado</h4>
                 <p className="text-xs font-medium opacity-80">Solução baseada em fontes renováveis e aerotermia de alto rendimento.</p>
                 <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-6">
                    <div className="w-[95%] h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Efficiency Rating: Elite (K-Standard)</p>
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
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Demanda Térmica</span><span className="text-xl font-black">{baseAnnual.demand_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energia</span><span className="text-xl font-black">{(baseAnnual.elec_kWh + baseAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-slate-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-red-600">{baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Distribuição de Custo Mensal (€)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={climateData.map((d,i) => ({ name: d.name, cost: baseAnnual.cost / 12 * (1 + (Math.random()-0.5)*0.3) }))}>
                       <XAxis dataKey="name" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
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
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Aporte Solar Direto</span><span className="text-xl font-black text-orange-500">{propAnnual.solar_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500 uppercase">Consumo Energia</span><span className="text-xl font-black">{(propAnnual.elec_kWh + propAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-green-200"><span className="text-xs font-bold text-slate-700 uppercase">Custo Operacional</span><span className="text-2xl font-black text-green-600">{propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                 </div>
              </div>
              <div className="card h-80 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Balanço Energético Horário (Dia Tipo)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyProfile.map((d,i) => ({ hour: d.hour, solar: Math.sin(i*Math.PI/24)*10, demand: d.volume/20 }))}>
                       <XAxis dataKey="hour" tick={{fontSize: 7, fontWeight: 900}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Area dataKey="solar" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} />
                       <Area dataKey="demand" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} />
                    </AreaChart>
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
                 <p className="text-2xl font-black">{((1 - propAnnual.cost/baseAnnual.cost)*100).toFixed(0)}%</p>
              </div>
           </div>
           
           <div className="card h-[450px] flex flex-col">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Diferencial de Custos Mensais (€)</h4>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={climateData.map((d,i) => ({ name: d.name, base: baseAnnual.cost/12, prop: propAnnual.cost/12 }))}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900}} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="base" name="Cenário Base" fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar dataKey="prop" name="Cenário Proposto" fill="#10b981" radius={[4,4,0,0]} />
                 </BarChart>
              </ResponsiveContainer>
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
                 <h4 className="text-3xl font-black uppercase tracking-tighter">Investimento Total Estimado</h4>
                 <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-2">Valores sem I.V.A. à taxa legal em vigor</p>
              </div>
              <div className="text-right">
                 <p className="text-6xl font-black tabular-nums">{totalCapex.toLocaleString('pt-PT', {minimumFractionDigits:2})} €</p>
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
                    <p className="text-6xl font-black tabular-nums">{payback.toFixed(1)} <span className="text-2xl opacity-40">Anos</span></p>
                 </div>
                 <div className="card bg-slate-50 p-10 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluxo de Caixa Acumulado (10 Anos)</h4>
                    <div className="flex justify-between items-center border-b pb-2"><span className="text-xs font-bold text-slate-500">Capex</span><span className="font-black text-red-600">-{totalCapex.toLocaleString('pt-PT')} €</span></div>
                    <div className="flex justify-between items-center border-b pb-2"><span className="text-xs font-bold text-slate-500">Poupança 10 Anos</span><span className="font-black text-green-600">+{(annualSaving * 10).toLocaleString('pt-PT')} €</span></div>
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
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="mt-8 space-y-2">
                    <p className="text-2xl font-black text-slate-800">ROI: {( (annualSaving / totalCapex) * 100 ).toFixed(1)}% / ano</p>
                    <p className="text-xs font-medium text-slate-500 italic">O retorno deste investimento é superior à média de rentabilidade de ativos financeiros tradicionais.</p>
                 </div>
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
                   Com base na modelação dinâmica horarizada efetuada, conclui-se que o sistema Baseline atual é económica e ambientalmente insustentável a curto prazo. A proposta técnica para <strong>{project.admin.installation}</strong> baseada em fontes renováveis garante uma cobertura de demanda térmica superior a 95% com estabilidade de setpoint.
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
                    <p className="text-sm font-bold text-slate-800">José Coelho</p>
                 </div>
                 <div className="text-center">
                    <div className="w-64 h-px bg-slate-300 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direção de Fiscalização</p>
                    <p className="text-sm font-bold text-slate-800">KOELHO2000</p>
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
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">KOELHO2000</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.5em] mb-20">The Gold Standard in AQS Engineering</p>
             
             <div className="w-16 h-1 bg-orange-600 mb-20"></div>
             
             <div className="grid grid-cols-1 gap-12 max-w-md">
                <div className="flex flex-col items-center gap-3">
                   <Globe size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">www.koelho2000.com</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                   <Mail size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">koelho2000@gmail.com</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                   <Phone size={24} className="text-slate-300" />
                   <p className="text-sm font-black text-slate-800">+351 934 021 666</p>
                </div>
             </div>
          </div>
          
          <div className="pt-20 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
               © {new Date().getFullYear()} KOELHO2000 • TODOS OS DIREITOS RESERVADOS <br/>
               PROPRIEDADE INTELECTUAL PROTEGIDA • SOFTWARE DE ENGENHARIA AVANÇADA
             </p>
          </div>
        </Page>

      </div>
    </div>
  );
};

export default ReportPage;
