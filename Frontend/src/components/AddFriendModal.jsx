import { useEffect, useState } from "react";

import { Search, MapPin, Check, UserPlus } from "lucide-react";

import { useApp } from "../context/AppContext";

import Modal from "./Modal";

export default function AddFriendModal({ open, onClose }) {
  const { searchUsers, sendRequest } = useApp();

  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // RESET WHEN MODAL CLOSES
  // =========================================================

  useEffect(() => {
    if (!open) {
      setTerm("");
      setResults([]);
      setSearching(false);
      setError("");
    }
  }, [open]);

  // =========================================================
  // SEARCH USERS
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const search = async () => {
      const searchTerm = term.trim();

      if (!searchTerm) {
        setResults([]);
        setSearching(false);
        setError("");
        return;
      }

      setSearching(true);
      setError("");

      try {
        console.log("Searching Firebase for:", searchTerm);

        const users = await searchUsers(searchTerm);

        console.log("Firebase search results:", users);

        setResults(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error("Search users error:", err);

        setResults([]);

        setError(err?.message || "Unable to search users");
      } finally {
        setSearching(false);
      }
    };

    // Small delay so Firebase isn't called
    // on every keystroke
    const timer = setTimeout(search, 300);

    return () => clearTimeout(timer);
  }, [term, open, searchUsers]);

  // =========================================================
  // GET INITIALS
  // =========================================================

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // =========================================================
  // GET LOCATION
  // =========================================================

  const getLocationText = (person) => {
    if (typeof person?.location === "string") {
      return person.location;
    }

    return person?.location?.city || person?.weather?.locationName || "";
  };

  // =========================================================
  // SEND FRIEND REQUEST
  // =========================================================

  const handleSendRequest = async (person) => {
    try {
      console.log("Sending friend request to:", {
        firebaseUid: person.id,
        publicUserId: person.userId,
        name: person.name,
      });

      /*
       * IMPORTANT:
       *
       * person.id = Firebase UID
       * person.userId = public User ID
       *
       * sendRequest(person) should internally
       * use person.id when creating the request.
       */

      await sendRequest(person);

      setResults((current) =>
        current.map((item) =>
          item.id === person.id
            ? {
                ...item,
                isPending: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Send friend request error:", error);

      alert(error?.message || "Could not send friend request");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Modal open={open} onClose={onClose} title="Add Friend">
      {/* SEARCH INPUT */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
        />

        <input
          autoFocus
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by name or User ID..."
          className="w-full bg-sky-50 rounded-full pl-10 pr-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-sky-300 transition-shadow"
        />
      </div>

      {/* EMPTY SEARCH */}
      {term.trim() === "" && (
        <div className="text-center py-8">
          <Search size={28} className="mx-auto mb-3 text-sky-300" />

          <p className="text-sm font-medium text-ink-600">Find your friends</p>

          <p className="text-xs text-ink-400 mt-1">
            Search by name or User ID.
          </p>
        </div>
      )}

      {/* SEARCHING */}
      {term.trim() !== "" && searching && (
        <div className="text-center py-8">
          <div className="h-6 w-6 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-ink-400">Searching users...</p>
        </div>
      )}

      {/* ERROR */}
      {term.trim() !== "" && !searching && error && (
        <div className="text-center py-8">
          <p className="text-sm font-medium text-red-500">Search failed</p>

          <p className="text-xs text-ink-400 mt-1">{error}</p>
        </div>
      )}

      {/* NO RESULTS */}
      {term.trim() !== "" && !searching && !error && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm font-medium text-ink-500">No users found</p>

          <p className="text-xs text-ink-400 mt-1">
            Try another name or User ID.
          </p>
        </div>
      )}

      {/* RESULTS */}
      {!searching && !error && results.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {results.map((person) => {
            const locationText = getLocationText(person);

            return (
              <div
                key={person.id}
                className="flex items-center gap-3 p-2.5 rounded-xl2 hover:bg-sky-50 transition-colors"
              >
                {/* AVATAR */}
                {person.photoURL ? (
                  <img
                    src={person.photoURL}
                    alt={person.name || "User"}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
                    {getInitials(person.name)}
                  </div>
                )}

                {/* USER INFO */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">
                    {person.name || "User"}
                  </p>

                  {/* PUBLIC USER ID */}
                  <p className="text-xs text-ink-400 truncate">
                    @ @{person.userId || person.username || "username"}
                  </p>

                  {/* LOCATION */}
                  {locationText && (
                    <p className="text-xs text-ink-400 flex items-center gap-1 truncate mt-0.5">
                      <MapPin size={10} className="shrink-0" />

                      <span className="truncate">{locationText}</span>
                    </p>
                  )}
                </div>

                {/* STATUS */}
                {person.isFriend ? (
                  <span className="text-xs font-medium text-sky-600 flex items-center gap-1 shrink-0">
                    <Check size={13} />
                    Friends
                  </span>
                ) : person.isPending ? (
                  <span className="text-xs font-medium text-ink-400 shrink-0">
                    Request Sent
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendRequest(person)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <UserPlus size={12} />
                    Add Friend
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
