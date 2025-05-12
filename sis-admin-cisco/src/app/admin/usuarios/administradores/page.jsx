import UsuariosTable from "@/components/admin/usuarios/UsuariosTable"

export const metadata = {
  title: "Administradores | Panel Administrativo",
  description: "Gestión de administradores de Cisco Academy",
}

export default function AdministradoresPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuariosTable rolFiltro="admin" titulo="Administradores" />
    </div>
  )
}
