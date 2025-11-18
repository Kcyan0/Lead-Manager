export type LeadStatus = 
  | 'novo' 
  | 'follow-up' 
  | 'remarcado' 
  | 'no-show' 
  | 'venda' 
  | 'reembolsado' 
  | 'loss';

export type PaymentType = 
  | 'pix' 
  | 'credito' 
  | 'boleto' 
  | 'debito';

export type UserRole = 'SDR' | 'Closer';

export type SalesMethod = 
  | 'TMB'
  | 'Zolt'
  | 'Ombrelone'
  | 'PIX'
  | 'Credito'
  | 'Boleto'
  | 'DINHEIRO'
  | 'Deposito';

export type Platform = 
  | 'Zolt'
  | 'Kiwify'
  | 'Eduzz'
  | 'Yampi'
  | 'Asaas'
  | 'Outros';

export type MeetingType = 'qualificacao' | 'fechamento';

export type MeetingStatus = 'marcado' | 'remarcado' | 'concluido' | 'no-show';

export interface User {
  id: string;
  nome: string;
  funcao: UserRole;
  foto?: string;
  projectId: string;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  instagram: string;
  email?: string;
  sdr_responsavel: string;
  closer_responsavel?: string;
  status: LeadStatus;
  valor_da_venda?: number;
  tipo_pagamento?: PaymentType;
  data_criacao: Date;
  data_atualizacao: Date;
  briefing?: string;
  observacoes?: string;
  projectId: string;
}

export interface Meeting {
  id: string;
  lead_id: string;
  data: Date;
  hora: string;
  sdr: string;
  closer?: string;
  tipo: MeetingType;
  status: MeetingStatus;
  observacoes?: string;
  projectId: string;
}

export interface Project {
  id: string;
  nome: string;
  data_criacao: Date;
}

export interface Sale {
  id: string;
  lead_id: string;
  closer_id: string;
  sdr_id: string;
  valor_bruto: number;
  metodo_pagamento: SalesMethod;
  plataforma?: Platform;
  taxa_percentual: number;
  taxa_valor: number;
  valor_liquido: number;
  comissao_closer: number;
  comissao_sdr: number;
  data_venda: Date;
  projectId: string;
}

export interface Gateway {
  id: string;
  nome: string;
  taxa_percentual: number;
  projectId: string;
}

// Mock data for SDRs
export const mockUsers: User[] = [
  { id: '1', nome: 'Carlos Silva', funcao: 'SDR', projectId: '1' },
  { id: '2', nome: 'Ana Santos', funcao: 'SDR', projectId: '1' },
  { id: '3', nome: 'Pedro Costa', funcao: 'SDR', projectId: '1' },
  { id: '4', nome: 'Julia Lima', funcao: 'Closer', projectId: '1' },
  { id: '5', nome: 'Ricardo Mendes', funcao: 'Closer', projectId: '1' },
  { id: '6', nome: 'Mariana Souza', funcao: 'Closer', projectId: '1' },
  // Project 2 users
  { id: '7', nome: 'Lucas Oliveira', funcao: 'SDR', projectId: '2' },
  { id: '8', nome: 'Sofia Martins', funcao: 'Closer', projectId: '2' },
  // Project 3 users
  { id: '9', nome: 'Gabriel Alves', funcao: 'SDR', projectId: '3' },
  { id: '10', nome: 'Isabela Costa', funcao: 'Closer', projectId: '3' },
];

// Mock data for leads
export const mockLeads: Lead[] = [
  {
    id: '1',
    nome: 'João Almeida',
    telefone: '(11) 98765-4321',
    instagram: '@joaoalmeida',
    email: 'joao@email.com',
    sdr_responsavel: '1',
    closer_responsavel: '4',
    status: 'venda',
    valor_da_venda: 5000,
    tipo_pagamento: 'pix',
    data_criacao: new Date('2024-01-15'),
    data_atualizacao: new Date('2024-01-20'),
    briefing: 'Interessado em consultoria empresarial',
    observacoes: 'Cliente decidiu fechar o pacote premium',
    projectId: '1'
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    telefone: '(21) 99876-5432',
    instagram: '@mariaoliveira',
    sdr_responsavel: '2',
    status: 'follow-up',
    data_criacao: new Date('2024-01-18'),
    data_atualizacao: new Date('2024-01-19'),
    briefing: 'Pediu mais informações sobre o serviço',
    projectId: '1'
  },
  {
    id: '3',
    nome: 'Lucas Ferreira',
    telefone: '(31) 97654-3210',
    instagram: '@lucasferreira',
    sdr_responsavel: '1',
    closer_responsavel: '5',
    status: 'remarcado',
    data_criacao: new Date('2024-01-10'),
    data_atualizacao: new Date('2024-01-18'),
    briefing: 'Precisa de treinamento para equipe',
    projectId: '1'
  },
  {
    id: '4',
    nome: 'Fernanda Costa',
    telefone: '(41) 96543-2109',
    instagram: '@fernandacosta',
    sdr_responsavel: '3',
    status: 'novo',
    data_criacao: new Date('2024-01-22'),
    data_atualizacao: new Date('2024-01-22'),
    briefing: 'Lead capturado via Instagram',
    projectId: '1'
  },
  {
    id: '5',
    nome: 'Roberto Santos',
    telefone: '(51) 95432-1098',
    instagram: '@robertosantos',
    email: 'roberto@email.com',
    sdr_responsavel: '2',
    closer_responsavel: '4',
    status: 'venda',
    valor_da_venda: 3500,
    tipo_pagamento: 'credito',
    data_criacao: new Date('2024-01-12'),
    data_atualizacao: new Date('2024-01-16'),
    briefing: 'Empresa de médio porte, interessado em mentoria',
    projectId: '1'
  },
  {
    id: '6',
    nome: 'Camila Lima',
    telefone: '(61) 94321-0987',
    instagram: '@camila_lima',
    sdr_responsavel: '3',
    status: 'no-show',
    data_criacao: new Date('2024-01-14'),
    data_atualizacao: new Date('2024-01-17'),
    briefing: 'Não compareceu à reunião agendada',
    projectId: '1'
  },
  {
    id: '7',
    nome: 'André Rocha',
    telefone: '(71) 93210-9876',
    instagram: '@andrerocha',
    sdr_responsavel: '1',
    closer_responsavel: '6',
    status: 'venda',
    valor_da_venda: 7500,
    tipo_pagamento: 'pix',
    data_criacao: new Date('2024-01-08'),
    data_atualizacao: new Date('2024-01-14'),
    briefing: 'Cliente corporativo premium',
    projectId: '1'
  },
  {
    id: '8',
    nome: 'Patricia Martins',
    telefone: '(81) 92109-8765',
    instagram: '@patriciamartins',
    sdr_responsavel: '2',
    status: 'loss',
    data_criacao: new Date('2024-01-11'),
    data_atualizacao: new Date('2024-01-15'),
    briefing: 'Não teve orçamento disponível',
    projectId: '1'
  },
  {
    id: '9',
    nome: 'Gustavo Pires',
    telefone: '(85) 91098-7654',
    instagram: '@gustavopires',
    sdr_responsavel: '3',
    closer_responsavel: '5',
    status: 'follow-up',
    data_criacao: new Date('2024-01-19'),
    data_atualizacao: new Date('2024-01-21'),
    briefing: 'Aguardando aprovação interna',
    projectId: '1'
  },
  {
    id: '10',
    nome: 'Juliana Moreira',
    telefone: '(91) 90987-6543',
    instagram: '@julianamoreira',
    email: 'juliana@email.com',
    sdr_responsavel: '1',
    closer_responsavel: '4',
    status: 'reembolsado',
    valor_da_venda: 4000,
    tipo_pagamento: 'credito',
    data_criacao: new Date('2024-01-05'),
    data_atualizacao: new Date('2024-01-20'),
    briefing: 'Solicitou reembolso por motivos pessoais',
    projectId: '1'
  },
  {
    id: '11',
    nome: 'Felipe Nascimento',
    telefone: '(92) 99876-5432',
    instagram: '@felipenascimento',
    sdr_responsavel: '2',
    status: 'novo',
    data_criacao: new Date('2024-01-23'),
    data_atualizacao: new Date('2024-01-23'),
    briefing: 'Lead qualificado via webinar',
    projectId: '1'
  },
  {
    id: '12',
    nome: 'Beatriz Carvalho',
    telefone: '(93) 98765-4321',
    instagram: '@beatrizcarvalho',
    sdr_responsavel: '3',
    closer_responsavel: '6',
    status: 'venda',
    valor_da_venda: 6000,
    tipo_pagamento: 'boleto',
    data_criacao: new Date('2024-01-09'),
    data_atualizacao: new Date('2024-01-18'),
    briefing: 'Cliente recorrente',
    projectId: '1'
  },
  // Project 2 leads
  {
    id: '13',
    nome: 'Thiago Pereira',
    telefone: '(11) 91234-5678',
    instagram: '@thiagopereira',
    sdr_responsavel: '7',
    closer_responsavel: '8',
    status: 'venda',
    valor_da_venda: 8000,
    tipo_pagamento: 'pix',
    data_criacao: new Date('2024-02-01'),
    data_atualizacao: new Date('2024-02-05'),
    briefing: 'Empresa de tecnologia',
    projectId: '2'
  },
  {
    id: '14',
    nome: 'Amanda Silva',
    telefone: '(21) 98765-1234',
    instagram: '@amandasilva',
    sdr_responsavel: '7',
    status: 'novo',
    data_criacao: new Date('2024-02-10'),
    data_atualizacao: new Date('2024-02-10'),
    briefing: 'Lead qualificado',
    projectId: '2'
  },
];

// Mock data for meetings
export const mockMeetings: Meeting[] = [
  {
    id: '1',
    lead_id: '3',
    data: new Date('2024-01-25'),
    hora: '10:00',
    sdr: '1',
    closer: '5',
    tipo: 'fechamento',
    status: 'marcado',
    observacoes: 'Reunião remarcada a pedido do cliente',
    projectId: '1'
  },
  {
    id: '2',
    lead_id: '2',
    data: new Date('2024-01-24'),
    hora: '14:00',
    sdr: '2',
    tipo: 'qualificacao',
    status: 'marcado',
    projectId: '1'
  },
  {
    id: '3',
    lead_id: '9',
    data: new Date('2024-01-26'),
    hora: '16:00',
    sdr: '3',
    closer: '5',
    tipo: 'fechamento',
    status: 'marcado',
    projectId: '1'
  },
  {
    id: '4',
    lead_id: '6',
    data: new Date('2024-01-17'),
    hora: '11:00',
    sdr: '3',
    tipo: 'qualificacao',
    status: 'no-show',
    observacoes: 'Cliente não compareceu',
    projectId: '1'
  },
  {
    id: '5',
    lead_id: '11',
    data: new Date('2024-01-27'),
    hora: '09:00',
    sdr: '2',
    tipo: 'qualificacao',
    status: 'marcado',
    projectId: '1'
  },
  // Project 2 meetings
  {
    id: '6',
    lead_id: '14',
    data: new Date('2024-02-15'),
    hora: '15:00',
    sdr: '7',
    tipo: 'qualificacao',
    status: 'marcado',
    projectId: '2'
  },
];

// Mock data for projects
export const mockProjects: Project[] = [
  { id: '1', nome: 'Yuri Cerri - Web Start', data_criacao: new Date('2024-01-01') },
  { id: '2', nome: 'Empresa Tech Solutions', data_criacao: new Date('2024-01-15') },
  { id: '3', nome: 'Consultoria Premium', data_criacao: new Date('2024-02-01') },
];

// Mock data for gateways
export const mockGateways: Gateway[] = [
  { id: '1', nome: 'PIX', taxa_percentual: 1.5, projectId: '1' },
  { id: '2', nome: 'Zolt', taxa_percentual: 6.5, projectId: '1' },
  { id: '3', nome: 'Kiwify', taxa_percentual: 9.9, projectId: '1' },
  { id: '4', nome: 'Eduzz', taxa_percentual: 8.9, projectId: '1' },
  { id: '5', nome: 'Yampi', taxa_percentual: 4.5, projectId: '1' },
  { id: '6', nome: 'Asaas', taxa_percentual: 3.5, projectId: '1' },
  { id: '7', nome: 'TMB', taxa_percentual: 0, projectId: '1' },
  { id: '8', nome: 'Ombrelone', taxa_percentual: 0, projectId: '1' },
  { id: '9', nome: 'Boleto', taxa_percentual: 3.5, projectId: '1' },
  { id: '10', nome: 'Crédito', taxa_percentual: 4.99, projectId: '1' },
  { id: '11', nome: 'DINHEIRO', taxa_percentual: 0, projectId: '1' },
  { id: '12', nome: 'Depósito', taxa_percentual: 0, projectId: '1' },
  // Project 2 gateways
  { id: '13', nome: 'PIX', taxa_percentual: 1.5, projectId: '2' },
  { id: '14', nome: 'Stripe', taxa_percentual: 5.9, projectId: '2' },
];

export const platformFees: Record<Platform, number> = {
  'Zolt': 6.5,
  'Kiwify': 9.9,
  'Eduzz': 8.9,
  'Yampi': 4.5,
  'Asaas': 3.5,
  'Outros': 5.0,
};

export const methodFees: Record<SalesMethod, number> = {
  'TMB': 0,
  'Zolt': 6.5,
  'Ombrelone': 0,
  'PIX': 1.5,
  'Credito': 4.99,
  'Boleto': 3.5,
  'DINHEIRO': 0,
  'Deposito': 0,
};

export const commissionRates = {
  closer: 0.10, // 10%
  sdr: 0.05, // 5%
};

export const mockSales: Sale[] = [
  {
    id: '1',
    lead_id: '1',
    closer_id: '4',
    sdr_id: '1',
    valor_bruto: 5000,
    metodo_pagamento: 'PIX',
    taxa_percentual: 1.5,
    taxa_valor: 75,
    valor_liquido: 4925,
    comissao_closer: 500,
    comissao_sdr: 250,
    data_venda: new Date('2024-01-20'),
    projectId: '1'
  },
  {
    id: '2',
    lead_id: '5',
    closer_id: '4',
    sdr_id: '2',
    valor_bruto: 3500,
    metodo_pagamento: 'Credito',
    plataforma: 'Kiwify',
    taxa_percentual: 9.9,
    taxa_valor: 346.5,
    valor_liquido: 3153.5,
    comissao_closer: 350,
    comissao_sdr: 175,
    data_venda: new Date('2024-01-16'),
    projectId: '1'
  },
  {
    id: '3',
    lead_id: '7',
    closer_id: '6',
    sdr_id: '1',
    valor_bruto: 7500,
    metodo_pagamento: 'PIX',
    taxa_percentual: 1.5,
    taxa_valor: 112.5,
    valor_liquido: 7387.5,
    comissao_closer: 750,
    comissao_sdr: 375,
    data_venda: new Date('2024-01-14'),
    projectId: '1'
  },
  {
    id: '4',
    lead_id: '12',
    closer_id: '6',
    sdr_id: '3',
    valor_bruto: 6000,
    metodo_pagamento: 'Boleto',
    plataforma: 'Asaas',
    taxa_percentual: 3.5,
    taxa_valor: 210,
    valor_liquido: 5790,
    comissao_closer: 600,
    comissao_sdr: 300,
    data_venda: new Date('2024-01-18'),
    projectId: '1'
  },
  {
    id: '5',
    lead_id: '13',
    closer_id: '8',
    sdr_id: '7',
    valor_bruto: 8000,
    metodo_pagamento: 'PIX',
    taxa_percentual: 1.5,
    taxa_valor: 120,
    valor_liquido: 7880,
    comissao_closer: 800,
    comissao_sdr: 400,
    data_venda: new Date('2024-02-05'),
    projectId: '2'
  },
];

// Helper functions to get user name by id
export function getUserName(userId: string): string {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.nome : 'N/A';
}

// Helper to get leads by SDR
export function getLeadsBySdr(sdrId: string): Lead[] {
  return mockLeads.filter(lead => lead.sdr_responsavel === sdrId);
}

// Helper to get leads by Closer
export function getLeadsByCloser(closerId: string): Lead[] {
  return mockLeads.filter(lead => lead.closer_responsavel === closerId);
}

// Helper to get leads by status
export function getLeadsByStatus(status: LeadStatus): Lead[] {
  return mockLeads.filter(lead => lead.status === status);
}

// Helper to get projects by user
export function getProjectsByUser(userId: string): Project[] {
  const projectId = mockUsers.find(u => u.id === userId)?.projectId;
  return projectId ? mockProjects.filter(project => project.id === projectId) : [];
}

// Helper to get leads by project
export function getLeadsByProject(projectId: string): Lead[] {
  return mockLeads.filter(lead => lead.projectId === projectId);
}

// Helper to get meetings by project
export function getMeetingsByProject(projectId: string): Meeting[] {
  return mockMeetings.filter(meeting => meeting.projectId === projectId);
}

// Helper to get sales by project
export function getSalesByProject(projectId: string): Sale[] {
  return mockSales.filter(sale => sale.projectId === projectId);
}

// Helper to get gateways by project
export function getGatewaysByProject(projectId: string): Gateway[] {
  return mockGateways.filter(gateway => gateway.projectId === projectId);
}
