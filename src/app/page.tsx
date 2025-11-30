// src/app/page.tsx
import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NBA Project</h1>

      <LoginForm />
    </main>
  );
}
