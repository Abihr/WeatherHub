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
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
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
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();

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

export async function sendFriendRequest(senderId, receiverId) {
  if (!senderId || !receiverId) {
    throw new Error("Sender and receiver are required");
  }

  if (senderId === receiverId) {
    throw new Error("You cannot send a friend request to yourself");
  }

  const requestsRef = collection(db, "friendRequests");

  const existingQuery = query(
    requestsRef,
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending"),
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error("Friend request already sent");
  }

  const requestRef = await addDoc(requestsRef, {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

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

export async function getReceivedRequests(userId) {
  if (!userId) return [];

  try {
    const requestsRef = collection(db, "friendRequests");

    const q = query(
      requestsRef,
      where("receiverId", "==", userId),
      where("status", "==", "pending"),
    );

    const snapshot = await getDocs(q);

    const requests = await Promise.all(
      snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();

        const sender = await getUser(data.senderId);

        return {
          requestId: requestDoc.id,

          senderId: data.senderId,
          receiverId: data.receiverId,
          status: data.status,
          createdAt: data.createdAt,

          name: sender?.name || "User",
          username: sender?.username || "",
          email: sender?.email || "",
          photoURL: sender?.photoURL || "",

          location: sender?.location || null,
          locationText: sender?.locationText || "",
          latitude: sender?.latitude ?? null,
          longitude: sender?.longitude ?? null,

          weather: sender?.weather || null,

          weatherSharing: sender?.weatherSharing ?? false,

          locationSharing: sender?.locationSharing ?? "off",
        };
      }),
    );

    return requests;
  } catch (error) {
    console.error("getReceivedRequests error:", error);
    return [];
  }
}

/* =========================================================
   GET SENT REQUESTS
========================================================= */

export async function getSentRequests(userId) {
  if (!userId) return [];

  try {
    const requestsRef = collection(db, "friendRequests");

    const q = query(
      requestsRef,
      where("senderId", "==", userId),
      where("status", "==", "pending"),
    );

    const snapshot = await getDocs(q);

    const requests = await Promise.all(
      snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();

        const receiver = await getUser(data.receiverId);

        return {
          requestId: requestDoc.id,

          senderId: data.senderId,
          receiverId: data.receiverId,
          status: data.status,
          createdAt: data.createdAt,

          name: receiver?.name || "User",
          username: receiver?.username || "",
          email: receiver?.email || "",
          photoURL: receiver?.photoURL || "",

          location: receiver?.location || null,
          locationText: receiver?.locationText || "",

          latitude: receiver?.latitude ?? null,
          longitude: receiver?.longitude ?? null,

          weather: receiver?.weather || null,

          weatherSharing: receiver?.weatherSharing ?? false,

          locationSharing: receiver?.locationSharing ?? "off",
        };
      }),
    );

    return requests;
  } catch (error) {
    console.error("getSentRequests error:", error);
    return [];
  }
}

/* =========================================================
   ACCEPT FRIEND REQUEST
========================================================= */

export async function acceptFriendRequest(requestId, user1, user2) {
  if (!requestId || !user1 || !user2) {
    throw new Error("Invalid friend request data");
  }

  if (user1 === user2) {
    throw new Error("A user cannot be friends with themselves");
  }

  const requestRef = doc(db, "friendRequests", requestId);

  await updateDoc(requestRef, {
    status: "accepted",
  });

  await setDoc(doc(db, "users", user1, "friends", user2), {
    userId: user2,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "users", user2, "friends", user1), {
    userId: user1,
    createdAt: serverTimestamp(),
  });

  const friend = await getUser(user2);

  console.log("FRIEND ACCEPTED:", friend);

  return {
    success: true,
    friend,
  };
}

/* =========================================================
   REJECT FRIEND REQUEST
========================================================= */

export async function rejectFriendRequest(requestId) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const requestRef = doc(db, "friendRequests", requestId);

  await updateDoc(requestRef, {
    status: "rejected",
  });

  return true;
}

/* =========================================================
   CANCEL FRIEND REQUEST
========================================================= */

export async function cancelFriendRequest(requestId) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const requestRef = doc(db, "friendRequests", requestId);

  await deleteDoc(requestRef);

  return true;
}

/* =========================================================
   GET FRIENDS
========================================================= */

export async function getFriends(userId) {
  if (!userId) return [];

  try {
    const friendsRef = collection(db, "users", userId, "friends");

    const snapshot = await getDocs(friendsRef);

    console.log(
      "Friend documents found:",
      snapshot.docs.length,
    );

    if (snapshot.empty) {
      console.log(
        "No accepted friends found for:",
        userId,
      );

      return [];
    }

    const myBlockedQuery = query(
      collection(db, "blockedUsers"),
      where("blockerId", "==", userId),
    );

    const blockedMeQuery = query(
      collection(db, "blockedUsers"),
      where("blockedUserId", "==", userId),
    );

    const [
      myBlockedSnapshot,
      blockedMeSnapshot,
    ] = await Promise.all([
      getDocs(myBlockedQuery),
      getDocs(blockedMeQuery),
    ]);

    const blockedUserIds = new Set(
      myBlockedSnapshot.docs.map(
        (blockDoc) =>
          blockDoc.data().blockedUserId,
      ),
    );

    const blockedByIds = new Set(
      blockedMeSnapshot.docs.map(
        (blockDoc) =>
          blockDoc.data().blockerId,
      ),
    );

    const friends = await Promise.all(
      snapshot.docs.map(async (friendDoc) => {
        const friendId = friendDoc.id;

        if (blockedUserIds.has(friendId)) {
          return null;
        }

        const friend = await getUser(friendId);

        if (!friend) {
          console.warn(
            "Friend user document missing:",
            friendId,
          );

          return null;
        }

        if (blockedByIds.has(friendId)) {
          console.log(
            "FRIEND BLOCKED ME:",
            friendId,
          );

          return {
            id: friendId,
            friendId,

            name: "User unavailable",
            username: "",
            email: "",
            photoURL: "",

            location: null,
            locationText: "",
            latitude: null,
            longitude: null,

            weather: null,
            weatherSharing: false,
            locationSharing: "off",

            weatherUpdatedAt: null,
            locationUpdatedAt: null,

            isBlocked: true,
            blockedMe: true,
            blockedByMe: false,

            friendshipId: friendDoc.id,

            friendshipCreatedAt:
              friendDoc.data()?.createdAt || null,
          };
        }

        return {
          id: friendId,
          friendId,

          name: friend.name || "User",
          username: friend.username || "",
          email: friend.email || "",
          photoURL: friend.photoURL || "",

          location: friend.location || null,
          locationText: friend.locationText || "",

          latitude: friend.latitude ?? null,
          longitude: friend.longitude ?? null,

          weather: friend.weather || null,

          weatherSharing:
            friend.weatherSharing === true,

          locationSharing:
            friend.locationSharing || "off",

          weatherUpdatedAt:
            friend.weatherUpdatedAt || null,

          locationUpdatedAt:
            friend.locationUpdatedAt || null,

          isBlocked: false,
          blockedMe: false,
          blockedByMe: false,

          friendshipId: friendDoc.id,

          friendshipCreatedAt:
            friendDoc.data()?.createdAt || null,
        };
      }),
    );

    const validFriends = friends.filter(Boolean);

    console.log(
      "COMPLETE FIREBASE FRIENDS:",
      validFriends,
    );

    return validFriends;
  } catch (error) {
    console.error("getFriends error:", error);

    return [];
  }
}

/* =========================================================
   REMOVE FRIEND
========================================================= */

export async function removeFriend(userId, friendId) {
  if (!userId || !friendId) {
    throw new Error(
      "User ID and Friend ID are required",
    );
  }

  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "friends",
      friendId,
    ),
  );

  await deleteDoc(
    doc(
      db,
      "users",
      friendId,
      "friends",
      userId,
    ),
  );

  return true;
}

/* =========================================================
   BLOCK USER
========================================================= */

export async function blockUser(
  blockerId,
  blockedUserId,
) {
  if (!blockerId || !blockedUserId) {
    throw new Error("Invalid block data");
  }

  if (blockerId === blockedUserId) {
    throw new Error(
      "You cannot block yourself",
    );
  }

  const blockedRef = collection(
    db,
    "blockedUsers",
  );

  const existingQuery = query(
    blockedRef,
    where(
      "blockerId",
      "==",
      blockerId,
    ),
    where(
      "blockedUserId",
      "==",
      blockedUserId,
    ),
  );

  const existingSnapshot =
    await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return {
      blockId:
        existingSnapshot.docs[0].id,
    };
  }

  const blockRef = await addDoc(
    blockedRef,
    {
      blockerId,
      blockedUserId,
      createdAt:
        serverTimestamp(),
    },
  );

  console.log(
    "USER BLOCKED:",
    {
      blockerId,
      blockedUserId,
      blockId: blockRef.id,
    },
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
    const blockedRef =
      collection(db, "blockedUsers");

    const q = query(
      blockedRef,
      where(
        "blockerId",
        "==",
        userId,
      ),
    );

    const snapshot =
      await getDocs(q);

    const blockedUsers =
      await Promise.all(
        snapshot.docs.map(
          async (blockDoc) => {
            const data =
              blockDoc.data();

            const blockedUser =
              await getUser(
                data.blockedUserId,
              );

            if (!blockedUser) {
              return null;
            }

            return {
              blockId:
                blockDoc.id,

              id:
                data.blockedUserId,

              name:
                blockedUser.name ||
                "User",

              username:
                blockedUser.username ||
                "",

              email:
                blockedUser.email ||
                "",

              photoURL:
                blockedUser.photoURL ||
                "",

              createdAt:
                data.createdAt ||
                null,
            };
          },
        ),
      );

    return blockedUsers.filter(Boolean);
  } catch (error) {
    console.error(
      "getBlockedUsers error:",
      error,
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
      "Block ID is required",
    );
  }

  const blockRef =
    doc(
      db,
      "blockedUsers",
      blockId,
    );

  await deleteDoc(blockRef);

  return true;
}

/* =========================================================
   WEATHER SHARING
========================================================= */

export async function updateWeatherSharing(
  userId,
  enabled,
) {
  if (!userId) {
    throw new Error(
      "User ID is required",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
    );

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
    },
  );

  return true;
}

/* =========================================================
   LOCATION SHARING
========================================================= */

export async function updateLocationSharing(
  userId,
  mode,
) {
  if (!userId) {
    throw new Error(
      "User ID is required",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
    );

  await setDoc(
    userRef,
    {
      locationSharing:
        mode,
    },
    {
      merge: true,
    },
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
  country = "",
) {
  if (!userId) {
    throw new Error(
      "User ID is required",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
    );

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
        ? `${locationName}${
            country
              ? `, ${country}`
              : ""
          }`
        : "",

      locationUpdatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return true;
}

/* =========================================================
   UPDATE USER WEATHER
========================================================= */

export async function updateUserWeather(
  userId,
  weather,
) {
  if (!userId) {
    throw new Error(
      "User ID is required",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
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
          weather?.locationName ??
          "",

        country:
          weather?.country ??
          "",
      },

      weatherUpdatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return true;
}

/* =========================================================
   REAL-TIME FRIENDS
========================================================= */

export function subscribeToFriends(
  userId,
  callback,
) {
  if (!userId) {
    callback([]);

    return () => {};
  }

  const friendsRef =
    collection(
      db,
      "users",
      userId,
      "friends",
    );

  const blockedRef =
    collection(
      db,
      "blockedUsers",
    );

  let unsubscribeFriends = null;
  let unsubscribeBlocked = null;
  let unsubscribeMyBlocked = null;

  let friendDocs = [];

  let blockedByIds =
    new Set();

  let blockedUserIds =
    new Set();

  let friendsLoaded = false;
  let blockedByLoaded = false;
  let myBlockedLoaded = false;

  async function rebuildFriends() {
    if (
      !friendsLoaded ||
      !blockedByLoaded ||
      !myBlockedLoaded
    ) {
      console.log(
        "Waiting for friend/block snapshots...",
      );

      return;
    }

    if (!friendDocs.length) {
      callback([]);

      return;
    }

    const currentFriends =
      [...friendDocs];

    const friends =
      await Promise.all(
        currentFriends.map(
          async (friendDoc) => {
            const friendId =
              friendDoc.id;

            if (
              blockedUserIds.has(
                friendId,
              )
            ) {
              console.log(
                "HIDING BLOCKED FRIEND:",
                friendId,
              );

              return null;
            }

            const friendSnapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  friendId,
                ),
              );

            if (
              !friendSnapshot.exists()
            ) {
              return null;
            }

            const data =
              friendSnapshot.data();

            if (
              blockedByIds.has(
                friendId,
              )
            ) {
              console.log(
                "FRIEND BLOCKED ME:",
                friendId,
              );

              return {
                id: friendId,
                friendId,

                name:
                  "User unavailable",

                username: "",
                email: "",
                photoURL: "",

                location: null,
                locationText: "",

                latitude: null,
                longitude: null,

                weather: null,
                weatherSharing: false,

                locationSharing:
                  "off",

                weatherUpdatedAt:
                  null,

                locationUpdatedAt:
                  null,

                isBlocked: true,
                blockedMe: true,
                blockedByMe: false,

                friendshipId:
                  friendDoc.id,

                friendshipCreatedAt:
                  friendDoc
                    .data()
                    ?.createdAt ||
                  null,
              };
            }

            return {
              id: friendId,
              friendId,

              name:
                data.name ||
                "User",

              username:
                data.username ||
                "",

              email:
                data.email ||
                "",

              photoURL:
                data.photoURL ||
                "",

              location:
                data.location ||
                null,

              locationText:
                data.locationText ||
                "",

              latitude:
                data.latitude ??
                null,

              longitude:
                data.longitude ??
                null,

              weather:
                data.weather ||
                null,

              weatherSharing:
                data.weatherSharing ===
                true,

              locationSharing:
                data.locationSharing ||
                "off",

              weatherUpdatedAt:
                data.weatherUpdatedAt ||
                null,

              locationUpdatedAt:
                data.locationUpdatedAt ||
                null,

              isBlocked: false,
              blockedMe: false,
              blockedByMe: false,

              friendshipId:
                friendDoc.id,

              friendshipCreatedAt:
                friendDoc
                  .data()
                  ?.createdAt ||
                null,
            };
          },
        ),
      );

    const validFriends =
      friends.filter(Boolean);

    console.log(
      "REAL-TIME FRIENDS:",
      validFriends,
    );

    callback(validFriends);
  }

  unsubscribeFriends =
    onSnapshot(
      friendsRef,
      async (snapshot) => {
        friendDocs =
          snapshot.docs;

        friendsLoaded = true;

        console.log(
          "FRIENDSHIP CHANGED:",
          friendDocs.length,
        );

        await rebuildFriends();
      },
      (error) => {
        console.error(
          "Friends listener error:",
          error,
        );

        callback([]);
      },
    );

  unsubscribeBlocked =
    onSnapshot(
      query(
        blockedRef,
        where(
          "blockedUserId",
          "==",
          userId,
        ),
      ),
      async (snapshot) => {
        blockedByIds =
          new Set(
            snapshot.docs.map(
              (blockDoc) =>
                blockDoc
                  .data()
                  .blockerId,
            ),
          );

        blockedByLoaded =
          true;

        console.log(
          "PEOPLE WHO BLOCKED ME:",
          Array.from(
            blockedByIds,
          ),
        );

        await rebuildFriends();
      },
      (error) => {
        console.error(
          "Blocked-by listener error:",
          error,
        );
      },
    );

  unsubscribeMyBlocked =
    onSnapshot(
      query(
        blockedRef,
        where(
          "blockerId",
          "==",
          userId,
        ),
      ),
      async (snapshot) => {
        blockedUserIds =
          new Set(
            snapshot.docs.map(
              (blockDoc) =>
                blockDoc
                  .data()
                  .blockedUserId,
            ),
          );

        myBlockedLoaded =
          true;

        console.log(
          "MY BLOCKED USERS:",
          Array.from(
            blockedUserIds,
          ),
        );

        await rebuildFriends();
      },
      (error) => {
        console.error(
          "My blocked listener error:",
          error,
        );
      },
    );

  return () => {
    if (unsubscribeFriends) {
      unsubscribeFriends();
    }

    if (unsubscribeBlocked) {
      unsubscribeBlocked();
    }

    if (unsubscribeMyBlocked) {
      unsubscribeMyBlocked();
    }

    friendDocs = [];

    blockedByIds.clear();
    blockedUserIds.clear();

    friendsLoaded = false;
    blockedByLoaded = false;
    myBlockedLoaded = false;
  };
}

/* =========================================================
   DISASTER ALERTS
========================================================= */

function calculateDistanceKm(
  lat1,
  lon1,
  lat2,
  lon2,
) {
  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) /
    180;

  const dLon =
    ((lon2 - lon1) * Math.PI) /
    180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180,
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180,
      ) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return (
    earthRadiusKm * c
  );
}

/* =========================================================
   CREATE DISASTER ALERT
========================================================= */

export async function createDisasterAlert(
  alert,
) {
  if (!alert?.title) {
    throw new Error(
      "Alert title is required",
    );
  }

  if (
    typeof alert.latitude !==
      "number" ||
    typeof alert.longitude !==
      "number"
  ) {
    throw new Error(
      "Alert latitude and longitude are required",
    );
  }

  const alertData = {
    title:
      alert.title,

    message:
      alert.message || "",

    type:
      alert.type ||
      "severe_weather",

    severity:
      alert.severity ||
      "warning",

    locationName:
      alert.locationName ||
      "",

    latitude:
      alert.latitude,

    longitude:
      alert.longitude,

    radiusKm:
      Number(alert.radiusKm) ||
      25,

    source:
      alert.source ||
      "WeatherHub",

    createdAt:
      serverTimestamp(),

    expiresAt:
      alert.expiresAt ||
      null,

    active: true,
  };

  const alertRef =
    await addDoc(
      collection(
        db,
        "disasterAlerts",
      ),
      alertData,
    );

  console.log(
    "DISASTER ALERT CREATED:",
    alertRef.id,
  );

  const usersSnapshot =
    await getDocs(
      collection(
        db,
        "users",
      ),
    );

  const notificationPromises =
    [];

  usersSnapshot.forEach(
    (userDoc) => {
      const userData =
        userDoc.data();

      const userLatitude =
        userData.latitude;

      const userLongitude =
        userData.longitude;

      if (
        typeof userLatitude !==
          "number" ||
        typeof userLongitude !==
          "number"
      ) {
        return;
      }

      const distance =
        calculateDistanceKm(
          alert.latitude,
          alert.longitude,
          userLatitude,
          userLongitude,
        );

      if (
        distance <=
        alertData.radiusKm
      ) {
        notificationPromises.push(
          addDoc(
            collection(
              db,
              "users",
              userDoc.id,
              "notifications",
            ),
            {
              alertId:
                alertRef.id,

              title:
                alertData.title,

              message:
                alertData.message,

              type:
                alertData.type,

              severity:
                alertData.severity,

              locationName:
                alertData.locationName,

              distanceKm:
                Number(
                  distance.toFixed(2),
                ),

              source:
                alertData.source,

              read: false,

              createdAt:
                serverTimestamp(),

              expiresAt:
                alertData.expiresAt ||
                null,
            },
          ),
        );
      }
    },
  );

  await Promise.all(
    notificationPromises,
  );

  console.log(
    "TARGETED NOTIFICATIONS SENT:",
    notificationPromises.length,
  );

  return {
    alertId:
      alertRef.id,

    affectedUsers:
      notificationPromises.length,
  };
}

/* =========================================================
   DELETE DISASTER ALERT + GENERATED NOTIFICATIONS
========================================================= */

/*
  Deletes one disaster alert and all notifications
  that were generated from that alert.

  Intended mainly for development/testing cleanup.

  IMPORTANT:
  It only deletes notifications whose alertId
  exactly matches the supplied alertId.
*/

export async function deleteDisasterAlert(
  alertId,
) {
  if (!alertId) {
    throw new Error(
      "Alert ID is required",
    );
  }

  /* ---------------------------------------------------------
     DELETE THE ALERT DOCUMENT
  --------------------------------------------------------- */

  const alertRef =
    doc(
      db,
      "disasterAlerts",
      alertId,
    );

  const alertSnapshot =
    await getDoc(alertRef);

  if (alertSnapshot.exists()) {
    await deleteDoc(alertRef);

    console.log(
      "DISASTER ALERT DELETED:",
      alertId,
    );
  } else {
    console.warn(
      "Disaster alert document not found:",
      alertId,
    );
  }

  /* ---------------------------------------------------------
     FIND ALL USERS
  --------------------------------------------------------- */

  const usersSnapshot =
    await getDocs(
      collection(
        db,
        "users",
      ),
    );

  let deletedNotifications = 0;

  /* ---------------------------------------------------------
     SEARCH EACH USER'S NOTIFICATIONS
  --------------------------------------------------------- */

  const cleanupPromises =
    usersSnapshot.docs.map(
      async (userDoc) => {
        const notificationsRef =
          collection(
            db,
            "users",
            userDoc.id,
            "notifications",
          );

        const notificationsSnapshot =
          await getDocs(
            notificationsRef,
          );

        const matchingNotifications =
          notificationsSnapshot.docs.filter(
            (notificationDoc) =>
              notificationDoc.data()
                .alertId === alertId,
          );

        await Promise.all(
          matchingNotifications.map(
            (notificationDoc) =>
              deleteDoc(
                notificationDoc.ref,
              ),
          ),
        );

        deletedNotifications +=
          matchingNotifications.length;
      },
    );

  await Promise.all(
    cleanupPromises,
  );

  console.log(
    "DISASTER NOTIFICATIONS DELETED:",
    deletedNotifications,
  );

  return {
    success: true,
    alertId,
    deletedNotifications,
  };
}

/* =========================================================
   GET USER NOTIFICATIONS
========================================================= */

export async function getUserNotifications(
  userId,
) {
  if (!userId) {
    return [];
  }

  try {
    const notificationsRef =
      collection(
        db,
        "users",
        userId,
        "notifications",
      );

    const q =
      query(
        notificationsRef,
        orderBy(
          "createdAt",
          "desc",
        ),
        limit(50),
      );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (notificationDoc) => ({
        id:
          notificationDoc.id,

        ...notificationDoc.data(),
      }),
    );
  } catch (error) {
    console.error(
      "getUserNotifications error:",
      error,
    );

    return [];
  }
}

/* =========================================================
   REAL-TIME USER NOTIFICATIONS
========================================================= */

export function subscribeToNotifications(
  userId,
  callback,
) {
  if (!userId) {
    callback([]);

    return () => {};
  }

  const notificationsRef =
    collection(
      db,
      "users",
      userId,
      "notifications",
    );

  const q =
    query(
      notificationsRef,
      orderBy(
        "createdAt",
        "desc",
      ),
      limit(50),
    );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications =
        snapshot.docs.map(
          (notificationDoc) => ({
            id:
              notificationDoc.id,

            ...notificationDoc.data(),
          }),
        );

      callback(
        notifications,
      );
    },
    (error) => {
      console.error(
        "Notification listener error:",
        error,
      );

      callback([]);
    },
  );
}

/* =========================================================
   MARK NOTIFICATION AS READ
========================================================= */

export async function markNotificationRead(
  userId,
  notificationId,
) {
  if (
    !userId ||
    !notificationId
  ) {
    throw new Error(
      "User ID and notification ID are required",
    );
  }

  await updateDoc(
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId,
    ),
    {
      read: true,
    },
  );

  return true;
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export async function deleteNotification(
  userId,
  notificationId,
) {
  if (
    !userId ||
    !notificationId
  ) {
    throw new Error(
      "User ID and notification ID are required",
    );
  }

  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId,
    ),
  );

  return true;
}

/* =========================================================
   CLEAR ALL NOTIFICATIONS
========================================================= */

export async function clearUserNotifications(
  userId,
) {
  if (!userId) {
    throw new Error(
      "User ID is required",
    );
  }

  const notificationsRef =
    collection(
      db,
      "users",
      userId,
      "notifications",
    );

  const snapshot =
    await getDocs(
      notificationsRef,
    );

  await Promise.all(
    snapshot.docs.map(
      (notificationDoc) =>
        deleteDoc(
          notificationDoc.ref,
        ),
    ),
  );

  return true;
}