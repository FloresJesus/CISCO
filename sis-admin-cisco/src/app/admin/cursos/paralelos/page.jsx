import ParalelosTable from "@/components/admin/paralelos/ParalelosList"

export const metadata = {
  title: "Gestión de Paralelos | Panel Administrativo",
  description: "Administra los paralelos de los cursos de Cisco Academy",
}

export default function ParalelosPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-ciscoBlue">Gestión de Paralelos</h1>
      <ParalelosTable />
    </div>
  )
}
