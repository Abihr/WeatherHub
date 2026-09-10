const dotenv = require("dotenv");

dotenv.config();

const OPEN_METEO_API =
    "https://api.open-meteo.com/v1/forecast";

const OPENWEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

async function testWeather() {
    try {
        const latitude = 22.882248;
        const longitude = 88.498436;

        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error("WEATHER_API_KEY is missing");
        }

        // ========================================================
        // FETCH CURRENT WEATHER + PLACE NAME
        // ========================================================
        console.log("Fetching weather...");

        const currentResponse = await fetch(
            `${OPENWEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error(
                `OpenWeather error: ${currentResponse.status}`
            );
        }

        const currentData = await currentResponse.json();

        // ========================================================
        // FETCH 7-DAY FORECAST
        // ========================================================
        const forecastResponse = await fetch(
            `${OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&timezone=Asia%2FKolkata&forecast_days=7&hourly=temperature_2m,relative_humidity_2m,rain,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max`
        );

        if (!forecastResponse.ok) {
            throw new Error(
                `Open-Meteo error: ${forecastResponse.status}`
            );
        }

        const forecastData = await forecastResponse.json();

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

        // ========================================================
        // 7-DAY DAILY FORECAST
        // ========================================================
        console.log("\n=================================");
        console.log("7-DAY DAILY FORECAST");
        console.log("=================================");

        forecastData.daily.time.forEach(
            (date, index) => {
                console.log(`\n${date}`);

                console.log(
                    "Temperature:",
                    forecastData.daily.temperature_2m_min[index],
                    "-",
                    forecastData.daily.temperature_2m_max[index],
                    "°C"
                );

                console.log(
                    "Rain:",
                    forecastData.daily.rain_sum[index],
                    "mm"
                );

                console.log(
                    "Rain Probability:",
                    forecastData.daily
                        .precipitation_probability_max[index],
                    "%"
                );
            }
        );

        // ========================================================
        // HOURLY FORECAST
        // NEXT 24 HOURS FROM CURRENT LOCAL HOUR
        // ========================================================
        console.log("\n=================================");
        console.log("HOURLY FORECAST");
        console.log("NEXT 24 HOURS FROM CURRENT HOUR");
        console.log("=================================");

        const hourly = forecastData.hourly;

        const hourlyTimes = hourly.time;

        // --------------------------------------------------------
        // GET CURRENT TIME IN INDIA
        // --------------------------------------------------------
        const now = new Date();

        const currentHourString = now.toLocaleString(
            "sv-SE",
            {
                timeZone: "Asia/Kolkata",
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
            }
        );

        const currentHour = currentHourString.replace(
            " ",
            "T"
        );

        console.log(
            "\nCurrent local hour:",
            currentHour
        );

        // --------------------------------------------------------
        // FIND CURRENT/NEXT FORECAST HOUR
        // --------------------------------------------------------
        let startIndex = hourlyTimes.findIndex(
            (time) => time >= currentHour
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

        // --------------------------------------------------------
        // TAKE NEXT 24 HOURS
        // --------------------------------------------------------
        const endIndex = Math.min(
            startIndex + 24,
            hourlyTimes.length
        );

        for (
            let index = startIndex;
            index < endIndex;
            index++
        ) {
            const time = hourly.time[index];

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
        }

        // ========================================================
        // COMPLETE
        // ========================================================
        console.log("\n=================================");
        console.log("TEST COMPLETED");
        console.log("=================================");

    } catch (error) {
        console.error(
            "\nERROR:",
            error.message
        );
    }
}

testWeather();