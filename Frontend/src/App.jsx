import { useEffect, useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
            <Route path="/requests" element={<FriendRequests />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blocked" element={<BlockedUsers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/Frontend" element={<Chatbot />} />
            <Route
              path="/railway-weather"
              element={<RailwayWeather />}
            />
            <Route
              path="/railway"
              element={<RailwayWeather />}
            />
            <Route path="/farmer" element={<Farmer />} />
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      try {
        if (currentUser) {
          // Firestore document:
          // users/{Firebase Authentication UID}
          const userRef = doc(db, "users", currentUser.uid);

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
            },
          );

          console.log("User data synced to Firestore:", currentUser.uid);
        }
      } catch (error) {
        console.error("Error syncing user data:", error);
      }
    }, (error) => {
      console.error("Firebase auth error:", error);
      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firebase is checking the current login session
  if (loading) {
    return (
      <div className="min-h-screen bg-sky-wash flex items-center justify-center">
        <p className="text-sm text-ink-400">Loading WeatherHub...</p>
      </div>
    );
  }

  // User is logged out
  if (!user) {
    return <Login />;
  }

  // User is logged in
  return (
    <AppProvider firebaseUser={user}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
