'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lead, Meeting, mockLeads, mockMeetings, mockUsers, User, Project, mockProjects, Sale, mockSales, Gateway, mockGateways } from './database';

interface CRMContextType {
  projects: Project[];
  currentProjectId: string;
  setCurrentProjectId: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'data_criacao'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  removeProject: (projectId: string) => void;
  
  leads: Lead[];
  meetings: Meeting[];
  users: User[];
  sales: Sale[];
  gateways: Gateway[];
  updateLeadStatus: (leadId: string, newStatus: Lead['status']) => void;
  addLead: (lead: Omit<Lead, 'id' | 'data_criacao' | 'data_atualizacao' | 'projectId'>) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  removeLead: (leadId: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'projectId'>) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  addUser: (user: Omit<User, 'id' | 'projectId'>) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'projectId'>) => void;
  updateSale: (saleId: string, updates: Partial<Sale>) => void;
  removeSale: (saleId: string) => void;
  addGateway: (gateway: Omit<Gateway, 'id' | 'projectId'>) => void;
  updateGateway: (gatewayId: string, updates: Partial<Gateway>) => void;
  removeGateway: (gatewayId: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [currentProjectId, setCurrentProjectId] = useState<string>('1');
  
  const [allLeads, setAllLeads] = useState<Lead[]>(mockLeads);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>(mockMeetings);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [allSales, setAllSales] = useState<Sale[]>(mockSales);
  const [allGateways, setAllGateways] = useState<Gateway[]>(mockGateways);

  const leads = allLeads.filter(lead => lead.projectId === currentProjectId);
  const meetings = allMeetings.filter(meeting => meeting.projectId === currentProjectId);
  const users = allUsers.filter(user => user.projectId === currentProjectId);
  const sales = allSales.filter(sale => sale.projectId === currentProjectId);
  const gateways = allGateways.filter(gateway => gateway.projectId === currentProjectId);

  const addProject = (projectData: Omit<Project, 'id' | 'data_criacao'>) => {
    const newProject: Project = {
      ...projectData,
      id: String(Date.now()),
      data_criacao: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  };

  const removeProject = (projectId: string) => {
    setProjects(prevProjects => {
      const filtered = prevProjects.filter(project => project.id !== projectId);
      if (filtered.length > 0 && currentProjectId === projectId) {
        setCurrentProjectId(filtered[0].id);
      }
      return filtered;
    });
    setAllLeads(prevLeads => prevLeads.filter(lead => lead.projectId !== projectId));
    setAllMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.projectId !== projectId));
    setAllUsers(prevUsers => prevUsers.filter(user => user.projectId !== projectId));
    setAllSales(prevSales => prevSales.filter(sale => sale.projectId !== projectId));
    setAllGateways(prevGateways => prevGateways.filter(gateway => gateway.projectId !== projectId));
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setAllLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, status: newStatus, data_atualizacao: new Date() }
          : lead
      )
    );
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'data_criacao' | 'data_atualizacao' | 'projectId'>) => {
    const newLead: Lead = {
      ...leadData,
      id: String(Date.now()),
      data_criacao: new Date(),
      data_atualizacao: new Date(),
      projectId: currentProjectId,
    };
    setAllLeads(prevLeads => [...prevLeads, newLead]);
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setAllLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, ...updates, data_atualizacao: new Date() }
          : lead
      )
    );
  };

  const removeLead = (leadId: string) => {
    setAllLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
  };

  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'projectId'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: String(Date.now()),
      projectId: currentProjectId,
    };
    setAllMeetings(prevMeetings => [...prevMeetings, newMeeting]);
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setAllMeetings(prevMeetings =>
      prevMeetings.map(meeting =>
        meeting.id === meetingId ? { ...meeting, ...updates } : meeting
      )
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'projectId'>) => {
    const newUser: User = {
      ...userData,
      id: String(Date.now()),
      projectId: currentProjectId,
    };
    setAllUsers(prevUsers => [...prevUsers, newUser]);
  };

  const removeUser = (userId: string) => {
    setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setAllUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'projectId'>) => {
    const newSale: Sale = {
      ...saleData,
      id: String(Date.now()),
      projectId: currentProjectId,
    };
    setAllSales(prevSales => [...prevSales, newSale]);
  };

  const updateSale = (saleId: string, updates: Partial<Sale>) => {
    setAllSales(prevSales =>
      prevSales.map(sale =>
        sale.id === saleId ? { ...sale, ...updates } : sale
      )
    );
  };

  const removeSale = (saleId: string) => {
    setAllSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
  };

  const addGateway = (gatewayData: Omit<Gateway, 'id' | 'projectId'>) => {
    const newGateway: Gateway = {
      ...gatewayData,
      id: String(Date.now()),
      projectId: currentProjectId,
    };
    setAllGateways(prevGateways => [...prevGateways, newGateway]);
  };

  const updateGateway = (gatewayId: string, updates: Partial<Gateway>) => {
    setAllGateways(prevGateways =>
      prevGateways.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, ...updates } : gateway
      )
    );
  };

  const removeGateway = (gatewayId: string) => {
    setAllGateways(prevGateways => prevGateways.filter(gateway => gateway.id !== gatewayId));
  };

  return (
    <CRMContext.Provider
      value={{
        projects,
        currentProjectId,
        setCurrentProjectId,
        addProject,
        updateProject,
        removeProject,
        leads,
        meetings,
        users,
        sales,
        gateways,
        updateLeadStatus,
        addLead,
        updateLead,
        removeLead,
        addMeeting,
        updateMeeting,
        addUser,
        removeUser,
        updateUser,
        addSale,
        updateSale,
        removeSale,
        addGateway,
        updateGateway,
        removeGateway,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
