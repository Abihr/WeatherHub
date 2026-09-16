const dotenv = require("dotenv");

dotenv.config();

// ========================================================
// API URLS
// ========================================================

const OPEN_METEO_API =
    "https://api.open-meteo.com/v1/forecast";

const OPENWEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

// ========================================================
// TEST WEATHER
// ========================================================

async function testWeather() {
    try {
        // ========================================================
        // LOCATION
        // ========================================================

        const latitude = 22.882248;
        const longitude = 88.498436;

        // ========================================================
        // API KEY
        // ========================================================

        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "WEATHER_API_KEY is missing from .env"
            );
        }

        // ========================================================
        // FETCH CURRENT WEATHER FROM OPENWEATHER
        // ========================================================

        console.log("\nFetching current weather...");

        const currentResponse = await fetch(
            `${OPENWEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error(
                `OpenWeather error: ${currentResponse.status}`
            );
        }

        const currentData =
            await currentResponse.json();

        // ========================================================
        // FETCH FORECAST FROM OPEN-METEO
        // ========================================================

        console.log(
            "Fetching 7-day + hourly forecast..."
        );

        const forecastResponse = await fetch(
            `${OPEN_METEO_API}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&timezone=Asia%2FKolkata` +
            `&forecast_days=7` +

            // CURRENT
            `&current=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `apparent_temperature,` +
            `weather_code,` +
            `is_day` +

            // HOURLY
            `&hourly=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `rain,` +
            `precipitation_probability,` +
            `weather_code,` +
            `is_day` +

            // DAILY
            `&daily=` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `rain_sum,` +
            `precipitation_probability_max,` +
            `weather_code`
        );

        if (!forecastResponse.ok) {
            throw new Error(
                `Open-Meteo error: ${forecastResponse.status}`
            );
        }

        const forecastData =
            await forecastResponse.json();

        // ========================================================
        // LOCATION
        // ========================================================

        console.log("\n=================================");
        console.log("LOCATION");
        console.log("=================================");

        console.log(
            "Place Name:",
            currentData.name
        );

        console.log(
            "Country:",
            currentData.sys?.country
        );

        console.log(
            "Latitude:",
            latitude
        );

        console.log(
            "Longitude:",
            longitude
        );

        console.log(
            "Timezone:",
            forecastData.timezone
        );

        // ========================================================
        // CURRENT WEATHER
        // ========================================================

        console.log("\n=================================");
        console.log("CURRENT WEATHER");
        console.log("=================================");

        console.log(
            "Temperature:",
            currentData.main?.temp,
            "°C"
        );

        console.log(
            "Feels Like:",
            currentData.main?.feels_like,
            "°C"
        );

        console.log(
            "Humidity:",
            currentData.main?.humidity,
            "%"
        );

        console.log(
            "Condition:",
            currentData.weather?.[0]?.description
        );

        console.log(
            "Weather Main:",
            currentData.weather?.[0]?.main
        );

        console.log(
            "OpenWeather Icon:",
            currentData.weather?.[0]?.icon
        );

        console.log(
            "Open-Meteo Weather Code:",
            forecastData.current?.weather_code
        );

        console.log(
            "Day/Night:",
            forecastData.current?.is_day === 1
                ? "DAY ☀️"
                : "NIGHT 🌙"
        );

        // ========================================================
        // CURRENT WEATHER OBJECT
        // ========================================================

        const currentWeather = {
            temperature:
                forecastData.current?.temperature_2m ??
                currentData.main?.temp ??
                null,

            feelsLike:
                forecastData.current?.apparent_temperature ??
                currentData.main?.feels_like ??
                null,

            humidity:
                forecastData.current?.relative_humidity_2m ??
                currentData.main?.humidity ??
                null,

            weatherCode:
                forecastData.current?.weather_code ??
                null,

            is_day:
                forecastData.current?.is_day ??
                null,

            condition:
                currentData.weather?.[0]?.description ??
                "Unknown",

            weatherMain:
                currentData.weather?.[0]?.main ??
                "Unknown",

            openWeatherIcon:
                currentData.weather?.[0]?.icon ??
                null,

            latitude,
            longitude,

            location:
                currentData.name ??
                "Unknown",

            country:
                currentData.sys?.country ??
                ""
        };

        console.log(
            "\nCurrent Weather Object:"
        );

        console.log(
            currentWeather
        );

        // ========================================================
        // 7-DAY DAILY FORECAST
        // ========================================================

        console.log("\n=================================");
        console.log("7-DAY DAILY FORECAST");
        console.log("=================================");

        const daily = forecastData.daily;

        daily.time.forEach(
            (date, index) => {

                console.log(
                    `\n${date}`
                );

                console.log(
                    "Min Temperature:",
                    daily.temperature_2m_min[index],
                    "°C"
                );

                console.log(
                    "Max Temperature:",
                    daily.temperature_2m_max[index],
                    "°C"
                );

                console.log(
                    "Rain:",
                    daily.rain_sum[index],
                    "mm"
                );

                console.log(
                    "Rain Probability:",
                    daily.precipitation_probability_max[index],
                    "%"
                );

                console.log(
                    "Weather Code:",
                    daily.weather_code[index]
                );
            }
        );

        // ========================================================
        // 7-DAY FORECAST OBJECT
        // ========================================================

        const dailyForecast = daily.time.map(
            (date, index) => {

                return {
                    date,

                    minTemp:
                        daily.temperature_2m_min[index],

                    maxTemp:
                        daily.temperature_2m_max[index],

                    rain:
                        daily.rain_sum[index],

                    rainProbability:
                        daily.precipitation_probability_max[index],

                    weatherCode:
                        daily.weather_code[index]
                };
            }
        );

        console.log(
            "\n7-Day Forecast Object:"
        );

        console.log(
            dailyForecast
        );

        // ========================================================
        // HOURLY FORECAST
        // NEXT 24 HOURS
        // ========================================================

        console.log("\n=================================");
        console.log("HOURLY FORECAST");
        console.log("NEXT 24 HOURS FROM CURRENT HOUR");
        console.log("=================================");

        const hourly =
            forecastData.hourly;

        const hourlyTimes =
            hourly.time;

        // ========================================================
        // GET CURRENT INDIA TIME
        // ========================================================

        const now = new Date();

        const currentHourString =
            now.toLocaleString(
                "sv-SE",
                {
                    timeZone: "Asia/Kolkata",
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit"
                }
            );

        const currentHour =
            currentHourString.replace(
                " ",
                "T"
            );

        console.log(
            "\nCurrent local hour:",
            currentHour
        );

        // ========================================================
        // FIND CURRENT / NEXT FORECAST HOUR
        // ========================================================

        let startIndex =
            hourlyTimes.findIndex(
                (time) =>
                    time >= currentHour
            );

        // Safety fallback
        if (startIndex === -1) {
            startIndex = 0;
        }

        console.log(
            "Starting forecast index:",
            startIndex
        );

        console.log(
            "Starting forecast time:",
            hourlyTimes[startIndex]
        );

        // ========================================================
        // NEXT 24 HOURS
        // ========================================================

        const endIndex =
            Math.min(
                startIndex + 24,
                hourlyTimes.length
            );

        const next24Hours = [];

        for (
            let index = startIndex;
            index < endIndex;
            index++
        ) {

            const time =
                hourly.time[index];

            const hourData = {

                time,

                temperature:
                    hourly.temperature_2m[index],

                humidity:
                    hourly.relative_humidity_2m[index],

                rain:
                    hourly.rain[index],

                rainProbability:
                    hourly.precipitation_probability[index],

                weatherCode:
                    hourly.weather_code[index],

                is_day:
                    hourly.is_day[index],

                dayNight:
                    hourly.is_day[index] === 1
                        ? "day"
                        : "night"
            };

            next24Hours.push(
                hourData
            );

            console.log(
                `\n${time}`,
                index === startIndex
                    ? "| NOW"
                    : ""
            );

            console.log(
                "Temp:",
                hourly.temperature_2m[index],
                "°C"
            );

            console.log(
                "Humidity:",
                hourly.relative_humidity_2m[index],
                "%"
            );

            console.log(
                "Rain:",
                hourly.rain[index],
                "mm"
            );

            console.log(
                "Rain Probability:",
                hourly.precipitation_probability[index],
                "%"
            );

            console.log(
                "Weather Code:",
                hourly.weather_code[index]
            );

            console.log(
                "Day/Night:",
                hourly.is_day[index] === 1
                    ? "DAY ☀️"
                    : "NIGHT 🌙"
            );
        }

        // ========================================================
        // COMPLETE HOURLY OBJECT
        // ========================================================

        console.log(
            "\n================================="
        );

        console.log(
            "NEXT 24 HOURS OBJECT"
        );

        console.log(
            "================================="
        );

        console.log(
            next24Hours
        );

        // ========================================================
        // FINAL WEATHER DATA
        // ========================================================

        const finalWeatherData = {

            location: {
                name:
                    currentData.name ??
                    "Unknown",

                country:
                    currentData.sys?.country ??
                    "",

                latitude,
                longitude,

                timezone:
                    forecastData.timezone
            },

            current: currentWeather,

            daily: dailyForecast,

            hourly: next24Hours
        };

        // ========================================================
        // FINAL RESULT
        // ========================================================

        console.log(
            "\n================================="
        );

        console.log(
            "FINAL WEATHER DATA"
        );

        console.log(
            "================================="
        );

        console.log(
            JSON.stringify(
                finalWeatherData,
                null,
                2
            )
        );

        // ========================================================
        // COMPLETE
        // ========================================================

        console.log(
            "\n================================="
        );

        console.log(
            "TEST COMPLETED ✅"
        );

        console.log(
            "================================="
        );

    } catch (error) {

        console.error(
            "\nERROR:",
            error.message
        );
    }
}

// ========================================================
// RUN
// ========================================================

testWeather();