"use client";

import { useEffect, useRef, useState } from "react";

export default function SignInForm({
  action
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [didSubmit, setDidSubmit] = useState(false);

  const tryAutoSubmit = () => {
    if (didSubmit) return;
    const form = formRef.current;
    if (!form) return;
    const email = (form.querySelector("input[name='email']") as HTMLInputElement | null)?.value;
    const password = (form.querySelector("input[name='password']") as HTMLInputElement | null)?.value;
    if (email && password) {
      setDidSubmit(true);
      form.requestSubmit();
    }
  };

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => {
      tryAutoSubmit();
    });
    return () => window.cancelAnimationFrame(handle);
  }, []);

  return (
    <form ref={formRef} action={action} className="mt-6 space-y-4" onInput={tryAutoSubmit}>
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
        autoComplete="current-password"
      />
      <button className="w-full rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
        Sign in
      </button>
    </form>
  );
}
