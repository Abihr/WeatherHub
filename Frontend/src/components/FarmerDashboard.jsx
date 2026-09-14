
import React, { useEffect, useState } from "react";

// Your other imports here...


const FarmerDashboard = () => {
  // Your existing states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Your existing farmerData state
  // const [farmerData, setFarmerData] = useState(...);

  // Your existing other states
  // const [farmerWeather, setFarmerWeather] = useState(...);
  // const [cropRisks, setCropRisks] = useState([]);
  // const [cropRecommendations, setCropRecommendations] = useState([]);

  const fetchFarmerData = async () => {
    setLoading(true);
    setError("");

    try {
      const crops = farmerData.farmDetails.crops.join(",");

      const API_URL = import.meta.env.VITE_API_URL || "";

      const response = await fetch(
        `${API_URL}/api/agriculture?city=Pune&crops=${encodeURIComponent(crops)}`
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          response.ok
            ? "Server returned an invalid response"
            : `Agriculture API error (${response.status}): ${text.slice(0, 150)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to fetch agriculture data"
        );
      }

      setFarmerData((previousData) => ({
        ...previousData,

        farmDetails:
          data.farmDetails || previousData.farmDetails,

        weatherForecast:
          data.weatherForecast ||
          previousData.weatherForecast,

        yieldPrediction:
          data.yieldPrediction ||
          previousData.yieldPrediction,
      }));

      setFarmerWeather(
        data.weatherForecast?.today || null
      );

      setCropRisks(data.cropRisks || []);

      setCropRecommendations(
        data.cropRecommendations || []
      );

      notifyHighSeverityAlerts(
        data.cropRisks || []
      );
    } catch (err) {
      console.error(
        "Farmer dashboard error:",
        err
      );

      setError(
        err.message ||
          "Failed to load farmer weather data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Your existing useEffect, handlers, functions, etc.


  return (
    <div>
      {/* YOUR EXISTING FARMER DASHBOARD UI */}
    </div>
  );
};

export default FarmerDashboard;

