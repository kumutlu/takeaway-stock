import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl rounded-3xl bg-white/80 p-10 shadow-card backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-ink-500">Wrap'n Bowl</p>
        <h1 className="mt-4 font-[var(--font-display)] text-4xl text-ink-900 md:text-5xl">
          Stock tracking, made clear.
        </h1>
        <p className="mt-4 text-base text-ink-600">
          Wrap'n Bowl, Eugreeka! and LEB+NOM inventory in one place. Fast login,
          clear alerts, easy ordering.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700"
          >
            Demo dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
