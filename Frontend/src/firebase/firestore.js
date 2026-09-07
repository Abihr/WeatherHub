import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot, // ADD THIS
} from "firebase/firestore";

import { db } from "./firebase";

/* =========================================================
   USERS
========================================================= */

export async function getUser(userId) {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.warn("User document not found:", userId);
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("getUser error:", error);
    return null;
  }
}

/* =========================================================
   SEARCH USERS
========================================================= */

export async function searchUsers(queryText) {
  const text = queryText?.trim().toLowerCase();

  if (!text) {
    return [];
  }

  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return users.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const username = String(
        user.username || ""
      ).toLowerCase();
      const email = String(
        user.email || ""
      ).toLowerCase();

      return (
        name.includes(text) ||
        username.includes(text) ||
        email.includes(text)
      );
    });
  } catch (error) {
    console.error("searchUsers error:", error);
    return [];
  }
}

/* =========================================================
   FRIEND REQUESTS
========================================================= */

export async function sendFriendRequest(
  senderId,
  receiverId
) {
  if (!senderId || !receiverId) {
    throw new Error(
      "Sender and receiver are required"
    );
  }

  if (senderId === receiverId) {
    throw new Error(
      "You cannot send a friend request to yourself"
    );
  }

  const requestsRef = collection(
    db,
    "friendRequests"
  );

  const existingQuery = query(
    requestsRef,
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );

  const existingSnapshot =
    await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error(
      "Friend request already sent"
    );
  }

  const requestRef = await addDoc(
    requestsRef,
    {
      senderId,
      receiverId,
      status: "pending",
      createdAt: serverTimestamp(),
    }
  );

  return {
    requestId: requestRef.id,
    senderId,
    receiverId,
    status: "pending",
  };
}

/* =========================================================
   GET RECEIVED REQUESTS
========================================================= */

export async function getReceivedRequests(
  userId
) {
  if (!userId) return [];

  try {
    const requestsRef = collection(
      db,
      "friendRequests"
    );

    const q = query(
      requestsRef,
      where("receiverId", "==", userId),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    const requests = await Promise.all(
      snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();

        const sender = await getUser(
          data.senderId
        );

        return {
          requestId: requestDoc.id,

          senderId: data.senderId,
          receiverId: data.receiverId,
          status: data.status,
          createdAt: data.createdAt,

          // Sender profile
          name: sender?.name || "User",
          username: sender?.username || "",
          email: sender?.email || "",
          photoURL: sender?.photoURL || "",

          // Sender location
          location: sender?.location || null,
          locationText:
            sender?.locationText || "",
          latitude:
            sender?.latitude ?? null,
          longitude:
            sender?.longitude ?? null,

          // Sender weather
          weather: sender?.weather || null,

          // Sharing settings
          weatherSharing:
            sender?.weatherSharing ?? false,

          locationSharing:
            sender?.locationSharing ?? "off",
        };
      })
    );

    return requests;
  } catch (error) {
    console.error(
      "getReceivedRequests error:",
      error
    );

    return [];
  }
}

/* =========================================================
   GET SENT REQUESTS
========================================================= */

export async function getSentRequests(userId) {
  if (!userId) return [];

  try {
    const requestsRef = collection(
      db,
      "friendRequests"
    );

    const q = query(
      requestsRef,
      where("senderId", "==", userId),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    const requests = await Promise.all(
      snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();

        const receiver = await getUser(
          data.receiverId
        );

        return {
          requestId: requestDoc.id,

          senderId: data.senderId,
          receiverId: data.receiverId,
          status: data.status,
          createdAt: data.createdAt,

          // Receiver profile
          name: receiver?.name || "User",
          username: receiver?.username || "",
          email: receiver?.email || "",
          photoURL:
            receiver?.photoURL || "",

          // Receiver location
          location:
            receiver?.location || null,
          locationText:
            receiver?.locationText || "",
          latitude:
            receiver?.latitude ?? null,
          longitude:
            receiver?.longitude ?? null,

          // Receiver weather
          weather:
            receiver?.weather || null,

          // Sharing settings
          weatherSharing:
            receiver?.weatherSharing ?? false,

          locationSharing:
            receiver?.locationSharing ?? "off",
        };
      })
    );

    return requests;
  } catch (error) {
    console.error(
      "getSentRequests error:",
      error
    );

    return [];
  }
}

/* =========================================================
   ACCEPT FRIEND REQUEST
========================================================= */

export async function acceptFriendRequest(
  requestId,
  user1,
  user2
) {
  if (!requestId || !user1 || !user2) {
    throw new Error(
      "Invalid friend request data"
    );
  }

  if (user1 === user2) {
    throw new Error(
      "A user cannot be friends with themselves"
    );
  }

  /*
    user1 = current user
    user2 = friend
  */

  // Update request status
  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await updateDoc(requestRef, {
    status: "accepted",
  });

  // Add user2 to user1's friends
  await setDoc(
    doc(
      db,
      "users",
      user1,
      "friends",
      user2
    ),
    {
      userId: user2,
      createdAt: serverTimestamp(),
    }
  );

  // Add user1 to user2's friends
  await setDoc(
    doc(
      db,
      "users",
      user2,
      "friends",
      user1
    ),
    {
      userId: user1,
      createdAt: serverTimestamp(),
    }
  );

  // Fetch complete friend's profile
  const friend = await getUser(user2);

  console.log(
    "FRIEND ACCEPTED:",
    friend
  );

  return {
    success: true,
    friend,
  };
}

/* =========================================================
   REJECT FRIEND REQUEST
========================================================= */

export async function rejectFriendRequest(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "Request ID is required"
    );
  }

  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await updateDoc(requestRef, {
    status: "rejected",
  });

  return true;
}

/* =========================================================
   CANCEL FRIEND REQUEST
========================================================= */

export async function cancelFriendRequest(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "Request ID is required"
    );
  }

  const requestRef = doc(
    db,
    "friendRequests",
    requestId
  );

  await deleteDoc(requestRef);

  return true;
}

/* =========================================================
   GET FRIENDS
========================================================= */

export async function getFriends(userId) {
  if (!userId) return [];

  try {
    /*
      Friends are stored here:

      users
        └── currentUser
              └── friends
                    ├── friendUID1
                    ├── friendUID2
                    └── ...
    */

    const friendsRef = collection(
      db,
      "users",
      userId,
      "friends"
    );

    const snapshot = await getDocs(
      friendsRef
    );

    console.log(
      "Friend documents found:",
      snapshot.docs.length
    );

    if (snapshot.empty) {
      console.log(
        "No accepted friends found for:",
        userId
      );

      return [];
    }

    /*
      IMPORTANT:
      We fetch the friend's USER document
      every time.

      This means weatherSharing and weather
      always come from:

      users/{friendId}

      and NOT from the friendship document.
    */

    const friends = await Promise.all(
      snapshot.docs.map(async (friendDoc) => {
        const friendId = friendDoc.id;

        console.log(
          "Loading friend:",
          friendId
        );

        // Get latest friend user document
        const friend = await getUser(
          friendId
        );

        if (!friend) {
          console.warn(
            "Friend user document missing:",
            friendId
          );

          return null;
        }

        /*
          IMPORTANT:
          weatherSharing is read directly
          from the friend's user document.
        */

        const weatherSharing =
          friend.weatherSharing === true;

        /*
          Weather is still returned from Firebase.

          We DO NOT delete weather when sharing
          is turned off.

          The UI decides whether it can display it.
        */

        return {
          id: friend.id,
          friendId,

          // Profile
          name: friend.name || "User",
          username:
            friend.username || "",
          email:
            friend.email || "",
          photoURL:
            friend.photoURL || "",

          // Location
          location:
            friend.location || null,

          locationText:
            friend.locationText || "",

          latitude:
            friend.latitude ?? null,

          longitude:
            friend.longitude ?? null,

          // Weather
          weather:
            friend.weather || null,

          // Sharing
          weatherSharing,

          locationSharing:
            friend.locationSharing ??
            "off",

          // Weather timestamp
          weatherUpdatedAt:
            friend.weatherUpdatedAt ||
            null,

          // Friendship
          friendshipId:
            friendDoc.id,

          friendshipCreatedAt:
            friendDoc.data()
              ?.createdAt || null,
        };
      })
    );

    const validFriends =
      friends.filter(Boolean);

    console.log(
      "COMPLETE FIREBASE FRIENDS:",
      validFriends
    );

    return validFriends;
  } catch (error) {
    console.error(
      "getFriends error:",
      error
    );

    return [];
  }
}

/* =========================================================
   REMOVE FRIEND
========================================================= */

export async function removeFriend(
  userId,
  friendId
) {
  if (!userId || !friendId) {
    throw new Error(
      "User ID and Friend ID are required"
    );
  }

  // Remove friend from current user's list
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "friends",
      friendId
    )
  );

  // Remove current user from friend's list
  await deleteDoc(
    doc(
      db,
      "users",
      friendId,
      "friends",
      userId
    )
  );

  return true;
}

/* =========================================================
   BLOCK USER
========================================================= */

export async function blockUser(
  blockerId,
  blockedUserId
) {
  if (!blockerId || !blockedUserId) {
    throw new Error(
      "Invalid block data"
    );
  }

  if (blockerId === blockedUserId) {
    throw new Error(
      "You cannot block yourself"
    );
  }

  const blockedRef = collection(
    db,
    "blockedUsers"
  );

  const blockRef = await addDoc(
    blockedRef,
    {
      blockerId,
      blockedUserId,
      createdAt: serverTimestamp(),
    }
  );

  return {
    blockId: blockRef.id,
  };
}

/* =========================================================
   GET BLOCKED USERS
========================================================= */

export async function getBlockedUsers(userId) {
  if (!userId) return [];

  try {
    const blockedRef = collection(db, "blockedUsers");

    const q = query(
      blockedRef,
      where("blockerId", "==", userId)
    );

    const snapshot = await getDocs(q);

    const blockedUsers = await Promise.all(
      snapshot.docs.map(async (blockDoc) => {
        const data = blockDoc.data();

        const blockedUser = await getUser(
          data.blockedUserId
        );

        if (!blockedUser) {
          return null;
        }

        return {
          // IMPORTANT:
          // This is the Firestore blockedUsers document ID
          blockId: blockDoc.id,

          // This is the actual user's UID
          id: data.blockedUserId,

          name: blockedUser.name || "User",
          username: blockedUser.username || "",
          email: blockedUser.email || "",
          photoURL: blockedUser.photoURL || "",

          createdAt: data.createdAt || null,
        };
      })
    );

    return blockedUsers.filter(Boolean);
  } catch (error) {
    console.error(
      "getBlockedUsers error:",
      error
    );

    return [];
  }
}
/* =========================================================
   UNBLOCK USER
========================================================= */

export async function unblockUser(blockId) {
  if (!blockId) {
    throw new Error(
      "Block ID is required"
    );
  }

  const blockRef = doc(
    db,
    "blockedUsers",
    blockId
  );

  await deleteDoc(blockRef);

  return true;
}

/* =========================================================
   WEATHER SHARING
========================================================= */

export async function updateWeatherSharing(
  userId,
  enabled
) {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  /*
    IMPORTANT:

    enabled MUST be a boolean.

    AppContext should call:

    updateWeatherSharing(userId, false)

    NOT:

    updateWeatherSharing(userId, {
      weatherSharing: false
    })

    Because:

    Boolean({ weatherSharing: false })
    === true
  */

  const sharingEnabled =
    Boolean(enabled);

  await updateDoc(userRef, {
    weatherSharing:
      sharingEnabled,
  });

  console.log(
    "WEATHER SHARING UPDATED:",
    {
      userId,
      weatherSharing:
        sharingEnabled,
    }
  );

  return true;
}

/* =========================================================
   LOCATION SHARING
========================================================= */

export async function updateLocationSharing(
  userId,
  mode
) {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await setDoc(
    userRef,
    {
      locationSharing: mode,
    },
    {
      merge: true,
    }
  );

  return true;
}

/* =========================================================
   USER LOCATION
========================================================= */

export async function updateUserLocation(
  userId,
  latitude,
  longitude,
  locationName = "",
  country = ""
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      uid: userId,

      latitude,
      longitude,

      location: {
        lat: latitude,
        lng: longitude,
        city: locationName,
        name: locationName,
        country,
      },

      locationText: locationName
        ? `${locationName}${country ? `, ${country}` : ""}`
        : "",

      locationUpdatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return true;
}

/* =========================================================
   UPDATE USER WEATHER
========================================================= */

export async function updateUserWeather(
  userId,
  weather
) {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await setDoc(
    userRef,
    {
      uid: userId,

      weather: {
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
          weather?.locationName ?? "",

        country:
          weather?.country ?? "",
      },

      weatherUpdatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return true;
}

// =========================================================
// REAL-TIME FRIEND WEATHER
// =========================================================

// =========================================================
// REAL-TIME FRIEND WEATHER + PROFILE
// =========================================================

export function subscribeToFriends(userId, callback) {
  if (!userId) {
    return () => {};
  }

  const friendsRef = collection(
    db,
    "users",
    userId,
    "friends"
  );

  let unsubscribeFriendListeners = [];
  let friendData = new Map();

  const unsubscribeFriends = onSnapshot(
    friendsRef,
    (snapshot) => {
      // Remove old friend listeners
      unsubscribeFriendListeners.forEach((unsubscribe) => {
        unsubscribe();
      });

      unsubscribeFriendListeners = [];
      friendData = new Map();

      const friendIds = snapshot.docs.map(
        (friendDoc) => friendDoc.id
      );

      // No friends
      if (friendIds.length === 0) {
        callback([]);
        return;
      }

      friendIds.forEach((friendId) => {
        const friendRef = doc(
          db,
          "users",
          friendId
        );

        const unsubscribeFriend = onSnapshot(
          friendRef,
          (friendSnapshot) => {
            if (!friendSnapshot.exists()) {
              return;
            }

            const data = friendSnapshot.data();

            const friend = {
              id: friendSnapshot.id,
              friendId: friendSnapshot.id,

              // Profile
              name: data.name || "User",
              username: data.username || "",
              email: data.email || "",
              photoURL: data.photoURL || "",

              // Location
              location: data.location || null,
              locationText: data.locationText || "",
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,

              // Weather
              weather: data.weather || null,

              // Sharing
              weatherSharing:
                data.weatherSharing === true,

              locationSharing:
                data.locationSharing || "off",

              // IMPORTANT
              weatherUpdatedAt:
                data.weatherUpdatedAt || null,

              locationUpdatedAt:
                data.locationUpdatedAt || null,
            };

            // Update this friend
            friendData.set(friendId, friend);

            // Send latest complete list
            callback(
              Array.from(friendData.values())
            );
          },
          (error) => {
            console.error(
              `Friend listener error (${friendId}):`,
              error
            );
          }
        );

        unsubscribeFriendListeners.push(
          unsubscribeFriend
        );
      });
    },
    (error) => {
      console.error(
        "Friends listener error:",
        error
      );

      callback([]);
    }
  );

  return () => {
    unsubscribeFriends();

    unsubscribeFriendListeners.forEach(
      (unsubscribe) => {
        unsubscribe();
      }
    );

    unsubscribeFriendListeners = [];
    friendData.clear();
  };
}
