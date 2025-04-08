'use client'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo para los cursos
  const courses = [
    {
      id: 1,
      title: 'CCNA: Introducción a Redes',
      description: 'Fundamentos de redes, arquitectura, estructura y funciones.',
      category: 'networking',
      level: 'Principiante',
      duration: '70 horas',
      image: '/images/ccna-course.jpg',
      certified: true,
    },
    {
      id: 2,
      title: 'CyberSecurity Essentials',
      description: 'Principios de seguridad informática y protección de redes.',
      category: 'security',
      level: 'Intermedio',
      duration: '50 horas',
      image: '/images/cyber-course.jpg',
      certified: true,
    },
    {
      id: 3,
      title: 'DevNet Associate',
      description: 'Desarrollo de aplicaciones y automatización para redes CISCO.',
      category: 'development',
      level: 'Avanzado',
      duration: '90 horas',
      image: '/images/devnet-course.jpg',
      certified: false,
    },
    {
      id: 4,
      title: 'CCNA: Conmutación y Enrutamiento',
      description: 'Configuración avanzada de switches y routers CISCO.',
      category: 'networking',
      level: 'Intermedio',
      duration: '80 horas',
      image: '/images/ccna-advanced.jpg',
      certified: true,
    },
    {
      id: 5,
      title: 'Ciberseguridad Avanzada',
      description: 'Técnicas avanzadas de protección contra amenazas digitales.',
      category: 'security',
      level: 'Avanzado',
      duration: '60 horas',
      image: '/images/cyber-advanced.jpg',
      certified: false,
    },
    {
      id: 6,
      title: 'Python para Redes',
      description: 'Automatización de redes usando Python y APIs CISCO.',
      category: 'development',
      level: 'Intermedio',
      duration: '40 horas',
      image: '/images/python-course.jpg',
      certified: true,
    },
  ];

  // Filtrar cursos según categoría y término de búsqueda
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeTab === 'all' || course.category === activeTab;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Cursos CISCO</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Capacítate con los programas oficiales de CISCO Networking Academy y obtén certificaciones reconocidas mundialmente.
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {/* Barra de búsqueda */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Buscar cursos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celestial focus:border-celestial outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filtros por categoría */}
            <div className="flex space-x-2 overflow-x-auto pb-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-celestial text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab('networking')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'networking' ? 'bg-celestial text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Redes
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'security' ? 'bg-celestial text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Seguridad
              </button>
              <button
                onClick={() => setActiveTab('development')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'development' ? 'bg-celestial text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Desarrollo
              </button>
            </div>
          </div>
        </div>

        {/* Listado de cursos */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-500"
                  />
                  {course.certified && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Certificación
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(course.category)}`}>
                      {getCategoryName(course.category)}
                    </span>
                    <span className="text-xs text-gray-500">{course.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Nivel: {course.level}</span>
                    <Link
                      href={`/cursos/${course.id}`}
                      className="text-sm font-medium text-celestial hover:text-celestial-dark"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o categorías</p>
            <button 
              onClick={() => {
                setActiveTab('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 bg-celestial text-white rounded-md hover:bg-celestial-dark"
            >
              Mostrar todos los cursos
            </button>
          </div>
        )}

        {/* CTA al final */}
        <div className="mt-16 bg-gradient-to-r from-primary to-celestial rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar tu capacitación?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Únete a miles de estudiantes que han transformado sus carreras con nuestras certificaciones CISCO.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-celestial px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Regístrate ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para categorías
function getCategoryName(category) {
  switch (category) {
    case 'networking': return 'Redes';
    case 'security': return 'Seguridad';
    case 'development': return 'Desarrollo';
    default: return category;
  }
}

function getCategoryColor(category) {
  switch (category) {
    case 'networking': return 'bg-blue-100 text-blue-800';
    case 'security': return 'bg-red-100 text-red-800';
    case 'development': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default CoursesPage;