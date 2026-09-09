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

        const currentData =
            await currentResponse.json();


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
                    forecastData.daily
                        .temperature_2m_min[index],
                    "-",
                    forecastData.daily
                        .temperature_2m_max[index],
                    "°C"
                );

                console.log(
                    "Rain:",
                    forecastData.daily
                        .rain_sum[index],
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
        // ========================================================

        console.log("\n=================================");
        console.log("HOURLY FORECAST");
        console.log("=================================");

        forecastData.hourly.time.slice(0, 24).forEach((time, index) => {
            console.log(
                time,
                "| Temp:",
                forecastData.hourly.temperature_2m[index],
                "°C",
                "| Humidity:",
                forecastData.hourly.relative_humidity_2m[index],
                "%",
                "| Rain:",
                forecastData.hourly.rain[index],
                "mm",
                "| Rain Probability:",
                forecastData.hourly.precipitation_probability[index],
                "%"
            );
        });


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