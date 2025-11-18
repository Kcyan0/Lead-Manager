'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff } from 'lucide-react';

export function LoginScreen() {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      const success = useAuth().signup(email, password, nome);
      if (!success) {
        setError('Este email já está cadastrado');
      }
    } else {
      const success = login(email, password);
      if (!success) {
        setError('Email ou senha incorretos');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/liquid-glass-bg.png)' }}
      />
      
      {/* Glassmorphism card */}
      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-white">
            {isSignup ? 'Criar Conta' : 'Lead Manager'}
          </CardTitle>
          <CardDescription className="text-center text-gray-200">
            {isSignup 
              ? 'Preencha os dados para criar sua conta' 
              : 'Entre com suas credenciais para acessar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/20 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isSignup ? 'Criar Conta' : 'Entrar'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="text-sm text-cyan-300 hover:text-cyan-400 underline"
              >
                {isSignup 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            {!isSignup && (
              <div className="text-center text-xs text-gray-300 mt-4 p-3 bg-white/5 rounded">
                <p className="font-semibold mb-1">Contas de teste:</p>
                <p>admin@leadmanager.com / admin123</p>
                <p>usuario@email.com / senha123</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
