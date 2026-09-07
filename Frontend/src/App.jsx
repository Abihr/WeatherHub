import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import RailwayWeather from "./components/RailwayWeather";
import Farmer from "../pages/Farmer"; 

function AppShell() {
  return (
    <div className="min-h-screen bg-sky-wash flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

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
          <Route path="/railway" element={<RailwayWeather />} /> {/* ← ADD THIS ROUTE */}
          <Route path="/farmer" element={<Farmer />} /> {/* ← ADD THIS ROUTE */}
        </Routes>
      </div>

      <BottomNav />
      <ToastStack />
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(true);

  console.log("APP IS RUNNING");

  useEffect(() => {
    console.log("STARTING WEATHER REQUEST");

    fetch("http://localhost:5000/api/weather?city=Kolkata")
      .then((response) => {
        console.log("BACKEND RESPONSE STATUS:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("WEATHER DATA:", data);
      })
      .catch((error) => {
        console.error("WEATHER ERROR:", error);
      });
  }, []);

  if (!authed) {
    return <Login onAuth={() => setAuthed(true)} />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}