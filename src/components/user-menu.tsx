"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ui-focus h-10 w-10 rounded-full border border-sand-300 bg-sand-200 transition duration-200 hover:border-sand-400 hover:bg-sand-300 active:scale-[0.98]"
        aria-label="User menu"
      />
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-ink-100 bg-white/90 p-2 text-sm shadow-soft dark:border-ink-700 dark:bg-ink-900">
          <button
            type="button"
            onClick={toggleTheme}
            className="ui-focus mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-ink-700 transition duration-200 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="ui-focus w-full rounded-lg px-3 py-2 text-left text-ink-700 transition duration-200 hover:bg-ink-50 active:scale-[0.99] dark:text-ink-200 dark:hover:bg-ink-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
