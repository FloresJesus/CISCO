import UsuariosTable from "@/components/admin/usuarios/UsuariosTable"

export const metadata = {
  title: "Instructores | Panel Administrativo",
  description: "Gestión de instructores de Cisco Academy",
}

export default function InstructoresPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuariosTable rolFiltro="instructor" titulo="Instructores" />
    </div>
  )
}
