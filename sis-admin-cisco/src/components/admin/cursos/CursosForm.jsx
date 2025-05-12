"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSave, FaArrowLeft, FaSpinner, FaPlus, FaTrash } from "react-icons/fa"
import api from "@/libs/api"

export default function CursoForm({ curso = null }) {
  const router = useRouter()
  const isEditing = !!curso

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    duracion_semanas: "",
    horas_totales: "",
    nivel: "introductorio",
    categoria: "ccna",
    estado: "disponible",
    imagen_portada: "",
    costo_matricula: "",
    modulos: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isEditing && curso) {
      setFormData({
        codigo: curso.codigo || "",
        nombre: curso.nombre || "",
        descripcion: curso.descripcion || "",
        duracion_semanas: curso.duracion_semanas || "",
        horas_totales: curso.horas_totales || "",
        nivel: curso.nivel || "introductorio",
        categoria: curso.categoria || "ccna",
        estado: curso.estado || "disponible",
        imagen_portada: curso.imagen_portada || "",
        costo_matricula: curso.costo_matricula || "",
        modulos: curso.modulos || [],
      })
    }
  }, [isEditing, curso])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }))
  }

  const handleModuloChange = (index, field, value) => {
    const updatedModulos = [...formData.modulos]
    updatedModulos[index] = {
      ...updatedModulos[index],
      [field]: field === "duracion_horas" ? (value === "" ? "" : Number(value)) : value,
    }
    setFormData((prev) => ({
      ...prev,
      modulos: updatedModulos,
    }))
  }

  const addModulo = () => {
    setFormData((prev) => ({
      ...prev,
      modulos: [...prev.modulos, { titulo: "", descripcion: "", duracion_horas: "" }],
    }))
  }

  const removeModulo = (index) => {
    const updatedModulos = [...formData.modulos]
    updatedModulos.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      modulos: updatedModulos,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validaciones
      if (
        !formData.codigo ||
        !formData.nombre ||
        !formData.duracion_semanas ||
        !formData.horas_totales ||
        !formData.costo_matricula
      ) {
        throw new Error("Por favor, completa los campos requeridos")
      }

      // Validar módulos
      const modulosValidos = formData.modulos.every((m) => m.titulo && m.duracion_horas)
      if (formData.modulos.length > 0 && !modulosValidos) {
        throw new Error("Todos los módulos deben tener título y duración")
      }

      // Crear o actualizar curso
      if (isEditing) {
        await api.put(`/api/admin/cursos/${curso.id}`, formData)
        setSuccess(true)
      } else {
        await api.post("/api/admin/cursos", formData)
        router.push("/admin/cursos")
      }
    } catch (err) {
      console.error("Error al guardar curso:", err)
      setError(err.response?.data?.error || err.message || "Error al guardar el curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Editar Curso" : "Nuevo Curso"}</h2>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {success && <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">Curso actualizado correctamente</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (semanas) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duracion_semanas"
              value={formData.duracion_semanas}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas totales <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="horas_totales"
              value={formData.horas_totales}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel <span className="text-red-500">*</span>
            </label>
            <select
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="introductorio">Introductorio</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="experto">Experto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="ccna">CCNA</option>
              <option value="cyberops">CyberOps</option>
              <option value="devnet">DevNet</option>
              <option value="iot">IoT</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            >
              <option value="disponible">Disponible</option>
              <option value="no_disponible">No disponible</option>
              <option value="en_desarrollo">En desarrollo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo de matrícula <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="costo_matricula"
              value={formData.costo_matricula}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen de portada</label>
            <input
              type="text"
              name="imagen_portada"
              value={formData.imagen_portada}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Módulos del curso</h3>
            <button
              type="button"
              onClick={addModulo}
              className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors"
            >
              <FaPlus size={12} /> Añadir módulo
            </button>
          </div>

          {formData.modulos.length === 0 ? (
            <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg">
              No hay módulos definidos para este curso
            </div>
          ) : (
            <div className="space-y-4">
              {formData.modulos.map((modulo, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Módulo {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeModulo(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={modulo.titulo}
                        onChange={(e) => handleModuloChange(index, "titulo", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración (horas) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={modulo.duracion_horas}
                        onChange={(e) => handleModuloChange(index, "duracion_horas", e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={modulo.descripcion}
                        onChange={(e) => handleModuloChange(index, "descripcion", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-ciscoBlue focus:border-ciscoBlue"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-ciscoBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ciscoDarkBlue transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  )
}
