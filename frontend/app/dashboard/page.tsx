import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Ringkasan market dan chart akan ditambahkan di slice frontend.
      </p>
      <nav className="flex gap-4 text-sm">
        <Link href="/screening" className="underline">
          Screening
        </Link>
        <Link href="/" className="underline">
          Home
        </Link>
      </nav>
    </main>
  );
}
