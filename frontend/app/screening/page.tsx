import Link from "next/link";

export default function ScreeningPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Screening</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Tabel screening indikator akan dihubungkan ke API di slice berikutnya.
      </p>
      <Link href="/dashboard" className="text-sm underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
