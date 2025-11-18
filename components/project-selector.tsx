'use client';

import { useCRM } from '@/lib/crm-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProjectSelector() {
  const { projects, currentProjectId, setCurrentProjectId, addProject, updateProject, removeProject } = useCRM();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<{ id: string; nome: string } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject({ nome: newProjectName.trim() });
      setNewProjectName('');
      setShowAddDialog(false);
    }
  };

  const handleEditProject = () => {
    if (editingProject && editingProject.nome.trim()) {
      updateProject(editingProject.id, { nome: editingProject.nome.trim() });
      setEditingProject(null);
      setShowEditDialog(false);
    }
  };

  const handleDeleteProject = () => {
    if (projectToDelete && projects.length > 1) {
      removeProject(projectToDelete);
      setProjectToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const openEditDialog = () => {
    if (currentProject) {
      setEditingProject({ id: currentProject.id, nome: currentProject.nome });
      setShowEditDialog(true);
    }
  };

  const openDeleteDialog = () => {
    if (currentProject) {
      setProjectToDelete(currentProject.id);
      setShowDeleteDialog(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentProjectId} onValueChange={setCurrentProjectId}>
        <SelectTrigger className="w-[280px] bg-white/80 backdrop-blur-sm border-cyan-200">
          <SelectValue placeholder="Selecione um projeto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="bg-white/80 backdrop-blur-sm border-cyan-200">
            <Pencil className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openEditDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Projeto
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={openDeleteDialog}
            disabled={projects.length <= 1}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Projeto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" className="bg-white/80 backdrop-blur-sm border-cyan-200">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Adicione um novo projeto para gerenciar leads e equipe separadamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nome do Projeto</Label>
              <Input
                id="project-name"
                placeholder="Ex: Empresa ABC - Vendas"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProject} disabled={!newProjectName.trim()} className="bg-sky-500 hover:bg-sky-600">
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize o nome do projeto atual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Nome do Projeto</Label>
              <Input
                id="edit-project-name"
                placeholder="Ex: Empresa ABC - Vendas"
                value={editingProject?.nome || ''}
                onChange={(e) => setEditingProject(prev => prev ? { ...prev, nome: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditProject} 
              disabled={!editingProject?.nome.trim()}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o projeto "{currentProject?.nome}"? Todos os dados associados 
              (leads, reuniões e membros da equipe) serão permanentemente removidos. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
