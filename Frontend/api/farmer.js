export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get("city");
  const crop = searchParams.get("crop");

  if (!city || !crop) {
    return Response.json(
      { error: "City and crop are required" },
      { status: 400 }
    );
  }

  try {
    // --------------------------------
    // 1. Fetch current weather
    // --------------------------------

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}` +
      `&appid=${process.env.WEATHER_API_KEY}` +
      `&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.message || "Weather API request failed" },
        { status: response.status }
      );
    }

    // --------------------------------
    // 2. Extract weather values
    // --------------------------------

    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const rainfall = data.rain?.["1h"] || 0;

    // --------------------------------
    // 3. Crop Risk Engine
    // --------------------------------

    const risks = [];

    const normalizedCrop = crop.toLowerCase();

    // ================================
    // WHEAT
    // ================================

    if (normalizedCrop === "wheat") {
      if (humidity >= 80) {
        risks.push({
          type: "Disease Risk",
          severity: "Medium",
          message: "High humidity may increase fungal disease risk in wheat.",
          action: "Inspect crops for signs of fungal infection."
        });
      }

      if (rainfall >= 25) {
        risks.push({
          type: "Heavy Rain",
          severity: "High",
          message: "Heavy rainfall may affect wheat fields.",
          action: "Avoid unnecessary irrigation and monitor field drainage."
        });
      }

      if (temperature >= 35) {
        risks.push({
          type: "Heat Stress",
          severity: "High",
          message: "High temperature may cause heat stress in wheat.",
          action: "Monitor soil moisture and provide irrigation if required."
        });
      }

      if (windSpeed >= 10) {
        risks.push({
          type: "Strong Wind",
          severity: "Medium",
          message: "Strong winds may damage wheat crops.",
          action: "Inspect crops for lodging or physical damage."
        });
      }
    }

    // ================================
    // RICE
    // ================================

    else if (normalizedCrop === "rice") {
      if (rainfall >= 25) {
        risks.push({
          type: "Heavy Rain",
          severity: "High",
          message: "Heavy rainfall may cause waterlogging in rice fields.",
          action: "Check field drainage and water levels."
        });
      }

      if (humidity >= 85) {
        risks.push({
          type: "Disease Risk",
          severity: "Medium",
          message: "Very high humidity may increase fungal disease risk.",
          action: "Monitor leaves and stems for disease symptoms."
        });
      }

      if (temperature >= 35) {
        risks.push({
          type: "Heat Stress",
          severity: "Medium",
          message: "High temperature may increase water demand in rice.",
          action: "Monitor field water levels carefully."
        });
      }
    }

    // ================================
    // COTTON
    // ================================

    else if (normalizedCrop === "cotton") {
      if (rainfall >= 25) {
        risks.push({
          type: "Heavy Rain",
          severity: "High",
          message: "Heavy rainfall may cause waterlogging in cotton fields.",
          action: "Check drainage and avoid additional irrigation."
        });
      }

      if (humidity >= 80) {
        risks.push({
          type: "Pest & Disease Risk",
          severity: "Medium",
          message: "High humidity can increase pest and fungal disease risk.",
          action: "Inspect plants regularly for pests and fungal symptoms."
        });
      }

      if (temperature >= 35) {
        risks.push({
          type: "Heat Stress",
          severity: "High",
          message: "High temperature may increase water requirements.",
          action: "Monitor soil moisture and consider irrigation."
        });
      }

      if (windSpeed >= 12) {
        risks.push({
          type: "Strong Wind",
          severity: "Medium",
          message: "Strong winds may damage cotton plants.",
          action: "Inspect plants for physical damage."
        });
      }
    }

    // ================================
    // SUGARCANE
    // ================================

    else if (normalizedCrop === "sugarcane") {
      if (rainfall >= 30) {
        risks.push({
          type: "Heavy Rain",
          severity: "High",
          message: "Heavy rainfall may create waterlogging conditions.",
          action: "Check drainage and consider delaying field operations."
        });
      }

      if (temperature >= 35) {
        risks.push({
          type: "Heat Stress",
          severity: "Medium",
          message: "High temperature may increase sugarcane water demand.",
          action: "Monitor soil moisture and irrigation requirements."
        });
      }

      if (windSpeed >= 12) {
        risks.push({
          type: "Strong Wind",
          severity: "Medium",
          message: "Strong winds may cause sugarcane lodging.",
          action: "Inspect fields for leaning or damaged plants."
        });
      }
    }

    // ================================
    // MAIZE
    // ================================

    else if (normalizedCrop === "maize") {
      if (rainfall >= 25) {
        risks.push({
          type: "Heavy Rain",
          severity: "High",
          message: "Heavy rainfall may cause waterlogging in maize fields.",
          action: "Check drainage and avoid unnecessary irrigation."
        });
      }

      if (temperature >= 35) {
        risks.push({
          type: "Heat Stress",
          severity: "High",
          message: "High temperature may cause heat stress in maize.",
          action: "Monitor soil moisture and irrigation requirements."
        });
      }

      if (humidity >= 80) {
        risks.push({
          type: "Disease Risk",
          severity: "Medium",
          message: "High humidity may increase fungal disease risk.",
          action: "Inspect leaves for fungal infection."
        });
      }

      if (windSpeed >= 12) {
        risks.push({
          type: "Strong Wind",
          severity: "Medium",
          message: "Strong winds may cause maize plants to bend or break.",
          action: "Inspect the crop for lodging."
        });
      }
    }

    // --------------------------------
    // 4. No-risk condition
    // --------------------------------

    if (risks.length === 0) {
      risks.push({
        type: "Weather Status",
        severity: "Low",
        message: `Current weather conditions look favorable for ${crop}.`,
        action: "Continue normal farm monitoring."
      });
    }

    // --------------------------------
    // 5. Return response
    // --------------------------------

    return Response.json({
      // Existing API response
      location: data.name,
      crop: crop,
      temperature: temperature,
      feelsLike: data.main.feels_like,
      humidity: humidity,
      windSpeed: windSpeed,
      condition: data.weather[0].main,
      rainfall: rainfall,

      // New farmer intelligence
      risks: risks
    });

  } catch (error) {
    console.error("Farmer weather error:", error);

    return Response.json(
      { error: "Failed to fetch farmer weather" },
      { status: 500 }
    );
  }
}