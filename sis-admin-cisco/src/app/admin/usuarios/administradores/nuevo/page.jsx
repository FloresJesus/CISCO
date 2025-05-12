import UsuarioForm from "@/components/admin/usuarios/UsuarioForm"

export const metadata = {
  title: "Nuevo Administrador | Panel Administrativo",
  description: "Crear un nuevo administrador en Cisco Academy",
}

export default function NuevoAdministradorPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuarioForm rolPredeterminado="admin" />
    </div>
  )
}
