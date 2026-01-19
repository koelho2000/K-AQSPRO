
import React from 'react';
import { ArrowRight, Thermometer, Shield, Zap } from 'lucide-react';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative flex-1 flex items-center justify-center text-center px-6 py-24 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('https://picsum.photos/1600/900?energy')` }}
      >
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-block p-2 px-4 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-bold tracking-widest uppercase">
            Engenharia Térmica Avançada
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
            K-<span className="text-orange-500">AQS</span>PRO
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            A plataforma profissional para projeto, simulação e otimização de sistemas de Águas Quentes Sanitárias (AQS).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold text-lg transition-all flex items-center gap-3 overflow-hidden shadow-2xl"
            >
              <span>INICIAR NOVO PROJETO</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-900 border-t border-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-400">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500">
              <Thermometer />
            </div>
            <h3 className="text-xl font-bold text-white">Simulação 8760h</h3>
            <p>Análise horária precisa considerando dados climáticos EPW e perfis dinâmicos de consumo.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500">
              <Zap />
            </div>
            <h3 className="text-xl font-bold text-white">Eficiência Energética</h3>
            <p>Comparação entre sistemas tradicionais e propostas sustentáveis como Bombas de Calor e Solar.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500">
              <Shield />
            </div>
            <h3 className="text-xl font-bold text-white">Relatórios Técnicos</h3>
            <p>Exportação completa de mapas de quantidades, análise financeira e KPIs de performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
