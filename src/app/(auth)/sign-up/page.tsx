import Link from "next/link";
import { signUpWithPassword } from "../login/actions";

export default function SignUpPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/95 p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-ink-900">Create account</h1>
        <p className="mt-2 text-sm text-ink-500">Set up your account to start tracking stock.</p>

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

        <form action={signUpWithPassword} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring"
            placeholder="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring"
            placeholder="Password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
          />
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring"
            placeholder="Confirm password"
            type="password"
            name="confirm"
            required
            autoComplete="new-password"
          />
          <button className="w-full rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
            Create account
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-ink-500">
          <Link className="hover:text-ink-700" href="/sign-in">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
