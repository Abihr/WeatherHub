import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  blockedUsers as initialBlocked,
  weatherAlerts,
} from "../data/mockData";

import * as fs from "../firebase/firestore";
import { getCurrentWeather } from "../services/weatherService";
import { getCurrentPosition } from "../services/locationService";

const AppContext = createContext(null);

let toastId = 0;

// ============================================================
// REVERSE GEOCODING
// ============================================================

async function getPlaceName(latitude, longitude) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${latitude}` +
      `&lon=${longitude}` +
      `&zoom=10` +
      `&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get location name");
    }

    const data = await response.json();

    const address = data?.address || {};

    const placeName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.county ||
      "";

    const country = address.country_code
      ? address.country_code.toUpperCase()
      : "";

    return {
      placeName,
      country,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return {
      placeName: "",
      country: "",
    };
  }
}

// ============================================================
// PROVIDER
// ============================================================

export function AppProvider({ children, firebaseUser }) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] = useState(null);

  const [friendsList, setFriendsList] = useState([]);

  const [received, setReceived] = useState([]);

  const [sent, setSent] = useState([]);

  const [blocked, setBlocked] = useState(initialBlocked);

  const [toasts, setToasts] = useState([]);

  const [locating, setLocating] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  // ==========================================================
  // TOASTS
  // ==========================================================

  const pushToast = useCallback(
    (message, tone = "success") => {
      const id = ++toastId;

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          tone,
        },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
      }, 3200);
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

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
        return;
      }

      try {
        const firebaseProfile = await fs.getUser(
          firebaseUser.uid
        );

        if (cancelled) return;

        const mergedUser = {
          ...(firebaseProfile || {}),

          id: firebaseUser.uid,

          uid: firebaseUser.uid,

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

        setUser(mergedUser);
      } catch (error) {
        console.error("Failed to load user:", error);

        if (cancelled) return;

        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        });
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  // ==========================================================
  // REFRESH FRIENDS - MANUAL FALLBACK
  // ==========================================================

  const refreshFriends = useCallback(async () => {
    if (!user?.id) {
      setFriendsList([]);
      return [];
    }

    try {
      const friends = await fs.getFriends(user.id);

      const uniqueFriends = Array.from(
        new Map(
          friends.map((friend) => [
            friend.friendId || friend.id,
            friend,
          ])
        ).values()
      );

      setFriendsList(uniqueFriends);

      return uniqueFriends;
    } catch (error) {
      console.error("refreshFriends error:", error);

      pushToast(
        "Failed to refresh friends",
        "error"
      );

      return [];
    }
  }, [user?.id, pushToast]);

  // ==========================================================
  // REAL-TIME FRIEND LISTENER
  //
  // This is the IMPORTANT part.
  //
  // It listens to:
  //
  // users/currentUser/friends
  //
  // and then listens to:
  //
  // users/friendUID
  //
  // Therefore when a friend updates their:
  //
  // - weather
  // - location
  // - weatherSharing
  // - locationSharing
  // - profile
  //
  // the friendsList updates automatically.
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setFriendsList([]);
      return;
    }

    console.log(
      "Starting real-time friend listener:",
      user.id
    );

    const unsubscribe = fs.subscribeToFriends(
      user.id,
      (friends) => {
        // console.log(
        //   "REAL-TIME FRIEND UPDATE:",
        //   friends
        // );

        // Remove duplicates
        const uniqueFriends = Array.from(
          new Map(
            friends.map((friend) => [
              friend.friendId || friend.id,
              friend,
            ])
          ).values()
        );

        setFriendsList(uniqueFriends);
      }
    );

    return () => {
      console.log(
        "Stopping real-time friend listener"
      );

      unsubscribe();
    };
  }, [user?.id]);

  // ==========================================================
  // DETECT LOCATION + WEATHER
  // ==========================================================

  const detectLocation = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLocating(true);

    try {
      // ------------------------------------------------------
      // GET GPS LOCATION
      // ------------------------------------------------------

      const position = await getCurrentPosition();

      const {
        latitude,
        longitude,
      } = position;

      console.log(
        "GPS LOCATION:",
        latitude,
        longitude
      );

      // ------------------------------------------------------
      // GET PLACE NAME
      // ------------------------------------------------------

      const place = await getPlaceName(
        latitude,
        longitude
      );

      console.log(
        "PLACE:",
        place
      );

      // ------------------------------------------------------
      // GET WEATHER
      // ------------------------------------------------------

      const weather = await getCurrentWeather(
        latitude,
        longitude
      );

      console.log(
        "CURRENT WEATHER:",
        weather
      );

      // ------------------------------------------------------
      // FINAL LOCATION NAME
      // ------------------------------------------------------

      const finalLocationName =
        weather?.locationName ||
        place?.placeName ||
        "";

      const finalCountry =
        weather?.country ||
        place?.country ||
        "";

      // ------------------------------------------------------
      // SAVE LOCATION TO FIREBASE
      // ------------------------------------------------------

      await fs.updateUserLocation(
        user.id,
        latitude,
        longitude,
        finalLocationName,
        finalCountry
      );

      // ------------------------------------------------------
      // NORMALIZE WEATHER
      // ------------------------------------------------------

      const weatherToSave = {
        temperature:
          weather?.temperature ??
          weather?.temp ??
          null,

        condition:
          weather?.condition ?? "",

        feelsLike:
          weather?.feelsLike ?? null,

        humidity:
          weather?.humidity ?? null,

        wind:
          weather?.wind ?? null,

        rain:
          weather?.rain ?? 0,

        icon:
          weather?.icon ?? "",

        locationName:
          finalLocationName,

        country:
          finalCountry,
      };

      // ------------------------------------------------------
      // SAVE WEATHER TO FIREBASE
      // ------------------------------------------------------

      await fs.updateUserWeather(
        user.id,
        weatherToSave
      );

      // ------------------------------------------------------
      // LOCATION TEXT
      // ------------------------------------------------------

      const locationText = finalLocationName
        ? `${finalLocationName}${
            finalCountry
              ? `, ${finalCountry}`
              : ""
          }`
        : "";

      // ------------------------------------------------------
      // UPDATE CURRENT USER LOCALLY
      // ------------------------------------------------------

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,

          latitude,

          longitude,

          location: {
            ...(currentUser.location || {}),

            city: finalLocationName,

            name: finalLocationName,

            lat: latitude,

            lng: longitude,

            country: finalCountry,
          },

          locationText,

          weather: weatherToSave,
        };
      });

      // ------------------------------------------------------
      // OPTIONAL MANUAL REFRESH
      // Real-time listener will also update automatically.
      // ------------------------------------------------------

      await refreshFriends();

      pushToast(
        `Location updated: ${locationText || "Current location"}`,
        "success"
      );
    } catch (error) {
      console.error(
        "Location/weather error:",
        error
      );

      let message =
        "Unable to get your location or weather.";

      if (error?.code === 1) {
        message =
          "Location permission was denied.";
      } else if (error?.code === 2) {
        message =
          "Your location could not be determined.";
      } else if (error?.code === 3) {
        message =
          "Location request timed out.";
      } else if (error?.message) {
        message = error.message;
      }

      pushToast(message, "error");
    } finally {
      setLocating(false);
    }
  }, [
    user?.id,
    pushToast,
    refreshFriends,
  ]);

  // ==========================================================
  // AUTOMATIC LOCATION DETECTION
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    detectLocation();
  }, [user?.id]);

  // ==========================================================
  // LOAD REQUESTS
  //
  // Friend weather itself is handled by onSnapshot above.
  // Requests can continue using normal Firestore reads.
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
          friends,
          receivedRequests,
          sentRequests,
        ] = await Promise.all([
          fs.getFriends(user.id),
          fs.getReceivedRequests(user.id),
          fs.getSentRequests(user.id),
        ]);

        if (cancelled) {
          return;
        }

        const uniqueFriends = Array.from(
          new Map(
            friends.map((friend) => [
              friend.friendId || friend.id,
              friend,
            ])
          ).values()
        );

        // Don't need to set friends here permanently
        // because subscribeToFriends controls friendsList.
        //
        // But this gives us an initial fallback while the
        // real-time listener starts.

        setFriendsList(uniqueFriends);

        setReceived(receivedRequests);

        setSent(sentRequests);
      } catch (error) {
        console.error(
          "Failed to load Firebase data:",
          error
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

  const sendRequest = useCallback(
    async (person) => {
      if (!user?.id || !person?.id) {
        return;
      }

      try {
        const result =
          await fs.sendFriendRequest(
            user.id,
            person.id
          );

        setSent((current) => [
          ...current,
          {
            requestId: result.requestId,
            senderId: user.id,
            receiverId: person.id,
            status: "pending",

            name:
              person.name || "User",

            username:
              person.username || "",

            email:
              person.email || "",

            photoURL:
              person.photoURL || "",

            location:
              person.location || null,

            locationText:
              person.locationText || "",

            latitude:
              person.latitude ?? null,

            longitude:
              person.longitude ?? null,

            weather:
              person.weather || null,

            weatherSharing:
              person.weatherSharing ?? false,

            locationSharing:
              person.locationSharing ?? "off",
          },
        ]);

        pushToast(
          "Friend request sent",
          "success"
        );

        return result;
      } catch (error) {
        console.error(
          "sendRequest error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to send friend request",
          "error"
        );

        throw error;
      }
    },
    [user?.id, pushToast]
  );

  // ==========================================================
  // CANCEL FRIEND REQUEST
  // ==========================================================

  const cancelRequest = useCallback(
    async (requestId) => {
      if (!requestId) {
        return;
      }

      try {
        await fs.cancelFriendRequest(
          requestId
        );

        setSent((current) =>
          current.filter(
            (request) =>
              request.requestId !== requestId
          )
        );

        pushToast(
          "Friend request cancelled",
          "success"
        );
      } catch (error) {
        console.error(
          "cancelRequest error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to cancel request",
          "error"
        );
      }
    },
    [pushToast]
  );

  // ==========================================================
  // ACCEPT FRIEND REQUEST
  // ==========================================================

  const acceptRequest = useCallback(
    async (request) => {
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
            request.senderId
          );

        const friend =
          result?.friend || {
            id: request.senderId,

            friendId:
              request.senderId,

            name:
              request.name || "User",

            username:
              request.username || "",

            email:
              request.email || "",

            photoURL:
              request.photoURL || "",

            location:
              request.location || null,

            locationText:
              request.locationText || "",

            latitude:
              request.latitude ?? null,

            longitude:
              request.longitude ?? null,

            weather:
              request.weather || null,

            weatherSharing:
              request.weatherSharing ?? false,

            locationSharing:
              request.locationSharing ??
              "off",
          };

        setFriendsList((current) => {
          const exists = current.some(
            (item) =>
              (item.friendId || item.id) ===
              (friend.friendId || friend.id)
          );

          if (exists) {
            return current;
          }

          return [...current, friend];
        });

        setReceived((current) =>
          current.filter(
            (item) =>
              item.requestId !==
              request.requestId
          )
        );

        // Refresh once.
        // Real-time listener will then take over.
        await refreshFriends();

        pushToast(
          "Friend request accepted",
          "success"
        );

        return friend;
      } catch (error) {
        console.error(
          "acceptRequest error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to accept friend request",
          "error"
        );

        throw error;
      }
    },
    [
      user?.id,
      pushToast,
      refreshFriends,
    ]
  );

  // ==========================================================
  // REJECT FRIEND REQUEST
  // ==========================================================

  const rejectRequest = useCallback(
    async (requestId) => {
      if (!requestId) {
        return;
      }

      try {
        await fs.rejectFriendRequest(
          requestId
        );

        setReceived((current) =>
          current.filter(
            (request) =>
              request.requestId !== requestId
          )
        );

        pushToast(
          "Friend request rejected",
          "success"
        );
      } catch (error) {
        console.error(
          "rejectRequest error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to reject request",
          "error"
        );
      }
    },
    [pushToast]
  );

  // ==========================================================
  // REMOVE FRIEND
  // ==========================================================

  const removeFriend = useCallback(
    async (friendId) => {
      if (!user?.id || !friendId) {
        return;
      }

      try {
        await fs.removeFriend(
          user.id,
          friendId
        );

        setFriendsList((current) =>
          current.filter(
            (friend) =>
              (friend.friendId || friend.id) !==
              friendId
          )
        );

        pushToast(
          "Friend removed",
          "success"
        );
      } catch (error) {
        console.error(
          "removeFriend error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to remove friend",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  // ==========================================================
  // BLOCK USER
  // ==========================================================

  const blockUserById = useCallback(
    async (person) => {
      if (!user?.id || !person?.id) {
        return;
      }

      try {
        const result =
          await fs.blockUser(
            user.id,
            person.id
          );

        setBlocked((current) => [
          ...current,
          {
            ...person,
            id: person.id,
            blockId: result.blockId,
          },
        ]);

        // Remove from friends if necessary
        setFriendsList((current) =>
          current.filter(
            (friend) =>
              (friend.friendId || friend.id) !==
              person.id
          )
        );

        pushToast(
          "User blocked",
          "success"
        );

        return result;
      } catch (error) {
        console.error(
          "blockUserById error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to block user",
          "error"
        );
      }
    },
    [user?.id, pushToast]
  );

  // ==========================================================
  // UNBLOCK USER
  // ==========================================================

  const unblockUserById = useCallback(
    async (person) => {
      const blockId =
        person?.blockId ||
        person?.id;

      if (!blockId) {
        return;
      }

      try {
        await fs.unblockUser(
          blockId
        );

        setBlocked((current) =>
          current.filter(
            (item) =>
              (item.blockId || item.id) !==
              blockId
          )
        );

        pushToast(
          "User unblocked",
          "success"
        );
      } catch (error) {
        console.error(
          "unblockUserById error:",
          error
        );

        pushToast(
          error?.message ||
            "Failed to unblock user",
          "error"
        );
      }
    },
    [pushToast]
  );

  // ==========================================================
  // WEATHER SHARING
  // ==========================================================

  const updateWeatherSharing =
    useCallback(
      async (enabled) => {
        if (!user?.id) {
          return;
        }

        try {
          const sharingEnabled =
            Boolean(enabled);

          await fs.updateWeatherSharing(
            user.id,
            sharingEnabled
          );

          setUser((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              weatherSharing:
                sharingEnabled,
            };
          });

          pushToast(
            sharingEnabled
              ? "Weather sharing enabled"
              : "Weather sharing disabled",
            "success"
          );
        } catch (error) {
          console.error(
            "updateWeatherSharing error:",
            error
          );

          pushToast(
            error?.message ||
              "Failed to update weather sharing",
            "error"
          );
        }
      },
      [user?.id, pushToast]
    );

  // ==========================================================
  // LOCATION SHARING
  // ==========================================================

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

          setUser((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              locationSharing: mode,
            };
          });

          pushToast(
            "Location sharing updated",
            "success"
          );
        } catch (error) {
          console.error(
            "updateLocationSharing error:",
            error
          );

          pushToast(
            error?.message ||
              "Failed to update location sharing",
            "error"
          );
        }
      },
      [user?.id, pushToast]
    );

  // ==========================================================
  // SEARCH USERS
  // ==========================================================

  const searchUsers = useCallback(
    async (term) => {
      if (!term?.trim()) {
        return [];
      }

      try {
        const results =
          await fs.searchUsers(term);

        const friendIds = new Set(
          friendsList.map(
            (friend) =>
              friend.friendId || friend.id
          )
        );

        const blockedIds = new Set(
          blocked.map(
            (person) =>
              person.id ||
              person.userId ||
              person.blockedUserId
          )
        );

        const sentIds = new Set(
          sent.map(
            (request) =>
              request.receiverId
          )
        );

        const receivedIds = new Set(
          received.map(
            (request) =>
              request.senderId
          )
        );

        return results.filter(
          (person) => {
            const id = person.id;

            if (!id) {
              return false;
            }

            if (id === user?.id) {
              return false;
            }

            if (friendIds.has(id)) {
              return false;
            }

            if (blockedIds.has(id)) {
              return false;
            }

            if (sentIds.has(id)) {
              return false;
            }

            if (receivedIds.has(id)) {
              return true;
            }

            return true;
          }
        );
      } catch (error) {
        console.error(
          "searchUsers error:",
          error
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
    ]
  );

  // ==========================================================
  // DARK MODE
  // ==========================================================

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current);
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

    // Weather alerts
    weatherAlerts,

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
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
}

export default AppContext;