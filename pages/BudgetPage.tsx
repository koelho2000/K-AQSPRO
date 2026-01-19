
import React, { useRef } from 'react';
import { Project, BudgetItem, BudgetChapter } from '../types';
import { Plus, Trash2, Wallet, RefreshCcw, Building2, User2, MapPin, BadgeInfo, Info, Ruler, FileText, Download, Printer, Copy, Layout } from 'lucide-react';

interface BudgetPageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const CHAPTERS: BudgetChapter[] = [
  'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA',
  'II - ACUMULAÇÃO E INÉRCIA',
  'III - HIDRÁULICA E DISTRIBUIÇÃO',
  'IV - ELETRICIDADE E CONTROLO',
  'V - MÃO DE OBRA E SERVIÇOS',
  'VI - CUSTOS INDIRETOS / DIVERSOS'
];

const BudgetPage: React.FC<BudgetPageProps> = ({ project, setProject }) => {
  const budgetRef = useRef<HTMLDivElement>(null);

  const updateBudget = (items: BudgetItem[]) => {
    setProject(prev => ({ ...prev, budget: items }));
  };

  const addItem = (category: BudgetChapter) => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      category: category,
      description: 'Novo Item',
      quantity: 1,
      unit: 'un',
      unitPrice: 0
    };
    updateBudget([...project.budget, newItem]);
  };

  const removeItem = (id: string) => {
    updateBudget(project.budget.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    updateBudget(project.budget.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const syncEquipments = () => {
    if (!confirm("Deseja gerar automaticamente o Mapa de Quantidades baseado na solução proposta?")) return;
    
    const newItems: BudgetItem[] = [];
    const timestamp = Date.now();
    let subtotalForEngineering = 0;

    const addTrackedItem = (item: BudgetItem) => {
      newItems.push(item);
      subtotalForEngineering += item.quantity * item.unitPrice;
    };

    if (project.existingSystem.equipments.length > 0) {
      addTrackedItem({
        id: `rem-1-${timestamp}`,
        category: 'V - MÃO DE OBRA E SERVIÇOS',
        description: `Desmontagem e remoção técnica de equipamentos existentes`,
        quantity: 1,
        unit: 'vg',
        unitPrice: 350
      });
    }

    project.proposedSystem.equipments.forEach((eq, idx) => {
      let estPrice = 0;
      if (eq.type === 'HP') estPrice = 3200;
      if (eq.type === 'SOLAR') estPrice = 850;
      if (eq.type === 'BOILER') estPrice = 1600;
      if (eq.type === 'HEATER') estPrice = 450;
      if (eq.type === 'ELECTRIC_TANK') estPrice = 350;

      addTrackedItem({
        id: `eq-${idx}-${timestamp}`,
        category: 'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA',
        description: `${eq.name} ${eq.power ? `(${eq.power}kW)` : eq.area ? `(${eq.area}m²)` : ''}`,
        quantity: 1,
        unit: 'un',
        unitPrice: estPrice
      });

      if (eq.type === 'SOLAR') {
        addTrackedItem({
          id: `struct-${idx}-${timestamp}`,
          category: 'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA',
          description: `Estrutura de fixação para coletor solar em alumínio`,
          quantity: 1,
          unit: 'un',
          unitPrice: 150
        });
      }
    });

    if (project.proposedSystem.storage.volume > 0) {
      addTrackedItem({
        id: `tank-${timestamp}`,
        category: 'II - ACUMULAÇÃO E INÉRCIA',
        description: `Depósito Acumulador de AQS ${project.proposedSystem.storage.volume} Litros em Aço Inox`,
        quantity: 1,
        unit: 'un',
        unitPrice: project.proposedSystem.storage.volume > 500 ? 1800 : 1100
      });
    }

    addTrackedItem({
      id: `hyd-${timestamp}`,
      category: 'III - HIDRÁULICA E DISTRIBUIÇÃO',
      description: 'Kit de ligações hidráulicas, válvulas e tubagem isolada',
      quantity: 1,
      unit: 'conj',
      unitPrice: 800
    });

    addTrackedItem({
      id: `elec-${timestamp}`,
      category: 'IV - ELETRICIDADE E CONTROLO',
      description: 'Quadro elétrico e ligações de comando',
      quantity: 1,
      unit: 'un',
      unitPrice: 350
    });

    addTrackedItem({
      id: `lab-${timestamp}`,
      category: 'V - MÃO DE OBRA E SERVIÇOS',
      description: 'Mão de obra qualificada para instalação e comissionamento',
      quantity: 1,
      unit: 'vg',
      unitPrice: 1500
    });

    const engineeringFee = Math.round(subtotalForEngineering * 0.10);
    newItems.push({
      id: `eng-${timestamp}`,
      category: 'VI - CUSTOS INDIRETOS / DIVERSOS',
      description: 'Projeto de Engenharia e Licenciamento (~10% do investimento)',
      quantity: 1,
      unit: 'vg',
      unitPrice: engineeringFee
    });

    updateBudget(newItems);
  };

  const handleCompanyChange = (field: keyof typeof project.company, value: string) => {
    setProject(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }));
  };

  const handleExport = (type: 'pdf' | 'html' | 'word') => {
    if (type === 'pdf') {
      window.print();
    } else {
      const htmlContent = budgetRef.current?.innerHTML || "";
      const fullHtml = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; color: #333; padding: 40px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #eee; padding: 12px; text-align: left; }
              h1, h2, h3 { color: #f97316; }
              .header { border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 30px; }
              .footer { margin-top: 40px; font-size: 10px; color: #999; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ORÇAMENTO E MAPA DE QUANTIDADES</h1>
              <p>Projeto: ${project.admin.installation || 'N/A'}</p>
              <p>Cliente: ${project.admin.client || 'N/A'}</p>
            </div>
            ${htmlContent}
            <div class="footer">Gerado por K-AQSPRO Suite</div>
          </body>
        </html>
      `;
      const blob = new Blob([fullHtml], { type: type === 'html' ? 'text/html' : 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento_KAQSPRO_${project.admin.client || 'Projeto'}.${type === 'html' ? 'html' : 'doc'}`;
      link.click();
    }
  };

  const handleCopy = async () => {
    if (!budgetRef.current) return;
    try {
      const html = budgetRef.current.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      await navigator.clipboard.write(data);
      alert("Orçamento copiado com formatação rica!");
    } catch (err) {
      const text = budgetRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert("Texto do orçamento copiado.");
    }
  };

  const totalCapex = project.budget.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24 print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Wallet className="text-orange-500" /> Orçamento e Mapa de Quantidades
          </h2>
          <p className="text-slate-500">Estrutura de investimento detalhada para a solução proposta.</p>
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
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all shadow-lg">
            <Printer size={16}/> PDF / IMPRIMIR
          </button>
          <button onClick={syncEquipments} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black shadow-lg transition-all active:scale-95"><RefreshCcw size={16}/> SINCRONIZAR</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><Building2 size={16}/> Empresa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome</label>
              <input value={project.company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} className="w-full bg-slate-50 px-3 py-2 rounded-lg text-sm font-bold text-slate-800 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">NIF</label>
              <input value={project.company.nif} onChange={(e) => handleCompanyChange('nif', e.target.value)} className="w-full bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alvará</label>
              <input value={project.company.alvara} onChange={(e) => handleCompanyChange('alvara', e.target.value)} className="w-full bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-600 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet size={120} /></div>
          <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2 relative z-10"><BadgeInfo size={16}/> Resumo</h3>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 opacity-60"><User2 size={14}/> <span className="text-[10px] font-bold uppercase">{project.admin.client || 'Cliente'}</span></div>
              <div className="flex items-center gap-2 opacity-60"><MapPin size={14}/> <span className="text-[10px] font-bold uppercase">{project.admin.installation || 'Localização'}</span></div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <p className="text-[10px] font-bold text-orange-400 uppercase mb-1 tracking-tighter">Investimento Total (CAPEX)</p>
              <p className="text-4xl font-black tabular-nums">{totalCapex.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={budgetRef} className="space-y-12">
        {CHAPTERS.map((chapter) => {
          const itemsInChapter = project.budget.filter(i => i.category === chapter);
          const chapterTotal = itemsInChapter.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
          return (
            <div key={chapter} className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="bg-orange-600 text-white w-6 h-6 rounded flex items-center justify-center text-[10px]">{chapter.split(' ')[0]}</span>
                  {chapter}
                </h3>
                <div className="text-sm font-bold text-slate-900">{chapterTotal.toLocaleString('pt-PT')} €</div>
              </div>
              <div className="space-y-2">
                {itemsInChapter.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 group print:border-none print:shadow-none">
                    <div className="flex-1 min-w-[300px]">
                      <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none print:border-none" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <label className="block text-[8px] font-black text-slate-300 uppercase no-print">Qtd</label>
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-12 text-center text-sm font-bold bg-slate-50 rounded print:bg-transparent" />
                      </div>
                      <div className="text-center">
                        <label className="block text-[8px] font-black text-slate-300 uppercase no-print">Preço Un</label>
                        <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-24 text-center text-sm font-black bg-orange-50 rounded print:bg-transparent" />
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 no-print"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addItem(chapter)} className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 hover:text-orange-400 hover:border-orange-100 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase no-print"><Plus size={14}/> ADICIONAR ITEM</button>
              </div>
            </div>
          );
        })}
        
        {/* TOTAL SUMMARY FOR EXPORT */}
        <div className="pt-8 border-t-4 border-slate-900 flex justify-between items-center">
          <p className="text-2xl font-black uppercase">Total Investimento (CAPEX)</p>
          <p className="text-4xl font-black text-orange-600">{totalCapex.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start no-print">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><Info size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Ruler size={14}/> Nota Técnica</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
            O orçamento automático inclui o provisionamento de 10% do subtotal para Projeto de Engenharia (Cap. VI). Use os botões de exportação no topo para gerar propostas comerciais em formatos profissionais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
