const STATIONS = [
    {
        id: "1",
        name: "Mumbai Central",
        code: "BCT",
        zone: "Western",
        city: "Mumbai",
        latitude: 18.9696,
        longitude: 72.8194,
    },
    {
        id: "2",
        name: "Delhi Junction",
        code: "DLI",
        zone: "Northern",
        city: "Delhi",
        latitude: 28.6448,
        longitude: 77.2167,
    },
    {
        id: "3",
        name: "Kolkata Howrah",
        code: "HWH",
        zone: "Eastern",
        city: "Kolkata",
        latitude: 22.5839,
        longitude: 88.3426,
    },
    {
        id: "4",
        name: "Chennai Central",
        code: "MAS",
        zone: "Southern",
        city: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
    },
    {
        id: "5",
        name: "Surat",
        code: "ST",
        zone: "Western",
        city: "Surat",
        latitude: 21.2049,
        longitude: 72.8401,
    },
    {
        id: "6",
        name: "Patna Junction",
        code: "PNBE",
        zone: "East Central",
        city: "Patna",
        latitude: 25.5941,
        longitude: 85.1376,
    },
    {
        id: "7",
        name: "Lucknow Charbagh",
        code: "LKO",
        zone: "Northern",
        city: "Lucknow",
        latitude: 26.8320,
        longitude: 80.9215,
    },
];

function getWeatherStatus(rainfall, windSpeed) {
    if (rainfall >= 50 || windSpeed >= 50) {
        return "Critical";
    }

    if (rainfall >= 25 || windSpeed >= 35) {
        return "Alert";
    }

    if (rainfall >= 10 || windSpeed >= 25) {
        return "Caution";
    }

    return "Safe";
}

export async function GET() {
    try {
        const results = await Promise.all(
            STATIONS.map(async (station) => {
                const url =
                    `https://api.openweathermap.org/data/2.5/weather` +
                    `?q=${encodeURIComponent(station.city)},IN` +
                    `&appid=${process.env.WEATHER_API_KEY}` +
                    `&units=metric`;

                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        `${station.city}: ${
                            data.message || "Weather API request failed"
                        }`
                    );
                }

                const rainfall =
                    data.rain?.["1h"] ??
                    data.rain?.["3h"] ??
                    0;

                const windSpeed = Math.round(
                    (data.wind?.speed ?? 0) * 3.6
                );

                const temperature = Math.round(
                    data.main?.temp ?? 0
                );

                const humidity =
                    data.main?.humidity ?? 0;

                const weatherStatus = getWeatherStatus(
                    rainfall,
                    windSpeed
                );

                return {
                    id: station.id,
                    stationName: station.name,
                    stationCode: station.code,
                    zone: station.zone,
                    city: station.city,

                    // Station coordinates for nearby-station filtering
                    latitude: station.latitude,
                    longitude: station.longitude,

                    // Live weather data
                    weatherStatus,
                    temperature,
                    humidity,
                    rainfall,
                    windSpeed,

                    lastUpdated: new Date().toISOString(),

                    // Railway operational data
                    // Will be connected to real railway sources later.
                    waterLevel: null,
                    trainDelays: null,
                    routeStatus: "Unknown",

                    alertMessage:
                        weatherStatus === "Critical"
                            ? "Severe weather conditions detected. Immediate monitoring advised."
                            : weatherStatus === "Alert"
                            ? "Severe weather conditions detected. Track monitoring advised."
                            : weatherStatus === "Caution"
                            ? "Moderate weather conditions detected. Continue monitoring."
                            : null,
                };
            })
        );

        return Response.json(results);
    } catch (error) {
        console.error(
            "Railway weather API error:",
            error
        );

        return Response.json(
            {
                error: "Failed to fetch railway weather data",
            },
            {
                status: 500,
            }
        );
    }
}