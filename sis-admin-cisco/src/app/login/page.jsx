import Image from 'next/image';
export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
     <div className="w-1/2 flex items-center justify-center">
          <Image 
            src="/images/cisco2.png" 
            width={180} 
            height={180} 
            alt="Cisco Logo"
            className="bg-white p-4 rounded-md"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Iniciar Sesión</h2>
        <form className="bg-white p-6 rounded-lg shadow-md w-80">
          <div className="mb-4">
            <label className="block text-gray-700">Correo Electrónico</label>
            <input type="email" className="w-full p-2 border rounded-lg" placeholder="xd@email.com" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contraseña</label>
            <input type="password" className="w-full p-2 border rounded-lg" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700">
            Ingresar
          </button>
        </form>
      </div>
    );
  }
  