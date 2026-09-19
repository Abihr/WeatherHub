import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { weatherAlerts as initialWeatherAlerts } from "../data/mockData";
import * as fs from "../firebase/firestore";
import { getCurrentWeather } from "../services/weatherService";
import { getCurrentPosition } from "../services/locationService";
import { classifySevereWeather } from "../utilities/severeWeather";

const AppContext = createContext(null);

let toastId = 0;

/* ================================================================
   REVERSE GEOCODING
================================================================ */

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

      /* =========================================================
         CURRENT WEATHER
      ========================================================= */

      `&current=` +
      `temperature_2m,` +
      `relative_humidity_2m,` +
      `apparent_temperature,` +
      `weather_code,` +
      `is_day` +

      /* =========================================================
         HOURLY FORECAST
      ========================================================= */

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
      `cape,` +
      `is_day` +

      /* =========================================================
         DAILY FORECAST
      ========================================================= */

      `&daily=` +
      `temperature_2m_max,` +
      `temperature_2m_min,` +
      `rain_sum,` +
      `precipitation_probability_max,` +
      `weather_code`;

    console.log("🌦️ FORECAST REQUEST:", url);

    const response = await fetch(url);

    if (!response.ok) {
      let message = `Forecast API error: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData?.reason) {
          message = errorData.reason;
        }
      } catch {
        // Ignore invalid error body
      }

      throw new Error(message);
    }

    const data = await response.json();

    console.log("🌦️ FORECAST RAW DATA:", data);

    /* ==========================================================
       CURRENT DEBUG
    ========================================================== */

    console.log("🌞 CURRENT OPEN-METEO:", {
      time: data?.current?.time,
      temperature: data?.current?.temperature_2m,
      feelsLike: data?.current?.apparent_temperature,
      humidity: data?.current?.relative_humidity_2m,
      weatherCode: data?.current?.weather_code,
      is_day: data?.current?.is_day,
    });

    return data;
  } catch (error) {
    console.error("❌ getForecast error:", error);
    throw error;
  }
}

/* ================================================================
   PROVIDER
================================================================ */

export function AppProvider({ children, firebaseUser }) {
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

  const [weatherAlerts, setWeatherAlerts] = useState(
    initialWeatherAlerts,
  );

  /* ============================================================
     FORECAST
  ============================================================ */

  const [forecast, setForecast] = useState(null);

  /* ============================================================
     DISASTER NOTIFICATIONS
  ============================================================ */

  const [disasterNotifications, setDisasterNotifications] = useState([]);

  /* ============================================================
     TOAST
  ============================================================ */

  const pushToast = useCallback((message, type = "info") => {
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
        current.filter((toast) => toast.id !== id),
      );
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id),
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
        const userData = await fs.getUser(firebaseUser.uid);

        if (userData) {
          setUser({
            id: firebaseUser.uid,
            ...userData,
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            userId: "",
            username: "",
          });
        }

        console.log("USER DATA LOADED:", firebaseUser.uid);
      } catch (error) {
        console.error("Failed to load user:", error);

        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          userId: "",
          username: "",
        });
      }
    };

    loadUser();
  }, [firebaseUser]);

  /* ============================================================
     REFRESH FRIENDS
  ============================================================ */

  const refreshFriends = useCallback(async () => {
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
        fs.getReceivedRequests(user.id),
        fs.getSentRequests(user.id),
        fs.getBlockedUsers(user.id),
      ]);

      setFriendsList(friendsData || []);
      setReceived(receivedData || []);
      setSent(sentData || []);
      setBlocked(blockedData || []);

      console.log("FRIENDS DATA REFRESHED:", {
        friends: friendsData?.length || 0,
        received: receivedData?.length || 0,
        sent: sentData?.length || 0,
        blocked: blockedData?.length || 0,
      });
    } catch (error) {
      console.error("refreshFriends error:", error);
    }
  }, [user?.id]);

  /* ============================================================
     LOAD FRIEND DATA AFTER USER LOAD
  ============================================================ */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    refreshFriends();
  }, [user?.id, refreshFriends]);

  /* ============================================================
     REAL-TIME FRIEND LISTENER
  ============================================================ */

  useEffect(() => {
    if (!user?.id) {
      setFriendsList([]);
      return;
    }

    console.log(
      "Starting real-time friend listener:",
      user.id,
    );

    const unsubscribe = fs.subscribeToFriends(
      user.id,
      (friends) => {
        const uniqueFriends = Array.from(
          new Map(
            (friends || []).map((friend) => [
              friend.friendId || friend.id,
              friend,
            ]),
          ).values(),
        );

        setFriendsList(uniqueFriends);
      },
    );

    return () => {
      console.log(
        "Stopping real-time friend listener",
      );

      unsubscribe?.();
    };
  }, [user?.id]);

  /* ============================================================
     REAL-TIME DISASTER NOTIFICATIONS
  ============================================================ */

  useEffect(() => {
    if (!user?.id) {
      setDisasterNotifications([]);
      return;
    }

    console.log(
      "Starting disaster notification listener:",
      user.id,
    );

    const unsubscribe = fs.subscribeToNotifications(
      user.id,
      (notifications) => {
        console.log(
          "DISASTER NOTIFICATIONS:",
          notifications,
        );

        setDisasterNotifications(
          notifications || [],
        );
      },
    );

    return () => {
      console.log(
        "Stopping disaster notification listener",
      );

      unsubscribe?.();
    };
  }, [user?.id]);

  /* ============================================================
     LOCATION + WEATHER + FORECAST
  ============================================================ */

  const detectLocation = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLocating(true);

    try {
      /* =================================================
         1. GPS
      ================================================= */

      const position = await getCurrentPosition();

      const { latitude, longitude } = position;

      console.log(
        "📍 GPS LOCATION:",
        latitude,
        longitude,
      );

      /* =================================================
         2. PLACE NAME
      ================================================= */

      const place = await getPlaceName(
        latitude,
        longitude,
      );

      console.log("📍 PLACE:", place);

      const finalLocationName =
        place?.placeName || "";

      const finalCountry =
        place?.country || "";

      /* =================================================
         3. FORECAST
      ================================================= */

      let formattedForecast = null;

      /*
       * IMPORTANT:
       * Keep forecastData outside the inner try block
       * because it is also needed later.
       */

      let forecastData = null;

      try {
        forecastData = await getForecast(
          latitude,
          longitude,
        );

        /* =============================================
           CURRENT OPEN-METEO DATA
        ============================================= */

        const openMeteoCurrent =
          forecastData?.current || {};

        console.log(
          "🌞 OPEN-METEO CURRENT DATA:",
          openMeteoCurrent,
        );

        /* =============================================
           DAILY FORECAST
        ============================================= */

        const daily =
          forecastData?.daily?.time?.map(
            (date, index) => ({
              date,

              minTemp:
                forecastData.daily
                  .temperature_2m_min?.[index] ??
                null,

              maxTemp:
                forecastData.daily
                  .temperature_2m_max?.[index] ??
                null,

              rain:
                forecastData.daily
                  .rain_sum?.[index] ??
                0,

              rainProbability:
                forecastData.daily
                  .precipitation_probability_max?.[
                    index
                  ] ?? 0,

              weatherCode:
                forecastData.daily
                  .weather_code?.[index] ??
                null,
            }),
          ) || [];

        /* =============================================
           HOURLY FORECAST
        ============================================= */

        const hourly =
          forecastData?.hourly?.time?.map(
            (time, index) => {
              const weatherCode =
                forecastData.hourly
                  .weather_code?.[index] ?? 0;

              const rain =
                forecastData.hourly
                  .rain?.[index] ?? 0;

              const showers =
                forecastData.hourly
                  .showers?.[index] ?? 0;

              const precipitation =
                forecastData.hourly
                  .precipitation?.[index] ?? 0;

              const precipitationProbability =
                forecastData.hourly
                  .precipitation_probability?.[
                    index
                  ] ?? 0;

              const cape =
                forecastData.hourly
                  .cape?.[index] ?? 0;

              const windGust =
                forecastData.hourly
                  .wind_gusts_10m?.[index] ?? 0;

              const isDay =
                forecastData.hourly
                  .is_day?.[index] ?? null;

              /* =================================
                 SEVERE WEATHER CLASSIFIER
              ================================= */

              const severeWeather =
                classifySevereWeather({
                  weatherCode,
                  rain,
                  showers,
                  precipitation,
                  precipitationProbability,
                  cape,
                  windGust,
                });

              return {
                time,

                temperature:
                  forecastData.hourly
                    .temperature_2m?.[index] ??
                  null,

                humidity:
                  forecastData.hourly
                    .relative_humidity_2m?.[
                      index
                    ] ?? null,

                rain,
                showers,
                precipitation,

                rainProbability:
                  precipitationProbability,

                weatherCode,

                /* ==============================
                   DAY / NIGHT
                ============================== */

                is_day: isDay,

                cloudCover:
                  forecastData.hourly
                    .cloud_cover?.[index] ??
                  0,

                windSpeed:
                  forecastData.hourly
                    .wind_speed_10m?.[index] ??
                  0,

                windGust,
                cape,
                severeWeather,
              };
            },
          ) || [];

        /* =============================================
           DEBUG — FIRST HOURLY DATA
        ============================================= */

        console.log(
          "🌦️ FIRST HOURLY OBJECT:",
          hourly[0],
        );

        /* =============================================
           DEBUG — DAY/NIGHT
        ============================================= */

        console.log(
          "🌞 HOURLY DAY/NIGHT:",
          hourly.slice(0, 24).map((hour) => ({
            time: hour.time,
            weatherCode: hour.weatherCode,
            is_day: hour.is_day,
          })),
        );

        /* =============================================
           DEBUG — THUNDERSTORM HOURS
        ============================================= */

        console.log(
          "⛈️ THUNDERSTORM HOURS:",
        );

        console.table(
          hourly
            .filter(
              (hour) =>
                hour.weatherCode === 95 ||
                hour.weatherCode === 96 ||
                hour.weatherCode === 99,
            )
            .map((hour) => ({
              time: hour.time,
              weatherCode:
                hour.weatherCode,
              temperature:
                hour.temperature,
              rain: hour.rain,
              precipitation:
                hour.precipitation,
              probability:
                hour.rainProbability,
              cape: hour.cape,
              windGust:
                hour.windGust,
              severeType:
                hour.severeWeather?.type,
              severity:
                hour.severeWeather?.level,
            })),
        );

        /* =============================================
           DEBUG — SEVERE WEATHER
        ============================================= */

        console.log(
          "🌩️ SEVERE WEATHER:",
          hourly
            .filter(
              (hour) =>
                hour.severeWeather?.level !==
                "normal",
            )
            .map((hour) => ({
              time: hour.time,
              weatherCode:
                hour.weatherCode,
              rain: hour.rain,
              showers: hour.showers,
              precipitation:
                hour.precipitation,
              probability:
                hour.rainProbability,
              cape: hour.cape,
              windGust:
                hour.windGust,
              severeWeather:
                hour.severeWeather,
            })),
        );

        /* =============================================
           FORMATTED FORECAST
        ============================================= */

        formattedForecast = {
          location: finalLocationName,
          country: finalCountry,

          latitude,
          longitude,

          timezone:
            forecastData?.timezone ||
            "Asia/Kolkata",

          /* =========================================
             CURRENT
          ========================================= */

          current: {
            temperature:
              openMeteoCurrent
                .temperature_2m ??
              null,

            feelsLike:
              openMeteoCurrent
                .apparent_temperature ??
              null,

            humidity:
              openMeteoCurrent
                .relative_humidity_2m ??
              null,

            weatherCode:
              openMeteoCurrent
                .weather_code ??
              null,

            is_day:
              openMeteoCurrent
                .is_day ??
              null,

            condition: "",
          },

          daily,
          hourly,
        };

        setForecast(formattedForecast);

        console.log(
          "🌦️ FORMATTED FORECAST:",
          formattedForecast,
        );
      } catch (forecastError) {
        console.error(
          "❌ Forecast fetch failed:",
          forecastError,
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
            longitude,
          );

        console.log(
          "🌡️ CURRENT WEATHER:",
          weather,
        );
      } catch (weatherError) {
        console.error(
          "❌ Current weather failed:",
          weatherError,
        );

        pushToast(
          "Forecast loaded, but current weather is unavailable.",
          "error",
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
        const forecastCurrent =
          formattedForecast.current || {};

        formattedForecast = {
          ...formattedForecast,

          location: weatherLocation,
          country: weatherCountry,

          current: {
            temperature:
              weather?.temp ??
              weather?.temperature ??
              forecastCurrent.temperature ??
              null,

            feelsLike:
              weather?.feelsLike ??
              forecastCurrent.feelsLike ??
              null,

            humidity:
              weather?.humidity ??
              forecastCurrent.humidity ??
              null,

            weatherCode:
              weather?.weatherCode ??
              weather?.weather_code ??
              forecastCurrent.weatherCode ??
              null,

            /*
             * IMPORTANT:
             * Preserve Open-Meteo is_day.
             */

            is_day:
              weather?.is_day ??
              weather?.isDay ??
              forecastCurrent.is_day ??
              null,

            condition:
              weather?.condition ??
              "",
          },
        };

        setForecast(formattedForecast);

        console.log(
          "🌦️ UPDATED FORECAST CURRENT:",
          formattedForecast.current,
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
        weatherCountry,
      );

      /* =================================================
         8. SAVE CURRENT WEATHER
      ================================================= */

      const weatherToSave = {
        temperature:
          weather?.temperature ??
          weather?.temp ??
          formattedForecast?.current
            ?.temperature ??
          null,

        condition:
          weather?.condition ??
          formattedForecast?.current
            ?.condition ??
          "",

        feelsLike:
          weather?.feelsLike ??
          formattedForecast?.current
            ?.feelsLike ??
          null,

        humidity:
          weather?.humidity ??
          formattedForecast?.current
            ?.humidity ??
          null,

        wind:
          weather?.wind ??
          null,

        rain:
          weather?.rain ??
          0,

        icon:
          weather?.icon ??
          weather?.openWeatherIcon ??
          "",

        /* =============================================
           WEATHER CODE
        ============================================= */

        weatherCode:
          weather?.weatherCode ??
          weather?.weather_code ??
          forecastData?.current
            ?.weather_code ??
          formattedForecast?.current
            ?.weatherCode ??
          null,

        /* =============================================
           DAY / NIGHT
        ============================================= */

        is_day:
          weather?.is_day ??
          weather?.isDay ??
          forecastData?.current
            ?.is_day ??
          formattedForecast?.current
            ?.is_day ??
          null,

        /* =============================================
           OPENWEATHER ICON
        ============================================= */

        openWeatherIcon:
          weather?.openWeatherIcon ??
          weather?.icon ??
          weather?.weatherIcon ??
          null,

        weatherIcon:
          weather?.weatherIcon ??
          weather?.openWeatherIcon ??
          weather?.icon ??
          null,

        locationName: weatherLocation,
        country: weatherCountry,
      };

      console.log(
        "💾 WEATHER TO SAVE:",
        weatherToSave,
      );

      if (weather || formattedForecast) {
        await fs.updateUserWeather(
          user.id,
          weatherToSave,
        );
      }

      /* =================================================
         9. LOCATION TEXT
      ================================================= */

      const locationText = weatherLocation
        ? `${weatherLocation}${
            weatherCountry
              ? `, ${weatherCountry}`
              : ""
          }`
        : "";

      /* =================================================
         10. UPDATE LOCAL USER
      ================================================= */

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

            city: weatherLocation,
            name: weatherLocation,

            lat: latitude,
            lng: longitude,

            country: weatherCountry,
          },

          locationText,

          ...(weather || formattedForecast
            ? {
                weather: weatherToSave,
              }
            : {}),

          forecast: formattedForecast,
        };
      });

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
        "success",
      );
    } catch (error) {
      console.error(
        "❌ Location/weather error:",
        error,
      );

      let message =
        "Unable to get your location.";

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

  /* ================================================================
     AUTOMATIC LOCATION DETECTION
  ================================================================ */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    detectLocation();
  }, [user?.id, detectLocation]);

  /* ================================================================
     WEATHER ALERTS
  ================================================================ */

  const removeWeatherAlert = useCallback(
    (alertId) => {
      setWeatherAlerts((current) =>
        current.filter(
          (alert) => alert.id !== alertId,
        ),
      );
    },
    [],
  );

  const clearWeatherAlerts =
    useCallback(() => {
      setWeatherAlerts([]);
    }, []);

  /* ================================================================
     DARK MODE
  ================================================================ */

  const toggleDarkMode =
    useCallback(() => {
      setDarkMode((current) => !current);
    }, []);

  /* ================================================================
     SEND FRIEND REQUEST
  ================================================================ */

  const sendRequest = useCallback(
    async (target) => {
      if (!user?.id || !target) {
        return;
      }

      const targetFirebaseUid =
        typeof target === "object"
          ? target?.id
          : target;

      if (!targetFirebaseUid) {
        pushToast(
          "Invalid user selected.",
          "error",
        );

        return;
      }

      console.log(
        "FRIEND REQUEST:",
        {
          senderFirebaseUid:
            user.id,

          receiverFirebaseUid:
            targetFirebaseUid,

          receiverPublicUserId:
            typeof target === "object"
              ? target?.userId
              : undefined,
        },
      );

      try {
        await fs.sendFriendRequest(
          user.id,
          targetFirebaseUid,
        );

        await refreshFriends();

        pushToast(
          "Friend request sent.",
          "success",
        );
      } catch (error) {
        console.error(
          "sendRequest error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to send friend request.",
          "error",
        );
      }
    },
    [
      user?.id,
      refreshFriends,
      pushToast,
    ],
  );

  /* ================================================================
     CANCEL FRIEND REQUEST
  ================================================================ */

  const cancelRequest = useCallback(
    async (requestOrId) => {
      const requestId =
        typeof requestOrId === "object"
          ? requestOrId?.requestId
          : requestOrId;

      if (!requestId) {
        return;
      }

      try {
        await fs.cancelFriendRequest(
          requestId,
        );

        await refreshFriends();

        pushToast(
          "Friend request cancelled.",
          "success",
        );
      } catch (error) {
        console.error(
          "cancelRequest error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to cancel friend request.",
          "error",
        );
      }
    },
    [refreshFriends, pushToast],
  );

  /* ================================================================
     ACCEPT FRIEND REQUEST
  ================================================================ */

  const acceptRequest = useCallback(
    async (
      requestOrId,
      requesterId,
    ) => {
      let requestId = requestOrId;
      let senderId = requesterId;

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
          "error",
        );

        return;
      }

      try {
        await fs.acceptFriendRequest(
          requestId,
          user.id,
          senderId,
        );

        await refreshFriends();

        pushToast(
          "Friend request accepted.",
          "success",
        );
      } catch (error) {
        console.error(
          "acceptRequest error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to accept friend request.",
          "error",
        );
      }
    },
    [
      user?.id,
      refreshFriends,
      pushToast,
    ],
  );

  /* ================================================================
     REJECT FRIEND REQUEST
  ================================================================ */

  const rejectRequest = useCallback(
    async (requestOrId) => {
      const requestId =
        typeof requestOrId === "object"
          ? requestOrId?.requestId
          : requestOrId;

      if (!requestId) {
        return;
      }

      try {
        await fs.rejectFriendRequest(
          requestId,
        );

        await refreshFriends();

        pushToast(
          "Friend request rejected.",
          "success",
        );
      } catch (error) {
        console.error(
          "rejectRequest error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to reject friend request.",
          "error",
        );
      }
    },
    [refreshFriends, pushToast],
  );

  /* ================================================================
     REMOVE FRIEND
  ================================================================ */

  const removeFriend = useCallback(
    async (friendId) => {
      if (!user?.id || !friendId) {
        return;
      }

      try {
        await fs.removeFriend(
          user.id,
          friendId,
        );

        await refreshFriends();

        pushToast(
          "Friend removed.",
          "success",
        );
      } catch (error) {
        console.error(
          "removeFriend error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to remove friend.",
          "error",
        );
      }
    },
    [
      user?.id,
      refreshFriends,
      pushToast,
    ],
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
            targetUserId,
          );

          await refreshFriends();

          pushToast(
            "User blocked.",
            "success",
          );
        } catch (error) {
          console.error(
            "blockUserById error:",
            error,
          );

          pushToast(
            error?.message ||
              "Unable to block user.",
            "error",
          );
        }
      },
      [
        user?.id,
        refreshFriends,
        pushToast,
      ],
    );

  /* ================================================================
     UNBLOCK USER
  ================================================================ */

  const unblockUserById =
    useCallback(
      async (blockIdOrUserId) => {
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
                blockIdOrUserId,
            );

          if (blockedUser?.blockId) {
            blockId =
              blockedUser.blockId;
          }

          await fs.unblockUser(
            blockId,
          );

          await refreshFriends();

          pushToast(
            "User unblocked.",
            "success",
          );
        } catch (error) {
          console.error(
            "unblockUserById error:",
            error,
          );

          pushToast(
            error?.message ||
              "Unable to unblock user.",
            "error",
          );
        }
      },
      [
        user?.id,
        blocked,
        refreshFriends,
        pushToast,
      ],
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
            enabled,
          );

          setUser((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              weatherSharing:
                Boolean(enabled),
            };
          });

          pushToast(
            `Weather sharing ${
              enabled
                ? "enabled"
                : "disabled"
            }.`,
            "success",
          );
        } catch (error) {
          console.error(
            "updateWeatherSharing error:",
            error,
          );

          pushToast(
            error?.message ||
              "Unable to update weather sharing.",
            "error",
          );
        }
      },
      [user?.id, pushToast],
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
            mode,
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
            "Location sharing updated.",
            "success",
          );
        } catch (error) {
          console.error(
            "updateLocationSharing error:",
            error,
          );

          pushToast(
            error?.message ||
              "Unable to update location sharing.",
            "error",
          );
        }
      },
      [user?.id, pushToast],
    );

  /* ================================================================
     DISASTER ALERT CREATION
  ================================================================ */

  const createDisasterAlert =
    useCallback(async (alert) => {
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
    }, []);

  /* ================================================================
     MARK DISASTER NOTIFICATION READ
  ================================================================ */

  const markDisasterNotificationRead =
    useCallback(
      async (notificationId) => {
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

  /* ================================================================
     REMOVE DISASTER NOTIFICATION
  ================================================================ */

  const removeDisasterNotification =
    useCallback(
      async (notificationId) => {
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

  /* ================================================================
     CLEAR DISASTER NOTIFICATIONS
  ================================================================ */

  const clearDisasterNotifications =
    useCallback(async () => {
      if (!user?.id) {
        return;
      }

      try {
        await fs.clearUserNotifications(
          user.id,
        );

        setDisasterNotifications([]);
      } catch (error) {
        console.error(
          "Failed to clear notifications:",
          error,
        );
      }
    }, [user?.id]);

  /* ============================================================
     SEARCH USERS
  ============================================================ */

  const searchUsers = useCallback(
    async (queryText) => {
      if (!queryText?.trim()) {
        return [];
      }

      try {
        const users =
          (await fs.searchUsers(
            queryText,
          )) || [];

        return users.filter(
          (person) =>
            person.id !== user?.id,
        );
      } catch (error) {
        console.error(
          "searchUsers error:",
          error,
        );

        pushToast(
          error?.message ||
            "Unable to search users.",
          "error",
        );

        return [];
      }
    },
    [pushToast, user?.id],
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

    /* Disaster notifications */
    disasterNotifications,
    createDisasterAlert,
    markDisasterNotificationRead,
    removeDisasterNotification,
    clearDisasterNotifications,

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
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider",
    );
  }

  return context;
}

export default AppContext;