'use client'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-light">
      <section className="bg-gradient-to-r from-ciscoDarkBlue to-animate text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contáctanos</h1>
          <p className="text-xl max-w-2xl mx-auto">¿Tienes preguntas? Estamos aquí para ayudarte</p>
        </div>
      </section>

      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-dark">Información de Contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-2xl text-ciscoBlue mt-1 mr-4" />
                  <div>
                    <h3 className="font-bold text-dark">Dirección</h3>
                    <p className="text-gray">Pagador entre Ballivián y Aldana- Carr. Ing. Sistemas e Ing. Informatica</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaPhone className="text-2xl text-ciscoBlue mt-1 mr-4" />
                  <div>
                    <h3 className="font-bold text-dark">Teléfono</h3>
                    <p className="text-gray">+591 69585007</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaEnvelope className="text-2xl text-ciscoBlue mt-1 mr-4" />
                  <div>
                    <h3 className="font-bold text-dark">Email</h3>
                    <p className="text-gray">academia@cisco.sistemas.edu.bo</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaClock className="text-2xl text-ciscoBlue mt-1 mr-4" />
                  <div>
                    <h3 className="font-bold text-dark">Horario</h3>
                    <p className="text-gray">No definidos</p>
                    <p className="text-gray"></p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-dark">Formulario de Contacto</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray mb-1">Nombre</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray mb-1">Asunto</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray mb-1">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="bg-ciscoBlue text-white px-6 py-3 rounded-md hover:bg-ciscoDarkBlue transition-colors w-full"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>

          <div className="mt-16">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.6122957811054!2d-67.1115891!3d-17.9739199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e2b0b8ce16113d%3A0x73039dfe13672bce!2sIngenier%C3%ADa%20de%20Sistemas%20e%20Inform%C3%A1tica!5e0!3m2!1ses!2sbo!4v1712570000000!5m2!1ses!2sbo" 
              width="100%" 
              height="450" 
              style={{ border: 0 }}
              allowFullScreen 
              loading="lazy" 
              className="rounded-lg shadow-md">
            </iframe>

          </div>
        </div>
      </section>
    </div>
  )
}