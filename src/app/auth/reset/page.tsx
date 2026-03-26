import { updatePassword } from "./actions";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Reset</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">Set a new password</h1>
        <p className="mt-2 text-sm text-ink-500">Enter and confirm your new password.</p>
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}
        <form action={updatePassword} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="New password"
            type="password"
            name="password"
            required
          />
          <input
            className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
            placeholder="Confirm password"
            type="password"
            name="confirm"
            required
          />
          <button className="w-full rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
