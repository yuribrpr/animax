import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Animax Auth</h1>
      <p className="text-slate-600">Sistema de autenticação com Next.js + Supabase pronto para Vercel.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Criar conta</Link>
        </Button>
      </div>
    </main>
  );
}
