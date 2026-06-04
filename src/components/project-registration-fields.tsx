"use client";

import { useState } from "react";

export default function ProjectRegistrationFields() {
  const [mode, setMode] = useState<"JOIN" | "CREATE">("JOIN");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-ink-200 bg-white/70 p-1">
        <button
          type="button"
          onClick={() => setMode("JOIN")}
          className={`ui-focus rounded-xl px-3 py-3 text-sm font-semibold transition ${
            mode === "JOIN" ? "bg-ink-900 text-white shadow-soft" : "text-ink-600"
          }`}
        >
          Join a project
        </button>
        <button
          type="button"
          onClick={() => setMode("CREATE")}
          className={`ui-focus rounded-xl px-3 py-3 text-sm font-semibold transition ${
            mode === "CREATE" ? "bg-ink-900 text-white shadow-soft" : "text-ink-600"
          }`}
        >
          Create a project
        </button>
      </div>
      <input type="hidden" name="projectMode" value={mode} />
      {mode === "JOIN" ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            Project number
          </label>
          <input
            className="ui-input py-3 uppercase"
            placeholder="Example: A1B2C3D4"
            name="projectCode"
            required
            autoComplete="off"
          />
          <p className="mt-2 text-xs text-ink-500">Ask your project admin for this number.</p>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            Business or project name
          </label>
          <input
            className="ui-input py-3"
            placeholder="Example: My Takeaway"
            name="projectName"
            required
            autoComplete="organization"
          />
          <p className="mt-2 text-xs text-ink-500">
            We will create a unique project number for your team.
          </p>
        </div>
      )}
    </div>
  );
}
