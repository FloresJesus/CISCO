import ParaleloForm from "@/components/admin/paralelos/ParaleloForm";

export const metadata = {
    title: "Nuevo Paralelo | Panel Administrativo",
    description: "Crear un nuevo paralelo en Cisco Academy",
};
export default function NuevoParaleloPage() {
    return (
        <div className="container mx-auto px-4 py-6">
            <ParaleloForm />
        </div>
    );
}