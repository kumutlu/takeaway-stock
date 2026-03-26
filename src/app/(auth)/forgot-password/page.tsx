import Link from "next/link";
import { sendPasswordReset } from "../login/actions";

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/95 p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-ink-900">Reset password</h1>
        <p className="mt-2 text-sm text-ink-500">We will email you a secure reset link.</p>

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

        <form action={sendPasswordReset} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring"
            placeholder="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <button className="w-full rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
            Send reset link
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
