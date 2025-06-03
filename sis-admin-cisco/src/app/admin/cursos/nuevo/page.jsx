import CursoForm from "@/components/admin/cursos/CursoForm"

export const metadata = {
  title: "Nuevo Curso | Panel Administrativo",
  description: "Crear un nuevo curso en Cisco Academy",
}

export default function NuevoCursoPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <CursoForm />
    </div>
  )
}
