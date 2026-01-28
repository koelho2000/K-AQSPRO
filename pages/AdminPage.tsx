
import React from 'react';
import { Project, CompanyInfo } from '../types';
import { Building2, FileText, MapPin, User, Briefcase, Globe, Mail, Phone, Hash, ShieldCheck, Tag, Fingerprint } from 'lucide-react';

interface AdminPageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const AdminPage: React.FC<AdminPageProps> = ({ project, setProject }) => {
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      admin: { ...prev.admin, [name]: value }
    }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      company: { ...prev.company, [name]: value }
    }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Dados Administrativos</h2>
        <p className="text-slate-500 font-medium">Identificação detalhada da obra, projeto e responsáveis intervenientes.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Card 1: Instalação */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
             <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Building2 size={20}/></div>
             <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Identificação da Instalação</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nome da Obra / Edifício
              </label>
              <input 
                type="text" 
                name="buildingName"
                value={project.admin.buildingName}
                onChange={handleAdminChange}
                placeholder="Ex: Hotel Atlântico Resort"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Designação do Projeto
              </label>
              <input 
                type="text" 
                name="projectDesignation"
                value={project.admin.projectDesignation}
                onChange={handleAdminChange}
                placeholder="Ex: Renovação Central Térmica AQS"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Fingerprint size={12}/> Nº de Projeto
              </label>
              <input 
                type="text" 
                name="projectNumber"
                value={project.admin.projectNumber}
                onChange={handleAdminChange}
                placeholder="Ex: FO_00_00"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Tag size={12}/> Nome da Variante
              </label>
              <input 
                type="text" 
                name="variantName"
                value={project.admin.variantName}
                onChange={handleAdminChange}
                placeholder="Ex: Solução Bomba de Calor"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <MapPin size={12} className="text-orange-500"/> Morada Completa
            </label>
            <input 
              type="text" 
              name="address"
              value={project.admin.address}
              onChange={handleAdminChange}
              placeholder="Rua, Número, Código Postal, Localidade"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Card 2: Entidade Auditora (Nova Secção) */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
             <div className="p-2 bg-slate-900 text-white rounded-xl"><ShieldCheck size={20}/></div>
             <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Entidade Auditora / Executante</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
              <input type="text" name="name" value={project.company.name} onChange={handleCompanyChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-800" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website Oficial</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                <input type="text" name="website" value={project.company.website} onChange={handleCompanyChange} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Contacto</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                <input type="email" name="email" value={project.company.email} onChange={handleCompanyChange} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / Telemóvel</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                <input type="text" name="phone" value={project.company.phone} onChange={handleCompanyChange} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIF</label>
              <input type="text" name="nif" value={project.company.nif} onChange={handleCompanyChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alvará de Construção / IMPIC</label>
              <input type="text" name="alvara" value={project.company.alvara} onChange={handleCompanyChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800" />
            </div>
          </div>
        </div>

        {/* Card 3: Intervenientes */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><User size={20}/></div>
             <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Intervenientes e Responsáveis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Cliente / Beneficiário
              </label>
              <input 
                type="text" 
                name="client"
                value={project.admin.client}
                onChange={handleAdminChange}
                placeholder="Ex: Grupo Hoteleiro S.A."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Técnico Responsável
              </label>
              <input 
                type="text" 
                name="technician"
                value={project.admin.technician}
                onChange={handleAdminChange}
                placeholder="Nome do Engenheiro/Técnico"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 flex gap-6 items-start mt-8">
        <div className="bg-white p-3 rounded-2xl text-slate-400 shadow-sm"><FileText size={24}/></div>
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Nota Metodológica</p>
          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">Os dados administrativos inseridos nesta secção serão utilizados para a personalização automática do relatório técnico final, orçamentação e certificação K2000. Certifique-se de que a <strong>Morada</strong> está correta para efeitos de georreferenciação climática.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;