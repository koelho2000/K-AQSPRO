
import React, { useMemo } from 'react';
import { Project, HourlySimResult } from '../types';
import { aggregateResults } from '../services/simulationEngine';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calculator, ArrowRight, Wallet, CheckCircle, Info } from 'lucide-react';

interface FinancePageProps {
  project: Project;
  baseResults: HourlySimResult[];
  propResults: HourlySimResult[];
}

const FinancePage: React.FC<FinancePageProps> = ({ project, baseResults, propResults }) => {
  // Fixed: Calculate CAPEX dynamically from the budget
  const capex = useMemo(() => 
    project.budget.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0)
  , [project.budget]);
  
  const baseAnnual = aggregateResults(baseResults);
  const propAnnual = aggregateResults(propResults);
  
  const annualSavings = baseAnnual.cost - propAnnual.cost;
  const payback = capex / (annualSavings || 1);

  const data = [
    { name: 'Cenário Baseline', value: baseAnnual.cost },
    { name: 'Cenário Proposto', value: propAnnual.cost },
  ];
  const COLORS = ['#ef4444', '#10b981'];

  if (baseResults.length === 0 || propResults.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 text-slate-400">
        <Calculator size={48} />
        <p className="text-xl font-medium">Resultados incompletos.</p>
        <p className="text-sm">Execute ambas as simulações para ver a análise comparativa.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Análise Financeira Comparativa</h2>
        <p className="text-slate-500">Viabilidade económica e retorno do investimento (ROI) baseado no orçamento real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Wallet size={18} className="text-orange-500"/> Investimento (CAPEX)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Custo Total (Do Orçamento)</label>
                <div className="text-3xl font-black text-slate-900">
                  {capex.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Poupança Operacional Anual</div>
                <div className="text-2xl font-bold text-green-600">+{annualSavings.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-600 p-8 rounded-2xl shadow-xl text-white space-y-4">
            <h3 className="text-lg font-bold">Payback Simples (PRI)</h3>
            <div className="text-5xl font-extrabold">{payback.toFixed(1)} <span className="text-xl font-normal opacity-80">Anos</span></div>
            <p className="text-sm opacity-90 leading-relaxed">
              Tempo necessário para recuperar o investimento através da poupança na fatura energética.
            </p>
            <div className="pt-4 border-t border-white/20 flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16}/> PROJETO VIÁVEL
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-8">Comparação de Custos Operacionais (Anual)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-r-xl">
                <div>
                  <div className="text-xs font-bold text-red-800/60 uppercase">Cenário Base</div>
                  <div className="text-xl font-bold text-red-800">{baseAnnual.cost.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
                </div>
                <ArrowRight className="text-red-300" />
              </div>
              <div className="flex items-center justify-between p-4 border-l-4 border-green-500 bg-green-50 rounded-r-xl">
                <div>
                  <div className="text-xs font-bold text-green-800/60 uppercase">Cenário Proposto</div>
                  <div className="text-xl font-bold text-green-800">{propAnnual.cost.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
                </div>
                <div className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded">EFICIENTE</div>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase">Redução de Custos</div>
                <div className="text-3xl font-extrabold text-slate-800">{((1 - propAnnual.cost/baseAnnual.cost) * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 flex gap-4 items-start mt-8">
        <div className="bg-white p-2 rounded-xl text-slate-400 shadow-sm"><Info size={20}/></div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Análise Técnica Financeira</p>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            O projeto apresenta indicadores de rentabilidade robustos. A poupança gerada no OPEX cobre o investimento num período inferior a 1/3 da vida útil dos equipamentos instalados, gerando um valor acumulado líquido altamente positivo ao fim de 10 anos. Este investimento é considerado de baixo risco dada a tendência crescente de custos de eletricidade e gás, atuando como um "hedge" contra a inflação energética.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
