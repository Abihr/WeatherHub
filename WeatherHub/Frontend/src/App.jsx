import { Component, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase/firebase";

import { AppProvider } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/Navbar";
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

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("WeatherHub render error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-sky-wash flex items-center justify-center px-6">
        <div className="max-w-md rounded-xl2 bg-white shadow-card p-6 text-center">
          <h1 className="font-display text-xl font-extrabold text-ink-900">
            WeatherHub could not load
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Refresh the page to try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}

function AppShell() {
  return (
    <div className="min-h-screen bg-sky-wash">
      <Navbar />

      <main className="animate-page-enter">
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
          <Route path="/railway-weather" element={<RailwayWeather />} />
          <Route path="/railway" element={<RailwayWeather />} />
          <Route path="/farmer" element={<Farmer />} />
        </Routes>
      </main>

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
        setUser(currentUser);
        setLoading(false);

        try {
          if (currentUser) {
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
              { merge: true },
            );

            console.log("User data synced to Firestore:", currentUser.uid);
          }
        } catch (error) {
          console.error("Error syncing user data:", error);
        }
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setUser(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-wash flex items-center justify-center">
        <p className="text-sm text-ink-400">Loading WeatherHub...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AppProvider firebaseUser={user}>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AppProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}