'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import Image from 'next/image';

const Footer = () => {
  const pathname = usePathname();

  // No mostrar footer en páginas de autenticación
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  const footerLinks = [
    {
      title: 'Cursos',
      links: [
        { name: 'CCNA', href: '/cursos/ccna' },
        { name: 'CyberSecurity', href: '/cursos/cybersecurity' },
        { name: 'DevNet', href: '/cursos/devnet' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { name: 'Documentación', href: '/recursos' },
        { name: 'Laboratorios', href: '/laboratorios' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Acerca de',
      links: [
        { name: 'Nuestra Academia', href: '/about' },
        { name: 'Instructores', href: '/instructores' },
        { name: 'Contacto', href: '/contacto' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaFacebook size={20} />, href: '#' }
  ];

  return (
    <footer className="bg-ciscoDarkBlue text-white pt-12 pb-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image 
                src="/images/logo3.png" 
                width={140} 
                height={70} 
                alt="CISCO Academy Logo"
                className="hover:opacity-90 transition-opacity"
              />
            </Link>
            <p className="text-sm text-celestial mb-4">
              Formando a los profesionales de redes del futuro con certificaciones CISCO reconocidas mundialmente.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-celestial hover:text-white transition-colors"
                  aria-label={`Red social ${index}`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Links del footer */}
          {footerLinks.map((column, index) => (
            <div key={index} className="mt-4 md:mt-0">
              <h3 className="text-lg font-semibold mb-4 text-celestial">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-celestial hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Información de contacto */}
          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-celestial">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MdLocationOn className="mt-1 mr-2 text-celestial" size={18} />
                <span className="text-sm text-celestial">
                  Av. Tecnológico 123, Ciudad de México
                </span>
              </li>
              <li className="flex items-center">
                <MdPhone className="mr-2 text-celestial" size={18} />
                <span className="text-sm text-celestial">+591</span>
              </li>
              <li className="flex items-center">
                <MdEmail className="mr-2 text-celestial" size={18} />
                <span className="text-sm text-celestial">contacto@ciscoacademy.mx</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="border-t border-celestial/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-celestial mb-4 md:mb-0">
            © {new Date().getFullYear()} CISCO Academy. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-celestial hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-celestial hover:text-white transition-colors">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;