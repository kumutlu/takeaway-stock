import { signInWithPassword, sendMagicLink, signInWithGoogle, signUpWithPassword, sendPasswordReset } from "./actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Welcome</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">Sign in</h1>
        <p className="mt-2 text-sm text-ink-500">Email + password, magic link or Google.</p>
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            {message}
          </div>
        )}

        <form action={signInWithGoogle} className="mt-6">
          <button className="w-full rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">
            Sign in with Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-100" />
          or
          <span className="h-px flex-1 bg-ink-100" />
        </div>

        <form action={signInWithPassword} className="space-y-4">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Email"
            type="email"
            name="email"
            required
          />
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Password"
            type="password"
            name="password"
            required
          />
          <button className="w-full rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
            Sign in
          </button>
        </form>
        <form action={sendPasswordReset} className="mt-3 flex gap-2">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-xs shadow-ring"
            placeholder="Email for reset"
            type="email"
            name="email"
            required
          />
          <button className="rounded-full border border-ink-200 px-3 text-xs text-ink-700">
            Reset
          </button>
        </form>
        <form action={sendMagicLink} className="mt-6 space-y-3 text-center text-sm text-ink-500">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Email"
            type="email"
            name="email"
            required
          />
          <button className="w-full rounded-full border border-ink-200 px-4 py-2" type="submit">
            Send magic link
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-100" />
          Create account
          <span className="h-px flex-1 bg-ink-100" />
        </div>
        <form action={signUpWithPassword} className="space-y-3">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Email"
            type="email"
            name="email"
            required
          />
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Password"
            type="password"
            name="password"
            required
          />
          <button className="w-full rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">
            Create account
          </button>
        </form>
      </div>
    </main>
  );
}
