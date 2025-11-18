'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardScreen } from './dashboard-screen';
import { KanbanScreen } from './kanban-screen';
import { CalendarScreen } from './calendar-screen';
import { TeamAdminScreen } from './team-admin-screen';
import { FinancialScreen } from './financial-screen';
import { ProjectAccessScreen } from './project-access-screen';
import { LayoutDashboard, KanbanSquare, Calendar, Users, DollarSign, Shield } from 'lucide-react';
import ProjectSelector from './project-selector';
import { UserMenu } from './user-menu';

export function CRMNavigation() {
  return (
    <div className="min-h-screen">
      <div className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Lead Manager</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão de Prospecção Comercial</p>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[1200px] glass">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" />
              Quadro de Leads
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Time
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Acesso
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardScreen />
          </TabsContent>
          
          <TabsContent value="kanban">
            <KanbanScreen />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarScreen />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialScreen />
          </TabsContent>

          <TabsContent value="team">
            <TeamAdminScreen />
          </TabsContent>

          <TabsContent value="access">
            <ProjectAccessScreen />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
