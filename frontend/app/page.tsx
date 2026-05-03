import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Trading Analytics
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Next.js 14 · Express · PostgreSQL · Redis
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90"
        >
          Dashboard
        </Link>
        <Link
          href="/screening"
          className="rounded-md border border-neutral-300 px-4 py-2 dark:border-neutral-600"
        >
          Screening
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-4 py-2 dark:border-neutral-600"
        >
          Login
        </Link>
      </nav>
    </main>
  );
}
