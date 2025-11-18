'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Account, mockAccounts } from './database';

interface AuthContextType {
  currentUser: Account | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, nome: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const user = accounts.find(acc => acc.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
    setIsLoading(false);
  }, [accounts]);

  const login = (email: string, password: string): boolean => {
    const account = accounts.find(
      acc => acc.email === email && acc.password === password
    );
    
    if (account) {
      setCurrentUser(account);
      localStorage.setItem('currentUserId', account.id);
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string, nome: string): boolean => {
    // Check if email already exists
    if (accounts.find(acc => acc.email === email)) {
      return false;
    }

    const newAccount: Account = {
      id: String(Date.now()),
      email,
      password,
      nome,
      data_criacao: new Date(),
      projectIds: [], // New users start with no projects
    };

    setAccounts(prev => [...prev, newAccount]);
    setCurrentUser(newAccount);
    localStorage.setItem('currentUserId', newAccount.id);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        isAuthenticated: currentUser !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
