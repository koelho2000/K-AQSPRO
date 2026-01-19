
import React from 'react';
import { Project } from '../types';

interface AdminPageProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const AdminPage: React.FC<AdminPageProps> = ({ project, setProject }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      admin: { ...prev.admin, [name]: value }
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dados Administrativos</h2>
        <p className="text-slate-500">Identificação da instalação e dos intervenientes do projeto.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Instalação / Obra</label>
            <input 
              type="text" 
              name="installation"
              value={project.admin.installation}
              onChange={handleChange}
              placeholder="Ex: Edifício Horizonte Lote 4"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente / Proprietário</label>
              <input 
                type="text" 
                name="client"
                value={project.admin.client}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Técnico Responsável</label>
              <input 
                type="text" 
                name="technician"
                value={project.admin.technician}
                onChange={handleChange}
                placeholder="Ex: Eng. Maria Santos"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
