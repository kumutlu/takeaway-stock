"use client";

import { useEffect, useRef, useState } from "react";

export default function SignInForm({
  action,
  error
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [didSubmit, setDidSubmit] = useState(false);
  const lastSubmitted = useRef<{ email: string; password: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tryAutoSubmit = (fromInput = false) => {
    if (didSubmit) return;
    if (error && !fromInput) return;
    const form = formRef.current;
    if (!form) return;
    const email = (form.querySelector("input[name='email']") as HTMLInputElement | null)?.value;
    const password = (form.querySelector("input[name='password']") as HTMLInputElement | null)?.value;
    if (email && password) {
      if (lastSubmitted.current?.email === email && lastSubmitted.current?.password === password) {
        return;
      }
      setDidSubmit(true);
      lastSubmitted.current = { email, password };
      form.requestSubmit();
    }
  };

  const scheduleAutoSubmit = (fromInput = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => tryAutoSubmit(fromInput), 500);
  };

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => {
      scheduleAutoSubmit(false);
    });
    return () => {
      window.cancelAnimationFrame(handle);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <form
      ref={formRef}
      action={action}
      className="mt-6 space-y-4"
      onInput={() => scheduleAutoSubmit(true)}
    >
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
