"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, 
  FiAward, FiClipboard, FiBarChart2, FiSettings, FiLogOut,
  FiChevronDown, FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    usuarios: false,
    cursos: false,
    academico: false,
    reportes: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/admin',
      exact: true,
    },
    {
      title: 'Usuarios',
      icon: <FiUsers className="w-5 h-5" />,
      submenu: 'usuarios',
      items: [
        { title: 'Administradores', path: '/admin/usuarios/administradores' },
        { title: 'Instructores', path: '/admin/usuarios/instructores' },
        { title: 'Estudiantes', path: '/admin/usuarios/estudiantes' },
      ]
    },
    {
      title: 'Cursos',
      icon: <FiBookOpen className="w-5 h-5" />,
      submenu: 'cursos',
      items: [
        { title: 'Catálogo de Cursos', path: '/admin/cursos' },
        { title: 'Paralelos', path: '/admin/cursos/paralelos' },
        { title: 'Módulos', path: '/admin/cursos/modulos' },
        { title: 'Evaluaciones', path: '/admin/cursos/evaluaciones' },
      ]
    },
    {
      title: 'Académico',
      icon: <FiCalendar className="w-5 h-5" />,
      submenu: 'academico',
      items: [
        { title: 'Inscripciones', path: '/admin/academico/inscripciones' },
        { title: 'Asistencias', path: '/admin/academico/asistencias' },
        { title: 'Calificaciones', path: '/admin/academico/calificaciones' },
        { title: 'Certificaciones', path: '/admin/academico/certificaciones' },
      ]
    },
    {
      title: 'Pagos',
      icon: <FiDollarSign className="w-5 h-5" />,
      path: '/admin/pagos',
    },
    {
      title: 'Reportes',
      icon: <FiBarChart2 className="w-5 h-5" />,
      submenu: 'reportes',
      items: [
        { title: 'Académicos', path: '/admin/reportes/academicos' },
        { title: 'Financieros', path: '/admin/reportes/financieros' },
        { title: 'Estadísticas', path: '/admin/reportes/estadisticas' },
      ]
    },
    {
      title: 'Configuración',
      icon: <FiSettings className="w-5 h-5" />,
      path: '/admin/configuracion',
    },
  ];
  //para el cierre de sesion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        window.location.href = '/'; // Redirigir después de logout
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="fixed z-50 bottom-4 right-4 md:hidden bg-ciscoBlue text-white p-3 rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar for desktop */}
      <div className={`hidden md:flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-ciscoDarkBlue text-white transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-ciscoBlue/20">
          {!isCollapsed && (
            <div className="flex items-center">
                <Image src="/images/logo3.png" alt="Cisco Academy" width={40} height={40} className="mr-2" />
                <span className="text-xl font-bold">Cisco Academy</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-ciscoBlue/20"
          >
            {isCollapsed ? <FiMenu className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.submenu)}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${isActive(item.path) ? 'bg-ciscoBlue text-white' : 'text-gray-300 hover:bg-ciscoBlue/20'}`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {openMenus[item.submenu] ? 
                            <FiChevronDown className="w-4 h-4" /> : 
                            <FiChevronRight className="w-4 h-4" />
                          }
                        </>
                      )}
                    </button>
                    {!isCollapsed && openMenus[item.submenu] && (
                      <div className="mt-1 pl-10 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.path}
                            className={`block px-3 py-2 text-sm rounded-md ${isActive(subItem.path) ? 'bg-ciscoBlue/30 text-white' : 'text-gray-300 hover:bg-ciscoBlue/10'}`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive(item.path) ? 'bg-ciscoBlue text-white' : 'text-gray-300 hover:bg-ciscoBlue/20'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-ciscoBlue/20">
          <button
            onClick={handleLogout}
            className='flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-ciscoBlue/20'
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden bg-black bg-opacity-50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 left-0 w-64 bg-ciscoDarkBlue text-white transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-ciscoBlue/20">
            <div className="flex items-center">
              <span className="text-xl font-bold">Cisco Academy</span>
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md hover:bg-ciscoBlue/20"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <div key={item.title}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.submenu)}
                        className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${isActive(item.path) ? 'bg-ciscoBlue text-white' : 'text-gray-300 hover:bg-ciscoBlue/20'}`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span className="flex-1 text-left">{item.title}</span>
                        {openMenus[item.submenu] ? 
                          <FiChevronDown className="w-4 h-4" /> : 
                          <FiChevronRight className="w-4 h-4" />
                        }
                      </button>
                      {openMenus[item.submenu] && (
                        <div className="mt-1 pl-10 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.path}
                              className={`block px-3 py-2 text-sm rounded-md ${isActive(subItem.path) ? 'bg-ciscoBlue/30 text-white' : 'text-gray-300 hover:bg-ciscoBlue/10'}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive(item.path) ? 'bg-ciscoBlue text-white' : 'text-gray-300 hover:bg-ciscoBlue/20'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-ciscoBlue/20">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-ciscoBlue/20"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
