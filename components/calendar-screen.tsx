'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/lib/crm-context';
import { Meeting, MeetingStatus, MeetingType, getUserName, LeadStatus } from '@/lib/database';
import { format, startOfWeek, addDays, isSameDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, FileText } from 'lucide-react';

export function CalendarScreen() {
  const { meetings, leads, users, addMeeting, updateMeeting, addLead } = useCRM();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSdr, setSelectedSdr] = useState<string>('all');
  const [selectedCloser, setSelectedCloser] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    // Lead fields
    nome: '',
    telefone: '',
    instagram: '',
    email: '',
    briefing: '',
    // Meeting fields
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '10:00',
    sdr: '',
    closer: '',
    tipo: 'qualificacao' as MeetingType,
    status: 'marcado' as MeetingStatus,
    observacoes: '',
  });

  const sdrs = users.filter(u => u.funcao === 'SDR');
  const closers = users.filter(u => u.funcao === 'Closer');

  // Get start of week for calendar view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      if (selectedSdr !== 'all' && meeting.sdr !== selectedSdr) return false;
      if (selectedCloser !== 'all' && meeting.closer !== selectedCloser) return false;
      return true;
    });
  }, [meetings, selectedSdr, selectedCloser]);

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    
    filteredMeetings.forEach(meeting => {
      const dateKey = format(new Date(meeting.data), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meeting);
    });
    
    // Sort meetings by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => a.hora.localeCompare(b.hora));
    });
    
    return groups;
  }, [filteredMeetings]);

  const handlePreviousWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.nome || !newMeeting.telefone || !newMeeting.instagram || !newMeeting.sdr) return;
    
    // Create the lead first
    const leadId = String(Date.now());
    addLead({
      nome: newMeeting.nome,
      telefone: newMeeting.telefone,
      instagram: newMeeting.instagram,
      email: newMeeting.email || undefined,
      sdr_responsavel: newMeeting.sdr,
      closer_responsavel: newMeeting.closer || undefined,
      status: 'novo' as LeadStatus,
      briefing: newMeeting.briefing || undefined,
    });
    
    // Then create the meeting with the new lead ID
    addMeeting({
      lead_id: leadId,
      data: parse(newMeeting.data, 'yyyy-MM-dd', new Date()),
      hora: newMeeting.hora,
      sdr: newMeeting.sdr,
      closer: newMeeting.closer || undefined,
      tipo: newMeeting.tipo,
      status: newMeeting.status,
      observacoes: newMeeting.observacoes || undefined,
    });
    
    // Reset form
    setNewMeeting({
      nome: '',
      telefone: '',
      instagram: '',
      email: '',
      briefing: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: '10:00',
      sdr: '',
      closer: '',
      tipo: 'qualificacao',
      status: 'marcado',
      observacoes: '',
    });
    
    setIsCreateDialogOpen(false);
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsViewDialogOpen(true);
  };

  const handleUpdateMeetingStatus = (status: MeetingStatus) => {
    if (selectedMeeting) {
      updateMeeting(selectedMeeting.id, { status });
      setSelectedMeeting({ ...selectedMeeting, status });
    }
  };

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'marcado': return 'bg-blue-500';
      case 'remarcado': return 'bg-orange-500';
      case 'concluido': return 'bg-green-500';
      case 'no-show': return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: MeetingStatus) => {
    switch (status) {
      case 'marcado': return 'Marcado';
      case 'remarcado': return 'Remarcado';
      case 'concluido': return 'Concluído';
      case 'no-show': return 'No-Show';
    }
  };

  const getTipoLabel = (tipo: MeetingType) => {
    return tipo === 'qualificacao' ? 'Qualificação' : 'Fechamento';
  };

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.nome : 'Lead não encontrado';
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Agenda de Reuniões</CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reunião
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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

      {/* Calendar navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {format(weekStart, 'dd MMM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: ptBR })}
              </h3>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoje
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly calendar view */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayMeetings = meetingsByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={index} className={isToday ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  <div className={`flex flex-col items-center ${isToday ? 'text-primary' : ''}`}>
                    <span className="text-xs font-normal">
                      {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold">
                      {format(day, 'dd')}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayMeetings.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nenhuma reunião
                  </p>
                ) : (
                  dayMeetings.map(meeting => {
                    const lead = leads.find(l => l.id === meeting.lead_id);
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => handleViewMeeting(meeting)}
                        className="p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-semibold">{meeting.hora}</span>
                        </div>
                        <p className="text-xs font-medium truncate">{lead?.nome}</p>
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(meeting.status)} text-white text-[10px] mt-1 border-0`}
                        >
                          {getStatusLabel(meeting.status)}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Reunião</DialogTitle>
            <DialogDescription>
              Crie um novo lead e agende uma reunião
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-semibold text-sm">Informações do Lead</h3>
              
              <div>
                <Label>Nome do Lead *</Label>
                <Input
                  value={newMeeting.nome}
                  onChange={(e) => setNewMeeting({ ...newMeeting, nome: e.target.value })}
                  placeholder="Nome completo"
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone *</Label>
                  <Input
                    value={newMeeting.telefone}
                    onChange={(e) => setNewMeeting({ ...newMeeting, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Instagram *</Label>
                  <Input
                    value={newMeeting.instagram}
                    onChange={(e) => setNewMeeting({ ...newMeeting, instagram: e.target.value })}
                    placeholder="@usuario"
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email (Opcional)</Label>
                <Input
                  type="email"
                  value={newMeeting.email}
                  onChange={(e) => setNewMeeting({ ...newMeeting, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Briefing (Opcional)</Label>
                <Textarea
                  value={newMeeting.briefing}
                  onChange={(e) => setNewMeeting({ ...newMeeting, briefing: e.target.value })}
                  placeholder="Informações sobre o lead..."
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informações da Reunião</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={newMeeting.data}
                    onChange={(e) => setNewMeeting({ ...newMeeting, data: e.target.value })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={newMeeting.hora}
                    onChange={(e) => setNewMeeting({ ...newMeeting, hora: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label>SDR Responsável *</Label>
                <Select value={newMeeting.sdr} onValueChange={(value) => setNewMeeting({ ...newMeeting, sdr: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione um SDR" />
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
                <Label>Closer (Opcional)</Label>
                <Select value={newMeeting.closer} onValueChange={(value) => setNewMeeting({ ...newMeeting, closer: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione um closer" />
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
                <Label>Tipo de Reunião *</Label>
                <Select value={newMeeting.tipo} onValueChange={(value) => setNewMeeting({ ...newMeeting, tipo: value as MeetingType })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualificacao">Qualificação</SelectItem>
                    <SelectItem value="fechamento">Fechamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Observações da Reunião (Opcional)</Label>
                <Textarea
                  value={newMeeting.observacoes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, observacoes: e.target.value })}
                  placeholder="Observações sobre a reunião..."
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleCreateMeeting} 
              className="w-full"
              disabled={!newMeeting.nome || !newMeeting.telefone || !newMeeting.instagram || !newMeeting.sdr}
            >
              Criar Lead e Agendar Reunião
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Meeting Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reunião</DialogTitle>
            <DialogDescription>
              Visualize e atualize o status da reunião
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeeting && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Lead</Label>
                <p className="mt-1 font-medium">{getLeadName(selectedMeeting.lead_id)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p className="mt-1 font-medium">
                    {format(new Date(selectedMeeting.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Hora</Label>
                  <p className="mt-1 font-medium">{selectedMeeting.hora}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">SDR</Label>
                <p className="mt-1 font-medium">{getUserName(selectedMeeting.sdr)}</p>
              </div>
              
              {selectedMeeting.closer && (
                <div>
                  <Label className="text-muted-foreground">Closer</Label>
                  <p className="mt-1 font-medium">{getUserName(selectedMeeting.closer)}</p>
                </div>
              )}
              
              <div>
                <Label className="text-muted-foreground">Tipo</Label>
                <p className="mt-1 font-medium">{getTipoLabel(selectedMeeting.tipo)}</p>
              </div>
              
              {selectedMeeting.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-1 text-sm">{selectedMeeting.observacoes}</p>
                </div>
              )}
              
              <div>
                <Label>Atualizar Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={selectedMeeting.status === 'marcado' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMeetingStatus('marcado')}
                  >
                    Marcado
                  </Button>
                  <Button
                    variant={selectedMeeting.status === 'remarcado' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMeetingStatus('remarcado')}
                  >
                    Remarcado
                  </Button>
                  <Button
                    variant={selectedMeeting.status === 'concluido' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMeetingStatus('concluido')}
                  >
                    Concluído
                  </Button>
                  <Button
                    variant={selectedMeeting.status === 'no-show' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMeetingStatus('no-show')}
                  >
                    No-Show
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
