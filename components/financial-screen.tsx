'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCRM } from '@/lib/crm-context';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { commissionRates } from '@/lib/database';

export function FinancialScreen() {
  const { gateways, addGateway, updateGateway, removeGateway } = useCRM();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<{ id: string; nome: string; taxa: number } | null>(null);
  
  // Form state
  const [gatewayName, setGatewayName] = useState('');
  const [gatewayTax, setGatewayTax] = useState('');

  // Commission state
  const [closerCommission, setCloserCommission] = useState(String(commissionRates.closer * 100));
  const [sdrCommission, setSdrCommission] = useState(String(commissionRates.sdr * 100));

  const handleAddGateway = () => {
    if (!gatewayName || !gatewayTax) return;

    addGateway({
      nome: gatewayName,
      taxa_percentual: parseFloat(gatewayTax),
    });

    setGatewayName('');
    setGatewayTax('');
    setIsAddDialogOpen(false);
  };

  const handleEditGateway = () => {
    if (!editingGateway || !editingGateway.nome || !editingGateway.taxa) return;

    updateGateway(editingGateway.id, {
      nome: editingGateway.nome,
      taxa_percentual: editingGateway.taxa,
    });

    setEditingGateway(null);
    setIsEditDialogOpen(false);
  };

  const handleRemoveGateway = (gatewayId: string, gatewayName: string) => {
    if (confirm(`Tem certeza que deseja remover o gateway "${gatewayName}"?`)) {
      removeGateway(gatewayId);
    }
  };

  const openEditDialog = (gateway: { id: string; nome: string; taxa_percentual: number }) => {
    setEditingGateway({ id: gateway.id, nome: gateway.nome, taxa: gateway.taxa_percentual });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Gateways Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gateways de Pagamento</CardTitle>
              <CardDescription>Gerencie os gateways e suas taxas</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Gateway
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Gateway</DialogTitle>
                  <DialogDescription>
                    Adicione um novo gateway de pagamento com sua taxa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="gateway-name">Nome do Gateway</Label>
                    <Input
                      id="gateway-name"
                      placeholder="Ex: Stripe, PayPal, Mercado Pago"
                      value={gatewayName}
                      onChange={(e) => setGatewayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gateway-tax">Taxa (%)</Label>
                    <Input
                      id="gateway-tax"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 4.99"
                      value={gatewayTax}
                      onChange={(e) => setGatewayTax(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddGateway} disabled={!gatewayName || !gatewayTax}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 pb-2 border-b font-medium text-sm">
              <span>Nome</span>
              <span>Taxa</span>
              <span className="text-right">Ações</span>
            </div>
            {gateways.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Nenhum gateway cadastrado
              </div>
            ) : (
              gateways.map((gateway) => (
                <div key={gateway.id} className="grid grid-cols-3 gap-4 py-3 items-center border-b last:border-0">
                  <span className="font-medium">{gateway.nome}</span>
                  <span className="text-muted-foreground">{gateway.taxa_percentual}%</span>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(gateway)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGateway(gateway.id, gateway.nome)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commission Rates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Taxas de Comissão</CardTitle>
          <CardDescription>Configure as porcentagens de comissão para SDRs e Closers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closer-commission">Comissão Closer (%)</Label>
                <Input
                  id="closer-commission"
                  type="number"
                  step="0.1"
                  value={closerCommission}
                  onChange={(e) => setCloserCommission(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Atualmente: {closerCommission}% do valor bruto
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sdr-commission">Comissão SDR (%)</Label>
                <Input
                  id="sdr-commission"
                  type="number"
                  step="0.1"
                  value={sdrCommission}
                  onChange={(e) => setSdrCommission(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Atualmente: {sdrCommission}% do valor bruto
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> As taxas de comissão são aplicadas sobre o valor bruto da venda, 
                independente das taxas dos gateways de pagamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Gateway Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Gateway</DialogTitle>
            <DialogDescription>
              Atualize as informações do gateway de pagamento
            </DialogDescription>
          </DialogHeader>
          {editingGateway && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-gateway-name">Nome do Gateway</Label>
                <Input
                  id="edit-gateway-name"
                  value={editingGateway.nome}
                  onChange={(e) => setEditingGateway({ ...editingGateway, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gateway-tax">Taxa (%)</Label>
                <Input
                  id="edit-gateway-tax"
                  type="number"
                  step="0.01"
                  value={editingGateway.taxa}
                  onChange={(e) => setEditingGateway({ ...editingGateway, taxa: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditGateway}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
