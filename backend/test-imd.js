const https = require("https");

const options = {
    hostname: "wis2box.imd.gov.in",
    path: "/oapi/collections/messages/items?limit=1",
    method: "GET",
    headers: {
        Accept: "application/json",
        "User-Agent": "WeatherGPT/1.0",
    },
};

const req = https.request(options, (res) => {
    console.log("STATUS:", res.statusCode);

    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        console.log("RESPONSE:");
        console.log(data.slice(0, 1000));
    });
});

req.on("error", (error) => {
    console.error("ERROR:", error);
    console.error("CAUSE:", error.cause);
});

req.end();