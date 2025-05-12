'use client';
import '@/styles/globals.css';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Determinar qué páginas no deben mostrar header/footer
  const hideGlobalLayout = 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/admin');

  return (
    <html lang="es">
      <body className={hideGlobalLayout ? '' : 'flex flex-col min-h-screen'}>
        <AuthProvider>
          {!hideGlobalLayout && <Header />}
          <main className={hideGlobalLayout ? '' : 'flex-grow pt-16'}>
            {children}
          </main>
          {!hideGlobalLayout && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}