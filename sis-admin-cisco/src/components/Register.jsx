'use client'
import { useState } from 'react';
import Image from 'next/image';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    ap_paterno: '',
    ap_materno: '',
    fecha_nac: '',
    gmail: '',
    password: '',
    verifyPassword: '',
    userType: 'estudiante'
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de contraseña
    if (formData.password !== formData.verifyPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Limpiar el mensaje de error si las contraseñas coinciden
    setError('');

    // Aquí puedes añadir la lógica para enviar los datos del formulario
    console.log(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="flex flex-col md:flex-row bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="w-full md:w-1/2 flex justify-center items-center p-4">
          <Image 
            src="/images/cisco2.png" 
            width={300} 
            height={300} 
            alt="Cisco Logo"
            className="rounded-md"
          />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Registro</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Apellido Paterno</label>
              <input
                type="text"
                name="ap_paterno"
                value={formData.ap_paterno}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Apellido Materno</label>
              <input
                type="text"
                name="ap_materno"
                value={formData.ap_materno}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nac"
                value={formData.fecha_nac}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                name="gmail"
                value={formData.gmail}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Verificar Contraseña</label>
              <input
                type="password"
                name="verifyPassword"
                value={formData.verifyPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-gray-700">Tipo de Usuario</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="estudiante">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;