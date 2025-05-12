'use client'
import Image from 'next/image';
import Link from 'next/link';
import { FaChalkboardTeacher, FaLaptopCode, FaShieldAlt, FaGraduationCap, FaUserTie, FaNetworkWired, FaCertificate } from 'react-icons/fa';

export default function HomeForm() {
  const features = [
    {
      icon: <FaUserTie className="text-4xl text-ciscoBlue" />,
      title: "Instructores Expertos",
      description: "Profesionales certificados con experiencia en redes empresariales"
    },
    {
      icon: <FaNetworkWired className="text-4xl text-ciscoBlue" />,
      title: "Infraestructura Real",
      description: "Prácticas con equipos CISCO de última generación"
    },
    {
      icon: <FaShieldAlt className="text-4xl text-ciscoBlue" />,
      title: "Seguridad Integral",
      description: "Enfoque en ciberseguridad desde el primer día"
    },
    {
      icon: <FaCertificate className="text-4xl text-ciscoBlue" />,
      title: "Certificaciones",
      description: "Preparación para exámenes oficiales CISCO"
    }
  ];

  const courses = [
    {
      title: "CCNA 200-301",
      description: "Fundamentos de redes para principiantes",
      duration: "70 horas",
      level: "Principiante",
      bgColor: "bg-animate" // Usando tu color --color-animate
    },
    {
      title: "CyberOps Associate",
      description: "Operaciones básicas de ciberseguridad",
      duration: "60 horas",
      level: "Intermedio",
      bgColor: "bg-ciscoBlue" // Usando tu color --color-ciscoBlue
    },
    {
      title: "DevNet Associate",
      description: "Automatización de redes con programación",
      duration: "80 horas",
      level: "Avanzado",
      bgColor: "bg-ciscoDarkBlue" // Usando tu color --color-ciscoDarkBlue
    }
  ];

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="relative text-white py-20">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/network-bg.jpg" // Ruta de tu nueva imagen de fondo
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ciscoDarkBlue/90 to-ciscoBlue/80"></div>
        </div>
        
        {/* Contenido sobre la imagen */}
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Formación CISCO Profesional</h1>
            <p className="text-xl mb-8 opacity-90">Conviértete en un experto en redes con nuestro programa académico certificado.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/cursos" 
                className="bg-accent text-white font-bold py-3 px-6 rounded-lg text-center hover:opacity-90 transition-opacity"
              >
                Explorar Cursos
              </Link>
              <Link 
                href="/register"
                className="bg-white text-ciscoBlue font-bold py-3 px-6 rounded-lg text-center hover:bg-gray-100 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <Image 
              src="/images/network-hero.jpg" 
              width={500} 
              height={400} 
              alt="Redes CISCO" 
              className="rounded-lg shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Nuestra Metodología</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center border-t-4 border-ciscoBlue"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-dark">{feature.title}</h3>
                <p className="text-gray">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Programas Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div 
                key={index} 
                className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-2 border-t-4 border-ciscoBlue"
              >
                <div className={`h-48 ${course.bgColor} flex items-center justify-center text-white`}>
                  <FaLaptopCode className="text-6xl opacity-90" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-dark">{course.title}</h3>
                  <p className="text-gray mb-4">{course.description}</p>
                  <div className="flex justify-between text-sm text-gray mb-4">
                    <span>Duración: {course.duration}</span>
                    <span>Nivel: {course.level}</span>
                  </div>
                  <Link 
                    href={`/cursos/${course.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-ciscoBlue font-medium hover:underline"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link 
              href="/cursos"
              className="bg-ciscoBlue text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity inline-block"
            >
              Ver todos los programas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/*<section className="bg-ciscoDarkBlue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">+2,500</div>
              <div className="opacity-80">Estudiantes</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="opacity-80">Tasa de aprobación</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="opacity-80">Certificaciones</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">10</div>
              <div className="opacity-80">Años de experiencia</div>
            </div>
          </div>
        </div>
      </section>*/}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-ciscoBlue to-animate text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para transformar tu carrera?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Únete a la nueva generación de profesionales en redes y seguridad
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register"
              className="bg-white text-ciscoBlue font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
              Comenzar Ahora
            </Link>
            <Link 
              href="/contact"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}