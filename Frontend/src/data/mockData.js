// Realistic dummy data used to develop the UI before Firebase + weather API
// integration are wired up. Shapes here mirror the Firestore structure
// described in the project spec (users / friendRequests / friends / blockedUsers).

export const currentUser = {
  id: "u_aritra",
  name: "Aritra",
  username: "aritra",
  email: "aritra@example.com",
  photoURL: null,
  location: "Kalyani, West Bengal",
  latitude: 22.9751,
  longitude: 88.4358,
  locationSharing: "approximate", // "off" | "approximate" | "exact"
  weatherSharing: true,
  weather: {
    icon: "partly-cloudy",
    temp: 27,
    condition: "Partly Cloudy",
    feelsLike: 28,
    humidity: 65,
    wind: 10,
    rain: 20,
  },
};

export const weatherIcon = {
  sunny: "☀️",
  "partly-cloudy": "🌤️",
  cloudy: "☁️",
  rain: "🌧️",
  storm: "⛈️",
  clear: "🌙",
};

export const friends = [
  {
    id: "uid_abir",
    name: "Abir Chakraborty",
    username: "abir1234",
    photoURL: null,
    location: "Panihati",
    distanceKm: 12,
    weatherSharing: true,
    locationSharing: "exact",
    weather: {
      icon: "sunny",
      temp: 31,
      condition: "Sunny",
      feelsLike: 34,
      humidity: 72,
      wind: 14,
      rain: 40,
    },
  },
  {
    id: "ui_aritrapatra",
    name: "Aritra Patra",
    username: "aritrapatra1234",
    photoURL: null,
    location: "Ichapur",
    distanceKm: 22,
    weatherSharing: true,
    locationSharing: "approximate",
    weather: {
      icon: "cloudy",
      temp: 25,
      condition: "Cloudy",
      feelsLike: 26,
      humidity: 80,
      wind: 8,
      rain: 55,
    },
  },
  {
    id: "uid_aritrakumar",
    name: "Aritra Kumar Patra",
    username: "aritrakumar1234",
    photoURL: null,
    location: "Barrakpore",
    distanceKm: 158,
    weatherSharing: true,
    locationSharing: "approximate",
    weather: {
      icon: "cloudy",
      temp: 25,
      condition: "Cloudy",
      feelsLike: 26,
      humidity: 80,
      wind: 8,
      rain: 55,
    },
  },
  {
    id: "u_ankona",
    name: "Ankona Bagchi",
    username: "ankonabagchi123",
    photoURL: null,
    location: "Dankuni",
    distanceKm: 1890,
    weatherSharing: true,
    locationSharing: "off",
    weather: {
      icon: "rain",
      temp: 29,
      condition: "Light Rain",
      feelsLike: 33,
      humidity: 88,
      wind: 18,
      rain: 85,
    },
  },
  {
    id: "u_ankona",
    name: "Ankona Bagchi",
    username: "ankonabagchi123",
    photoURL: null,
    location: "Dankuni",
    distanceKm: 1890,
    weatherSharing: true,
    locationSharing: "off",
    weather: {
      icon: "rain",
      temp: 29,
      condition: "Light Rain",
      feelsLike: 33,
      humidity: 88,
      wind: 18,
      rain: 85,
    },
  },
];

export const receivedRequests = [
  {
    requestId: "r1",
    senderId: "u_anushka",
    name: "Anushka Poddar",
    username: "anushka123",
    location: "Ranaghat",
    photoURL: null,
    createdAt: "2026-09-02T10:00:00Z",
  },
];

export const sentRequests = [
  {
    requestId: "r2",
    receiverId: "u_Rabi",
    name: "Rabi Sen",
    username: "rabi123",
    location: "Habra",
    photoURL: null,
    status: "pending",
    createdAt: "2026-09-03T08:30:00Z",
  },
];

export const searchResultsPool = [
  {
    id: "u_neha",
    name: "Neha Kapoor",
    username: "neha.k",
    location: "Delhi",
    photoURL: null,
  },
  {
    id: "u_vikram",
    name: "Vikram Rao",
    username: "vrao",
    location: "Bengaluru",
    photoURL: null,
  },
  ...friends.map((f) => ({ id: f.id, name: f.name, username: f.username, location: f.location, photoURL: f.photoURL })),
];

export const blockedUsers = [
  {
    id: "u_abhisekh",
    name: "Rehman Dakait",
    username: "rehmanbhai",
    location: "Lyari",
    photoURL: null,
  },
];

export const weatherAlerts = [
  {
    id: "a1",
    title: "Heavy rain expected this evening",
    detail: "Rain probability rises to 85% after 6 PM in Kalyani.",
    severity: "moderate",
    time: "2h ago",
  },
  {
    id: "a1",
    title: "Aritra's area: thunderstorm watch",
    detail: "Panihati may see thunderstorms tonight. Shared by Abir.",
    severity: "high",
    time: "5h ago",
  },
  {
    id: "a2",
    title: "Heavy rain expected",
    detail: "Kalyani may experience heavy rainfall during the evening.",
    severity: "medium",
    time: "2h ago",
  },
  {
    id: "a3",
    title: "Strong winds reported",
    detail: "Strong winds have been reported around Barrackpore. Stay alert outdoors.",
    severity: "medium",
    time: "3h ago",
  },
  {
    id: "a4",
    title: "Flooding risk near low-lying areas",
    detail: "Waterlogging may occur in low-lying parts of the area after heavy rain.",
    severity: "high",
    time: "6h ago",
  },
  {
    id: "a5",
    title: "Clear weather ahead",
    detail: "Weather conditions are expected to improve overnight.",
    severity: "low",
    time: "8h ago",
  },
  {
    id: "a6",
    title: "Weather report shared by Aritra Kumar Patra",
    detail: "Light rain has been reported near Bārākpur. Roads may be slippery.",
    severity: "medium",
    time: "1h ago",
  },
];
