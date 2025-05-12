'use client'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaGraduationCap } from 'react-icons/fa'

const PerfilPage = () => {
  const user = {
    name: "Alejandro Martínez",
    email: "alejandro@example.com",
    phone: "+52 55 1234 5678",
    certifications: ["CCNA"],
    joinDate: "15 Enero 2022"
  }

  return (
    <div className="min-h-screen bg-light">
      <section className="bg-gradient-to-r from-ciscoBlue to-celestial text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="opacity-90">Administra tu información personal</p>
        </div>
      </section>

      <section className="py-8 bg-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-32 h-32 bg-ciscoBlue/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaUserCircle className="text-5xl text-ciscoBlue" />
                </div>
                <h2 className="text-xl font-bold text-dark mb-1">{user.name}</h2>
                <p className="text-gray mb-4">Estudiante Cisco Academy</p>
                <button className="text-ciscoBlue font-medium hover:underline text-sm">
                  Cambiar foto
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6 text-dark">Información Personal</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FaUser className="text-gray mt-1 mr-4" />
                    <div className="flex-1">
                      <label className="block text-gray text-sm mb-1">Nombre completo</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaEnvelope className="text-gray mt-1 mr-4" />
                    <div className="flex-1">
                      <label className="block text-gray text-sm mb-1">Correo electrónico</label>
                      <input 
                        type="email" 
                        defaultValue={user.email}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaPhone className="text-gray mt-1 mr-4" />
                    <div className="flex-1">
                      <label className="block text-gray text-sm mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        defaultValue={user.phone}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaLock className="text-gray mt-1 mr-4" />
                    <div className="flex-1">
                      <label className="block text-gray text-sm mb-1">Contraseña</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ciscoBlue"
                      />
                      <button className="text-sm text-ciscoBlue mt-1 hover:underline">
                        Cambiar contraseña
                      </button>
                    </div>
                  </div>
                </div>
                
                <button className="mt-6 bg-ciscoBlue text-white px-6 py-2 rounded-md hover:bg-ciscoDarkBlue transition-colors">
                  Guardar cambios
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-bold mb-6 text-dark flex items-center">
                  <FaGraduationCap className="mr-2 text-ciscoBlue" /> Certificaciones
                </h2>
                
                <div className="space-y-4">
                  {user.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="font-medium text-dark">{cert}</span>
                      <button className="text-sm text-ciscoBlue hover:underline">
                        Ver certificado
                      </button>
                    </div>
                  ))}
                  
                  <button className="text-ciscoBlue font-medium hover:underline mt-2">
                    + Agregar certificación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PerfilPage;