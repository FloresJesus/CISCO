'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // No mostrar header en páginas de autenticación
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Cursos', href: '/cursos' },
    { name: 'Calificaciones', href: '/calificaciones' },
    { name: 'Contacto', href: '/contacto' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo3.png" 
              width={120} 
              height={60} 
              alt="CISCO Academy Logo"
              className="hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href ? 'bg-ciscoDarkBlue text-white' : 'text-white hover:bg-ciscoBlue/80'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-white hover:text-celestial transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="bg-celestial text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ciscoBlue transition-colors"
            >
              Registrarse
            </Link>
          </div>

          {/* Botón Mobile */}
          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-ciscoBlue focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú de navegación"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Menú Mobile */}
        {isOpen && (
          <div className="md:hidden bg-ciscoDarkBlue pb-4 px-4 rounded-b-lg shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href ? 'bg-ciscoBlue text-white' : 'text-white hover:bg-ciscoBlue/80'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-celestial/20 pt-2 mt-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm font-medium text-white hover:bg-ciscoBlue/80 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 mt-2 bg-celestial text-white rounded-md text-sm font-medium hover:bg-ciscoBlue"
                  onClick={() => setIsOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;