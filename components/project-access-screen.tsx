'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCRM } from '@/lib/crm-context';
import { useAuth } from '@/lib/auth-context';
import { UserPlus, X, Mail } from 'lucide-react';
import { mockAccounts } from '@/lib/database';

export function ProjectAccessScreen() {
  const { projects, currentProjectId } = useCRM();
  const { currentUser } = useAuth();
  const [emailToShare, setEmailToShare] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId);

  if (!currentProject) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <p className="text-center text-gray-300">Nenhum projeto selecionado</p>
        </CardContent>
      </Card>
    );
  }

  const projectUsers = mockAccounts.filter(account => 
    account.projectIds.includes(currentProjectId)
  );

  const handleShareProject = () => {
    setError('');
    const targetAccount = mockAccounts.find(acc => acc.email === emailToShare);
    
    if (!targetAccount) {
      setError('Usuário não encontrado');
      return;
    }

    if (targetAccount.projectIds.includes(currentProjectId)) {
      setError('Este usuário já tem acesso ao projeto');
      return;
    }

    targetAccount.projectIds.push(currentProjectId);
    setEmailToShare('');
    setShareDialogOpen(false);
  };

  const handleRemoveAccess = (accountId: string) => {
    const account = mockAccounts.find(acc => acc.id === accountId);
    if (account) {
      const index = account.projectIds.indexOf(currentProjectId);
      if (index > -1) {
        account.projectIds.splice(index, 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Gerenciar Acesso ao Projeto</CardTitle>
              <CardDescription className="text-gray-300">
                Controle quem pode acessar o projeto "{currentProject.nome}"
              </CardDescription>
            </div>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Compartilhar Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Compartilhar Projeto</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Digite o email do usuário com quem deseja compartilhar este projeto
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email do Usuário</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@email.com"
                      value={emailToShare}
                      onChange={(e) => setEmailToShare(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    />
                  </div>
                  {error && (
                    <div className="text-red-300 text-sm bg-red-500/20 p-2 rounded">
                      {error}
                    </div>
                  )}
                  <Button 
                    onClick={handleShareProject} 
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Compartilhar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Usuários com Acesso ({projectUsers.length})
              </h3>
              <div className="space-y-2">
                {projectUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.nome}</p>
                        <p className="text-xs text-gray-300 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAccess(user.id)}
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white">Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-gray-300">Nome do Projeto</Label>
            <p className="text-white font-medium">{currentProject.nome}</p>
          </div>
          <div>
            <Label className="text-gray-300">Data de Criação</Label>
            <p className="text-white font-medium">
              {currentProject.data_criacao.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <Label className="text-gray-300">ID do Projeto</Label>
            <p className="text-white font-mono text-sm">{currentProject.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
