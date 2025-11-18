'use client';

import { useAuth } from '@/lib/auth-context';
import { LoginScreen } from '@/components/login-screen';
import { CRMNavigation } from '@/components/crm-navigation';

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <CRMNavigation />;
}
