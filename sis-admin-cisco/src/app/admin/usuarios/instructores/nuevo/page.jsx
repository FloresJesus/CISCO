import UsuarioForm from "@/components/admin/usuarios/UsuarioForm"

export const metadata = {
  title: "Nuevo Instructor | Panel Administrativo",
  description: "Crear un nuevo instructor en Cisco Academy",
}

export default function NuevoInstructorPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuarioForm rolPredeterminado="instructor" />
    </div>
  )
}
