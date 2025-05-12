import { notFound } from "next/navigation"
import UsuarioDetail from "@/components/admin/usuarios/UsuarioDetail"
import { getUserById } from "@/libs/data"

export async function generateMetadata({ params }) {
  const usuario = await getUserById(params.id)
  if (!usuario) return { title: "Usuario no encontrado" }

  return {
    title: `${usuario.detalles?.nombre || usuario.email} | Panel Administrativo`,
    description: `Detalles del usuario ${usuario.detalles?.nombre || usuario.email}`,
  }
}

export default async function UsuarioDetailPage({ params }) {
  const usuario = await getUserById(params.id)

  if (!usuario) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <UsuarioDetail usuario={usuario} />
    </div>
  )
}
