'use client'
import { FaAward, FaChartLine, FaUserTie,FaNetworkWired, FaShieldAlt, FaLaptopCode } from 'react-icons/fa'


const CertificacionesPage = () => {
  const certifications = [
    {
      title: "CCNA",
      description: "Cisco Certified Network Associate",
      icon: <FaNetworkWired className="text-4xl text-ciscoBlue" />
    },
    {
      title: "CyberOps",
      description: "Cisco Certified CyberOps Associate",
      icon: <FaShieldAlt className="text-4xl text-ciscoBlue" />
    },
    {
      title: "DevNet",
      description: "Cisco Certified DevNet Associate",
      icon: <FaLaptopCode className="text-4xl text-ciscoBlue" />
    }
  ]

  return (
    <div className="min-h-screen bg-light">
      <section className="bg-gradient-to-r from-ciscoDarkBlue to-animate text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Certificaciones Cisco</h1>
          <p className="text-xl max-w-2xl mx-auto">Reconocimiento global de tus habilidades en networking</p>
        </div>
      </section>

      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{cert.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-dark">{cert.title}</h3>
                <p className="text-gray mb-4">{cert.description}</p>
                <button className="bg-ciscoBlue text-white px-6 py-2 rounded-md hover:bg-ciscoDarkBlue transition-colors">
                  Más información
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-dark">Beneficios de Certificarte</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <FaUserTie className="text-2xl text-ciscoBlue mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-dark">Mejores Oportunidades</h3>
                  <p className="text-gray mt-1">Acceso a puestos mejor remunerados</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaChartLine className="text-2xl text-ciscoBlue mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-dark">Crecimiento Profesional</h3>
                  <p className="text-gray mt-1">Valoración en la industria</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaAward className="text-2xl text-ciscoBlue mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-dark">Reconocimiento Global</h3>
                  <p className="text-gray mt-1">Certificación internacional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CertificacionesPage;