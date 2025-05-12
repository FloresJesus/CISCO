import UsuarioForm from "@/components/admin/usuarios/UsuarioForm"

export const metadata = {
  title: "Nuevo Estudiante | Panel Administrativo",
  description: "Crear un nuevo estudiante en Cisco Academy",
}

export default function NuevoEstudiantePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuarioForm rolPredeterminado="estudiante" />
    </div>
  )
}
