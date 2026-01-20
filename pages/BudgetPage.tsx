
import React, { useRef } from 'react';
import { Project, BudgetItem, BudgetChapter, Equipment, System } from '../types';
import { Plus, Trash2, Wallet, RefreshCcw, Info, Download, Printer, Copy, Layout, History, Sparkles } from 'lucide-react';

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

const BUDGET_EXPORT_STYLES = `
  <style>
    body { font-family: sans-serif; color: #1e293b; padding: 40px; }
    .header { border-bottom: 5px solid #f97316; margin-bottom: 30px; padding-bottom: 20px; }
    .chapter-title { background: #0f172a; color: white; padding: 15px 25px; border-radius: 15px; margin: 40px 0 20px 0; font-weight: 900; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; background: #f8fafc; padding: 15px; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .total-box { background: #0f172a; color: white; padding: 40px; border-radius: 40px; margin-top: 50px; display: flex; justify-content: space-between; align-items: center; }
    .text-orange { color: #f97316; }
    .price-col { font-weight: bold; text-align: right; }
  </style>
`;

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

  // Algoritmo de Estimativa de Preços Profissional
  const estimateEquipmentPrice = (eq: Equipment): number => {
    switch (eq.type) {
      case 'HP':
        // Bomba de calor: Base (Inverter/Controlos) + Preço incremental por kW
        return 2450 + (eq.power || 0) * 520;
      case 'BOILER':
        // Caldeira: Estrutura + Preço por kW térmico
        return 1100 + (eq.power || 0) * 55;
      case 'SOLAR':
        // Painéis Solares: Coletor seletivo + Estrutura + Kit hidráulico por m2
        return (eq.area || 0) * 620;
      case 'HEATER':
        // Esquentador: Base + Potência de queima
        return 380 + (eq.power || 0) * 35;
      case 'ELECTRIC_TANK':
        // Termoacumulador: Base + Resistência por kW
        return 280 + (eq.power || 0) * 145;
      default:
        return 1000;
    }
  };

  const estimateStoragePrice = (volume: number): number => {
    if (volume <= 0) return 0;
    // Depósito: Custo fixo fabrico + Custo material por litro (escalonado)
    const factor = volume > 1000 ? 3.2 : volume > 500 ? 3.8 : 4.5;
    return 550 + (volume * factor);
  };

  const syncSystemToBudget = (type: 'existing' | 'proposed') => {
    const systemName = type === 'existing' ? 'Sistema Base' : 'Sistema Proposto';
    if (!confirm(`Deseja gerar o Mapa de Quantidades para o ${systemName}? Esta ação substituirá os itens atuais.`)) return;
    
    const targetSystem = type === 'existing' ? project.existingSystem : project.proposedSystem;
    const newItems: BudgetItem[] = [];
    const timestamp = Date.now();
    
    // I - Equipamentos de Produção
    targetSystem.equipments.forEach((eq, idx) => {
      const unitPrice = estimateEquipmentPrice(eq);
      newItems.push({
        id: `eq-${idx}-${timestamp}`,
        category: 'I - EQUIPAMENTO DE PRODUÇÃO TÉRMICA',
        description: `[${type.toUpperCase()}] ${eq.name} (${eq.power ? `${eq.power} kW` : `${eq.area} m²`})`,
        quantity: 1,
        unit: 'un',
        unitPrice: Math.round(unitPrice / 5) * 5
      });
    });

    // II - Acumulação
    if (targetSystem.hasStorage !== false && targetSystem.storage.volume > 0) {
      const storagePrice = estimateStoragePrice(targetSystem.storage.volume);
      newItems.push({
        id: `st-${timestamp}`,
        category: 'II - ACUMULAÇÃO E INÉRCIA',
        description: `[${type.toUpperCase()}] Depósito Acumulador - ${targetSystem.storage.volume} Litros`,
        quantity: 1,
        unit: 'un',
        unitPrice: Math.round(storagePrice / 10) * 10
      });
    }

    // III - Hidráulica (Valores de mercado base)
    newItems.push({
      id: `hid-${timestamp}`,
      category: 'III - HIDRÁULICA E DISTRIBUIÇÃO',
      description: `Kit Hidráulico Completo para ${targetSystem.name}`,
      quantity: 1,
      unit: 'vg',
      unitPrice: 550
    });

    if (targetSystem.hasMixingValve) {
      newItems.push({
        id: `mix-${timestamp}`,
        category: 'III - HIDRÁULICA E DISTRIBUIÇÃO',
        description: 'Válvula Misturadora Termostática Antiescaldão',
        quantity: 1,
        unit: 'un',
        unitPrice: 245
      });
    }

    // IV - Controlo
    newItems.push({
      id: `ctrl-${timestamp}`,
      category: 'IV - ELETRICIDADE E CONTROLO',
      description: 'Painel de Proteção Elétrica e Gestão Térmica',
      quantity: 1,
      unit: 'un',
      unitPrice: 380
    });

    // V - Mão de Obra
    newItems.push({
      id: `labor-${timestamp}`,
      category: 'V - MÃO DE OBRA E SERVIÇOS',
      description: `Instalação e Comissionamento - ${targetSystem.name}`,
      quantity: 1,
      unit: 'vg',
      unitPrice: 1600
    });

    updateBudget(newItems);
  };

  const handleExport = (type: 'pdf' | 'html' | 'word') => {
    if (type === 'pdf') { window.print(); return; }
    const htmlContent = budgetRef.current?.innerHTML || "";
    const fullHtml = `<html><head><meta charset="utf-8">${BUDGET_EXPORT_STYLES}</head><body><div class="header"><h1>Orçamento Técnico - ${project.admin.client || 'Sem Nome'}</h1><p>${project.admin.installation || 'Local não definido'}</p></div>${htmlContent}</body></html>`;
    const blob = new Blob([fullHtml], { type: type === 'html' ? 'text/html' : 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orcamento_KAQSPRO_${project.admin.client || 'Project'}.${type === 'html' ? 'html' : 'doc'}`;
    link.click();
  };

  const handleCopy = async () => {
    if (!budgetRef.current) return;
    const html = `<html><head>${BUDGET_EXPORT_STYLES}</head><body>${budgetRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
    alert("Copiado para a área de transferência com sucesso!");
  };

  const totalCapex = project.budget.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24 print:p-0">
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white !important; padding: 1.5cm !important; } }
      `}</style>

      {/* Header com botões de sincronização dupla */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Wallet className="text-orange-500" /> Orçamentação Profissional
          </h2>
          <p className="text-slate-500 font-medium">Estimativa de CAPEX baseada em parâmetros técnicos (kW, Litros, m²).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex gap-2">
            <button 
              onClick={() => syncSystemToBudget('existing')} 
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95 border border-slate-200"
            >
              <History size={16} className="text-slate-400"/> SYNC BASELINE
            </button>
            <button 
              onClick={() => syncSystemToBudget('proposed')} 
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-orange-500 transition-all active:scale-95 border border-orange-700"
            >
              <Sparkles size={16}/> SYNC PROPOSTA
            </button>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          <button onClick={handleCopy} className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 shadow-sm" title="Copiar"><Copy size={18}/></button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all shadow-lg" title="Imprimir/PDF"><Printer size={18}/> PDF</button>
        </div>
      </div>

      <div ref={budgetRef} className="space-y-12">
        {CHAPTERS.map((chapter) => {
          const itemsInChapter = project.budget.filter(i => i.category === chapter);
          const chapterTotal = itemsInChapter.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
          
          return (
            <div key={chapter} className="space-y-4">
              <div className="chapter-title bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center border-l-[10px] border-orange-500">
                <span className="font-black text-xs uppercase tracking-[0.2em]">{chapter}</span>
                <span className="font-black text-lg">{chapterTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="rounded-tl-xl">Descrição do Artigo / Serviço</th>
                    <th style={{width:'80px'}}>Qtd</th>
                    <th style={{width:'80px'}}>Un</th>
                    <th style={{width:'130px', textAlign:'right'}}>Preço Unit.</th>
                    <th style={{width:'130px', textAlign:'right'}} className="rounded-tr-xl">Total Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsInChapter.map(item => (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50">
                      <td>
                        <input 
                          className="w-full bg-transparent border-none outline-none focus:text-orange-600 font-medium no-print py-1" 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                        />
                        <span className="print-only hidden">{item.description}</span>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="w-full bg-transparent border-none outline-none no-print font-medium" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} 
                        />
                        <span className="print-only hidden">{item.quantity}</span>
                      </td>
                      <td>{item.unit}</td>
                      <td style={{textAlign:'right'}}>
                        <input 
                          type="number" 
                          className="w-full bg-transparent border-none outline-none text-right no-print font-black" 
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} 
                        />
                        <span className="print-only hidden">{item.unitPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</span>
                      </td>
                      <td style={{textAlign:'right', fontWeight:'900'}} className="relative text-slate-900">
                        {(item.quantity * item.unitPrice).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="absolute -right-10 top-1/2 -translate-y-1/2 text-slate-200 hover:text-red-500 transition-colors no-print p-2"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {itemsInChapter.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-300 italic py-10">Este capítulo encontra-se vazio.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button onClick={() => addItem(chapter)} className="no-print w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase hover:border-orange-500 hover:text-orange-500 transition-all bg-white shadow-sm">+ ADICIONAR ITEM MANUAL</button>
            </div>
          );
        })}

        <div className="total-box bg-slate-900 text-white p-14 rounded-[50px] flex flex-col md:flex-row justify-between items-center shadow-2xl border-b-[12px] border-orange-600 mt-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-5 -mr-10 -mt-10 rotate-12 transition-transform group-hover:scale-110"><Wallet size={200}/></div>
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
             <p className="text-5xl font-black uppercase tracking-tighter leading-none">Investimento Total</p>
             <p className="text-orange-500 font-black text-sm uppercase tracking-widest mt-3 flex items-center gap-2 justify-center md:justify-start">
               <Info size={16}/> Baseado em Simulação Técnica Sazonal (Sem I.V.A.)
             </p>
          </div>
          <div className="relative z-10 text-right">
             <p className="text-7xl font-black tabular-nums tracking-tighter">{totalCapex.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} <span className="text-3xl text-orange-500 font-medium">€</span></p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8 no-print">
        <div className="bg-white p-4 rounded-3xl text-slate-400 shadow-sm"><Info size={28}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Nota sobre Algoritmos de Orçamentação</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
            O motor de sincronização utiliza rácios de engenharia reais: os preços de equipamentos variam exponencialmente com a potência térmica (kW), enquanto os acumuladores utilizam uma curva de custo material baseada na volumetria (L). 
            <br/><br/>
            <strong>Dica:</strong> Pode sincronizar o "Baseline" para mostrar ao cliente o custo de uma substituição convencional vs a "Proposta" de alta eficiência.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
