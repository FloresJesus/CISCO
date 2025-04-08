import CourseForm from '@/components/CourseForm';

export const metadata = {
  title: 'Registrate | CISCO Academy',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <CourseForm />
      </div>
    </main>
  );
}