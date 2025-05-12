import UsuariosTable from "@/components/admin/usuarios/UsuariosTable"

export const metadata = {
  title: "Estudiantes | Panel Administrativo",
  description: "Gestión de estudiantes de Cisco Academy",
}

export default function EstudiantesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <UsuariosTable rolFiltro="estudiante" titulo="Estudiantes" />
    </div>
  )
}
