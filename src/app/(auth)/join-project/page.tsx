import { joinProjectAfterOAuth } from "../login/actions";
import ProjectRegistrationFields from "@/components/project-registration-fields";

export default function JoinProjectPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = typeof searchParams.error === "string" ? searchParams.error : "";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/95 p-8 shadow-card">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Order Hub</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900">Choose your project</h1>
        <p className="mt-2 text-sm text-ink-500">
          Your Google account is ready. Join an existing team or start a new project.
        </p>
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}
        <form action={joinProjectAfterOAuth} className="mt-6 space-y-4">
          <ProjectRegistrationFields />
          <button className="ui-btn ui-btn-primary ui-focus w-full py-3 text-sm">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
