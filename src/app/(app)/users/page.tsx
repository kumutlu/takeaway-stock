import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormFeedback } from "@/components/form-feedback";
import { approveUser, blockUser, createUser, removeUser, updateUserRole } from "./actions";

export default async function UsersPage() {
  const { appUser } = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Users</h1>
          <p className="text-sm text-ink-500">Admin only · approve and manage access.</p>
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
              <form action={updateUserRole} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-700"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring">
                  Save role
                </button>
              </form>
              <div className="flex items-center gap-2">
                <span className="text-ink-500">{user.isActive ? "Active" : "Pending approval"}</span>
                {!user.isActive && (
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Approve
                    </button>
                  </form>
                )}
                {user.id !== appUser.id && (
                  <>
                    <form action={blockUser}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Block user
                      </button>
                    </form>
                    <form action={removeUser}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Remove user
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">{user.email}</p>
              <form action={updateUserRole} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-700"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring">
                  Save
                </button>
              </form>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
              <span>{user.isActive ? "Active" : "Pending approval"}</span>
              {!user.isActive && (
                <form action={approveUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Approve
                  </button>
                </form>
              )}
            </div>
            {user.id !== appUser.id && (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={blockUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Block user
                  </button>
                </form>
                <form action={removeUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    Remove user
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
