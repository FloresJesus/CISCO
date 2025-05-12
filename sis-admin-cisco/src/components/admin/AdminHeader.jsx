"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';

export default function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock notifications data
  const notifications = [
    { id: 1, title: 'Nueva inscripción', message: 'Juan Pérez se ha inscrito en CCNA', time: '5 min' },
    { id: 2, title: 'Pago recibido', message: 'Pago de matrícula confirmado', time: '1 hora' },
    { id: 3, title: 'Curso completado', message: 'María López ha completado CyberOps', time: '3 horas' },
  ];

  //para cerrar sesion
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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center flex-1">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-ciscoBlue focus:border-ciscoBlue sm:text-sm"
              placeholder="Buscar..."
            />
          </div>
        </div>
        
        <div className="flex items-center ml-4 space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="p-1 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <FiBell className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 bg-accent rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                  Notificaciones
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notification) => (
                    <a
                      key={notification.id}
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </a>
                  ))}
                </div>
                <a
                  href="/admin/notificaciones"
                  className="block px-4 py-2 text-sm text-center text-ciscoBlue hover:bg-gray-100"
                >
                  Ver todas las notificaciones
                </a>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ciscoBlue"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="w-8 h-8 rounded-full bg-ciscoDarkBlue flex items-center justify-center text-white">
                <FiUser className="w-5 h-5" />
              </div>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  href="/admin/perfil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/admin/configuracion"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Configuración
                </Link>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
