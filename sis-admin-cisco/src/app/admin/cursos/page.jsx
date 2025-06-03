import CursosTable from "@/components/admin/cursos/CursosTable"

export const metadata = {
  title: "Gestión de Cursos | Panel Administrativo",
  description: "Administra los cursos de Cisco Academy",
}

export default function CursosPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <CursosTable />
    </div>
  )
}
