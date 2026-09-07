import { useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

import { useApp } from "../context/AppContext";

import WeatherComparison from "../components/WeatherComparison";

import EmptyState from "../components/EmptyState";

export default function Compare() {
  const { user, friendsList } = useApp();

  const routerLocation = useLocation();

  /*
   * IMPORTANT:
   * Show ALL friends in the selector.
   *
   * WeatherComparison.jsx itself decides whether
   * the friend's weather can be displayed.
   */
  const friends = useMemo(() => {
    return friendsList.filter(
      (friend) => friend?.id
    );
  }, [friendsList]);

  const [friendId, setFriendId] = useState("");

  /*
   * Select the friend passed from the Friends page.
   *
   * If that friend doesn't exist anymore,
   * select the first available friend.
   */
  useEffect(() => {
    const requestedFriendId =
      routerLocation.state?.friendId;

    const requestedFriendExists = friends.some(
      (friend) => friend.id === requestedFriendId
    );

    if (requestedFriendExists) {
      setFriendId(requestedFriendId);
    } else if (friends.length > 0) {
      setFriendId((currentId) => {
        const currentFriendExists = friends.some(
          (friend) => friend.id === currentId
        );

        return currentFriendExists
          ? currentId
          : friends[0].id;
      });
    } else {
      setFriendId("");
    }
  }, [routerLocation.state, friends]);

  /*
   * Find selected friend.
   */
  const friend = useMemo(() => {
    return friends.find(
      (friend) => friend.id === friendId
    );
  }, [friends, friendId]);

  /*
   * Debug Firebase friend data.
   */
  // console.log(
  //   "🔥 COMPARE ALL FRIEND DATA:",
  //   JSON.stringify(
  //     friends.map((friend) => ({
  //       id: friend.id,
  //       name: friend.name,
  //       weatherSharing: friend.weatherSharing,
  //       hasWeather: !!friend.weather,
  //       weather: friend.weather,
  //       weatherUpdatedAt: friend.weatherUpdatedAt,
  //     })),
  //     null,
  //     2
  //   )
  // );

  // console.log("🔥 SELECTED FRIEND:", friend);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">

      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
        Compare Weather
      </h1>

      {/* No friends */}
      {friends.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No friends yet"
          message="Add a friend to compare weather conditions."
        />
      ) : (
        <>
          {/* Friend selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {friends.map((friend) => {
              const sharing =
                friend?.weatherSharing === true;

              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() =>
                    setFriendId(friend.id)
                  }
                  className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                    friendId === friend.id
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-white text-ink-600 border-sky-100 hover:bg-sky-50"
                  }`}
                >
                  {friend.name || "Friend"}

                  {!sharing && (
                    <span className="ml-1">
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Weather comparison */}
          {friend && (
            <WeatherComparison
              you={{
                location:
                  user?.location ?? null,
                weather:
                  user?.weather ?? null,
              }}
              youLabel="You"
              friend={{
                id: friend.id,
                name: friend.name,

                location:
                  friend.location ?? null,

                /*
                 * Firebase weather sharing status.
                 */
                weatherSharing:
                  friend.weatherSharing === true,

                /*
                 * Only provide weather when
                 * sharing is enabled.
                 */
                weather:
                  friend.weatherSharing === true
                    ? friend.weather
                    : null,

                /*
                 * Firebase weather update timestamp.
                 *
                 * This is used by WeatherComparison.jsx
                 * to show:
                 *
                 * "Updated just now"
                 * "Updated 5 minutes ago"
                 * etc.
                 */
                weatherUpdatedAt:
                  friend.weatherUpdatedAt ?? null,
              }}
              friendLabel={
                friend.name?.split(" ")[0] ||
                "Friend"
              }
            />
          )}
        </>
      )}
    </div>
  );
}