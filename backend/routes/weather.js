import express from "express";

const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // 1) geocode city
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      return res.status(404).json({ message: "City not found" });
    }

    const { lat, lon, name } = geoData[0];

    // 2) current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherRes.json();

    // 3) AQI
    const airRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const airData = await airRes.json();

    res.json({
      city: name,
      coordinates: { lat, lon },
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      weather: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      aqi: airData.list[0].main.aqi,
      pm2_5: airData.list[0].components.pm2_5,
      pm10: airData.list[0].components.pm10
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Weather fetch failed" });
  }
});

export default router;