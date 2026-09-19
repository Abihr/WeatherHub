import React, { useEffect, useMemo, useState } from "react";
import {
  Sprout,
  Droplets,
  Thermometer,
  Wind,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Tractor,
  CloudRain,
  Sun,
  Cloud,
  RefreshCw,
  Bell,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import {
  getGreeting,
  getGreetingRefreshDelay,
} from "../utils/greeting";

// ============================================================
// LANGUAGE HELPERS
// ============================================================

const localeMap = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
};

const cropTranslationMap = {
  Wheat: {
    en: "Wheat",
    hi: "गेहूँ",
    mr: "गहू",
    ta: "கோதுமை",
    te: "గోధుమ",
    bn: "গম",
  },
  Sugarcane: {
    en: "Sugarcane",
    hi: "गन्ना",
    mr: "ऊस",
    ta: "கரும்பு",
    te: "చెరకు",
    bn: "আখ",
  },
  Cotton: {
    en: "Cotton",
    hi: "कपास",
    mr: "कापूस",
    ta: "பருத்தி",
    te: "పత్తి",
    bn: "তুলা",
  },
};

const conditionTranslationMap = {
  Sunny: "sunny",
  Cloudy: "cloudy",
  Rainy: "rainy",
  Windy: "windy",
  Stormy: "stormy",
  Clear: "clear",
  "Partly Cloudy": "partlyCloudy",
};

const getCropName = (crop, language) => {
  return (
    cropTranslationMap[crop]?.[language] ||
    cropTranslationMap[crop]?.en ||
    crop
  );
};

const getConditionName = (condition, t) => {
  const key = conditionTranslationMap[condition];

  return key && t[key] ? t[key] : condition;
};

const getLocale = (language) => {
  return localeMap[language] || "en-IN";
};

// ============================================================
// RECOMMENDATION ENGINE
// ============================================================

const generateCropRecommendation = (crop, weather, t) => {
  const rainfall = Number(weather?.rainfall || 0);
  const temperature = Number(weather?.temperature || 0);
  const humidity = Number(weather?.humidity || 0);
  const windSpeed = Number(weather?.windSpeed || 0);

  // ----------------------------------------------------------
  // WHEAT
  // ----------------------------------------------------------

  if (crop === "Wheat") {
    if (rainfall > 10) {
      return {
        action: t.checkDrainage,
        message: t.significantRainfall,
        timing: t.next3Days,
        icon: CloudRain,
      };
    }

    if (temperature >= 32) {
      return {
        action: t.monitorField,
        message: t.highTemperatureDetected,
        timing: t.next3Days,
        icon: Thermometer,
      };
    }

    if (humidity >= 80) {
      return {
        action: t.diseaseMonitoring,
        message: t.highHumidityDisease,
        timing: t.next3Days,
        icon: AlertTriangle,
      };
    }

    return {
      action: t.cropMonitoring,
      message: t.suitableWeather,
      timing: t.next5to7Days,
      icon: Sprout,
    };
  }

  // ----------------------------------------------------------
  // SUGARCANE
  // ----------------------------------------------------------

  if (crop === "Sugarcane") {
    if (rainfall > 15) {
      return {
        action: t.checkDrainage,
        message: t.heavyRainfall,
        timing: t.next3Days,
        icon: CloudRain,
      };
    }

    if (temperature >= 35) {
      return {
        action: t.irrigation,
        message: t.highTemperatureWaterRequirement,
        timing: t.next3Days,
        icon: Droplets,
      };
    }

    if (windSpeed >= 25) {
      return {
        action: t.monitorField,
        message: t.higherWind,
        timing: t.next3Days,
        icon: Wind,
      };
    }

    return {
      action: t.cropMonitoring,
      message: t.currentWeatherSuitable,
      timing: t.next5to7Days,
      icon: Sprout,
    };
  }

  // ----------------------------------------------------------
  // COTTON
  // ----------------------------------------------------------

  if (crop === "Cotton") {
    if (rainfall > 10) {
      return {
        action: t.checkDrainage,
        message: t.rainfallDetected,
        timing: t.next3Days,
        icon: CloudRain,
      };
    }

    if (temperature >= 35) {
      return {
        action: t.irrigation,
        message: t.highTemperatureWater,
        timing: t.next3Days,
        icon: Droplets,
      };
    }

    if (humidity >= 80) {
      return {
        action: t.diseaseMonitoring,
        message: t.highHumidityDisease,
        timing: t.next3Days,
        icon: AlertTriangle,
      };
    }

    return {
      action: t.cropMonitoring,
      message: t.favorableWeather,
      timing: t.next5to7Days,
      icon: Sprout,
    };
  }

  // ----------------------------------------------------------
  // DEFAULT
  // ----------------------------------------------------------

  return {
    action: t.monitorField,
    message: t.normalMonitoring,
    timing: t.next5to7Days,
    icon: Sprout,
  };
};

// ============================================================
// WEATHER ICON
// ============================================================

const WeatherIcon = ({ condition, size = 24 }) => {
  if (condition === "Rainy" || condition === "Stormy") {
    return <CloudRain size={size} />;
  }

  if (condition === "Cloudy" || condition === "Partly Cloudy") {
    return <Cloud size={size} />;
  }

  return <Sun size={size} />;
};

// ============================================================
// FARMER DASHBOARD
// ============================================================

export default function Farmer() {
  const { t, language } = useLanguage();

  // ==========================================================
  // DEMO FARM DATA
  // ==========================================================

  const farm = {
    name: "Green Valley Farm",
    location: "Pune, Maharashtra",
    area: "12 Acres",
    soil: "Black Soil",
    crops: ["Wheat", "Sugarcane", "Cotton"],
  };

  const weatherToday = {
    temperature: 32.45,
    humidity: 65,
    rainfall: 0,
    windSpeed: 8,
    condition: "Sunny",
  };

  const weekForecast = [
    {
      day: "Mon",
      temperature: 32,
      rainfall: 0,
      condition: "Sunny",
    },
    {
      day: "Tue",
      temperature: 31,
      rainfall: 4,
      condition: "Partly Cloudy",
    },
    {
      day: "Wed",
      temperature: 30,
      rainfall: 8,
      condition: "Cloudy",
    },
    {
      day: "Thu",
      temperature: 28,
      rainfall: 22,
      condition: "Rainy",
    },
    {
      day: "Fri",
      temperature: 29,
      rainfall: 12,
      condition: "Rainy",
    },
    {
      day: "Sat",
      temperature: 31,
      rainfall: 4,
      condition: "Partly Cloudy",
    },
    {
      day: "Sun",
      temperature: 33,
      rainfall: 0,
      condition: "Sunny",
    },
  ];

  // ==========================================================
  // STATE
  // ==========================================================

  const [refreshing, setRefreshing] = useState(false);

  const [selectedCrop, setSelectedCrop] = useState("All");

  const [completedTasks, setCompletedTasks] = useState([]);

  const [notificationPermission, setNotificationPermission] =
    useState(() => {
      if (typeof Notification === "undefined") {
        return "unsupported";
      }

      return Notification.permission;
    });

  const [currentGreeting, setCurrentGreeting] = useState("");

  // ==========================================================
  // GREETING
  // ==========================================================

  const updateGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setCurrentGreeting(t.greeting_morning || getGreeting());
    } else if (hour < 17) {
      setCurrentGreeting(
        t.greeting_afternoon || getGreeting()
      );
    } else {
      setCurrentGreeting(
        t.greeting_evening || getGreeting()
      );
    }
  };

  useEffect(() => {
    updateGreeting();

    const delay = getGreetingRefreshDelay
      ? getGreetingRefreshDelay()
      : 60000;

    const timer = setTimeout(() => {
      updateGreeting();
    }, delay);

    return () => clearTimeout(timer);
  }, [language]);

  // ==========================================================
  // DATE
  // ==========================================================

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString(getLocale(language), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [language]);

  // ==========================================================
  // WEATHER-BASED ALERTS
  // ==========================================================

  const farmerAlerts = useMemo(() => {
    const alerts = [];

    const {
      temperature,
      humidity,
      rainfall,
      windSpeed,
    } = weatherToday;

    if (rainfall > 10) {
      alerts.push({
        id: "rainfall",
        title: t.heavyRainfall,
        message: t.significantRainfall,
        type: "rain",
        icon: CloudRain,
      });
    }

    if (temperature >= 35) {
      alerts.push({
        id: "temperature",
        title: t.highTemperatureDetected,
        message: t.highTemperatureWater,
        type: "temperature",
        icon: Thermometer,
      });
    }

    if (humidity >= 80) {
      alerts.push({
        id: "humidity",
        title: t.highHumidityDisease,
        message: t.diseaseMonitoring,
        type: "humidity",
        icon: Droplets,
      });
    }

    if (windSpeed >= 25) {
      alerts.push({
        id: "wind",
        title: t.higherWind,
        message: t.monitorField,
        type: "wind",
        icon: Wind,
      });
    }

    return alerts;
  }, [weatherToday, t]);

  // ==========================================================
  // CROP RECOMMENDATIONS
  // ==========================================================

  const cropRecommendations = useMemo(() => {
    return farm.crops.map((crop) => ({
      crop,
      ...generateCropRecommendation(
        crop,
        weatherToday,
        t
      ),
    }));
  }, [t]);

  const visibleRecommendations = useMemo(() => {
    if (selectedCrop === "All") {
      return cropRecommendations;
    }

    return cropRecommendations.filter(
      (item) => item.crop === selectedCrop
    );
  }, [selectedCrop, cropRecommendations]);

  // ==========================================================
  // TASKS
  // ==========================================================

  const tasks = [
    {
      id: "cotton",
      title: t.irrigateCotton,
      icon: Droplets,
    },
    {
      id: "wheat",
      title: t.inspectWheat,
      icon: Sprout,
    },
    {
      id: "sugarcane",
      title: t.reviewSugarcane,
      icon: Tractor,
    },
  ];

  const toggleTask = (id) => {
    setCompletedTasks((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      setNotificationPermission(permission);

      if (permission === "granted") {
        new Notification("WeatherHub", {
          body: t.farmerAlerts,
        });
      }
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );
    }
  };

  // ==========================================================
  // YIELD DATA
  // ==========================================================

  const yieldData = [
    {
      crop: "Wheat",
      current: 92,
      previous: 86,
      unit: "%",
    },
    {
      crop: "Sugarcane",
      current: 88,
      previous: 82,
      unit: "%",
    },
    {
      crop: "Cotton",
      current: 95,
      previous: 89,
      unit: "%",
    },
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-sky-wash">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-4 pb-5 pt-5 sm:px-6 md:pt-8 lg:px-8">
        <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-600">
                <Calendar size={16} />
                <span>{todayDate}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-ink-800 sm:text-3xl">
                {currentGreeting}, Farmer
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-ink-500 sm:text-base">
                {t.farmerSubtitle}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Sprout size={28} />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto w-full max-w-7xl space-y-5 px-4 pb-10 sm:px-6 lg:px-8">
        {/* ====================================================
            DASHBOARD HEADER
        ==================================================== */}

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink-800">
              {t.farmerDashboard}
            </h2>

            <p className="mt-1 text-sm text-ink-500">
              {t.smartWeatherInsights}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-medium text-sky-600 shadow-sm transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? t.refreshing
              : t.refresh}
          </button>
        </section>

        {/* ====================================================
            FARM OVERVIEW
        ==================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Farm */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Sprout size={20} />
              </div>

              <span className="text-xs font-medium text-green-600">
                {t.live}
              </span>
            </div>

            <p className="text-xs font-medium text-ink-400">
              {t.farm}
            </p>

            <h3 className="mt-1 text-base font-bold text-ink-800">
              {farm.name}
            </h3>

            <p className="mt-1 text-xs text-ink-400">
              {farm.location}
            </p>
          </div>

          {/* Farm Area */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp size={20} />
            </div>

            <p className="text-xs font-medium text-ink-400">
              {t.farmArea}
            </p>

            <h3 className="mt-1 text-2xl font-bold text-ink-800">
              {farm.area}
            </h3>

            <p className="mt-1 text-xs text-ink-400">
              {farm.soil}
            </p>
          </div>

          {/* Crops */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sprout size={20} />
            </div>

            <p className="text-xs font-medium text-ink-400">
              {t.activeCrops}
            </p>

            <h3 className="mt-1 text-2xl font-bold text-ink-800">
              {farm.crops.length}
            </h3>

            <p className="mt-1 truncate text-xs text-ink-400">
              {farm.crops
                .map((crop) =>
                  getCropName(crop, language)
                )
                .join(", ")}
            </p>
          </div>

          {/* Weather */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Sun size={20} />
              </div>

              <span className="text-xs font-medium text-green-600">
                {t.live}
              </span>
            </div>

            <p className="text-xs font-medium text-ink-400">
              {t.todaysWeather}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-2xl font-bold text-ink-800">
                {Math.round(
                  weatherToday.temperature
                )}
                °C
              </h3>

              <WeatherIcon
                condition={weatherToday.condition}
                size={22}
              />
            </div>

            <p className="mt-1 text-xs text-ink-400">
              {getConditionName(
                weatherToday.condition,
                t
              )}
            </p>
          </div>
        </section>

        {/* ====================================================
            WEATHER FORECAST
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink-800">
              {t.weatherForecast}
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              {t.sevenDayOutlook}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weekForecast.map((day, index) => {
              const dayKey =
                day.day.toLowerCase();

              const translatedDay =
                t[dayKey] || day.day;

              return (
                <div
                  key={`${day.day}-${index}`}
                  className={`rounded-2xl border p-4 text-center ${
                    index === 0
                      ? "border-sky-200 bg-sky-50"
                      : "border-sky-100 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold text-ink-500">
                    {index === 0
                      ? t.today
                      : translatedDay}
                  </p>

                  <div className="my-3 flex justify-center text-sky-500">
                    <WeatherIcon
                      condition={day.condition}
                      size={25}
                    />
                  </div>

                  <p className="text-lg font-bold text-ink-800">
                    {day.temperature}°C
                  </p>

                  <p className="mt-1 text-xs text-sky-500">
                    {day.rainfall} mm
                  </p>

                  <p className="mt-1 text-[11px] text-ink-400">
                    {getConditionName(
                      day.condition,
                      t
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            PHONE ALERTS
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Bell size={21} />
              </div>

              <div>
                <h2 className="font-bold text-ink-800">
                  {t.phoneAlerts}
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-ink-400">
                  {t.phoneAlertsDescription}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {notificationPermission ===
                "granted" && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-600">
                  <CheckCircle size={16} />
                  {t.alertsEnabled}
                </div>
              )}

              {notificationPermission ===
                "denied" && (
                <div className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600">
                  {t.allowBrowserSettings}
                </div>
              )}

              {notificationPermission ===
                "unsupported" && (
                <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-ink-400">
                  {t.notSupported}
                </div>
              )}

              {notificationPermission ===
                "default" && (
                <button
                  type="button"
                  onClick={
                    enableNotifications
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  <Bell size={16} />
                  {t.enablePhoneAlerts}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            FARMER ALERTS
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink-800">
              {t.farmerAlerts}
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              {t.weatherBasedCropRisks}
            </p>
          </div>

          {farmerAlerts.length === 0 ? (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <h3 className="font-semibold text-green-700">
                    {t.noActiveCropRisks}
                  </h3>

                  <p className="mt-1 text-sm text-green-600">
                    {t.favorableConditions}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {farmerAlerts.map((alert) => {
                const Icon = alert.icon;

                return (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-orange-100 bg-orange-50 p-5"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500">
                        <Icon size={19} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-ink-800">
                          {alert.title}
                        </h3>

                        <p className="mt-1 text-sm text-ink-500">
                          {alert.message}
                        </p>

                        <p className="mt-3 text-xs font-medium text-orange-600">
                          {t.recommendedAction}{" "}
                          {alert.type ===
                            "rain" &&
                            t.checkDrainage}

                          {alert.type ===
                            "temperature" &&
                            t.irrigation}

                          {alert.type ===
                            "humidity" &&
                            t.diseaseMonitoring}

                          {alert.type ===
                            "wind" &&
                            t.monitorField}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================================================
            FIELD CONDITIONS
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink-800">
              {t.fieldConditions}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-sky-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sky-600">
                <Droplets size={18} />
                <span className="text-xs font-medium">
                  {t.humidity}
                </span>
              </div>

              <p className="text-2xl font-bold text-ink-800">
                {weatherToday.humidity}%
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-orange-600">
                <Thermometer size={18} />
                <span className="text-xs font-medium">
                  {t.temperature}
                </span>
              </div>

              <p className="text-2xl font-bold text-ink-800">
                {Math.round(
                  weatherToday.temperature
                )}
                °C
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-600">
                <Wind size={18} />
                <span className="text-xs font-medium">
                  {t.wind}
                </span>
              </div>

              <p className="text-2xl font-bold text-ink-800">
                {weatherToday.windSpeed}
                <span className="ml-1 text-sm font-medium">
                  km/h
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-green-600">
                <CloudRain size={18} />
                <span className="text-xs font-medium">
                  {t.rainfall}
                </span>
              </div>

              <p className="text-2xl font-bold text-ink-800">
                {weatherToday.rainfall}
                <span className="ml-1 text-sm font-medium">
                  mm
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <Sun size={18} />
            <span>
              <strong>
                {t.currentCondition}:
              </strong>{" "}
              {getConditionName(
                weatherToday.condition,
                t
              )}
            </span>
          </div>
        </section>

        {/* ====================================================
            TASK PLANNER
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-800">
                {t.taskPlanner}
              </h2>

              <p className="mt-1 text-sm text-ink-400">
                {completedTasks.length}/{tasks.length}{" "}
                {t.completed}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Calendar size={19} />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;

              const completed =
                completedTasks.includes(task.id);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() =>
                    toggleTask(task.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    completed
                      ? "border-green-100 bg-green-50"
                      : "border-sky-100 bg-white hover:bg-sky-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      completed
                        ? "bg-green-100 text-green-600"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle size={19} />
                    ) : (
                      <Icon size={19} />
                    )}
                  </div>

                  <span
                    className={`flex-1 text-sm font-medium ${
                      completed
                        ? "text-green-700 line-through"
                        : "text-ink-700"
                    }`}
                  >
                    {task.title}
                  </span>

                  {!completed && (
                    <Clock
                      size={17}
                      className="shrink-0 text-ink-300"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            CROP RECOMMENDATIONS
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-800">
                {t.cropRecommendations}
              </h2>

              <p className="mt-1 text-sm text-ink-400">
                {t.suggestedFarmActivities}
              </p>
            </div>

            <select
              value={selectedCrop}
              onChange={(event) =>
                setSelectedCrop(
                  event.target.value
                )
              }
              className="rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              <option value="All">
                {t.allCrops}
              </option>

              {farm.crops.map((crop) => (
                <option
                  key={crop}
                  value={crop}
                >
                  {getCropName(
                    crop,
                    language
                  )}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {visibleRecommendations.map(
              (recommendation) => {
                const Icon =
                  recommendation.icon;

                return (
                  <div
                    key={recommendation.crop}
                    className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                          <Icon size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-ink-800">
                            {getCropName(
                              recommendation.crop,
                              language
                            )}
                          </h3>

                          <p className="text-xs text-ink-400">
                            {
                              recommendation.timing
                            }
                          </p>
                        </div>
                      </div>

                      <Sprout
                        size={18}
                        className="text-green-500"
                      />
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-sky-700">
                        {recommendation.action}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-ink-500">
                        {recommendation.message}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* ====================================================
            YIELD PREDICTION
        ==================================================== */}

        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink-800">
              {t.yieldPrediction}
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              {t.expectedYield}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {yieldData.map((item) => {
              const difference =
                item.current -
                item.previous;

              return (
                <div
                  key={item.crop}
                  className="rounded-2xl border border-sky-100 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink-800">
                      {getCropName(
                        item.crop,
                        language
                      )}
                    </h3>

                    <TrendingUp
                      size={18}
                      className="text-green-600"
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-xs text-ink-400">
                      {t.expectedYield}
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-3xl font-bold text-ink-800">
                        {item.current}
                        {item.unit}
                      </span>

                      <span className="mb-1 text-xs font-semibold text-green-600">
                        +{difference}
                        {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-sky-50 pt-3">
                    <span className="text-xs text-ink-400">
                      {t.lastYear}
                    </span>

                    <span className="text-sm font-semibold text-ink-600">
                      {item.previous}
                      {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}