'use client'
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">CISCO</h2>
            <p className="text-sm">© 2025 SISTEMA ACADEMICO CISCO</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="hover:underline">Inicio</Link>
            <Link href="/cursos" className="hover:underline">Cursos</Link>
            <Link href="/about" className="hover:underline">Calificaciones</Link>
            <Link href="/about" className="hover:underline">about</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;