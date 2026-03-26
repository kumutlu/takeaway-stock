export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-ink-100 bg-white/85 p-10 text-center shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Wrap'n Bowl</p>
        <h1 className="mt-4 font-[var(--font-display)] text-4xl text-ink-900 md:text-5xl">
          Stock tracking, made clear.
        </h1>
        <p className="mt-4 text-base text-ink-600">
          Wrap&apos;n Bowl, Eugreeka! and LEB+NOM inventory in one place.
        </p>
        <div className="mt-8">
          <a
            href="/sign-in"
            className="inline-flex rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
