'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Cursos', href: '/cursos' },
    { name: 'Contacto', href: '/contact' }
  ]

  const legalLinks = [
    { name: 'Términos de servicio', href: '/terms' },
    { name: 'Política de privacidad', href: '/privacy' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Aviso legal', href: '/legal' }
  ]

  const socialMedia = [
    { icon: <FaFacebook />, href: 'https://facebook.com/cisco.uto' },
    
  ]

  return (
    <footer className="bg-ciscoDarkBlue text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image 
                src="/images/logo3.png" 
                width={180} 
                height={80} 
                alt="Cisco Academy Logo"
              />
            </div>
            <p className="mb-4 text-gray-300">
              Formando a la próxima generación de profesionales en redes y seguridad con estándares de calidad CISCO.
            </p>
            <div className="flex space-x-4">
              {socialMedia.map((social, index) => (
                <Link 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-celestial text-xl transition-colors"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-celestial/30 pb-2">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces legales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-celestial/30 pb-2">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-celestial/30 pb-2">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-celestial flex-shrink-0" />
                <span className="text-gray-300">Pagador entre Ballivián y Aldana- Carr. Ing. Sistemas e Ing. Informatica</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-celestial flex-shrink-0" />
                <span className="text-gray-300">+591 69585007</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-celestial flex-shrink-0" />
                <span className="text-gray-300">Academia@cisco.sistemas.edu.bo</span>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-3 text-celestial flex-shrink-0" />
                <span className="text-gray-300">Sin definir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* División */}
        <div className="border-t border-celestial/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} Cisco Networking Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}