import { Lock } from "lucide-react";

import { useApp } from "../context/AppContext";

import EmptyState from "../components/EmptyState";

export default function BlockedUsers() {
  const { blocked, unblockUserById } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
          Blocked Users
        </h1>

        <p className="text-sm text-ink-400 mt-0.5">
          Unblocking restores the friendship automatically.
        </p>
      </div>

      {blocked.length === 0 ? (
        <EmptyState
          icon="🔓"
          title="No blocked users"
          message="Anyone you block will be listed here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {blocked.map((b) => (
            <div
              key={b.id}
              className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter"
            >
              {/* Avatar */}
              <div className="h-11 w-11 rounded-full bg-ink-50 text-ink-400 font-display font-semibold flex items-center justify-center text-sm shrink-0">
                {b.name
                  ?.split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              {/* User Information */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-800 truncate">
                  {b.name || "User"}
                </p>

                <p className="text-xs text-ink-400">
                  @{b.username || "username"}
                </p>

                <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                  <Lock size={10} />
                  Blocked
                </p>
              </div>

              {/* Unblock */}
              <button
                type="button"
                onClick={() => unblockUserById(b)}
                className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors shrink-0"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}