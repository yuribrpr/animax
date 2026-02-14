'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage('Conta criada! Verifique seu e-mail para confirmar e depois faça login.');
      setLoading(false);
      return;
    }

    router.push('/home');
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <section className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-600">Registro com Supabase Auth</p>
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Nome</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              minLength={6}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          <Button className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Registrar'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Já possui conta? <Link href="/login" className="underline">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
