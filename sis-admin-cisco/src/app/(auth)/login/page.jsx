import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar Sesión | CISCO Academy',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <LoginForm />
      </div>
    </main>
  );
}