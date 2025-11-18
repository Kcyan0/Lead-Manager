'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCRM } from '@/lib/crm-context';
import { Lead, LeadStatus, getUserName } from '@/lib/database';
import { Phone, Instagram, User, DollarSign, Plus, Search, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLUMN_CONFIG: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'novo', label: 'Novo', color: 'bg-blue-500' },
  { status: 'follow-up', label: 'Follow-Up', color: 'bg-yellow-500' },
  { status: 'remarcado', label: 'Remarcado', color: 'bg-orange-500' },
  { status: 'no-show', label: 'No-Show', color: 'bg-gray-500' },
  { status: 'venda', label: 'Venda', color: 'bg-green-500' },
  { status: 'reembolsado', label: 'Reembolsado', color: 'bg-red-500' },
  { status: 'loss', label: 'Loss', color: 'bg-slate-600' },
];

const commissionRates = {
  closer: 0.1, // Example commission rate for closer
  sdr: 0.05,    // Example commission rate for SDR
};

export function KanbanScreen() {
  const { leads, users, updateLeadStatus, updateLead, removeLead, addSale, gateways } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSdr, setSelectedSdr] = useState<string>('all');
  const [selectedCloser, setSelectedCloser] = useState<string>('all');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [saleLeadId, setSaleLeadId] = useState<string>('');
  const [saleValor, setSaleValor] = useState('');
  const [saleGateway, setSaleGateway] = useState('');

  const sdrs = users.filter(u => u.funcao === 'SDR');
  const closers = users.filter(u => u.funcao === 'Closer');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (searchTerm && !lead.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedSdr !== 'all' && lead.sdr_responsavel !== selectedSdr) {
        return false;
      }
      if (selectedCloser !== 'all' && lead.closer_responsavel !== selectedCloser) {
        return false;
      }
      return true;
    });
  }, [leads, searchTerm, selectedSdr, selectedCloser]);

  const groupedLeads = useMemo(() => {
    const groups: Record<LeadStatus, Lead[]> = {
      'novo': [],
      'follow-up': [],
      'remarcado': [],
      'no-show': [],
      'venda': [],
      'reembolsado': [],
      'loss': [],
    };
    
    filteredLeads.forEach(lead => {
      groups[lead.status].push(lead);
    });
    
    return groups;
  }, [filteredLeads]);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: LeadStatus) => {
    if (draggedLead && draggedLead.status !== status) {
      if (status === 'venda') {
        setSaleLeadId(draggedLead.id);
        setIsSaleDialogOpen(true);
      } else {
        updateLeadStatus(draggedLead.id, status);
      }
    }
    setDraggedLead(null);
  };

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  const handleUpdateLead = (updates: Partial<Lead>) => {
    if (selectedLead) {
      updateLead(selectedLead.id, updates);
      setSelectedLead({ ...selectedLead, ...updates });
    }
  };

  const handleRemoveLead = () => {
    if (selectedLead && confirm(`Tem certeza que deseja remover o lead "${selectedLead.nome}"?`)) {
      removeLead(selectedLead.id);
      setIsDialogOpen(false);
      setSelectedLead(null);
    }
  };

  const handleRecordSale = () => {
    if (!saleLeadId || !saleValor || !saleGateway) return;

    const lead = leads.find(l => l.id === saleLeadId);
    if (!lead) return;

    const valor = parseFloat(saleValor);
    const gateway = gateways.find(g => g.id === saleGateway);
    const taxaPercentual = gateway?.taxa_percentual || 0;
    const taxaValor = (valor * taxaPercentual) / 100;
    const valorLiquido = valor - taxaValor;
    const comissaoCloser = valor * commissionRates.closer;
    const comissaoSdr = valor * commissionRates.sdr;

    updateLeadStatus(saleLeadId, 'venda');
    updateLead(saleLeadId, {
      valor_da_venda: valor,
      tipo_pagamento: 'pix',
    });

    addSale({
      lead_id: saleLeadId,
      closer_id: lead.closer_responsavel || users.find(u => u.funcao === 'Closer')?.id || '',
      sdr_id: lead.sdr_responsavel,
      valor_bruto: valor,
      metodo_pagamento: gateway?.nome as any || 'PIX',
      taxa_percentual: taxaPercentual,
      taxa_valor: taxaValor,
      valor_liquido: valorLiquido,
      comissao_closer: comissaoCloser,
      comissao_sdr: comissaoSdr,
      data_venda: new Date(),
    });

    setSaleLeadId('');
    setSaleValor('');
    setSaleGateway('');
    setIsSaleDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Quadro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Buscar Lead</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Label>Filtrar por SDR</Label>
              <Select value={selectedSdr} onValueChange={setSelectedSdr}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos os SDRs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os SDRs</SelectItem>
                  {sdrs.map(sdr => (
                    <SelectItem key={sdr.id} value={sdr.id}>
                      {sdr.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Label>Filtrar por Closer</Label>
              <Select value={selectedCloser} onValueChange={setSelectedCloser}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos os Closers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Closers</SelectItem>
                  {closers.map(closer => (
                    <SelectItem key={closer.id} value={closer.id}>
                      {closer.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {COLUMN_CONFIG.map(column => (
          <div
            key={column.status}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            <div className={`${column.color} text-white rounded-t-lg p-3 flex items-center justify-between`}>
              <span className="font-semibold">{column.label}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {groupedLeads[column.status].length}
              </Badge>
            </div>
            
            <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[400px]">
              {groupedLeads[column.status].map(lead => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  onClick={() => handleCardClick(lead)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="font-semibold text-sm">{lead.nome}</div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.telefone}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        <span>{lead.instagram}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>SDR: {getUserName(lead.sdr_responsavel)}</span>
                      </div>
                      
                      {lead.closer_responsavel && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Closer: {getUserName(lead.closer_responsavel)}</span>
                        </div>
                      )}
                      
                      {lead.valor_da_venda && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>R$ {lead.valor_da_venda.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(lead.data_atualizacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    </div>
                    
                    {lead.briefing && (
                      <div className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t">
                        {lead.briefing}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              Visualize e edite as informações do lead
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={selectedLead.nome}
                    onChange={(e) => handleUpdateLead({ nome: e.target.value })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={selectedLead.telefone}
                    onChange={(e) => handleUpdateLead({ telefone: e.target.value })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={selectedLead.instagram}
                    onChange={(e) => handleUpdateLead({ instagram: e.target.value })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Email</Label>
                  <Input
                    value={selectedLead.email || ''}
                    onChange={(e) => handleUpdateLead({ email: e.target.value })}
                    className="mt-2"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label>SDR Responsável</Label>
                  <Select
                    value={selectedLead.sdr_responsavel}
                    onValueChange={(value) => handleUpdateLead({ sdr_responsavel: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sdrs.map(sdr => (
                        <SelectItem key={sdr.id} value={sdr.id}>
                          {sdr.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Closer Responsável</Label>
                  <Select
                    value={selectedLead.closer_responsavel || 'none'}
                    onValueChange={(value) => handleUpdateLead({ closer_responsavel: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {closers.map(closer => (
                        <SelectItem key={closer.id} value={closer.id}>
                          {closer.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(value) => handleUpdateLead({ status: value as LeadStatus })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_CONFIG.map(col => (
                        <SelectItem key={col.status} value={col.status}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(selectedLead.status === 'venda' || selectedLead.status === 'reembolsado') && (
                  <>
                    <div>
                      <Label>Valor da Venda</Label>
                      <Input
                        type="number"
                        value={selectedLead.valor_da_venda || ''}
                        onChange={(e) => handleUpdateLead({ valor_da_venda: Number(e.target.value) })}
                        className="mt-2"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label>Tipo de Pagamento</Label>
                      <Select
                        value={selectedLead.tipo_pagamento || 'pix'}
                        onValueChange={(value) => handleUpdateLead({ tipo_pagamento: value as any })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <Label>Briefing</Label>
                <Textarea
                  value={selectedLead.briefing || ''}
                  onChange={(e) => handleUpdateLead({ briefing: e.target.value })}
                  className="mt-2"
                  placeholder="Informações sobre o lead..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={selectedLead.observacoes || ''}
                  onChange={(e) => handleUpdateLead({ observacoes: e.target.value })}
                  className="mt-2"
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Criado: {format(new Date(selectedLead.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                <span>Atualizado: {format(new Date(selectedLead.data_atualizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleRemoveLead}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover Lead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Venda</DialogTitle>
            <DialogDescription>
              Informe o valor e o gateway de pagamento para registrar a venda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sale-valor">Valor da Venda</Label>
              <Input
                id="sale-valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={saleValor}
                onChange={(e) => setSaleValor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-gateway">Gateway de Pagamento</Label>
              <Select value={saleGateway} onValueChange={setSaleGateway}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gateway" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map(gateway => (
                    <SelectItem key={gateway.id} value={gateway.id}>
                      {gateway.nome} ({gateway.taxa_percentual}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {saleValor && saleGateway && (
              <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor Bruto:</span>
                  <span className="font-semibold">R$ {parseFloat(saleValor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa ({gateways.find(g => g.id === saleGateway)?.taxa_percentual}%):</span>
                  <span>- R$ {((parseFloat(saleValor) * (gateways.find(g => g.id === saleGateway)?.taxa_percentual || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Valor Líquido:</span>
                  <span>R$ {(parseFloat(saleValor) - (parseFloat(saleValor) * (gateways.find(g => g.id === saleGateway)?.taxa_percentual || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRecordSale} disabled={!saleValor || !saleGateway}>
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
