
import React from 'react';
import { ArrowRight, Thermometer, Shield, Zap, Info } from 'lucide-react';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const APP_VERSION = "v2.8.0-PRO";
  const LAST_UPDATE = "27.01.2026";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Version & Date Badge - Top Right */}
      <div className="absolute top-6 right-8 z-50 flex flex-col items-end pointer-events-none">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-end shadow-2xl">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] leading-none">Engine Version</span>
          <span className="text-sm font-black text-white mt-1 tracking-tighter">{APP_VERSION}</span>
          <div className="h-[1px] w-full bg-white/10 my-1.5"></div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Last Build: {LAST_UPDATE}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="relative flex-1 flex items-center justify-center text-center px-6 py-24 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000')` }}
      >
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-block p-2 px-4 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-bold tracking-widest uppercase">
            Engenharia Térmica Avançada
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
            K<span className="text-orange-500">-AQS</span>PRO
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            A plataforma profissional para projeto, simulação horária (8760h) e otimização de sistemas de Águas Quentes Sanitárias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button 
              onClick={onStart}
              className="group relative px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-black text-lg transition-all flex items-center gap-4 overflow-hidden shadow-2xl active:scale-95"
            >
              <span className="relative z-10 uppercase tracking-widest">INICIAR NOVO PROJETO</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-900 border-t border-white/5 py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-400">
          <div className="space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:-translate-y-1 shadow-lg">
              <Thermometer />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Simulação 8760h</h3>
            <p className="text-sm leading-relaxed">Análise horária precisa de balanço de massa e energia considerando dados climáticos EPW e perfis dinâmicos de consumo terminal.</p>
          </div>
          <div className="space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:-translate-y-1 shadow-lg">
              <Zap />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Estrategista Solar</h3>
            <p className="text-sm leading-relaxed">Assistente inteligente para dimensionamento de áreas coletoras e volume de acumulação com base em 3 propostas de eficiência sazonal.</p>
          </div>
          <div className="space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500 transition-all group-hover:bg-green-600 group-hover:text-white group-hover:-translate-y-1 shadow-lg">
              <Shield />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Rigor Financeiro</h3>
            <p className="text-sm leading-relaxed">Mapa de quantidades automático, análise de Payback e ROI com filtragem inteligente de ativos existentes para reabilitação.</p>
          </div>
        </div>
        
        {/* Footer info in landing */}
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Sistema Operacional • Protocolo K2000 Ativo
          </div>
          <div className="flex gap-6">
            <span>Engineering Suite {APP_VERSION}</span>
            <span>Update: {LAST_UPDATE}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
