import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import { getGreeting, getGreetingRefreshDelay } from "../utils/greeting";

// ============================================================
// MOCK DATA
// Things that our backend does NOT provide yet remain here.
// ============================================================

const MOCK_FARMER_DATA = {
  farmDetails: {
    name: "Green Valley Farm",
    location: "Pune, Maharashtra",
    area: "12 Acres",
    soilType: "Black Soil",
    crops: ["Wheat", "Sugarcane", "Cotton"],
  },

  weatherForecast: {
    today: {
      temp: 32.45,
      humidity: 65,
      rainfall: 0,
      windSpeed: 8,
      condition: "Sunny",
    },

    week: [
      {
        day: "Mon",
        temp: 32,
        rain: 0,
        condition: "Sunny",
      },
      {
        day: "Tue",
        temp: 30,
        rain: 5,
        condition: "Partly Cloudy",
      },
      {
        day: "Wed",
        temp: 28,
        rain: 15,
        condition: "Light Rain",
      },
      {
        day: "Thu",
        temp: 26,
        rain: 45,
        condition: "Heavy Rain",
      },
      {
        day: "Fri",
        temp: 27,
        rain: 20,
        condition: "Cloudy",
      },
      {
        day: "Sat",
        temp: 29,
        rain: 0,
        condition: "Sunny",
      },
      {
        day: "Sun",
        temp: 31,
        rain: 0,
        condition: "Sunny",
      },
    ],
  },

  cropRecommendations: [
    {
      crop: "Wheat",
      action: "Sowing",
      timing: "Next 3 days",
      confidence: "85%",
      recommendation: "Good time for sowing as rainfall is expected.",
    },
    {
      crop: "Sugarcane",
      action: "Harvesting",
      timing: "Next 5-7 days",
      confidence: "72%",
      recommendation: "Wait for 2 days. Heavy rain expected on Thursday.",
    },
    {
      crop: "Cotton",
      action: "Irrigation",
      timing: "Today",
      confidence: "90%",
      recommendation: "High temperature. Irrigate today before 10 AM.",
    },
  ],

  yieldPrediction: {
    wheat: {
      predicted: "4.2 tons/acre",
      lastYear: "3.8 tons/acre",
      change: "+10.5%",
    },

    sugarcane: {
      predicted: "42 tons/acre",
      lastYear: "38 tons/acre",
      change: "+10.5%",
    },

    cotton: {
      predicted: "2.8 tons/acre",
      lastYear: "2.5 tons/acre",
      change: "+12%",
    },
  },
};

// ============================================================
// COMPONENT
// ============================================================

const FarmerDashboard = () => {
  // ----------------------------------------------------------
  // Farmer data
  // ----------------------------------------------------------

  const [farmerData, setFarmerData] = useState(MOCK_FARMER_DATA);

  // ----------------------------------------------------------
  // Backend farmer weather/risk data
  // ----------------------------------------------------------

  const [farmerWeather, setFarmerWeather] = useState(null);

  const [cropRisks, setCropRisks] = useState([]);

  // ----------------------------------------------------------
  // REAL CROP RECOMMENDATIONS
  // Starts with mock data until backend data is loaded.
  // ----------------------------------------------------------

  const [cropRecommendations, setCropRecommendations] = useState(
    MOCK_FARMER_DATA.cropRecommendations,
  );

  // ----------------------------------------------------------
  // UI state
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [selectedCrop, setSelectedCrop] = useState("all");

  // ----------------------------------------------------------
  // Task planner
  // ----------------------------------------------------------

  const [tasks, setTasks] = useState([
    {
      id: 1,
      label: "Irrigate cotton before 10 AM",
      crop: "Cotton",
      due: "Today",
      done: false,
    },

    {
      id: 2,
      label: "Inspect wheat for fungal infection",
      crop: "Wheat",
      due: "Today",
      done: false,
    },

    {
      id: 3,
      label: "Review sugarcane harvest timing",
      crop: "Sugarcane",
      due: "Tomorrow",
      done: false,
    },
  ]);

  // ----------------------------------------------------------
  // Greeting
  // ----------------------------------------------------------

  const [currentGreeting, setCurrentGreeting] = useState(getGreeting());

  // ==========================================================
  // WEATHER ICON
  // ==========================================================

  const getWeatherIcon = (condition) => {
    if (!condition) {
      return <Sun size={24} />;
    }

    const normalizedCondition = condition.toLowerCase();

    if (
      normalizedCondition.includes("rain") ||
      normalizedCondition.includes("drizzle") ||
      normalizedCondition.includes("thunder")
    ) {
      return <CloudRain size={24} />;
    }

    if (normalizedCondition.includes("cloud")) {
      return <Cloud size={24} />;
    }

    return <Sun size={24} />;
  };

  // ==========================================================
  // PRIORITY COLOR
  // ==========================================================

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "low":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // ==========================================================
  // CROP RECOMMENDATION ENGINE
  // Generates recommendations from real weather data.
  // ==========================================================

  const generateCropRecommendation = (weather, crop) => {
    if (!weather || !crop) {
      return null;
    }

    const temperature = Number(weather.temperature ?? 0);

    const humidity = Number(weather.humidity ?? 0);

    const rainfall = Number(weather.rainfall ?? 0);

    const windSpeed = Number(weather.windSpeed ?? 0);

    const normalizedCrop = crop.toLowerCase();

    // --------------------------------------------------------
    // WHEAT
    // --------------------------------------------------------

    if (normalizedCrop === "wheat") {
      if (rainfall > 10) {
        return {
          crop,
          action: "Monitor Field",
          timing: "Today",
          confidence: "88%",
          recommendation:
            "Rainfall is present. Avoid unnecessary irrigation and monitor the field for excess moisture.",
        };
      }

      if (temperature >= 30) {
        return {
          crop,
          action: "Irrigation",
          timing: "Today",
          confidence: "86%",
          recommendation:
            "Temperature is relatively high. Check soil moisture and irrigate if the field is dry.",
        };
      }

      return {
        crop,
        action: "Crop Monitoring",
        timing: "Today",
        confidence: "82%",
        recommendation:
          "Current weather conditions are suitable. Continue regular crop monitoring.",
      };
    }

    // --------------------------------------------------------
    // SUGARCANE
    // --------------------------------------------------------

    if (normalizedCrop === "sugarcane") {
      if (rainfall > 20) {
        return {
          crop,
          action: "Check Drainage",
          timing: "Today",
          confidence: "91%",
          recommendation:
            "Heavy rainfall is detected. Check field drainage and avoid additional irrigation.",
        };
      }

      if (temperature >= 35) {
        return {
          crop,
          action: "Irrigation",
          timing: "Today",
          confidence: "87%",
          recommendation:
            "High temperature may increase water demand. Check soil moisture and irrigate if required.",
        };
      }

      return {
        crop,
        action: "Crop Monitoring",
        timing: "Today",
        confidence: "83%",
        recommendation:
          "Weather conditions are currently suitable. Continue normal crop monitoring.",
      };
    }

    // --------------------------------------------------------
    // COTTON
    // --------------------------------------------------------

    if (normalizedCrop === "cotton") {
      if (humidity >= 80) {
        return {
          crop,
          action: "Disease Monitoring",
          timing: "Today",
          confidence: "92%",
          recommendation:
            "High humidity can increase disease risk. Inspect cotton plants for fungal infections and leaf damage.",
        };
      }

      if (temperature >= 35) {
        return {
          crop,
          action: "Irrigation",
          timing: "Today",
          confidence: "89%",
          recommendation:
            "High temperature may increase water requirements. Check soil moisture and irrigate if necessary.",
        };
      }

      if (rainfall > 20) {
        return {
          crop,
          action: "Monitor Drainage",
          timing: "Today",
          confidence: "87%",
          recommendation:
            "Significant rainfall is present. Monitor field drainage and avoid unnecessary irrigation.",
        };
      }

      return {
        crop,
        action: "Crop Monitoring",
        timing: "Today",
        confidence: "84%",
        recommendation:
          "Current weather is favorable. Continue monitoring cotton growth and soil moisture.",
      };
    }

    // --------------------------------------------------------
    // MAIZE
    // --------------------------------------------------------

    if (normalizedCrop === "maize") {
      if (temperature >= 35) {
        return {
          crop,
          action: "Irrigation",
          timing: "Today",
          confidence: "88%",
          recommendation:
            "High temperature may cause increased water demand. Check soil moisture and irrigate if required.",
        };
      }

      if (humidity >= 80) {
        return {
          crop,
          action: "Disease Monitoring",
          timing: "Today",
          confidence: "89%",
          recommendation:
            "High humidity can increase fungal disease risk. Inspect maize leaves and stems.",
        };
      }

      if (rainfall > 20) {
        return {
          crop,
          action: "Check Drainage",
          timing: "Today",
          confidence: "86%",
          recommendation:
            "Heavy rainfall is present. Monitor drainage and avoid additional irrigation.",
        };
      }

      return {
        crop,
        action: "Crop Monitoring",
        timing: "Today",
        confidence: "82%",
        recommendation:
          "Weather conditions are currently suitable for maize. Continue normal monitoring.",
      };
    }

    // --------------------------------------------------------
    // GENERIC FALLBACK
    // --------------------------------------------------------

    if (rainfall > 20) {
      return {
        crop,
        action: "Check Drainage",
        timing: "Today",
        confidence: "80%",
        recommendation:
          "Heavy rainfall detected. Monitor drainage and avoid unnecessary irrigation.",
      };
    }

    if (temperature >= 35) {
      return {
        crop,
        action: "Irrigation",
        timing: "Today",
        confidence: "80%",
        recommendation:
          "High temperature detected. Check soil moisture and irrigate if required.",
      };
    }

    if (windSpeed >= 10) {
      return {
        crop,
        action: "Monitor Field",
        timing: "Today",
        confidence: "75%",
        recommendation:
          "Higher wind speeds are present. Monitor crops for physical damage.",
      };
    }

    return {
      crop,
      action: "Crop Monitoring",
      timing: "Today",
      confidence: "78%",
      recommendation:
        "Current weather conditions look favorable. Continue normal farm monitoring.",
    };
  };

  // ==========================================================
  // FETCH FARMER DATA
  // ==========================================================

  const fetchFarmerData = async () => {
    setLoading(true);
    setError("");

    try {
      const crops = farmerData.farmDetails.crops;

      // ------------------------------------------------------
      // Fetch data for every crop
      // ------------------------------------------------------

      const responses = await Promise.all(
        crops.map(async (crop) => {
          const response = await fetch(
            `/api/farmer?city=Pune&crop=${encodeURIComponent(crop)}`,
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Failed to fetch ${crop} data`);
          }

          return data;
        }),
      );

      // ------------------------------------------------------
      // Use first crop's weather as current farm weather
      // ------------------------------------------------------

      if (responses.length > 0) {
        const firstWeather = responses[0];

        setFarmerWeather(firstWeather);
      }

      // ------------------------------------------------------
      // Combine risks from all crops
      // ------------------------------------------------------

      const combinedRisks = [];

      responses.forEach((data) => {
        if (!data.risks) {
          return;
        }

        data.risks.forEach((risk) => {
          combinedRisks.push({
            ...risk,
            crop: data.crop,
          });
        });
      });

      setCropRisks(combinedRisks);

      // ------------------------------------------------------
      // Generate crop recommendations
      // from real backend weather data
      // ------------------------------------------------------

      const generatedRecommendations = responses
        .map((data) => generateCropRecommendation(data, data.crop))
        .filter(Boolean);

      setCropRecommendations(generatedRecommendations);

      // ------------------------------------------------------
      // Update today's weather in farmerData
      // ------------------------------------------------------

      if (responses.length > 0) {
        const weather = responses[0];

        setFarmerData((previousData) => ({
          ...previousData,

          weatherForecast: {
            ...previousData.weatherForecast,

            today: {
              ...previousData.weatherForecast.today,

              temp: weather.temperature,

              humidity: weather.humidity,

              rainfall: weather.rainfall,

              windSpeed: weather.windSpeed,

              condition: weather.condition,
            },
          },
        }));
      }
    } catch (err) {
      console.error("Farmer dashboard error:", err);

      setError(err.message || "Failed to load farmer weather data.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // REFRESH BUTTON
  // ==========================================================

  const refreshData = () => {
    fetchFarmerData();
  };

  // ==========================================================
  // FILTER RECOMMENDATIONS
  // ==========================================================

  const filteredRecommendations =
    selectedCrop === "all"
      ? cropRecommendations
      : cropRecommendations.filter(
          (recommendation) => recommendation.crop === selectedCrop,
        );

  // ==========================================================
  // FILTER RISKS
  // ==========================================================

  const filteredRisks =
    selectedCrop === "all"
      ? cropRisks
      : cropRisks.filter((risk) => risk.crop === selectedCrop);

  // ==========================================================
  // TASK TOGGLE
  // ==========================================================

  const toggleTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              done: !task.done,
            }
          : task,
      ),
    );
  };

  // ==========================================================
  // COMPLETED TASKS
  // ==========================================================

  const completedTasks = tasks.filter((task) => task.done).length;

  // ==========================================================
  // GREETING REFRESH
  // ==========================================================

  useEffect(() => {
    let timeoutId;

    const updateGreeting = () => {
      setCurrentGreeting(getGreeting());

      timeoutId = setTimeout(updateGreeting, getGreetingRefreshDelay());
    };

    timeoutId = setTimeout(updateGreeting, getGreetingRefreshDelay());

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // ==========================================================
  // INITIAL API CALL
  // ==========================================================

  useEffect(() => {
    fetchFarmerData();
  }, []);

  // ==========================================================
  // CREATE ALERTS FROM RISKS
  // ==========================================================

  const generatedAlerts = filteredRisks.map((risk, index) => ({
    id: index,

    type: risk.type,

    message: risk.message,

    priority: risk.severity,

    action: risk.action,

    crop: risk.crop,
  }));

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-ink-50/50 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="mb-8">
        <p className="text-sm text-ink-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h2 className="text-3xl font-bold text-ink-800 mt-1">
          {currentGreeting}, Farmer
        </h2>

        <p className="mt-1 text-sm text-ink-500">
          Here is your farm plan and weather outlook.
        </p>
      </section>

      {/* =====================================================
          DASHBOARD HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink-800">Farmer Dashboard</h2>

          <p className="text-sm text-ink-500 mt-1">
            Smart weather insights for your farm
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={loading}
          className="
            flex
            items-center
            justify-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-white
            border
            border-slate-200
            text-sm
            font-medium
            text-ink-700
            hover:bg-slate-50
            disabled:opacity-50
            transition
          "
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="
          mb-6
          p-4
          rounded-xl
          border
          border-red-200
          bg-red-50
          text-red-700
          text-sm
        "
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5" />

            <div>
              <p className="font-semibold">Unable to load farmer data</p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FARM OVERVIEW
      ====================================================== */}

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
        mb-8
      "
      >
        {/* FARM NAME */}

        <div
          className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          p-5
          shadow-sm
        "
        >
          <div
            className="
            flex
            items-center
            justify-between
            mb-4
          "
          >
            <div
              className="
              w-10
              h-10
              rounded-xl
              bg-green-100
              flex
              items-center
              justify-center
            "
            >
              <Sprout size={20} className="text-green-600" />
            </div>
          </div>

          <p className="text-xs text-ink-400">Farm</p>

          <h3
            className="
            text-lg
            font-semibold
            text-ink-800
            mt-1
          "
          >
            {farmerData.farmDetails.name}
          </h3>

          <p
            className="
            text-xs
            text-ink-500
            mt-1
          "
          >
            {farmerData.farmDetails.location}
          </p>
        </div>

        {/* AREA */}

        <div
          className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          p-5
          shadow-sm
        "
        >
          <div
            className="
            w-10
            h-10
            rounded-xl
            bg-blue-100
            flex
            items-center
            justify-center
            mb-4
          "
          >
            <Tractor size={20} className="text-blue-600" />
          </div>

          <p className="text-xs text-ink-400">Farm Area</p>

          <h3
            className="
            text-lg
            font-semibold
            text-ink-800
            mt-1
          "
          >
            {farmerData.farmDetails.area}
          </h3>

          <p
            className="
            text-xs
            text-ink-500
            mt-1
          "
          >
            {farmerData.farmDetails.soilType}
          </p>
        </div>

        {/* CROPS */}

        <div
          className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          p-5
          shadow-sm
        "
        >
          <div
            className="
            w-10
            h-10
            rounded-xl
            bg-emerald-100
            flex
            items-center
            justify-center
            mb-4
          "
          >
            <Sprout size={20} className="text-emerald-600" />
          </div>

          <p className="text-xs text-ink-400">Active Crops</p>

          <h3
            className="
            text-lg
            font-semibold
            text-ink-800
            mt-1
          "
          >
            {farmerData.farmDetails.crops.length}
          </h3>

          <p
            className="
            text-xs
            text-ink-500
            mt-1
          "
          >
            {farmerData.farmDetails.crops.join(", ")}
          </p>
        </div>

        {/* TODAY WEATHER */}

        <div
          className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          p-5
          shadow-sm
        "
        >
          <div
            className="
            flex
            items-center
            justify-between
            mb-4
          "
          >
            <div
              className="
              w-10
              h-10
              rounded-xl
              bg-orange-100
              flex
              items-center
              justify-center
            "
            >
              {getWeatherIcon(farmerData.weatherForecast.today.condition)}
            </div>

            <span
              className="
              text-xs
              font-medium
              text-green-600
            "
            >
              Live
            </span>
          </div>

          <p className="text-xs text-ink-400">Today's Weather</p>

          <h3
            className="
            text-2xl
            font-bold
            text-ink-800
            mt-1
          "
          >
            {Math.round(farmerData.weatherForecast.today.temp)} °C
          </h3>

          <p
            className="
            text-xs
            text-ink-500
            mt-1
          "
          >
            {farmerData.weatherForecast.today.condition}
          </p>
        </div>
      </div>

      {/* =====================================================
          WEATHER FORECAST
      ====================================================== */}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="
              text-xl
              font-bold
              text-ink-800
            "
            >
              Weather Forecast
            </h3>

            <p
              className="
              text-sm
              text-ink-500
              mt-1
            "
            >
              Seven-day weather outlook
            </p>
          </div>
        </div>

        <div
          className="
          grid
          grid-cols-2
          sm:grid-cols-4
          lg:grid-cols-7
          gap-3
        "
        >
          {farmerData.weatherForecast.week.map((day, index) => (
            <div
              key={index}
              className="
                  bg-white
                  rounded-2xl
                  border
                  border-slate-100
                  p-4
                  text-center
                  shadow-sm
                "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-ink-500
                "
              >
                {day.day}
              </p>

              <div
                className="
                  flex
                  justify-center
                  my-4
                  text-sky-500
                "
              >
                {getWeatherIcon(day.condition)}
              </div>

              <p
                className="
                  text-lg
                  font-bold
                  text-ink-800
                "
              >
                {day.temp}°C
              </p>

              <p
                className="
                  text-xs
                  text-sky-600
                  mt-1
                "
              >
                {day.rain} mm
              </p>

              <p
                className="
                  text-[11px]
                  text-ink-400
                  mt-1
                "
              >
                {day.condition}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="
              text-xl
              font-bold
              text-ink-800
            "
            >
              Farmer Alerts
            </h3>

            <p
              className="
              text-sm
              text-ink-500
              mt-1
            "
            >
              Weather-based crop risks
            </p>
          </div>

          <AlertTriangle size={20} className="text-orange-500" />
        </div>

        {loading && cropRisks.length === 0 ? (
          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-6
            text-center
            text-sm
            text-ink-500
          "
          >
            Loading farmer alerts...
          </div>
        ) : generatedAlerts.length === 0 ? (
          <div
            className="
            bg-white
            rounded-2xl
            border
            border-green-200
            p-6
            flex
            items-center
            gap-3
          "
          >
            <CheckCircle size={22} className="text-green-600" />

            <div>
              <p
                className="
                font-semibold
                text-green-700
              "
              >
                No active crop risks
              </p>

              <p
                className="
                text-sm
                text-ink-500
                mt-1
              "
              >
                Current weather conditions look favorable.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-100
                    p-5
                    shadow-sm
                  "
              >
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-orange-100
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >
                      <AlertTriangle size={20} className="text-orange-600" />
                    </div>

                    <div>
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <h4
                          className="
                            font-semibold
                            text-ink-800
                          "
                        >
                          {alert.type}
                        </h4>

                        <span
                          className="
                            text-xs
                            px-2
                            py-1
                            rounded-full
                            bg-green-50
                            text-green-700
                          "
                        >
                          {alert.crop}
                        </span>
                      </div>

                      <p
                        className="
                          text-sm
                          text-ink-600
                          mt-1
                        "
                      >
                        {alert.message}
                      </p>

                      {alert.action && (
                        <p
                          className="
                            text-xs
                            text-ink-500
                            mt-2
                          "
                        >
                          <strong>Recommended action:</strong> {alert.action}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      px-3
                      py-1
                      rounded-full
                      border
                      text-xs
                      font-medium
                      ${getPriorityColor(alert.priority)}
                    `}
                  >
                    {alert.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FIELD CONDITIONS + TASK PLANNER
      ====================================================== */}

      <div
        className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
        mb-8
      "
      >
        {/* FIELD CONDITIONS */}

        <section>
          <h3
            className="
            text-xl
            font-bold
            text-ink-800
            mb-4
          "
          >
            Field Conditions
          </h3>

          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-5
            shadow-sm
          "
          >
            <div
              className="
              grid
              grid-cols-2
              gap-4
            "
            >
              {/* HUMIDITY */}

              <div
                className="
                rounded-xl
                bg-sky-50
                p-4
              "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-sky-600
                  mb-2
                "
                >
                  <Droplets size={18} />

                  <span className="text-xs">Humidity</span>
                </div>

                <p
                  className="
                  text-xl
                  font-bold
                  text-ink-800
                "
                >
                  {farmerWeather?.humidity ??
                    farmerData.weatherForecast.today.humidity}
                  %
                </p>
              </div>

              {/* TEMPERATURE */}

              <div
                className="
                rounded-xl
                bg-orange-50
                p-4
              "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-orange-600
                  mb-2
                "
                >
                  <Thermometer size={18} />

                  <span className="text-xs">Temperature</span>
                </div>

                <p
                  className="
                  text-xl
                  font-bold
                  text-ink-800
                "
                >
                  {Math.round(
                    farmerWeather?.temperature ??
                      farmerData.weatherForecast.today.temp,
                  )}{" "}
                  °C
                </p>
              </div>

              {/* WIND */}

              <div
                className="
                rounded-xl
                bg-slate-50
                p-4
              "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-slate-600
                  mb-2
                "
                >
                  <Wind size={18} />

                  <span className="text-xs">Wind</span>
                </div>

                <p
                  className="
                  text-xl
                  font-bold
                  text-ink-800
                "
                >
                  {farmerWeather?.windSpeed ??
                    farmerData.weatherForecast.today.windSpeed}
                  m/s
                </p>
              </div>

              {/* RAINFALL */}

              <div
                className="
                rounded-xl
                bg-blue-50
                p-4
              "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-blue-600
                  mb-2
                "
                >
                  <CloudRain size={18} />

                  <span className="text-xs">Rainfall</span>
                </div>

                <p
                  className="
                  text-xl
                  font-bold
                  text-ink-800
                "
                >
                  {farmerWeather?.rainfall ??
                    farmerData.weatherForecast.today.rainfall}
                  mm
                </p>
              </div>
            </div>

            <div
              className="
              mt-4
              p-4
              rounded-xl
              bg-green-50
              border
              border-green-100
            "
            >
              <p
                className="
                text-sm
                font-medium
                text-green-700
              "
              >
                Current condition
              </p>

              <p
                className="
                text-xs
                text-green-600
                mt-1
              "
              >
                {farmerWeather?.condition ??
                  farmerData.weatherForecast.today.condition}
              </p>
            </div>
          </div>
        </section>

        {/* TASK PLANNER */}

        <section>
          <div
            className="
            flex
            items-center
            justify-between
            mb-4
          "
          >
            <h3
              className="
              text-xl
              font-bold
              text-ink-800
            "
            >
              Task Planner
            </h3>

            <span
              className="
              text-xs
              font-medium
              text-green-600
            "
            >
              {completedTasks}/{tasks.length} completed
            </span>
          </div>

          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-5
            shadow-sm
          "
          >
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-xl
                    border
                    transition
                    ${
                      task.done
                        ? "bg-green-50 border-green-100"
                        : "bg-slate-50 border-slate-100"
                    }
                  `}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.done ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Clock size={20} className="text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p
                      className={`
                      text-sm
                      font-medium
                      ${
                        task.done
                          ? "text-green-700 line-through"
                          : "text-ink-700"
                      }
                    `}
                    >
                      {task.label}
                    </p>

                    <div
                      className="
                      flex
                      items-center
                      gap-2
                      mt-1
                    "
                    >
                      <span
                        className="
                        text-[11px]
                        text-ink-400
                      "
                      >
                        {task.crop}
                      </span>

                      <span
                        className="
                        text-[11px]
                        text-ink-400
                      "
                      >
                        •
                      </span>

                      <span
                        className="
                        text-[11px]
                        text-ink-400
                      "
                      >
                        {task.due}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          CROP RECOMMENDATIONS
      ====================================================== */}

      <section className="mb-8">
        <div
          className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          mb-4
        "
        >
          <div>
            <h3
              className="
              text-xl
              font-bold
              text-ink-800
            "
            >
              Crop Recommendations
            </h3>

            <p
              className="
              text-sm
              text-ink-500
              mt-1
            "
            >
              Suggested farm activities
            </p>
          </div>

          {/* CROP FILTER */}

          <div
            className="
            flex
            flex-wrap
            gap-2
          "
          >
            <button
              onClick={() => setSelectedCrop("all")}
              className={`
                px-3
                py-1.5
                rounded-lg
                text-xs
                font-medium
                transition
                ${
                  selectedCrop === "all"
                    ? "bg-green-600 text-white"
                    : "bg-white text-ink-600 border border-slate-200"
                }
              `}
            >
              All Crops
            </button>

            {farmerData.farmDetails.crops.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-medium
                    transition
                    ${
                      selectedCrop === crop
                        ? "bg-green-600 text-white"
                        : "bg-white text-ink-600 border border-slate-200"
                    }
                  `}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-4
        "
        >
          {filteredRecommendations.map((recommendation, index) => (
            <div
              key={index}
              className="
                  bg-white
                  rounded-2xl
                  border
                  border-slate-100
                  p-5
                  shadow-sm
                "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      text-ink-400
                    "
                  >
                    {recommendation.crop}
                  </p>

                  <h4
                    className="
                      text-lg
                      font-semibold
                      text-ink-800
                      mt-1
                    "
                  >
                    {recommendation.action}
                  </h4>
                </div>

                <span
                  className="
                    text-xs
                    font-semibold
                    text-green-600
                    bg-green-50
                    px-2
                    py-1
                    rounded-full
                  "
                >
                  {recommendation.confidence}
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-4
                  text-xs
                  text-ink-500
                "
              >
                <Calendar size={14} />

                {recommendation.timing}
              </div>

              <p
                className="
                  text-sm
                  text-ink-600
                  mt-3
                  leading-relaxed
                "
              >
                {recommendation.recommendation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          YIELD PREDICTION
      ====================================================== */}

      <section>
        <div className="mb-4">
          <h3
            className="
            text-xl
            font-bold
            text-ink-800
          "
          >
            Yield Prediction
          </h3>

          <p
            className="
            text-sm
            text-ink-500
            mt-1
          "
          >
            Expected yield compared with last year
          </p>
        </div>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
        >
          {/* WHEAT */}

          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-5
            shadow-sm
          "
          >
            <div
              className="
              flex
              items-center
              gap-2
              mb-4
            "
            >
              <Sprout size={18} className="text-green-600" />

              <h4
                className="
                font-semibold
                text-ink-800
              "
              >
                Wheat
              </h4>
            </div>

            <p
              className="
              text-2xl
              font-bold
              text-ink-800
            "
            >
              {farmerData.yieldPrediction.wheat.predicted}
            </p>

            <p
              className="
              text-xs
              text-ink-400
              mt-1
            "
            >
              Last year: {farmerData.yieldPrediction.wheat.lastYear}
            </p>

            <div
              className="
              flex
              items-center
              gap-1
              mt-3
              text-green-600
              text-sm
              font-medium
            "
            >
              <TrendingUp size={16} />

              {farmerData.yieldPrediction.wheat.change}
            </div>
          </div>

          {/* SUGARCANE */}

          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-5
            shadow-sm
          "
          >
            <div
              className="
              flex
              items-center
              gap-2
              mb-4
            "
            >
              <Sprout size={18} className="text-green-600" />

              <h4
                className="
                font-semibold
                text-ink-800
              "
              >
                Sugarcane
              </h4>
            </div>

            <p
              className="
              text-2xl
              font-bold
              text-ink-800
            "
            >
              {farmerData.yieldPrediction.sugarcane.predicted}
            </p>

            <p
              className="
              text-xs
              text-ink-400
              mt-1
            "
            >
              Last year: {farmerData.yieldPrediction.sugarcane.lastYear}
            </p>

            <div
              className="
              flex
              items-center
              gap-1
              mt-3
              text-green-600
              text-sm
              font-medium
            "
            >
              <TrendingUp size={16} />

              {farmerData.yieldPrediction.sugarcane.change}
            </div>
          </div>

          {/* COTTON */}

          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            p-5
            shadow-sm
          "
          >
            <div
              className="
              flex
              items-center
              gap-2
              mb-4
            "
            >
              <Sprout size={18} className="text-green-600" />

              <h4
                className="
                font-semibold
                text-ink-800
              "
              >
                Cotton
              </h4>
            </div>

            <p
              className="
              text-2xl
              font-bold
              text-ink-800
            "
            >
              {farmerData.yieldPrediction.cotton.predicted}
            </p>

            <p
              className="
              text-xs
              text-ink-400
              mt-1
            "
            >
              Last year: {farmerData.yieldPrediction.cotton.lastYear}
            </p>

            <div
              className="
              flex
              items-center
              gap-1
              mt-3
              text-green-600
              text-sm
              font-medium
            "
            >
              <TrendingUp size={16} />

              {farmerData.yieldPrediction.cotton.change}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboard;
