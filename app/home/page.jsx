'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return <main className="p-6">Carregando...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center p-6">
      <section className="rounded-lg border bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Home</p>
        <h1 className="mt-2 text-2xl font-bold">Olá, {user.user_metadata?.name || 'Usuário'} 👋</h1>
        <p className="mt-3 text-slate-600">Seu e-mail: {user.email}</p>
        <p className="text-slate-600">Conta criada em: {new Date(user.created_at).toLocaleString()}</p>
        <div className="mt-6">
          <Button onClick={logout}>Sair</Button>
        </div>
      </section>
    </main>
  );
}
