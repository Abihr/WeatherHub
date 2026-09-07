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

    return Response.json({
      location: data.name,
      crop: crop,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].main,
      rainfall: data.rain?.["1h"] || 0,
    });
  } catch (error) {
    console.error("Farmer weather error:", error);

    return Response.json(
      { error: "Failed to fetch farmer weather" },
      { status: 500 }
    );
  }
}