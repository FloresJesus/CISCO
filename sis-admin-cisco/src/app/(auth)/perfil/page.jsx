import PerfilForm from '@/components/auth/PerfilForm';

export const metadata = {
  title: 'Iniciar Sesión | CISCO Academy',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <PerfilForm/>
      </div>
    </main>
  );
}