
import React, { useRef, useMemo } from 'react';
import { Project, HourlySimResult, Equipment } from '../types';
import { aggregateResults } from '../services/simulationEngine';
// Added ComposedChart to imports
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, ComposedChart
} from 'recharts';
// Added CheckCircle to imports
import { 
  Printer, 
  FileText, 
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
  Layout,
  TrendingDown,
  Award,
  Lock,
  Compass,
  Briefcase,
  Layers,
  BarChart3,
  Calendar,
  AlertTriangle,
  Scale,
  Info,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react';

interface ReportPageProps {
  project: Project;
  baseResults: HourlySimResult[];
  propResults: HourlySimResult[];
}

const EXPORT_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; }
    .page-wrapper { 
      background: white; 
      width: 21cm; 
      min-height: 29.7cm; 
      margin: 40px auto; 
      padding: 1.5cm 1.8cm; 
      box-shadow: 0 0 50px rgba(0,0,0,0.08); 
      box-sizing: border-box; 
      display: flex; 
      flex-direction: column;
      position: relative;
    }
    @media print { 
      body { background: white !important; }
      .page-wrapper { margin: 0; box-shadow: none; border-radius: 0; width: 21cm; height: 29.7cm; page-break-after: always; } 
      .no-print { display: none !important; } 
    }
    h1, h2, h3, h4 { text-transform: uppercase; tracking: -0.03em; margin: 0; }
    .section-title { font-size: 28px; font-weight: 900; color: #0f172a; border-left: 8px solid #f97316; padding-left: 20px; margin-bottom: 35px; }
    .card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; background: #fff; }
    .footer-text { font-size: 9px; font-weight: 800; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: auto; display: flex; justify-content: space-between; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 11px; border-radius: 12px; overflow: hidden; }
    th { background: #f8fafc; padding: 12px; font-weight: 900; color: #64748b; text-align: left; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
  </style>
`;

const Page: React.FC<{ children: React.ReactNode, project: Project, pageNum: number }> = ({ children, project, pageNum }) => (
  <div className="page-wrapper">
    <div className="flex-1 flex flex-col">
      {children}
    </div>
    <div className="footer-text">
      <span>K-AQSPRO ENGINEERING SUITE • {project.id}</span>
      <span>{project.admin.client || 'RELATÓRIO DE EFICIÊNCIA'}</span>
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

  const climateData = useMemo(() => {
    const climate = project.customClimate || [];
    return Array.from({ length: 12 }, (_, i) => ({
      name: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][i],
      temp: climate[i]?.temp || 15,
      rad: climate[i]?.radiation || 4
    }));
  }, [project]);

  const dailyProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, volume: 0 }));
    project.activities.forEach(act => {
      act.hours.forEach(h => {
        hours[h].volume += act.volume / (act.hours.length || 1);
      });
    });
    return hours;
  }, [project.activities]);

  const hasData = baseResults.length > 0 && propResults.length > 0;

  if (!hasData) {
    return (
      <div className="p-20 text-center space-y-6">
        <AlertTriangle size={64} className="mx-auto text-orange-500 animate-bounce" />
        <h2 className="text-3xl font-black text-slate-800 uppercase">Simulação em Falta</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Para gerar este documento técnico, deve primeiro executar as simulações horárias de ambos os cenários (Baseline e Proposta).</p>
      </div>
    );
  }

  return (
    <div className="report-root">
      <style>{EXPORT_STYLES}</style>
      
      <div className="fixed bottom-8 right-8 flex gap-4 no-print z-[100]">
        <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-black shadow-2xl hover:bg-orange-600 transition-all">
          <Printer size={20}/> IMPRIMIR RELATÓRIO PDF
        </button>
      </div>

      <div ref={reportRef}>
        
        {/* P01: CAPA */}
        <Page project={project} pageNum={1}>
          <div className="flex justify-between items-start mb-24">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl">K</div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter">K-AQSPRO</h1>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em]">Advanced AQS Engineering</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Relatório N.º</p>
               <p className="text-lg font-black text-slate-900">{project.id}</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100">Consultoria Energética Especializada</div>
              <h1 className="text-[64px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                ESTUDO DE <br/>
                VIABILIDADE <br/>
                <span className="text-orange-600">AQS 8760H</span>
              </h1>
            </div>
            <div className="w-24 h-2 bg-slate-900 rounded-full"></div>
            <p className="text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
              Modelação termodinâmica horária e análise de retorno financeiro para otimização de sistemas de Águas Quentes Sanitárias.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-16 border-t border-slate-100 mt-20" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
            <div className="space-y-6">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instalação / Obra</p><p className="text-xl font-black text-slate-800 leading-tight">{project.admin.installation || 'Projecto de Engenharia'}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p><p className="text-lg font-black text-slate-600">{project.district}, Portugal</p></div>
            </div>
            <div className="space-y-6 text-right">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p><p className="text-xl font-black text-slate-800">{project.admin.client || 'Público Geral'}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável Técnico</p><p className="text-lg font-black text-slate-600">{project.admin.technician || 'Engenharia K2000'}</p></div>
            </div>
          </div>
        </Page>

        {/* P02: ÍNDICE */}
        <Page project={project} pageNum={2}>
           <h3 className="section-title">Índice Geral do Estudo</h3>
           <div className="mt-10 space-y-5">
              {[
                { id: '01', title: 'Enquadramento Administrativo e Tarifário', page: 3 },
                { id: '02', title: 'Análise Climática Local e Solar', page: 4 },
                { id: '03', title: 'Perfil de Consumo e Demanda Térmica', page: 5 },
                { id: '04', title: 'Cenário Baseline (Sistema Existente)', page: 6 },
                { id: '05', title: 'Proposta de Alta Eficiência (Sistema Proposto)', page: 7 },
                { id: '06', title: 'Análise de Investimento e Viabilidade', page: 8 },
                { id: '07', title: 'Mapa de Quantidades e Orçamento', page: 9 },
                { id: '08', title: 'Conclusão Técnica e Certificação', page: 10 }
              ].map(item => (
                <div key={item.id} className="flex items-center group cursor-default">
                  <span className="text-orange-600 font-black text-lg w-12">{item.id}</span>
                  <span className="flex-1 text-slate-800 font-black uppercase tracking-tight text-sm border-b border-slate-50 pb-2 group-hover:text-orange-600 transition-colors">{item.title}</span>
                  <span className="text-slate-400 font-black text-xs ml-4">PÁG. {item.page}</span>
                </div>
              ))}
           </div>
           <div className="mt-auto bg-slate-900 p-10 rounded-[30px] text-white flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500"><Compass size={28}/></div>
              <div>
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Nota Metodológica</h4>
                <p className="text-[10px] opacity-70 leading-relaxed italic">Este estudo baseia-se em simulações dinâmicas de 8.760 horas por ano, utilizando coeficientes de transferência térmica reais, rendimentos sazonais certificados e perfis de radiação solar específicos da localidade selecionada.</p>
              </div>
           </div>
        </Page>

        {/* P03: ADMIN & TARIFF (01) */}
        <Page project={project} pageNum={3}>
           <h3 className="section-title">01. Enquadramento Administrativo</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card bg-slate-50">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Tarifário Energético Aplicado</h4>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Eletricidade (Simples/Média)</span><span className="font-black text-slate-900">{project.energy.electricity.toFixed(4)} €/kWh</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Gás Natural / GLP</span><span className="font-black text-slate-900">{project.energy.gas.toFixed(4)} €/kWh</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Água de Abastecimento</span><span className="font-black text-slate-900">{project.energy.water.toFixed(2)} €/m³</span></div>
                    </div>
                 </div>
                 <div className="card">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Intervenientes</h4>
                    <p className="text-sm font-black text-slate-900">{project.company.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">NIF: {project.company.nif} | Alvará: {project.company.alvara}</p>
                    <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">{project.company.contacts}</p>
                 </div>
              </div>
              <div className="card bg-slate-900 text-white p-10 flex flex-col justify-center text-center">
                 <Building2 size={40} className="text-orange-500 mx-auto mb-6" />
                 <h4 className="text-lg font-black uppercase mb-2">Baseline Técnica</h4>
                 <p className="text-[10px] opacity-50 uppercase tracking-widest mb-6">Estado Atual Identificado</p>
                 <div className="space-y-2 text-[11px] font-bold text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Acumulação</span><span>{project.existingSystem.storage.volume} L</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Apoio Térmico</span><span>{project.existingSystem.equipments.reduce((acc,e)=>acc+(e.power||0),0).toFixed(1)} kW</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Tecnologia Principal</span><span>{project.existingSystem.equipments[0]?.type}</span></div>
                 </div>
              </div>
           </div>
        </Page>

        {/* P04: CLIMATE (02) */}
        <Page project={project} pageNum={4}>
           <h3 className="section-title">02. Análise Climática e Recurso Solar</h3>
           <p className="text-xs text-slate-500 italic mb-10 leading-relaxed">Considerando a localidade de <strong>{project.district}</strong>, foram mapeados os dados médios mensais para determinar as necessidades térmicas e o potencial de energia renovável térmica.</p>
           <div className="grid grid-cols-2 gap-8 h-[320px]" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="card bg-slate-50 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Thermometer size={14} className="text-blue-500"/> Temperatura Ambiente Média (ºC)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={climateData}>
                       <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{fontSize: 8, fontWeight: 800}} axisLine={false} tickLine={false} />
                       <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                       <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="card bg-slate-50 flex flex-col">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Sun size={14} className="text-orange-500"/> Radiação Solar Directa (kWh/m²/dia)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={climateData}>
                       <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{fontSize: 8, fontWeight: 800}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="rad" fill="#f59e0b" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-12 bg-blue-50 p-8 rounded-[30px] border border-blue-100 flex items-start gap-4">
              <Info className="text-blue-600 mt-1 shrink-0" size={24}/>
              <div className="space-y-2">
                 <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Parecer do Recurso Térmico</p>
                 <p className="text-[10px] text-blue-700 leading-relaxed italic">A análise climática revela uma temperatura média favorável à aerotermia. No entanto, o decréscimo térmico nos meses de Inverno aumenta a carga sobre os sistemas de apoio. O recurso solar é abundante, permitindo uma redução substancial do OPEX se integrada tecnologia de coletores térmicos.</p>
              </div>
           </div>
        </Page>

        {/* P05: CONSUMPTION (03) */}
        <Page project={project} pageNum={5}>
           <h3 className="section-title">03. Perfil de Consumo e Demanda</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividades Parametrizadas</h4>
                 <table>
                    <thead><tr><th>Atividade</th><th>Vol. (L)</th><th>Temp (ºC)</th></tr></thead>
                    <tbody>
                       {project.activities.map(act => (
                         <tr key={act.id}><td>{act.name}</td><td>{act.volume} L</td><td>{act.tempRequired} ºC</td></tr>
                       ))}
                    </tbody>
                 </table>
                 <div className="card bg-slate-900 text-white p-8 border-l-[10px] border-orange-600">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Carga Diária Total</p>
                    <p className="text-4xl font-black">{project.activities.reduce((acc,a)=>acc+a.volume, 0).toLocaleString('pt-PT')} <span className="text-base opacity-40">LITROS / DIA</span></p>
                 </div>
              </div>
              <div className="card flex flex-col h-[350px]">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Curva de Demanda Horária (L/h)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyProfile}>
                       <XAxis dataKey="hour" tick={{fontSize: 8, fontWeight: 700}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="volume" fill="#3b82f6" radius={[3,3,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl flex justify-around text-center">
              <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nec. Energia Dia</p><p className="text-xl font-black text-slate-800">{(baseAnnual.demand_kWh / 365).toFixed(1)} kWh</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nec. Energia Ano</p><p className="text-xl font-black text-slate-800">{baseAnnual.demand_kWh.toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Temp. Média Nec.</p><p className="text-xl font-black text-orange-600">{(project.activities.reduce((acc,a)=>acc+(a.volume*a.tempRequired),0) / project.activities.reduce((acc,a)=>acc+a.volume,1)).toFixed(1)} ºC</p></div>
           </div>
        </Page>

        {/* P06: BASELINE (04) */}
        <Page project={project} pageNum={6}>
           <h3 className="section-title">04. Análise do Sistema Baseline</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card border-red-100 bg-red-50/20">
                    <h4 className="text-[10px] font-black text-red-600 uppercase mb-4 tracking-widest">Caracterização Baseline</h4>
                    <p className="text-lg font-black text-slate-800 mb-2 uppercase leading-tight">{project.existingSystem.name}</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed italic">{project.existingSystem.description || 'Sistema atualmente instalado sem optimizações energéticas.'}</p>
                 </div>
                 <div className="card space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KPIs Operacionais (Baseline)</h4>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Consumo Energético Final</span><span className="font-black text-slate-900">{(baseAnnual.elec_kWh + baseAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh/ano</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Custo Operacional (OPEX)</span><span className="font-black text-red-600">{baseAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Rendimento Sazonal Est.</span><span className="font-black text-slate-900">~85%</span></div>
                 </div>
              </div>
              <div className="card flex flex-col h-[350px]">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Inércia e Perdas (Dia Crítico)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={baseResults.slice(0,24)}>
                       <XAxis dataKey="hour" tick={{fontSize: 8}} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[15, 80]} />
                       <Tooltip />
                       <Line type="monotone" dataKey="temp_tank" name="Temp. Acumulação" stroke="#ef4444" strokeWidth={3} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-8 bg-red-50 border border-red-100 p-8 rounded-[30px] flex items-start gap-4">
              <AlertTriangle className="text-red-600 mt-1 shrink-0" size={24}/>
              <div className="space-y-2">
                 <p className="text-xs font-black text-red-900 uppercase">Diagnóstico de Ineficiência</p>
                 <p className="text-[10px] text-red-700 leading-relaxed italic">O sistema atual revela elevadas perdas térmicas estáticas e dependência exclusiva de combustíveis fósseis ou eletricidade direta, resultando num OPEX insustentável a longo prazo perante a volatilidade tarifária.</p>
              </div>
           </div>
        </Page>

        {/* P07: PROPOSAL (05) */}
        <Page project={project} pageNum={7}>
           <h3 className="section-title">05. Solução Eficiente Proposta</h3>
           <div className="grid grid-cols-2 gap-8 mt-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card border-green-100 bg-green-50/20">
                    <h4 className="text-[10px] font-black text-green-600 uppercase mb-4 tracking-widest">Configuração Proposta</h4>
                    <p className="text-lg font-black text-slate-800 mb-2 uppercase leading-tight">{project.proposedSystem.name}</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed italic">{project.proposedSystem.description || 'Solução integrada de alto rendimento baseada em renováveis térmicas.'}</p>
                 </div>
                 <div className="card space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KPIs Esperados (Proposta)</h4>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Consumo Energético Reduzido</span><span className="font-black text-slate-900">{(propAnnual.elec_kWh + propAnnual.gas_kWh).toLocaleString('pt-PT', {maximumFractionDigits:0})} kWh/ano</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Novo Custo Op. (OPEX)</span><span className="font-black text-green-600">{propAnnual.cost.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-xs font-bold text-slate-500">Fração Solar / Renovável</span><span className="font-black text-orange-600">+{((propAnnual.solar_kWh / propAnnual.demand_kWh) * 100).toFixed(0)}%</span></div>
                 </div>
              </div>
              <div className="card flex flex-col h-[350px]">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Balanço Térmico (Dia de Máxima Eficiência)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={propResults.slice(500,524)}>
                       <XAxis dataKey="hour" tick={{fontSize: 8}} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="solar_gain_kWh" name="Ganho Solar" fill="#f59e0b" radius={[3,3,0,0]} />
                       <Line type="monotone" dataKey="temp_tank" name="Temp. Depósito" stroke="#10b981" strokeWidth={3} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="mt-8 bg-green-50 border border-green-100 p-8 rounded-[30px] flex items-start gap-4">
              <CheckCircle className="text-green-600 mt-1 shrink-0" size={24}/>
              <div className="space-y-2">
                 <p className="text-xs font-black text-green-900 uppercase">Vantagens da Tecnologia Proposta</p>
                 <p className="text-[10px] text-green-700 leading-relaxed italic">A integração de aerotermia com apoio solar permite atingir coeficientes de performance (COP) anuais superiores a 3.0, redução drástica da fatura energética e das emissões de CO2.</p>
              </div>
           </div>
        </Page>

        {/* P08: FINANCE (06) */}
        <Page project={project} pageNum={8}>
           <h3 className="section-title">06. Viabilidade e Retorno (ROI)</h3>
           <div className="grid grid-cols-2 gap-10 mt-6" style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
              <div className="space-y-6">
                 <div className="card bg-slate-900 text-white p-10 border-b-[8px] border-orange-600 shadow-xl">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Período de Retorno (Payback)</p>
                    <p className="text-6xl font-black">{payback.toFixed(1)} <span className="text-2xl opacity-40">ANOS</span></p>
                 </div>
                 <div className="card flex justify-between items-center bg-green-50 border-green-200">
                    <div><p className="text-[9px] font-black text-green-700 uppercase mb-1">Poupança Anual Garantida</p><p className="text-2xl font-black text-green-800">{annualSaving.toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</p></div>
                    <TrendingUp className="text-green-600" size={32}/>
                 </div>
                 <div className="card">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Redução de Custos a 10 Anos</p>
                    <p className="text-3xl font-black text-slate-800">{(annualSaving * 10).toLocaleString('pt-PT', {style:'currency', currency:'EUR'})}</p>
                 </div>
              </div>
              <div className="card flex flex-col items-center justify-center bg-slate-50">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Composição de OPEX Anual (€)</h4>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={[{n:'Baseline',v:baseAnnual.cost},{n:'Proposta',v:propAnnual.cost}]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="v">
                             <Cell fill="#ef4444" /><Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex gap-4 text-[9px] font-black uppercase mt-6">
                    <span className="flex items-center gap-1.5 text-red-600"><div className="w-3 h-3 bg-red-600 rounded"></div> Baseline</span>
                    <span className="flex items-center gap-1.5 text-green-600"><div className="w-3 h-3 bg-green-600 rounded"></div> Proposta</span>
                 </div>
              </div>
           </div>
        </Page>

        {/* P09: BUDGET (07) */}
        <Page project={project} pageNum={9}>
           <h3 className="section-title">07. Orçamento e Quantidades</h3>
           <p className="text-[11px] text-slate-500 italic mb-6">Mapa detalhado do investimento (CAPEX) necessário para a implementação da solução proposta:</p>
           <table>
              <thead>
                 <tr><th>Capítulo / Descrição Técnica</th><th style={{width:'40px'}}>Qtd</th><th style={{width:'80px', textAlign:'right'}}>P. Unit.</th><th style={{width:'100px', textAlign:'right'}}>Total Líquido</th></tr>
              </thead>
              <tbody>
                 {project.budget.map(item => (
                   <tr key={item.id}>
                     <td><span className="font-black text-orange-600 opacity-60">[{item.category.split(' - ')[0]}]</span> {item.description}</td>
                     <td>{item.quantity} {item.unit}</td>
                     <td style={{textAlign:'right'}}>{item.unitPrice.toLocaleString('pt-PT')} €</td>
                     <td style={{textAlign:'right', fontWeight:800}}>{(item.quantity * item.unitPrice).toLocaleString('pt-PT')} €</td>
                   </tr>
                 ))}
              </tbody>
           </table>
           <div className="mt-auto bg-slate-900 text-white p-12 rounded-[40px] flex justify-between items-center shadow-2xl border-b-[10px] border-orange-600">
              <div className="space-y-1">
                 <h4 className="text-3xl font-black uppercase tracking-tight">Investimento Total</h4>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Valor estimado (Sujeito a I.V.A.)</p>
              </div>
              <div className="text-right">
                 <p className="text-6xl font-black">{totalCapex.toLocaleString('pt-PT')} <span className="text-2xl opacity-40 font-medium">€</span></p>
              </div>
           </div>
        </Page>

        {/* P10: CONCLUSION & CERTIFICATION (08) */}
        <Page project={project} pageNum={10}>
           <h3 className="section-title">08. Conclusão e Certificação</h3>
           <div className="space-y-10 mt-6">
              <div className="card bg-slate-50 border-l-[10px] border-slate-900 shadow-sm">
                 <h4 className="text-xs font-black text-slate-900 uppercase mb-4 flex items-center gap-2"><Briefcase size={16} className="text-orange-600"/> Parecer de Engenharia</h4>
                 <p className="text-[11px] text-slate-600 leading-relaxed italic font-medium">
                   Com base na simulação horária 8.760h efetuada para o local de {project.district}, conclui-se que o sistema proposto é altamente viável, apresentando uma redução de custos operacionais de {((annualSaving/baseAnnual.cost)*100).toFixed(0)}%. O período de retorno de {payback.toFixed(1)} anos é considerado excelente para projetos de climatização e AQS. Recomenda-se a adjudicação da proposta conforme o mapa de quantidades apresentado, garantindo assim os níveis de conforto e eficiência projetados.
                 </p>
              </div>

              <div className="relative p-16 border-8 border-orange-600/10 rounded-[50px] flex flex-col items-center text-center overflow-hidden">
                 <Award size={72} className="text-orange-600 mb-6" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Certificado de Rigor Técnico</h2>
                 <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.4em] mb-8">K-AQSPRO Engineering Suite Validation</p>
                 <div className="w-24 h-1 bg-slate-900 mb-8"></div>
                 <p className="text-[10px] text-slate-400 max-w-sm font-medium leading-relaxed italic">Este documento foi gerado através de algoritmos de simulação dinâmica validados, assegurando que os dados aqui apresentados refletem com precisão o comportamento térmico esperado da instalação.</p>
                 <div className="mt-12 flex gap-10 text-[9px] font-black uppercase text-slate-300">
                    <span className="flex items-center gap-2"><ShieldCheck size={14}/> Dados Validados</span>
                    <span className="flex items-center gap-2"><Activity size={14}/> Simulação 8760h</span>
                    <span className="flex items-center gap-2"><Lock size={14}/> ID: {project.id}</span>
                 </div>
              </div>
           </div>
        </Page>

        {/* P11: CONTRACAPA */}
        <Page project={project} pageNum={11}>
           <div className="flex-1 flex flex-col items-center justify-center space-y-14">
              <div className="w-36 h-36 bg-slate-900 rounded-[40px] flex items-center justify-center text-white text-7xl font-black shadow-2xl ring-8 ring-slate-100">K</div>
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">K-AQSPRO</h2>
                 <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.5em]">Engineering for the future</p>
              </div>
              <div className="w-12 h-1 bg-orange-600 rounded-full"></div>
              <div className="max-w-xs text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase leading-loose tracking-widest">Propriedade Intelectual K2000 Engenharia & Soluções Térmicas. Todos os direitos reservados {new Date().getFullYear()}.</p>
              </div>
           </div>
           <div className="mt-auto pt-10 border-t border-slate-50 flex justify-center text-[7px] font-black text-slate-200 uppercase tracking-[0.6em]">
             Digital Transformation for Thermal Engineering
           </div>
        </Page>

      </div>
    </div>
  );
};

export default ReportPage;
