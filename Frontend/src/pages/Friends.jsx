import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  UserPlus,
  Inbox,
} from "lucide-react";

import { useApp } from "../context/AppContext";

import FriendCard from "../components/FriendCard";
import AddFriendModal from "../components/AddFriendModal";
import BlockUserModal from "../components/BlockUserModal";
import EmptyState from "../components/EmptyState";
import RefreshButton from "../components/Refreshbutton";

export default function Friends() {
  const {
    friendsList,
    received,
    pushToast,
  } = useApp();

  const navigate = useNavigate();

  const [term, setTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);

  // Remove duplicate friends based on ID
  const uniqueFriends = Array.from(
    new Map(
      friendsList.map((friend) => [
        friend.id,
        friend,
      ])
    ).values()
  );

  const filtered = uniqueFriends.filter((friend) => {
  const t = term.trim().toLowerCase();

  if (!t) return true;

  const name = String(friend.name || "").toLowerCase();
  const userId = String(friend.userId || "").toLowerCase();
  const username = String(friend.username || "").toLowerCase();

  return (
    name.includes(t) ||
    userId.includes(t) ||
    username.includes(t)
  );
});

  // Handle compare button
  const handleCompare = (friend) => {
    // Friend has not enabled weather sharing
    if (friend?.weatherSharing !== true) {
      pushToast(
        `${
          friend?.name || "This friend"
        }'s weather is not shared`,
        "error"
      );

      return;
    }

    // Weather sharing is enabled
    navigate("/compare", {
      state: {
        friendId: friend.id,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
          My Weather Circle
        </h1>

        <RefreshButton />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          <UserPlus size={15} />
          Add Friend
        </button>

        <button
          type="button"
          onClick={() => navigate("/requests")}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors relative"
        >
          <Inbox size={15} />
          Friend Requests

          {received.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-sun-400 text-white text-[10px] font-bold flex items-center justify-center">
              {received.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
        />

        <input
          type="text"
          value={term}
          onChange={(e) =>
            setTerm(e.target.value)
          }
          placeholder="Search users..."
          className="w-full bg-white shadow-card rounded-full pl-10 pr-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-sky-300 transition-shadow"
        />
      </div>

      {/* Friends */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={
            uniqueFriends.length === 0
              ? "No friends yet"
              : "No matches"
          }
          message={
            uniqueFriends.length === 0
              ? "Add friends to start comparing weather and sharing your location."
              : "Try a different name or username."
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onCompare={() =>
                handleCompare(friend)
              }
              onBlock={setBlockTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddFriendModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <BlockUserModal
        open={!!blockTarget}
        onClose={() =>
          setBlockTarget(null)
        }
        person={blockTarget}
      />
    </div>
  );
}