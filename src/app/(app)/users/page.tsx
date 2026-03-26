import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormFeedback } from "@/components/form-feedback";
import { createUser, toggleUserActive } from "./actions";

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Users</h1>
          <p className="text-sm text-ink-500">Admin only · 4 user limit.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-ink-900">New user</h2>
        <FormFeedback action={createUser}>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              placeholder="Email"
              type="email"
              name="email"
              required
            />
            <input
              className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              placeholder="Temporary password"
              type="password"
              name="password"
              required
            />
            <select
              className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              name="role"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            Add user
          </button>
        </FormFeedback>
      </div>

      <div className="hidden rounded-2xl border border-ink-100 bg-white/90 shadow-soft lg:block">
        <div className="grid grid-cols-4 gap-2 border-b border-ink-100 px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink-400">
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-ink-100">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-4 gap-2 px-6 py-4 text-sm text-ink-700">
              <span className="font-semibold text-ink-900">{user.email}</span>
              <span>{user.role}</span>
              <span className="text-ink-500">{user.isActive ? "Active" : "Paused"}</span>
              <form action={toggleUserActive}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="isActive" value={String(user.isActive)} />
                <button className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring">
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">{user.email}</p>
              <span className="text-xs text-ink-500">{user.role}</span>
            </div>
            <p className="mt-2 text-xs text-ink-500">{user.isActive ? "Active" : "Paused"}</p>
            <form action={toggleUserActive} className="mt-3">
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="isActive" value={String(user.isActive)} />
              <button className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring">
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
