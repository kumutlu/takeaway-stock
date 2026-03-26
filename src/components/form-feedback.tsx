"use client";

import { useFormState } from "react-dom";

export function FormFeedback({
  action,
  children
}: {
  action: (prevState: { message?: string }, formData: FormData) => Promise<{ message?: string }>;
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, { message: "" });

  return (
    <form action={formAction} className="space-y-3">
      {children}
      {state.message && (
        <p className="rounded-xl border border-ink-100 bg-white/80 px-3 py-2 text-sm text-ink-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
