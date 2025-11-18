'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCRM } from '@/lib/crm-context';
import { getUserName } from '@/lib/database';
import { BarChart3, DollarSign, TrendingUp, Users, UserPlus, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { UserRole } from '@/lib/database';

export function DashboardScreen() {
  const { leads, users, sales, gateways, addUser, removeUser } = useCRM();
  const [selectedSdr, setSelectedSdr] = useState<string>('all');
  const [selectedCloser, setSelectedCloser] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isAddSdrOpen, setIsAddSdrOpen] = useState(false);
  const [isAddCloserOpen, setIsAddCloserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const sdrs = users.filter(u => u.funcao === 'SDR');
  const closers = users.filter(u => u.funcao === 'Closer');

  const handleAddUser = (role: UserRole) => {
    if (newUserName.trim()) {
      addUser({ nome: newUserName.trim(), funcao: role });
      setNewUserName('');
      if (role === 'SDR') {
        setIsAddSdrOpen(false);
      } else {
        setIsAddCloserOpen(false);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      removeUser(userId);
    }
  };

  // Filter leads based on selected filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (selectedSdr !== 'all' && lead.sdr_responsavel !== selectedSdr) return false;
      if (selectedCloser !== 'all' && lead.closer_responsavel !== selectedCloser) return false;
      
      if (selectedPeriod !== 'all') {
        const leadDate = new Date(lead.data_criacao);
        const now = new Date();
        const daysAgo = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedPeriod === '7' && daysAgo > 7) return false;
        if (selectedPeriod === '30' && daysAgo > 30) return false;
        if (selectedPeriod === '90' && daysAgo > 90) return false;
      }
      
      return true;
    });
  }, [leads, selectedSdr, selectedCloser, selectedPeriod]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (selectedPeriod !== 'all') {
        const saleDate = new Date(sale.data_venda);
        const now = new Date();
        const daysAgo = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedPeriod === '7' && daysAgo > 7) return false;
        if (selectedPeriod === '30' && daysAgo > 30) return false;
        if (selectedPeriod === '90' && daysAgo > 90) return false;
      }
      
      return true;
    });
  }, [sales, selectedPeriod]);

  // Calculate KPIs
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.valor_bruto, 0);
  }, [filteredSales]);

  const netCash = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.valor_liquido, 0);
  }, [filteredSales]);

  const totalLeads = filteredLeads.length;

  const conversionRate = useMemo(() => {
    const salesCount = filteredSales.length;
    return totalLeads > 0 ? ((salesCount / totalLeads) * 100).toFixed(1) : '0.0';
  }, [filteredLeads, totalLeads, filteredSales]);

  const revenueByPayment = useMemo(() => {
    const paymentData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const paymentType = sale.metodo_pagamento;
      if (paymentType) {
        paymentData[paymentType] = (paymentData[paymentType] || 0) + sale.valor_bruto;
      }
    });
    return Object.entries(paymentData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const revenueByCloser = useMemo(() => {
    const closerData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const closerName = getUserName(sale.closer_id);
      closerData[closerName] = (closerData[closerName] || 0) + sale.valor_bruto;
    });
    return Object.entries(closerData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const revenueBySdr = useMemo(() => {
    const sdrData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const sdrName = getUserName(sale.sdr_id);
      sdrData[sdrName] = (sdrData[sdrName] || 0) + sale.valor_bruto;
    });
    return Object.entries(sdrData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const liquidCashByCloser = useMemo(() => {
    const closerData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const closerName = getUserName(sale.closer_id);
      closerData[closerName] = (closerData[closerName] || 0) + sale.valor_liquido;
    });
    return Object.entries(closerData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const liquidCashBySdr = useMemo(() => {
    const sdrData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const sdrName = getUserName(sale.sdr_id);
      sdrData[sdrName] = (sdrData[sdrName] || 0) + sale.valor_liquido;
    });
    return Object.entries(sdrData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const commissionByCloser = useMemo(() => {
    const closerData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const closerName = getUserName(sale.closer_id);
      closerData[closerName] = (closerData[closerName] || 0) + sale.comissao_closer;
    });
    return Object.entries(closerData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const commissionBySdr = useMemo(() => {
    const sdrData: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const sdrName = getUserName(sale.sdr_id);
      sdrData[sdrName] = (sdrData[sdrName] || 0) + sale.comissao_sdr;
    });
    return Object.entries(sdrData).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  // Lead status distribution
  const statusDistribution = useMemo(() => {
    const statusData: Record<string, number> = {};
    filteredLeads.forEach(lead => {
      statusData[lead.status] = (statusData[lead.status] || 0) + 1;
    });
    
    const total = filteredLeads.length;
    const statusConfig: Record<string, { label: string; color: string }> = {
      'remarcado': { label: 'Remarcado', color: '#f59e0b' },
      'loss': { label: 'Loss / Não prosseguiu', color: '#ec4899' },
      'venda': { label: 'Venda', color: '#ef4444' },
      'no-show': { label: 'No-Show', color: '#fb923c' },
      'novo': { label: 'Novo', color: '#06b6d4' },
      'reembolsado': { label: 'Reembolsado', color: '#a855f7' },
      'reunião marcada': { label: 'Reunião marcada', color: '#10b981' },
    };
    
    return Object.entries(statusData)
      .map(([status, count]) => ({
        status,
        label: statusConfig[status]?.label || status,
        color: statusConfig[status]?.color || '#6b7280',
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const FinancialCard = ({ title, description, data }: { title: string; description: string; data: { name: string; value: number }[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx={70}
                    cy={70}
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm font-medium border-b pb-2">
                <span>Responsável</span>
                <span>Valor</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <span className="font-medium text-xs">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm font-bold border-t pt-2 mt-2">
                <span>SUM</span>
                <span>R$ {data.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado para exibir.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">SDR</label>
              <Select value={selectedSdr} onValueChange={setSelectedSdr}>
                <SelectTrigger>
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
              <label className="text-sm font-medium mb-2 block">Closer</label>
              <Select value={selectedCloser} onValueChange={setSelectedCloser}>
                <SelectTrigger>
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
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todo o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredSales.length} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Caixa Gerado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {netCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Líquido após taxas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads no Período</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de leads captados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads convertidos em vendas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FinancialCard 
          title="Receita por Pagamento"
          description="Distribuição da receita por forma de pagamento."
          data={revenueByPayment}
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Leads</CardTitle>
            <CardDescription className="text-sm">Distribuição dos leads por status no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground text-xs">
                        {item.label} ({item.count})
                      </span>
                    </div>
                    <span className="font-semibold text-foreground text-xs">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <FinancialCard 
          title="Receita por Closer"
          description="Receita total gerada por cada closer."
          data={revenueByCloser}
        />

        <FinancialCard 
          title="Receita por SDR"
          description="Receita total gerada por cada SDR."
          data={revenueBySdr}
        />

        <FinancialCard 
          title="Caixa Gerado (Líquido) por Closer"
          description="Caixa líquido gerado por cada closer."
          data={liquidCashByCloser}
        />

        <FinancialCard 
          title="Caixa Gerado (Líquido) por SDR"
          description="Caixa líquido gerado por cada SDR."
          data={liquidCashBySdr}
        />

        <FinancialCard 
          title="Comissão por Closer"
          description="Comissão calculada para cada closer."
          data={commissionByCloser}
        />

        <FinancialCard 
          title="Comissão por SDR"
          description="Comissão calculada para cada SDR."
          data={commissionBySdr}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversão por SDR</CardTitle>
            <CardDescription className="text-sm">Performance de cada membro da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-xs font-medium">Membro</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Leads</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Vendas</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Tx. Conv.</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Tx. Reemb.</th>
                  </tr>
                </thead>
                <tbody>
                  {sdrs.map((sdr, index) => {
                    const sdrLeads = filteredLeads.filter(l => l.sdr_responsavel === sdr.id);
                    const salesCount = sdrLeads.filter(l => l.status === 'venda').length;
                    const refunds = sdrLeads.filter(l => l.status === 'reembolsado').length;
                    const conversion = sdrLeads.length > 0 ? ((salesCount / sdrLeads.length) * 100).toFixed(1) : '0.0';
                    const refundRate = salesCount > 0 ? ((refunds / salesCount) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <span className="text-xs font-semibold text-cyan-600">{sdr.nome.charAt(0)}</span>
                            </div>
                            <span className="text-xs">{sdr.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-center">{sdrLeads.length}</td>
                        <td className="py-3 px-2 text-xs text-center">{salesCount}</td>
                        <td className="py-3 px-2 text-xs text-center text-cyan-600 font-medium">{conversion}%</td>
                        <td className="py-3 px-2 text-xs text-center text-red-600 font-medium">{refundRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversão por Closer</CardTitle>
            <CardDescription className="text-sm">Performance de cada membro da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-xs font-medium">Membro</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Leads</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Vendas</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Tx. Conv.</th>
                    <th className="text-center py-2 px-2 text-xs font-medium">Tx. Reemb.</th>
                  </tr>
                </thead>
                <tbody>
                  {closers.map((closer, index) => {
                    const closerLeads = filteredLeads.filter(l => l.closer_responsavel === closer.id);
                    const salesCount = closerLeads.filter(l => l.status === 'venda').length;
                    const refunds = closerLeads.filter(l => l.status === 'reembolsado').length;
                    const conversion = closerLeads.length > 0 ? ((salesCount / closerLeads.length) * 100).toFixed(1) : '0.0';
                    const refundRate = salesCount > 0 ? ((refunds / salesCount) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-semibold text-purple-600">{closer.nome.charAt(0)}</span>
                            </div>
                            <span className="text-xs">{closer.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-center">{closerLeads.length}</td>
                        <td className="py-3 px-2 text-xs text-center">{salesCount}</td>
                        <td className="py-3 px-2 text-xs text-center text-cyan-600 font-medium">{conversion}%</td>
                        <td className="py-3 px-2 text-xs text-center text-red-600 font-medium">{refundRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
