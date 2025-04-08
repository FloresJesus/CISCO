import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Registrate | CISCO Academy',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <RegisterForm />
      </div>
    </main>
  );
}