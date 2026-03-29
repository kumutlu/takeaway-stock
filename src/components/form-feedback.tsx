"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

export function FormFeedback({
  action,
  children,
  resetOnSuccess = false,
  onSuccess
}: {
  action: (
    prevState: { message?: string; success?: boolean },
    formData: FormData
  ) => Promise<{ message?: string; success?: boolean }>;
  children: React.ReactNode;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useFormState(action, { message: "", success: false });
  const formRef = useRef<HTMLFormElement>(null);
  const handledSuccessRef = useRef(false);

  useEffect(() => {
    if (!state.success) {
      handledSuccessRef.current = false;
      return;
    }
    if (handledSuccessRef.current) return;
    handledSuccessRef.current = true;

    if (resetOnSuccess) {
      formRef.current?.reset();
    }
    onSuccess?.();
  }, [onSuccess, resetOnSuccess, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {children}
      {state.message && (
        <p className="rounded-xl border border-ink-100 bg-white/80 px-3 py-2 text-sm text-ink-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
