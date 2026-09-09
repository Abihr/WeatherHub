
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
  weatherAlerts as initialWeatherAlerts,
} from "../data/mockData";

import * as fs from "../firebase/firestore";

import {
  getCurrentWeather,
} from "../services/weatherService";

import {
  getCurrentPosition,
} from "../services/locationService";

const AppContext = createContext(null);

let toastId = 0;

/* ================================================================
   REVERSE GEOCODING
================================================================ */

async function getPlaceName(
  latitude,
  longitude,
) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${latitude}` +
      `&lon=${longitude}` +
      `&zoom=10` +
      `&addressdetails=1`;

    const response =
      await fetch(url, {
        headers: {
          Accept:
            "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        "Failed to get location name",
      );
    }

    const data =
      await response.json();

    const address =
      data?.address || {};

    const placeName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.county ||
      "";

    const country =
      address.country_code
        ? address.country_code.toUpperCase()
        : "";

    return {
      placeName,
      country,
    };
  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error,
    );

    return {
      placeName: "",
      country: "",
    };
  }
}

// ============================================================
// PROVIDER
// ============================================================

export function AppProvider({
  children,
  firebaseUser,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] =
    useState(null);

  const [friendsList, setFriendsList] =
    useState([]);

  const [received, setReceived] =
    useState([]);

  const [sent, setSent] =
    useState([]);

  const [blocked, setBlocked] =
    useState([]);

  const [toasts, setToasts] =
    useState([]);

  const [locating, setLocating] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  /*
    Existing mock weather alerts.
    We keep this temporarily so the
    current Alerts UI doesn't break.
  */

  const [weatherAlerts, setWeatherAlerts] =
    useState(initialWeatherAlerts);

  /*
    NEW:
    Real geo-targeted disaster notifications.
  */

  const [
    disasterNotifications,
    setDisasterNotifications,
  ] = useState([]);

  // ==========================================================
  // REMOVE SINGLE WEATHER ALERT
  // ==========================================================

  const removeWeatherAlert =
    useCallback(
      (alertId) => {
        setWeatherAlerts(
          (current) =>
            current.filter(
              (alert) =>
                alert.id !==
                alertId,
            ),
        );
      },
      [],
    );

  // ==========================================================
  // CLEAR WEATHER ALERTS
  // ==========================================================

  const clearWeatherAlerts =
    useCallback(() => {
      setWeatherAlerts([]);
    }, []);

  // ==========================================================
  // TOASTS
  // ==========================================================

  const pushToast =
    useCallback(
      (
        message,
        tone = "success",
      ) => {
        const id =
          ++toastId;

        setToasts(
          (current) => [
            ...current,
            {
              id,
              message,
              tone,
            },
          ],
        );

        setTimeout(() => {
          setToasts(
            (current) =>
              current.filter(
                (toast) =>
                  toast.id !==
                  id,
              ),
          );
        }, 3200);
      },
      [],
    );

  const dismissToast =
    useCallback(
      (id) => {
        setToasts(
          (current) =>
            current.filter(
              (toast) =>
                toast.id !== id,
            ),
        );
      },
      [],
    );

  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!firebaseUser) {
        setUser(null);
        setFriendsList([]);
        setReceived([]);
        setSent([]);
        setBlocked([]);
        setDisasterNotifications([]);

        return;
      }

      try {
        const firebaseProfile =
          await fs.getUser(
            firebaseUser.uid,
          );

        if (cancelled) return;

        const mergedUser = {
          ...(firebaseProfile ||
            {}),

          id:
            firebaseUser.uid,

          uid:
            firebaseUser.uid,

          name:
            firebaseProfile?.name ||
            firebaseUser.displayName ||
            "User",

          email:
            firebaseProfile?.email ||
            firebaseUser.email ||
            "",

          photoURL:
            firebaseProfile?.photoURL ||
            firebaseUser.photoURL ||
            "",
        };

        setUser(
          mergedUser,
        );
      } catch (error) {
        console.error(
          "Failed to load user:",
          error,
        );

        if (cancelled) return;

        setUser({
          id:
            firebaseUser.uid,

          uid:
            firebaseUser.uid,

          name:
            firebaseUser.displayName ||
            "User",

          email:
            firebaseUser.email ||
            "",

          photoURL:
            firebaseUser.photoURL ||
            "",
        });
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  // ==========================================================
  // LOAD BLOCKED USERS
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setBlocked([]);
      return;
    }

    let cancelled = false;

    async function loadBlockedUsers() {
      try {
        const blockedUsers =
          await fs.getBlockedUsers(
            user.id,
          );

        if (!cancelled) {
          setBlocked(
            blockedUsers,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load blocked users:",
          error,
        );
      }
    }

    loadBlockedUsers();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ==========================================================
  // REFRESH FRIENDS
  // ==========================================================

  const refreshFriends =
    useCallback(
      async () => {
        if (!user?.id) {
          setFriendsList([]);
          return [];
        }

        try {
          const friends =
            await fs.getFriends(
              user.id,
            );

          const uniqueFriends =
            Array.from(
              new Map(
                friends.map(
                  (friend) => [
                    friend.friendId ||
                      friend.id,
                    friend,
                  ],
                ),
              ).values(),
            );

          setFriendsList(
            uniqueFriends,
          );

          return uniqueFriends;
        } catch (error) {
          console.error(
            "refreshFriends error:",
            error,
          );

          pushToast(
            "Failed to refresh friends",
            "error",
          );

          return [];
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // REAL-TIME FRIEND LISTENER
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setFriendsList([]);
      return;
    }

    console.log(
      "Starting real-time friend listener:",
      user.id,
    );

    const unsubscribe =
      fs.subscribeToFriends(
        user.id,
        (friends) => {
          const uniqueFriends =
            Array.from(
              new Map(
                friends.map(
                  (friend) => [
                    friend.friendId ||
                      friend.id,
                    friend,
                  ],
                ),
              ).values(),
            );

          setFriendsList(
            uniqueFriends,
          );
        },
      );

    return () => {
      console.log(
        "Stopping real-time friend listener",
      );

      unsubscribe();
    };
  }, [user?.id]);

  // ==========================================================
  // REAL-TIME DISASTER NOTIFICATIONS
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setDisasterNotifications([]);
      return;
    }

    console.log(
      "Starting disaster notification listener:",
      user.id,
    );

    const unsubscribe =
      fs.subscribeToNotifications(
        user.id,
        (notifications) => {
          console.log(
            "DISASTER NOTIFICATIONS:",
            notifications,
          );

          setDisasterNotifications(
            notifications,
          );
        },
      );

    return () => {
      console.log(
        "Stopping disaster notification listener",
      );

      unsubscribe();
    };
  }, [user?.id]);

  // ==========================================================
  // DETECT LOCATION + WEATHER
  // ==========================================================

  const detectLocation =
    useCallback(
      async () => {
        if (!user?.id) {
          return;
        }

        setLocating(true);

        try {
          // --------------------------------------------------
          // GET GPS LOCATION
          // --------------------------------------------------

          const position =
            await getCurrentPosition();

          const {
            latitude,
            longitude,
          } = position;

          console.log(
            "GPS LOCATION:",
            latitude,
            longitude,
          );

          // --------------------------------------------------
          // GET PLACE NAME
          // --------------------------------------------------

          const place =
            await getPlaceName(
              latitude,
              longitude,
            );

          console.log(
            "PLACE:",
            place,
          );

          // --------------------------------------------------
          // GET WEATHER
          // --------------------------------------------------

          const weather =
            await getCurrentWeather(
              latitude,
              longitude,
            );

          console.log(
            "CURRENT WEATHER:",
            weather,
          );

          // --------------------------------------------------
          // FINAL LOCATION NAME
          // --------------------------------------------------

          const finalLocationName =
            weather?.locationName ||
            place?.placeName ||
            "";

          const finalCountry =
            weather?.country ||
            place?.country ||
            "";

          // --------------------------------------------------
          // SAVE LOCATION TO FIREBASE
          // --------------------------------------------------

          await fs.updateUserLocation(
            user.id,
            latitude,
            longitude,
            finalLocationName,
            finalCountry,
          );

          // --------------------------------------------------
          // NORMALIZE WEATHER
          // --------------------------------------------------

          const weatherToSave = {
            temperature:
              weather?.temperature ??
              weather?.temp ??
              null,

            condition:
              weather?.condition ??
              "",

            feelsLike:
              weather?.feelsLike ??
              null,

            humidity:
              weather?.humidity ??
              null,

            wind:
              weather?.wind ??
              null,

            rain:
              weather?.rain ??
              0,

            icon:
              weather?.icon ??
              "",

            locationName:
              finalLocationName,

            country:
              fcdinalCountry,
          };

          // --------------------------------------------------
          // SAVE WEATHER TO FIREBASE
          // --------------------------------------------------

          await fs.updateUserWeather(
            user.id,
            weatherToSave,
          );

          // --------------------------------------------------
          // LOCATION TEXT
          // --------------------------------------------------

          const locationText =
            finalLocationName
              ? `${finalLocationName}${
                  finalCountry
                    ? `, ${finalCountry}`
                    : ""
                }`
              : "";

          // --------------------------------------------------
          // UPDATE CURRENT USER LOCALLY
          // --------------------------------------------------

          setUser(
            (currentUser) => {
              if (!currentUser) {
                return currentUser;
              }

              return {
                ...currentUser,

                latitude,
                longitude,

                location: {
                  ...(currentUser.location ||
                    {}),

                  city:
                    finalLocationName,

                  name:
                    finalLocationName,

                  lat:
                    latitude,

                  lng:
                    longitude,

                  country:
                    finalCountry,
                },

                locationText,

                weather:
                  weatherToSave,
              };
            },
          );

          // --------------------------------------------------
          // OPTIONAL MANUAL REFRESH
          // --------------------------------------------------

          await refreshFriends();

          pushToast(
            `Location updated: ${
              locationText ||
              "Current location"
            }`,
            "success",
          );
        } catch (error) {
          console.error(
            "Location/weather error:",
            error,
          );

          let message =
            "Unable to get your location or weather.";

          if (
            error?.code === 1
          ) {
            message =
              "Location permission was denied.";
          } else if (
            error?.code === 2
          ) {
            message =
              "Your location could not be determined.";
          } else if (
            error?.code === 3
          ) {
            message =
              "Location request timed out.";
          } else if (
            error?.message
          ) {
            message =
              error.message;
          }

          pushToast(
            message,
            "error",
          );
        } finally {
          setLocating(false);
        }
      },
      [
        user?.id,
        pushToast,
        refreshFriends,
      ],
    );

  // ==========================================================
  // AUTOMATIC LOCATION DETECTION
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    detectLocation();
  }, [
    user?.id,
  ]);

  // ==========================================================
  // LOAD REQUESTS
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setReceived([]);
      setSent([]);
      return;
    }

    let cancelled = false;

    async function loadFirebaseData() {
      try {
        const [
          receivedRequests,
          sentRequests,
        ] = await Promise.all([
          fs.getReceivedRequests(
            user.id,
          ),

          fs.getSentRequests(
            user.id,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setReceived(
          receivedRequests,
        );

        setSent(
          sentRequests,
        );
      } catch (error) {
        console.error(
          "Failed to load Firebase data:",
          error,
        );
      }
    }

    loadFirebaseData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ==========================================================
  // SEND FRIEND REQUEST
  // ==========================================================

  const sendRequest =
    useCallback(
      async (person) => {
        if (
          !user?.id ||
          !person?.id
        ) {
          return;
        }

        try {
          const result =
            await fs.sendFriendRequest(
              user.id,
              person.id,
            );

          setSent(
            (current) => [
              ...current,
              {
                requestId:
                  result.requestId,

                senderId:
                  user.id,

                receiverId:
                  person.id,

                status:
                  "pending",

                name:
                  person.name ||
                  "User",

                username:
                  person.username ||
                  "",

                email:
                  person.email ||
                  "",

                photoURL:
                  person.photoURL ||
                  "",

                location:
                  person.location ||
                  null,

                locationText:
                  person.locationText ||
                  "",

                latitude:
                  person.latitude ??
                  null,

                longitude:
                  person.longitude ??
                  null,

                weather:
                  person.weather ||
                  null,

                weatherSharing:
                  person.weatherSharing ??
                  false,

                locationSharing:
                  person.locationSharing ??
                  "off",
              },
            ],
          );

          pushToast(
            "Friend request sent",
            "success",
          );

          return result;
        } catch (error) {
          console.error(
            "sendRequest error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to send friend request",
            "error",
          );

          throw error;
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // CANCEL FRIEND REQUEST
  // ==========================================================

  const cancelRequest =
    useCallback(
      async (
        requestId,
      ) => {
        if (!requestId) {
          return;
        }

        try {
          await fs.cancelFriendRequest(
            requestId,
          );

          setSent(
            (current) =>
              current.filter(
                (request) =>
                  request.requestId !==
                  requestId,
              ),
          );

          pushToast(
            "Friend request cancelled",
            "success",
          );
        } catch (error) {
          console.error(
            "cancelRequest error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to cancel request",
            "error",
          );
        }
      },
      [pushToast],
    );

  // ==========================================================
  // ACCEPT FRIEND REQUEST
  // ==========================================================

  const acceptRequest =
    useCallback(
      async (
        request,
      ) => {
        if (
          !request?.requestId ||
          !user?.id ||
          !request?.senderId
        ) {
          return;
        }

        try {
          const result =
            await fs.acceptFriendRequest(
              request.requestId,
              user.id,
              request.senderId,
            );

          const friend =
            result?.friend || {
              id:
                request.senderId,

              friendId:
                request.senderId,

              name:
                request.name ||
                "User",

              username:
                request.username ||
                "",

              email:
                request.email ||
                "",

              photoURL:
                request.photoURL ||
                "",

              location:
                request.location ||
                null,

              locationText:
                request.locationText ||
                "",

              latitude:
                request.latitude ??
                null,

              longitude:
                request.longitude ??
                null,

              weather:
                request.weather ||
                null,

              weatherSharing:
                request.weatherSharing ??
                false,

              locationSharing:
                request.locationSharing ??
                "off",
            };

          setFriendsList(
            (current) => {
              const exists =
                current.some(
                  (item) =>
                    (
                      item.friendId ||
                      item.id
                    ) ===
                    (
                      friend.friendId ||
                      friend.id
                    ),
                );

              if (exists) {
                return current;
              }

              return [
                ...current,
                friend,
              ];
            },
          );

          setReceived(
            (current) =>
              current.filter(
                (item) =>
                  item.requestId !==
                  request.requestId,
              ),
          );

          await refreshFriends();

          pushToast(
            "Friend request accepted",
            "success",
          );

          return friend;
        } catch (error) {
          console.error(
            "acceptRequest error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to accept friend request",
            "error",
          );

          throw error;
        }
      },
      [
        user?.id,
        pushToast,
        refreshFriends,
      ],
    );

  // ==========================================================
  // REJECT FRIEND REQUEST
  // ==========================================================

  const rejectRequest =
    useCallback(
      async (
        requestId,
      ) => {
        if (!requestId) {
          return;
        }

        try {
          await fs.rejectFriendRequest(
            requestId,
          );

          setReceived(
            (current) =>
              current.filter(
                (request) =>
                  request.requestId !==
                  requestId,
              ),
          );

          pushToast(
            "Friend request rejected",
            "success",
          );
        } catch (error) {
          console.error(
            "rejectRequest error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to reject request",
            "error",
          );
        }
      },
      [pushToast],
    );

  // ==========================================================
  // REMOVE FRIEND
  // ==========================================================

  const removeFriend =
    useCallback(
      async (
        friendId,
      ) => {
        if (
          !user?.id ||
          !friendId
        ) {
          return;
        }

        try {
          await fs.removeFriend(
            user.id,
            friendId,
          );

          setFriendsList(
            (current) =>
              current.filter(
                (friend) =>
                  (
                    friend.friendId ||
                    friend.id
                  ) !== friendId,
              ),
          );

          pushToast(
            "Friend removed",
            "success",
          );
        } catch (error) {
          console.error(
            "removeFriend error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to remove friend",
            "error",
          );
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // BLOCK USER
  // ==========================================================

  const blockUserById =
    useCallback(
      async (
        person,
      ) => {
        if (
          !user?.id ||
          !person?.id
        ) {
          return;
        }

        try {
          const result =
            await fs.blockUser(
              user.id,
              person.id,
            );

          setBlocked(
            (current) => {
              const alreadyBlocked =
                current.some(
                  (item) =>
                    (
                      item.id ||
                      item.userId ||
                      item.blockedUserId
                    ) === person.id,
                );

              if (
                alreadyBlocked
              ) {
                return current;
              }

              return [
                ...current,
                {
                  ...person,

                  id:
                    person.id,

                  blockId:
                    result.blockId,
                },
              ];
            },
          );

          setFriendsList(
            (current) =>
              current.filter(
                (friend) =>
                  (
                    friend.friendId ||
                    friend.id
                  ) !== person.id,
              ),
          );

          pushToast(
            "User blocked",
            "success",
          );

          return result;
        } catch (error) {
          console.error(
            "blockUserById error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to block user",
            "error",
          );
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // UNBLOCK USER
  // ==========================================================

  const unblockUserById =
    useCallback(
      async (
        person,
      ) => {
        const blockId =
          person?.blockId ||
          person?.id;

        if (!blockId) {
          return;
        }

        try {
          await fs.unblockUser(
            blockId,
          );

          setBlocked(
            (current) =>
              current.filter(
                (item) =>
                  (
                    item.blockId ||
                    item.id
                  ) !== blockId,
              ),
          );

          pushToast(
            "User unblocked",
            "success",
          );
        } catch (error) {
          console.error(
            "unblockUserById error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to unblock user",
            "error",
          );
        }
      },
      [pushToast],
    );

  // ==========================================================
  // WEATHER SHARING
  // ==========================================================

  const updateWeatherSharing =
    useCallback(
      async (
        enabled,
      ) => {
        if (!user?.id) {
          return;
        }

        try {
          const sharingEnabled =
            Boolean(enabled);

          await fs.updateWeatherSharing(
            user.id,
            sharingEnabled,
          );

          setUser(
            (currentUser) => {
              if (!currentUser) {
                return currentUser;
              }

              return {
                ...currentUser,

                weatherSharing:
                  sharingEnabled,
              };
            },
          );

          pushToast(
            sharingEnabled
              ? "Weather sharing enabled"
              : "Weather sharing disabled",
            "success",
          );
        } catch (error) {
          console.error(
            "updateWeatherSharing error:",
            error,
          );

          pushToast(
            error?.message ||
              "Failed to update weather sharing",
            "error",
          );
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // LOCATION SHARING
  // ==========================================================

  const updateLocationSharing =
    useCallback(
      async (
        mode,
      ) => {
        if (!user?.id) {
          return;
        }

        try {
          await fs.updateLocationSharing(
            user.id,
            mode,
          );

          setUser(
            (currentUser) => {
              if (!currentUser) {
                return currentUser;
              }

              return {
                ...currentUser,

                locationSharing:
                  mode,
              };
            },
          );

          pushToast(
            "Location sharing updated",
            "success",
          );
        } catch (error) {
          console.error(
            "updateLocationSharing error:",
            error,
          );
        }
      },
      [
        user?.id,
        pushToast,
      ],
    );

  // ==========================================================
  // DISASTER ALERT CREATION
  // ==========================================================

  const createDisasterAlert =
    useCallback(
      async (alert) => {
        try {
          const result =
            await fs.createDisasterAlert(
              alert,
            );

          console.log(
            "DISASTER ALERT CREATED:",
            result,
          );

          return result;
        } catch (error) {
          console.error(
            "createDisasterAlert error:",
            error,
          );

          throw error;
        }
      },
      [],
    );

  // ==========================================================
  // DISASTER NOTIFICATIONS
  // ==========================================================

  const markDisasterNotificationRead =
    useCallback(
      async (
        notificationId,
      ) => {
        if (
          !user?.id ||
          !notificationId
        ) {
          return;
        }

        try {
          await fs.markNotificationRead(
            user.id,
            notificationId,
          );

          setDisasterNotifications(
            (current) =>
              current.map(
                (notification) =>
                  notification.id ===
                  notificationId
                    ? {
                        ...notification,
                        read: true,
                      }
                    : notification,
              ),
          );
        } catch (error) {
          console.error(
            "Failed to mark notification as read:",
            error,
          );
        }
      },
      [user?.id],
    );

  const removeDisasterNotification =
    useCallback(
      async (
        notificationId,
      ) => {
        if (
          !user?.id ||
          !notificationId
        ) {
          return;
        }

        try {
          await fs.deleteNotification(
            user.id,
            notificationId,
          );

          setDisasterNotifications(
            (current) =>
              current.filter(
                (notification) =>
                  notification.id !==
                  notificationId,
              ),
          );
        } catch (error) {
          console.error(
            "Failed to delete notification:",
            error,
          );
        }
      },
      [user?.id],
    );

  const clearDisasterNotifications =
    useCallback(
      async () => {
        if (!user?.id) {
          return;
        }

        try {
          await fs.clearUserNotifications(
            user.id,
          );

          setDisasterNotifications(
            [],
          );
        } catch (error) {
          console.error(
            "Failed to clear notifications:",
            error,
          );
        }
      },
      [user?.id],
    );

  // ==========================================================
  // SEARCH USERS
  // ==========================================================

  const searchUsers =
    useCallback(
      async (
        term,
      ) => {
        if (!term?.trim()) {
          return [];
        }

        try {
          const results =
            await fs.searchUsers(
              term,
            );

          const friendIds =
            new Set(
              friendsList.map(
                (friend) =>
                  friend.friendId ||
                  friend.id,
              ),
            );

          const blockedIds =
            new Set(
              blocked.map(
                (person) =>
                  person.id ||
                  person.userId ||
                  person.blockedUserId,
              ),
            );

          const sentIds =
            new Set(
              sent.map(
                (request) =>
                  request.receiverId,
              ),
            );

          const receivedIds =
            new Set(
              received.map(
                (request) =>
                  request.senderId,
              ),
            );

          return results.filter(
            (person) => {
              const id =
                person.id;

              if (!id) {
                return false;
              }

              if (
                id === user?.id
              ) {
                return false;
              }

              if (
                friendIds.has(id)
              ) {
                return false;
              }

              if (
                blockedIds.has(id)
              ) {
                return false;
              }

              if (
                sentIds.has(id)
              ) {
                return false;
              }

              if (
                receivedIds.has(id)
              ) {
                return true;
              }

              return true;
            },
          );
        } catch (error) {
          console.error(
            "searchUsers error:",
            error,
          );

          return [];
        }
      },
      [
        user?.id,
        friendsList,
        blocked,
        sent,
        received,
      ],
    );

  // ==========================================================
  // DARK MODE
  // ==========================================================

  const toggleDarkMode =
    useCallback(() => {
      setDarkMode(
        (current) =>
          !current,
      );
    }, []);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    // User
    user,
    setUser,

    // Friends
    friendsList,
    refreshFriends,

    // Requests
    received,
    sent,

    // Blocked users
    blocked,

    // Toasts
    toasts,
    pushToast,
    dismissToast,

    // Location
    locating,
    detectLocation,

    // Existing weather alerts
    weatherAlerts,
    removeWeatherAlert,
    clearWeatherAlerts,

    // NEW disaster notifications
    disasterNotifications,
    createDisasterAlert,
    markDisasterNotificationRead,
    removeDisasterNotification,
    clearDisasterNotifications,

    // Dark mode
    darkMode,
    toggleDarkMode,

    // Friend requests
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,

    // Friends
    removeFriend,

    // Blocking
    blockUserById,
    unblockUserById,

    // Sharing
    updateWeatherSharing,
    updateLocationSharing,

    // Search
    searchUsers,
  };

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ================================================================
   OPEN-METEO FORECAST
================================================================ */

async function getForecast(latitude, longitude) {
    try {
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&timezone=auto` +
            `&forecast_days=7` +
            `&hourly=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `rain,` +
            `showers,` +
            `precipitation,` +
            `precipitation_probability,` +
            `weather_code,` +
            `cloud_cover,` +
            `wind_speed_10m,` +
            `wind_gusts_10m,` +
            `cape` +
            `&daily=` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `rain_sum,` +
            `precipitation_probability_max`;

        console.log(
            "🌦️ FORECAST REQUEST:",
            url
        );

        const response = await fetch(url);

        if (!response.ok) {
            let message =
                `Forecast API error: ${response.status}`;

            try {
                const errorData =
                    await response.json();

                if (errorData?.reason) {
                    message = errorData.reason;
                }
            } catch {
                // Ignore invalid error body
            }

            throw new Error(message);
        }

        const data = await response.json();

        console.log(
            "🌦️ FORECAST RAW DATA:",
            data
        );

        return data;
    } catch (error) {
        console.error(
            "❌ getForecast error:",
            error
        );

        throw error;
    }
}

/* ================================================================
   APP PROVIDER
================================================================ */

export function AppProvider({
    children,
    firebaseUser,
}) {
    /* ============================================================
       USER
    ============================================================ */

    const [user, setUser] = useState(null);

    /* ============================================================
       FRIENDS
    ============================================================ */

    const [friendsList, setFriendsList] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [blocked, setBlocked] = useState([]);

    /* ============================================================
       TOASTS
    ============================================================ */

    const [toasts, setToasts] = useState([]);

    /* ============================================================
       LOCATION
    ============================================================ */

    const [locating, setLocating] = useState(false);

    /* ============================================================
       UI
    ============================================================ */

    const [darkMode, setDarkMode] = useState(false);

    /* ============================================================
       WEATHER ALERTS
    ============================================================ */

    const [weatherAlerts, setWeatherAlerts] =
        useState(initialWeatherAlerts);

    /* ============================================================
       FORECAST
    ============================================================ */

    const [forecast, setForecast] = useState(null);

    /* ============================================================
       TOAST
    ============================================================ */

    const pushToast = useCallback(
        (message, type = "info") => {
            const id = ++toastId;

            setToasts((current) => [
                ...current,
                {
                    id,
                    message,
                    type,
                },
            ]);

            setTimeout(() => {
                setToasts((current) =>
                    current.filter(
                        (toast) =>
                            toast.id !== id
                    )
                );
            }, 4000);
        },
        []
    );

    const dismissToast = useCallback((id) => {
        setToasts((current) =>
            current.filter(
                (toast) => toast.id !== id
            )
        );
    }, []);

    /* ============================================================
       LOAD USER
    ============================================================ */

    useEffect(() => {
        if (!firebaseUser?.uid) {
            setUser(null);
            return;
        }

        const loadUser = async () => {
            try {
                const userData =
                    await fs.getUser(
                        firebaseUser.uid
                    );

                if (userData) {
                    setUser({
                        id: firebaseUser.uid,
                        ...userData,
                    });
                } else {
                    setUser({
                        id: firebaseUser.uid,
                        email:
                            firebaseUser.email || "",
                        name:
                            firebaseUser.displayName ||
                            "",
                    });
                }

                console.log(
                    "USER DATA LOADED:",
                    firebaseUser.uid
                );
            } catch (error) {
                console.error(
                    "Failed to load user:",
                    error
                );

                setUser({
                    id: firebaseUser.uid,
                    email:
                        firebaseUser.email || "",
                    name:
                        firebaseUser.displayName ||
                        "",
                });
            }
        };

        loadUser();
    }, [firebaseUser]);

    /* ============================================================
       REFRESH FRIENDS
    ============================================================ */

    const refreshFriends = useCallback(
        async () => {
            if (!user?.id) {
                return;
            }

            try {
                const [
                    friendsData,
                    receivedData,
                    sentData,
                    blockedData,
                ] = await Promise.all([
                    fs.getFriends(user.id),
                    fs.getReceivedRequests(
                        user.id
                    ),
                    fs.getSentRequests(user.id),
                    fs.getBlockedUsers(user.id),
                ]);

                setFriendsList(
                    friendsData || []
                );

                setReceived(
                    receivedData || []
                );

                setSent(
                    sentData || []
                );

                setBlocked(
                    blockedData || []
                );

                console.log(
                    "FRIENDS DATA REFRESHED:",
                    {
                        friends:
                            friendsData?.length ||
                            0,
                        received:
                            receivedData?.length ||
                            0,
                        sent:
                            sentData?.length ||
                            0,
                        blocked:
                            blockedData?.length ||
                            0,
                    }
                );
            } catch (error) {
                console.error(
                    "refreshFriends error:",
                    error
                );
            }
        },
        [user?.id]
    );

    /* ============================================================
       LOAD FRIEND DATA AFTER USER LOAD
    ============================================================ */

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        refreshFriends();
    }, [
        user?.id,
        refreshFriends,
    ]);

    /* ============================================================
       LOCATION + WEATHER + FORECAST
    ============================================================ */

    const detectLocation = useCallback(
        async () => {
            if (!user?.id) {
                return;
            }

            setLocating(true);

            try {
                /* =================================================
                   1. GPS
                ================================================= */

                const position =
                    await getCurrentPosition();

                const {
                    latitude,
                    longitude,
                } = position;

                console.log(
                    "📍 GPS LOCATION:",
                    latitude,
                    longitude
                );

                /* =================================================
                   2. PLACE NAME
                ================================================= */

                const place =
                    await getPlaceName(
                        latitude,
                        longitude
                    );

                console.log(
                    "📍 PLACE:",
                    place
                );

                const finalLocationName =
                    place?.placeName || "";

                const finalCountry =
                    place?.country || "";

                /* =================================================
                   3. FORECAST
                ================================================= */

                let formattedForecast =
                    null;

                try {
                    const forecastData =
                        await getForecast(
                            latitude,
                            longitude
                        );

                    /* =============================================
                       DAILY FORECAST
                    ============================================= */

                    const daily =
                        forecastData?.daily?.time?.map(
                            (date, index) => ({
                                date,

                                minTemp:
                                    forecastData
                                        .daily
                                        .temperature_2m_min?.[
                                        index
                                    ] ?? null,

                                maxTemp:
                                    forecastData
                                        .daily
                                        .temperature_2m_max?.[
                                        index
                                    ] ?? null,

                                rain:
                                    forecastData
                                        .daily
                                        .rain_sum?.[
                                        index
                                    ] ?? 0,

                                rainProbability:
                                    forecastData
                                        .daily
                                        .precipitation_probability_max?.[
                                        index
                                    ] ?? 0,
                            })
                        ) || [];

                    /* =============================================
                       HOURLY FORECAST
                    ============================================= */

                    const hourly =
                        forecastData?.hourly?.time?.map(
                            (time, index) => {
                                const weatherCode =
                                    forecastData
                                        .hourly
                                        .weather_code?.[
                                        index
                                    ] ?? 0;

                                const rain =
                                    forecastData
                                        .hourly
                                        .rain?.[
                                        index
                                    ] ?? 0;

                                const showers =
                                    forecastData
                                        .hourly
                                        .showers?.[
                                        index
                                    ] ?? 0;

                                const precipitation =
                                    forecastData
                                        .hourly
                                        .precipitation?.[
                                        index
                                    ] ?? 0;

                                const precipitationProbability =
                                    forecastData
                                        .hourly
                                        .precipitation_probability?.[
                                        index
                                    ] ?? 0;

                                const cape =
                                    forecastData
                                        .hourly
                                        .cape?.[
                                        index
                                    ] ?? 0;

                                const windGust =
                                    forecastData
                                        .hourly
                                        .wind_gusts_10m?.[
                                        index
                                    ] ?? 0;

                                /* =================================
                                   SEVERE WEATHER CLASSIFIER
                                ================================= */

                                const severeWeather =
                                    classifySevereWeather(
                                        {
                                            weatherCode,
                                            rain,
                                            showers,
                                            precipitation,
                                            precipitationProbability,
                                            cape,
                                            windGust,
                                        }
                                    );

                                return {
                                    time,

                                    temperature:
                                        forecastData
                                            .hourly
                                            .temperature_2m?.[
                                            index
                                        ] ?? null,

                                    humidity:
                                        forecastData
                                            .hourly
                                            .relative_humidity_2m?.[
                                            index
                                        ] ?? null,

                                    rain,

                                    showers,

                                    precipitation,

                                    rainProbability:
                                        precipitationProbability,

                                    weatherCode,

                                    cloudCover:
                                        forecastData
                                            .hourly
                                            .cloud_cover?.[
                                            index
                                        ] ?? 0,

                                    windSpeed:
                                        forecastData
                                            .hourly
                                            .wind_speed_10m?.[
                                            index
                                        ] ?? 0,

                                    windGust,

                                    cape,

                                    severeWeather,
                                };
                            }
                        ) || [];

                    /* =============================================
                       DEBUG — FIRST HOURLY DATA
                    ============================================= */

                   console.log("🌦️ FIRST HOURLY OBJECT:");
console.log(hourly[0]);

console.log("⛈️ THUNDERSTORM HOURS:");

console.table(
    hourly
        .filter(
            (h) =>
                h.weatherCode === 95 ||
                h.weatherCode === 96 ||
                h.weatherCode === 99
        )
        .map((h) => ({
            time: h.time,
            weatherCode: h.weatherCode,
            temperature: h.temperature,
            rain: h.rain,
            precipitation: h.precipitation,
            probability: h.rainProbability,
            cape: h.cape,
            windGust: h.windGust,
            severeType: h.severeWeather?.type,
            severity: h.severeWeather?.level,
        }))
);

                    /* =============================================
                       DEBUG — THUNDERSTORM HOURS
                    ============================================= */

                    console.log(
                        "⛈️ THUNDERSTORM HOURS:",
                        hourly.filter(
                            (hour) =>
                                hour.weatherCode ===
                                    95 ||
                                hour.weatherCode ===
                                    96 ||
                                hour.weatherCode ===
                                    99
                        )
                    );

                    /* =============================================
                       DEBUG — SEVERE WEATHER
                    ============================================= */

                    console.log(
                        "🌩️ SEVERE WEATHER:",
                        hourly
                            .filter(
                                (hour) =>
                                    hour.severeWeather
                                        ?.level !==
                                    "normal"
                            )
                            .map((hour) => ({
                                time:
                                    hour.time,

                                weatherCode:
                                    hour.weatherCode,

                                rain:
                                    hour.rain,

                                showers:
                                    hour.showers,

                                precipitation:
                                    hour.precipitation,

                                probability:
                                    hour.rainProbability,

                                cape:
                                    hour.cape,

                                windGust:
                                    hour.windGust,

                                severeWeather:
                                    hour.severeWeather,
                            }))
                    );

                    /* =============================================
                       FORMATTED FORECAST
                    ============================================= */

                    formattedForecast = {
                        location:
                            finalLocationName,

                        country:
                            finalCountry,

                        latitude,

                        longitude,

                        timezone:
                            forecastData?.timezone ||
                            "Asia/Kolkata",

                        current: {
                            temperature:
                                null,

                            feelsLike:
                                null,

                            humidity:
                                null,

                            condition:
                                "",
                        },

                        daily,

                        hourly,
                    };

                    setForecast(
                        formattedForecast
                    );

                    console.log(
                        "🌦️ FORMATTED FORECAST:",
                        formattedForecast
                    );
                } catch (
                    forecastError
                ) {
                    console.error(
                        "❌ Forecast fetch failed:",
                        forecastError
                    );

                    setForecast(null);
                }

                /* =================================================
                   4. CURRENT WEATHER
                ================================================= */

                let weather = null;

                try {
                    weather =
                        await getCurrentWeather(
                            latitude,
                            longitude
                        );

                    console.log(
                        "🌡️ CURRENT WEATHER:",
                        weather
                    );
                } catch (
                    weatherError
                ) {
                    console.error(
                        "❌ Current weather failed:",
                        weatherError
                    );

                    pushToast(
                        "Forecast loaded, but current weather is unavailable.",
                        "error"
                    );
                }

                /* =================================================
                   5. USE WEATHER LOCATION IF AVAILABLE
                ================================================= */

                const weatherLocation =
                    weather?.locationName ||
                    finalLocationName;

                const weatherCountry =
                    weather?.country ||
                    finalCountry;

                /* =================================================
                   6. UPDATE FORECAST CURRENT DATA
                ================================================= */

                if (formattedForecast) {
                    formattedForecast = {
                        ...formattedForecast,

                        location:
                            weatherLocation,

                        country:
                            weatherCountry,

                        current: {
                            temperature:
                                weather?.temp ??
                                weather?.temperature ??
                                null,

                            feelsLike:
                                weather?.feelsLike ??
                                null,

                            humidity:
                                weather?.humidity ??
                                null,

                            condition:
                                weather?.condition ??
                                "",
                        },
                    };

                    setForecast(
                        formattedForecast
                    );
                }

                /* =================================================
                   7. UPDATE FIREBASE LOCATION
                ================================================= */

                await fs.updateUserLocation(
                    user.id,
                    latitude,
                    longitude,
                    weatherLocation,
                    weatherCountry
                );

                /* =================================================
                   8. SAVE CURRENT WEATHER
                ================================================= */

                const weatherToSave = {
                    temperature:
                        weather?.temperature ??
                        weather?.temp ??
                        null,

                    condition:
                        weather?.condition ??
                        "",

                    feelsLike:
                        weather?.feelsLike ??
                        null,

                    humidity:
                        weather?.humidity ??
                        null,

                    wind:
                        weather?.wind ??
                        null,

                    rain:
                        weather?.rain ??
                        0,

                    icon:
                        weather?.icon ??
                        "",

                    locationName:
                        weatherLocation,

                    country:
                        weatherCountry,
                };

                if (weather) {
                    await fs.updateUserWeather(
                        user.id,
                        weatherToSave
                    );
                }

                /* =================================================
                   9. LOCATION TEXT
                ================================================= */

                const locationText =
                    weatherLocation
                        ? `${weatherLocation}${
                              weatherCountry
                                  ? `, ${weatherCountry}`
                                  : ""
                          }`
                        : "";

                /* =================================================
                   10. UPDATE LOCAL USER
                ================================================= */

                setUser(
                    (currentUser) => {
                        if (!currentUser) {
                            return currentUser;
                        }

                        return {
                            ...currentUser,

                            latitude,

                            longitude,

                            location: {
                                ...(currentUser.location ||
                                    {}),

                                city:
                                    weatherLocation,

                                name:
                                    weatherLocation,

                                lat:
                                    latitude,

                                lng:
                                    longitude,

                                country:
                                    weatherCountry,
                            },

                            locationText,

                            ...(weather
                                ? {
                                      weather:
                                          weatherToSave,
                                  }
                                : {}),

                            forecast:
                                formattedForecast,
                        };
                    }
                );

                /* =================================================
                   11. REFRESH FRIENDS
                ================================================= */

                await refreshFriends();

                /* =================================================
                   12. SUCCESS
                ================================================= */

                pushToast(
                    `Location updated: ${
                        locationText ||
                        "Current location"
                    }`,
                    "success"
                );
            } catch (error) {
                console.error(
                    "❌ Location/weather error:",
                    error
                );

                let message =
                    "Unable to get your location.";

                if (error?.code === 1) {
                    message =
                        "Location permission was denied.";
                } else if (
                    error?.code === 2
                ) {
                    message =
                        "Your location could not be determined.";
                } else if (
                    error?.code === 3
                ) {
                    message =
                        "Location request timed out.";
                } else if (
                    error?.message
                ) {
                    message =
                        error.message;
                }

                pushToast(
                    message,
                    "error"
                );
            } finally {
                setLocating(false);
            }
        },
        [
            user?.id,
            pushToast,
            refreshFriends,
        ]
    );

    /* ================================================================
       AUTOMATIC LOCATION DETECTION
    ================================================================ */

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        detectLocation();
    }, [
        user?.id,
        detectLocation,
    ]);

    /* ================================================================
       WEATHER ALERTS
    ================================================================ */

    const removeWeatherAlert =
        useCallback((alertId) => {
            setWeatherAlerts(
                (current) =>
                    current.filter(
                        (alert) =>
                            alert.id !==
                            alertId
                    )
            );
        }, []);

    const clearWeatherAlerts =
        useCallback(() => {
            setWeatherAlerts([]);
        }, []);

    /* ================================================================
       DARK MODE
    ================================================================ */

    const toggleDarkMode =
        useCallback(() => {
            setDarkMode(
                (current) => !current
            );
        }, []);

    /* ================================================================
       SEND FRIEND REQUEST
    ================================================================ */

    const sendRequest =
        useCallback(
            async (targetUserId) => {
                if (
                    !user?.id ||
                    !targetUserId
                ) {
                    return;
                }

                try {
                    await fs.sendFriendRequest(
                        user.id,
                        targetUserId
                    );

                    await refreshFriends();

                    pushToast(
                        "Friend request sent.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "sendRequest error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to send friend request.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       CANCEL FRIEND REQUEST
    ================================================================ */

    const cancelRequest =
        useCallback(
            async (requestOrId) => {
                const requestId =
                    typeof requestOrId ===
                    "object"
                        ? requestOrId?.requestId
                        : requestOrId;

                if (!requestId) {
                    return;
                }

                try {
                    await fs.cancelFriendRequest(
                        requestId
                    );

                    await refreshFriends();

                    pushToast(
                        "Friend request cancelled.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "cancelRequest error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to cancel friend request.",
                        "error"
                    );
                }
            },
            [
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       ACCEPT FRIEND REQUEST
    ================================================================ */

    const acceptRequest =
        useCallback(
            async (
                requestOrId,
                requesterId
            ) => {
                let requestId =
                    requestOrId;

                let senderId =
                    requesterId;

                if (
                    typeof requestOrId ===
                    "object"
                ) {
                    requestId =
                        requestOrId?.requestId;

                    senderId =
                        requestOrId?.senderId;
                }

                if (
                    !requestId ||
                    !senderId ||
                    !user?.id
                ) {
                    pushToast(
                        "Invalid friend request data.",
                        "error"
                    );

                    return;
                }

                try {
                    await fs.acceptFriendRequest(
                        requestId,
                        user.id,
                        senderId
                    );

                    await refreshFriends();

                    pushToast(
                        "Friend request accepted.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "acceptRequest error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to accept friend request.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       REJECT FRIEND REQUEST
    ================================================================ */

    const rejectRequest =
        useCallback(
            async (requestOrId) => {
                const requestId =
                    typeof requestOrId ===
                    "object"
                        ? requestOrId?.requestId
                        : requestOrId;

                if (!requestId) {
                    return;
                }

                try {
                    await fs.rejectFriendRequest(
                        requestId
                    );

                    await refreshFriends();

                    pushToast(
                        "Friend request rejected.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "rejectRequest error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to reject friend request.",
                        "error"
                    );
                }
            },
            [
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       REMOVE FRIEND
    ================================================================ */

    const removeFriend =
        useCallback(
            async (friendId) => {
                if (
                    !user?.id ||
                    !friendId
                ) {
                    return;
                }

                try {
                    await fs.removeFriend(
                        user.id,
                        friendId
                    );

                    await refreshFriends();

                    pushToast(
                        "Friend removed.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "removeFriend error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to remove friend.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       BLOCK USER
    ================================================================ */

    const blockUserById =
        useCallback(
            async (targetUserId) => {
                if (
                    !user?.id ||
                    !targetUserId
                ) {
                    return;
                }

                try {
                    await fs.blockUser(
                        user.id,
                        targetUserId
                    );

                    await refreshFriends();

                    pushToast(
                        "User blocked.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "blockUserById error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to block user.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       UNBLOCK USER
    ================================================================ */

    const unblockUserById =
        useCallback(
            async (
                blockIdOrUserId
            ) => {
                if (
                    !blockIdOrUserId ||
                    !user?.id
                ) {
                    return;
                }

                try {
                    let blockId =
                        blockIdOrUserId;

                    const blockedUser =
                        blocked.find(
                            (item) =>
                                item.id ===
                                blockIdOrUserId
                        );

                    if (
                        blockedUser?.blockId
                    ) {
                        blockId =
                            blockedUser.blockId;
                    }

                    await fs.unblockUser(
                        blockId
                    );

                    await refreshFriends();

                    pushToast(
                        "User unblocked.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "unblockUserById error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to unblock user.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                blocked,
                refreshFriends,
                pushToast,
            ]
        );

    /* ================================================================
       WEATHER SHARING
    ================================================================ */

    const updateWeatherSharing =
        useCallback(
            async (enabled) => {
                if (!user?.id) {
                    return;
                }

                try {
                    await fs.updateWeatherSharing(
                        user.id,
                        enabled
                    );

                    setUser(
                        (currentUser) => {
                            if (
                                !currentUser
                            ) {
                                return currentUser;
                            }

                            return {
                                ...currentUser,

                                weatherSharing:
                                    Boolean(
                                        enabled
                                    ),
                            };
                        }
                    );

                    pushToast(
                        `Weather sharing ${
                            enabled
                                ? "enabled"
                                : "disabled"
                        }.`,
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "updateWeatherSharing error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to update weather sharing.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                pushToast,
            ]
        );

    /* ================================================================
       LOCATION SHARING
    ================================================================ */

    const updateLocationSharing =
        useCallback(
            async (mode) => {
                if (!user?.id) {
                    return;
                }

                try {
                    await fs.updateLocationSharing(
                        user.id,
                        mode
                    );

                    setUser(
                        (currentUser) => {
                            if (
                                !currentUser
                            ) {
                                return currentUser;
                            }

                            return {
                                ...currentUser,

                                locationSharing:
                                    mode,
                            };
                        }
                    );

                    pushToast(
                        "Location sharing updated.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "updateLocationSharing error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to update location sharing.",
                        "error"
                    );
                }
            },
            [
                user?.id,
                pushToast,
            ]
        );

    /* ================================================================
       SEARCH USERS
    ================================================================ */

    const searchUsers =
        useCallback(
            async (queryText) => {
                if (
                    !queryText?.trim()
                ) {
                    return [];
                }

                try {
                    return (
                        (await fs.searchUsers(
                            queryText
                        )) || []
                    );
                } catch (error) {
                    console.error(
                        "searchUsers error:",
                        error
                    );

                    pushToast(
                        error?.message ||
                            "Unable to search users.",
                        "error"
                    );

                    return [];
                }
            },
            [pushToast]
        );

    /* ================================================================
       CONTEXT VALUE
    ================================================================ */

    const value = {
        /* User */
        user,
        setUser,

        /* Friends */
        friendsList,
        refreshFriends,
        received,
        sent,
        blocked,

        /* Toast */
        toasts,
        pushToast,
        dismissToast,

        /* Location */
        locating,
        detectLocation,

        /* Weather alerts */
        weatherAlerts,
        removeWeatherAlert,
        clearWeatherAlerts,

        /* Forecast */
        forecast,

        /* UI */
        darkMode,
        toggleDarkMode,

        /* Friend actions */
        sendRequest,
        cancelRequest,
        acceptRequest,
        rejectRequest,
        removeFriend,

        /* Block actions */
        blockUserById,
        unblockUserById,

        /* Privacy */
        updateWeatherSharing,
        updateLocationSharing,

        /* Search */
        searchUsers,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

/* ================================================================
   USE APP
================================================================ */

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider",
    );
  }

    return context;
}

export default AppContext;

