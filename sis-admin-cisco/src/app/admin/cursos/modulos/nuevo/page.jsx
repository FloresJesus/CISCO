import ModuloForm from "@/components/admin/modulos/ModuloForm"

export const metadata = {
  title: "Nuevo Módulo | Panel Administrativo",
  description: "Crear un nuevo módulo para los cursos de Cisco Academy",
}

export default function NuevoModuloPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-ciscoBlue">Crear Nuevo Módulo</h1>
      <ModuloForm />
    </div>
  )
}