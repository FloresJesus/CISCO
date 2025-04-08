'use client';
import '@/styles/globals.css';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  return (
    <html lang="es">
      <body>
        {!isAuthPage && <Header />}
        <main className={!isAuthPage ? 'pt-16' : ''}>
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}