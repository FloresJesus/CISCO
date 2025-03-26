'use client'
import Image from 'next/image';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex bg-white p-8 rounded-lg shadow-lg w-3/5">
        <div className="w-1/2 flex justify-center items-center p-4">
          <Image 
            src="/images/cisco2.png" 
            width={300} 
            height={300} 
            alt="Cisco Logo"
            className="rounded-md"
          />
        </div>
        <div className="w-1/2 p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Iniciar Sesión</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Correo Electrónico</label>
              <input 
              type="email" 
              className="w-full p-2 border rounded-lg" 
              placeholder="xd@email.com" />
            </div>
            <div>
              <label className="block text-gray-700">Contraseña</label>
              <input 
              type="password" 
              className="w-full p-2 border rounded-lg" 
              placeholder="••••••••" />
            </div>
            <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
