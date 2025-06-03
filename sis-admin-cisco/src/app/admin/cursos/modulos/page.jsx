import ModulosTable from "@/components/admin/modulos/ModulosTable"

export const metadata = {
  title: "Gestión de Módulos | Panel Administrativo",
  description: "Administra los módulos de los cursos de Cisco Academy",
}

export default function ModulosPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-ciscoBlue">Gestión de Módulos</h1>
      <ModulosTable />
    </div>
  )
}
