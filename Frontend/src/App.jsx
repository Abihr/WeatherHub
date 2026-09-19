import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase/firebase";

import { AppProvider } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import ToastStack from "./components/Toast";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import FriendRequests from "./pages/FriendRequests";
import Compare from "./pages/Compare";
import MapPage from "./pages/Map";
import Profile from "./pages/Profile";
import BlockedUsers from "./pages/BlockedUsers";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Chatbot from "./pages/Chatbot";
import RailwayWeather from "./components/RailwayWeather";
import Farmer from "./pages/Farmer";

function AppShell() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-sky-wash">
      {/* ================================
          TOP NAVBAR
      ================================= */}
      <Navbar />

      {/* ================================
          PAGE CONTENT
          pb-24 prevents BottomNav from
          covering content on mobile
      ================================= */}
      <main className="min-w-0 pb-24 md:pb-0">
        <div className="animate-page-enter">
          <Routes>
            {/* HOME */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* FRIENDS */}
            <Route
              path="/friends"
              element={<Friends />}
            />

            {/* FRIEND REQUESTS */}
            <Route
              path="/requests"
              element={<FriendRequests />}
            />

            {/* COMPARE */}
            <Route
              path="/compare"
              element={<Compare />}
            />

            {/* MAP */}
            <Route
              path="/map"
              element={<MapPage />}
            />

            {/* ALERTS */}
            <Route
              path="/alerts"
              element={<Alerts />}
            />

            {/* PROFILE */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* BLOCKED USERS */}
            <Route
              path="/blocked"
              element={<BlockedUsers />}
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* CHATBOT */}
            <Route
              path="/chatbot"
              element={<Chatbot />}
            />

            {/* FRONTEND / CHATBOT */}
            <Route
              path="/Frontend"
              element={<Chatbot />}
            />

            {/* RAILWAY WEATHER */}
            <Route
              path="/railway-weather"
              element={<RailwayWeather />}
            />

            {/* RAILWAY SHORT ROUTE */}
            <Route
              path="/railway"
              element={<RailwayWeather />}
            />

            {/* AGRICULTURE */}
            <Route
              path="/farmer"
              element={<Farmer />}
            />
          </Routes>
        </div>
      </main>

      {/* ================================
          MOBILE BOTTOM NAVIGATION
          BottomNav itself uses md:hidden
      ================================= */}
      <BottomNav />

      {/* ================================
          TOAST NOTIFICATIONS
      ================================= */}
      <ToastStack />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===========================================================
  // FIREBASE AUTH SESSION
  // ===========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (currentUser) {
            // =================================================
            // FIREBASE AUTH UID
            // =================================================

            const userRef = doc(
              db,
              "users",
              currentUser.uid
            );

            // =================================================
            // GET FIRESTORE PROFILE
            // =================================================

            const userSnapshot =
              await getDoc(userRef);

            let profileData = {};

            // =================================================
            // EXISTING USER
            // =================================================

            if (userSnapshot.exists()) {
              profileData =
                userSnapshot.data();

              await setDoc(
                userRef,
                {
                  uid: currentUser.uid,

                  name:
                    currentUser.displayName ||
                    profileData.name ||
                    "",

                  email:
                    currentUser.email ||
                    profileData.email ||
                    "",

                  photoURL:
                    currentUser.photoURL ||
                    profileData.photoURL ||
                    "",

                  lastLogin:
                    serverTimestamp(),
                },
                {
                  merge: true,
                }
              );

              console.log(
                "✅ Existing user synced:",
                currentUser.uid
              );

              console.log(
                "✅ Public User ID:",
                profileData.userId ||
                  profileData.username ||
                  "Not set"
              );
            }

            // =================================================
            // FIRESTORE PROFILE DOES NOT EXIST
            // =================================================

            else {
              profileData = {
                uid: currentUser.uid,

                name:
                  currentUser.displayName || "",

                email:
                  currentUser.email || "",

                photoURL:
                  currentUser.photoURL || "",

                userId: "",
                username: "",
              };

              await setDoc(
                userRef,
                {
                  uid: currentUser.uid,

                  name:
                    currentUser.displayName || "",

                  email:
                    currentUser.email || "",

                  photoURL:
                    currentUser.photoURL || "",

                  lastLogin:
                    serverTimestamp(),
                },
                {
                  merge: true,
                }
              );

              console.log(
                "⚠️ Firestore profile created for existing Auth user:",
                currentUser.uid
              );

              console.log(
                "⚠️ This user does not have a public User ID yet."
              );
            }

            // =================================================
            // COMBINE AUTH USER + FIRESTORE PROFILE
            // =================================================

            const combinedUser = {
              ...currentUser,

              // Firebase UID
              id: currentUser.uid,
              uid: currentUser.uid,

              // Public User ID
              userId:
                profileData.userId ||
                profileData.username ||
                "",

              // Backward compatibility
              username:
                profileData.username ||
                profileData.userId ||
                "",

              // Firestore profile
              name:
                profileData.name ||
                currentUser.displayName ||
                "",

              email:
                profileData.email ||
                currentUser.email ||
                "",

              photoURL:
                profileData.photoURL ||
                currentUser.photoURL ||
                "",

              // Keep complete Firestore profile
              ...profileData,

              // Make sure these values win
              id: currentUser.uid,
              uid: currentUser.uid,

              userId:
                profileData.userId ||
                profileData.username ||
                "",

              username:
                profileData.username ||
                profileData.userId ||
                "",
            };

            console.log(
              "👤 App User:",
              combinedUser
            );

            console.log(
              "🆔 Public User ID:",
              combinedUser.userId
            );

            setUser(combinedUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error(
            "Error syncing user data:",
            error
          );

          setUser(currentUser);
        } finally {
          setLoading(false);
        }
      },

      (error) => {
        console.error(
          "Firebase auth error:",
          error
        );

        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ===========================================================
  // LOADING SCREEN
  // ===========================================================

  if (loading) {
    return (
      <LanguageProvider>
        <div className="flex min-h-screen items-center justify-center bg-sky-wash">
          <p className="text-sm text-ink-400">
            Loading WeatherHub...
          </p>
        </div>
      </LanguageProvider>
    );
  }

  // ===========================================================
  // LOGGED OUT
  // ===========================================================

  if (!user) {
    return (
      <LanguageProvider>
        <Login />
      </LanguageProvider>
    );
  }

  // ===========================================================
  // LOGGED IN
  // ===========================================================

  return (
    <LanguageProvider>
      <AppProvider firebaseUser={user}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
}