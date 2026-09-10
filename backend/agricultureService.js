const DEFAULT_CROPS = [
    "Wheat",
    "Sugarcane",
    "Cotton",
];

const {
    predictYield,
} = require("./yieldModel");

const CROP_YIELD_BASELINES = {
    wheat: {
        current: 4.2,
        previous: 3.8,
        unit: "tons/acre",
    },
    sugarcane: {
        current: 42,
        previous: 38,
        unit: "tons/acre",
    },
    cotton: {
        current: 2.8,
        previous: 2.5,
        unit: "tons/acre",
    },
};

function getWeatherCondition(weatherCode) {
    if (weatherCode === 0) return "Sunny";
    if ([1, 2, 3].includes(weatherCode)) return "Partly Cloudy";
    if ([51, 53, 55, 56, 57].includes(weatherCode)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "Snow";
    if ([95, 96, 99].includes(weatherCode)) return "Thunderstorm";
    return "Cloudy";
}

function getSeverityScore(weather) {
    return {
        humidity: weather.humidity >= 80,
        rain: weather.rainfall >= 25,
        heat: weather.temperature >= 35,
        wind: weather.windSpeed >= 35,
    };
}

function buildCropRisks(crop, weather) {
    const risks = [];
    const score = getSeverityScore(weather);

    if (score.humidity) {
        risks.push({
            type: "Disease Risk",
            severity: "Medium",
            message: `High humidity may increase disease risk in ${crop}.`,
            action: "Inspect crops for fungal infection.",
        });
    }

    if (score.rain) {
        risks.push({
            type: "Heavy Rain",
            severity: "High",
            message: `Heavy rainfall may affect ${crop} fields.`,
            action: "Check drainage and avoid unnecessary irrigation.",
        });
    }

    if (score.heat) {
        risks.push({
            type: "Heat Stress",
            severity: "High",
            message: `High temperature may cause heat stress in ${crop}.`,
            action: "Monitor soil moisture and irrigation requirements.",
        });
    }

    if (score.wind) {
        risks.push({
            type: "Strong Wind",
            severity: "Medium",
            message: `Strong winds may damage ${crop} plants.`,
            action: "Inspect crops for lodging or physical damage.",
        });
    }

    if (risks.length === 0) {
        risks.push({
            type: "Weather Status",
            severity: "Low",
            message: `Current weather conditions look favorable for ${crop}.`,
            action: "Continue normal farm monitoring.",
        });
    }

    return risks.map((risk) => ({
        ...risk,
        crop,
    }));
}

function buildRecommendation(crop, weather, forecast) {
    const upcomingRain = forecast.some(
        (day) => day.rainfall >= 10
    );

    if (weather.temperature >= 35) {
        return {
            crop,
            action: "Irrigation",
            timing: "Today",
            confidence: "90%",
            recommendation: `High temperature detected. Check ${crop.toLowerCase()} soil moisture and irrigate if dry.`,
        };
    }

    if (upcomingRain) {
        return {
            crop,
            action: "Field Monitoring",
            timing: "Next 3 days",
            confidence: "82%",
            recommendation: `Rain is expected soon. Check drainage and avoid unnecessary irrigation for ${crop.toLowerCase()}.`,
        };
    }

    return {
        crop,
        action: "Crop Monitoring",
        timing: "Today",
        confidence: "78%",
        recommendation: `Conditions are favorable. Continue normal ${crop.toLowerCase()} monitoring.`,
    };
}

function buildYieldPrediction(crop, weather, marketPrice) {
    const baseline = CROP_YIELD_BASELINES[crop.toLowerCase()] || {
        current: 1,
        previous: 1,
        unit: "tons/acre",
    };
    const modelPrediction = predictYield(
        crop,
        weather,
        marketPrice || baseline.current * 1000
    );
    const predicted = modelPrediction || baseline.current;
    const change = ((predicted - baseline.previous) / baseline.previous) * 100;

    return {
        predicted: `${predicted.toFixed(1)} ${baseline.unit}`,
        lastYear: `${baseline.previous.toFixed(1)} ${baseline.unit}`,
        change: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
        model: "linear-regression",
        marketPrice: marketPrice || null,
    };
}

async function fetchJson(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.reason || data.message || "Agriculture API request failed"
        );
    }

    return data;
}

async function fetchGovernmentMarketPrice(crop, city) {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const resourceId = process.env.DATA_GOV_RESOURCE_ID;

    if (!apiKey || !resourceId) {
        return null;
    }

    const data = await fetchJson(
        `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(
            apiKey
        )}&format=json&limit=20&filters[commodity]=${encodeURIComponent(
            crop
        )}&filters[district]=${encodeURIComponent(city)}`
    );
    const records = Array.isArray(data.records)
        ? data.records
        : [];
    const prices = records
        .map((record) =>
            Number(
                record.modal_price ||
                    record.modal_price_rs ||
                    record.price
            )
        )
        .filter((price) => Number.isFinite(price) && price > 0);

    if (!prices.length) {
        return null;
    }

    return Math.round(
        prices.reduce((total, price) => total + price, 0) /
            prices.length
    );
}

async function getAgricultureData({
    city = "Pune",
    crops = DEFAULT_CROPS,
    farmName = "Green Valley Farm",
    area = "12 Acres",
    soilType = "Black Soil",
} = {}) {
    const normalizedCrops = crops
        .map((crop) => String(crop).trim())
        .filter(Boolean);
    const selectedCrops = normalizedCrops.length
        ? normalizedCrops
        : DEFAULT_CROPS;

    const locationData = await fetchJson(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
        )}&count=1&language=en&format=json`
    );
    const location = locationData.results?.[0];

    if (!location) {
        throw new Error(`Location not found: ${city}`);
    }

    const weatherData = await fetchJson(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,weather_code&forecast_days=7&timezone=auto&wind_speed_unit=kmh`
    );
    const current = weatherData.current || {};
    const daily = weatherData.daily || {};
    const weather = {
        temperature: current.temperature_2m ?? 0,
        humidity: current.relative_humidity_2m ?? 0,
        rainfall: current.rain ?? 0,
        windSpeed: current.wind_speed_10m ?? 0,
        condition: getWeatherCondition(current.weather_code),
    };
    const forecast = (daily.time || []).map((date, index) => ({
        date,
        day: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
            weekday: "short",
        }),
        temp: Math.round(daily.temperature_2m_max?.[index] ?? 0),
        rain: daily.rain_sum?.[index] ?? 0,
        condition: getWeatherCondition(daily.weather_code?.[index]),
        temperature: {
            min: daily.temperature_2m_min?.[index] ?? 0,
            max: daily.temperature_2m_max?.[index] ?? 0,
        },
        humidity: weather.humidity,
        rainfall: daily.rain_sum?.[index] ?? 0,
        precipitationProbability:
            daily.precipitation_probability_max?.[index] ?? 0,
        windSpeed: weather.windSpeed,
    }));
    const marketPrices = Object.fromEntries(
        await Promise.all(
            selectedCrops.map(async (crop) => [
                crop,
                await fetchGovernmentMarketPrice(crop, city),
            ])
        )
    );

    return {
        source: "Open-Meteo",
        governmentDataSource:
            process.env.DATA_GOV_API_KEY &&
            process.env.DATA_GOV_RESOURCE_ID
                ? "data.gov.in"
                : null,
        updatedAt: new Date().toISOString(),
        farmDetails: {
            name: farmName,
            location: `${location.name}, ${location.admin1 || location.country}`,
            area,
            soilType,
            crops: selectedCrops,
        },
        weatherForecast: {
            today: weather,
            week: forecast,
        },
        cropRisks: selectedCrops.flatMap((crop) =>
            buildCropRisks(crop, weather)
        ),
        cropRecommendations: selectedCrops.map((crop) =>
            buildRecommendation(crop, weather, forecast)
        ),
        yieldPrediction: Object.fromEntries(
            selectedCrops.map((crop) => [
                crop.toLowerCase(),
                buildYieldPrediction(
                    crop,
                    weather,
                    marketPrices[crop]
                ),
            ])
        ),
        marketPrices,
    };
}

module.exports = {
    getAgricultureData,
};
