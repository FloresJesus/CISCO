'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="bg-primary text-dark shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          {/* Logo y enlaces principales */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Image src="/images/cisco2.png" width={100} height={100} alt="logo" />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="font-bold text-celestial">Inicio</Link>
              <Link href="/cursos" className="text-celestial">Cursos</Link>
              <Link href="/about" className="text-celestial">Calificaciones</Link>
              <Link href="/about" className="text-celestial">About</Link>

            </div>
          </div>

          {/* Enlaces de login y register */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="border rounded px-4 py-2 text-celestial hover:text-white hover:bg-celestial">Iniciar sesión</Link>
            <Link href="/register" className="border bg-celestial text-white px-4 py-2 rounded hover:bg-white hover:text-celestial">Registrate</Link>
          </div>

          {/* Botón de menú para móviles */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </nav>

        {/* Menú desplegable para móviles */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link href="/" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>Inicio</Link>
            <Link href="/cursos" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>Cursos</Link>
            <Link href="/about" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>Calificaciones</Link>
            <Link href="/about" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>About</Link>
            <Link href="/login" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>Iniciar sesión</Link>
            <Link href="/register" className="block py-2 text-celestial hover:text-dark" onClick={handleLinkClick}>Registrate</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;