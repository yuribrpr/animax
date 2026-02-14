import './globals.css';

export const metadata = {
  title: 'Animax Auth',
  description: 'Login e registro com Next.js + Supabase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
