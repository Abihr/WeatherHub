import { useEffect, useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase/firebase";

import { AppProvider } from "./context/AppContext";

import Sidebar from "./components/Sidebar";
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
    <div className="min-h-screen bg-sky-wash flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <div className="animate-page-enter">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/friends" element={<Friends />} />

            <Route
              path="/requests"
              element={<FriendRequests />}
            />

            <Route
              path="/compare"
              element={<Compare />}
            />

            <Route
              path="/map"
              element={<MapPage />}
            />

            <Route
              path="/alerts"
              element={<Alerts />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/blocked"
              element={<BlockedUsers />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/chatbot"
              element={<Chatbot />}
            />

            <Route
              path="/Frontend"
              element={<Chatbot />}
            />

            <Route
              path="/railway-weather"
              element={<RailwayWeather />}
            />

            <Route
              path="/railway"
              element={<RailwayWeather />}
            />

            <Route
              path="/farmer"
              element={<Farmer />}
            />
          </Routes>
        </div>
      </div>

      <BottomNav />

      <ToastStack />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {
      try {
        if (currentUser) {
          // =====================================================
          // FIREBASE AUTH UID
          // =====================================================
          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          // =====================================================
          // GET FIRESTORE PROFILE
          // =====================================================
          const userSnapshot = await getDoc(userRef);

          let profileData = {};

          // =====================================================
          // EXISTING USER
          // =====================================================
          if (userSnapshot.exists()) {
            profileData = userSnapshot.data();

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

                lastLogin: serverTimestamp(),
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

          // =====================================================
          // FIRESTORE PROFILE DOES NOT EXIST
          // =====================================================
          else {
            profileData = {
              uid: currentUser.uid,
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              userId: "",
              username: "",
            };

            await setDoc(
              userRef,
              {
                uid: currentUser.uid,
                name: currentUser.displayName || "",
                email: currentUser.email || "",
                photoURL: currentUser.photoURL || "",
                lastLogin: serverTimestamp(),
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

          // =====================================================
          // IMPORTANT:
          // COMBINE FIREBASE AUTH USER + FIRESTORE PROFILE
          // =====================================================
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

            // Firestore profile data
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

            // Keep complete Firestore profile available
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



  // =====================================================
  // FIREBASE SESSION CHECK
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-wash flex items-center justify-center">
        <p className="text-sm text-ink-400">
          Loading WeatherHub...
        </p>
      </div>
    );
  }

  // =====================================================
  // LOGGED OUT
  // =====================================================

  if (!user) {
    return <Login />;
  }

  // =====================================================
  // LOGGED IN
  // =====================================================

  return (
    <AppProvider firebaseUser={user}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}