import { notFound } from "next/navigation"
import UsuarioForm from "@/components/admin/usuarios/UsuarioForm"
import { getUserById } from "@/libs/data"

export async function generateMetadata({ params }) {
  const usuario = await getUserById(params.id)
  if (!usuario) return { title: "Usuario no encontrado" }

  return {
    title: `Editar ${usuario.detalles?.nombre || usuario.email} | Panel Administrativo`,
    description: `Editar el usuario ${usuario.detalles?.nombre || usuario.email}`,
  }
}

export default async function EditarUsuarioPage({ params }) {
  const usuario = await getUserById(params.id)

  if (!usuario) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <UsuarioForm usuario={usuario} />
    </div>
  )
}
