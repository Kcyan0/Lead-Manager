'use client';

import { useState } from 'react';
import { useCRM } from '@/lib/crm-context';
import { User, UserRole } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function TeamAdminScreen() {
  const { users, addUser, removeUser } = useCRM();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('SDR');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '' });

  const sdrs = users.filter(u => u.funcao === 'SDR');
  const closers = users.filter(u => u.funcao === 'Closer');

  const handleAdd = () => {
    if (formData.nome && formData.email) {
      addUser({ nome: formData.nome, funcao: currentRole });
      setFormData({ nome: '', email: '' });
      setShowAddDialog(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ nome: user.nome, email: '' });
    setShowEditDialog(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      removeUser(selectedUser.id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const TeamTable = ({ members, role }: { members: User[]; role: UserRole }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{role === 'SDR' ? 'SDRs' : 'Closers'}</CardTitle>
          <CardDescription>
            Adicione, edite ou remova {role === 'SDR' ? 'SDRs' : 'Closers'} da sua equipe.
          </CardDescription>
        </div>
        <Button
          onClick={() => {
            setCurrentRole(role);
            setFormData({ nome: '', email: '' });
            setShowAddDialog(true);
          }}
          className="bg-sky-500 hover:bg-sky-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar {role}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,2fr,120px] gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
            <div>Nome</div>
            <div>Email</div>
            <div>Ações</div>
          </div>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum {role} cadastrado
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1fr,2fr,120px] gap-4 items-center py-3 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium">
                    {getInitials(member.nome)}
                  </div>
                  <span className="font-medium">{member.nome}</span>
                </div>
                <div className="text-muted-foreground">
                  {member.nome.toLowerCase().replace(/\s+/g, '') + '@email.com'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(member)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Gerenciar Time</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie os membros da sua equipe de vendas
        </p>
      </div>

      <Tabs defaultValue="sdrs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sdrs">SDRs</TabsTrigger>
          <TabsTrigger value="closers">Closers</TabsTrigger>
        </TabsList>

        <TabsContent value="sdrs">
          <TeamTable members={sdrs} role="SDR" />
        </TabsContent>

        <TabsContent value="closers">
          <TeamTable members={closers} role="Closer" />
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar {currentRole}</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo membro da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome</Label>
              <Input
                id="add-name"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.nome || !formData.email}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {selectedUser?.funcao}</DialogTitle>
            <DialogDescription>
              Atualize os dados do membro da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Note: We would need to add updateUser to context for full edit functionality
                setShowEditDialog(false);
              }}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedUser?.nome} da equipe? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
