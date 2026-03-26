"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-10 w-10 rounded-full bg-sand-200"
        aria-label="User menu"
      />
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-ink-100 bg-white/90 p-2 text-sm shadow-soft">
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-lg px-3 py-2 text-left text-ink-700 hover:bg-ink-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
