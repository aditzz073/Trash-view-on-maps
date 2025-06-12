require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// Replace this with localhost URL for running locally
const proxyURL = process.env.PROXY_URL || "http://localhost:3000";

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve the Google Maps API script via proxy
app.get("/api/maps", async (req, res) => {
  try {
    const callback = req.query.callback || "initializeMap";
    const response = await fetch(
      `${proxyURL}/proxy/maps?callback=${callback}`
    );
    const script = await response.text();
    res.type("application/javascript").send(script);
  } catch (error) {
    console.error("Error fetching Maps API script via proxy:", error);
    res.status(500).send("Internal server error.");
  }
});

// API endpoint for getting 10 random valid Street View points
app.get("/api/streetview", async (req, res) => {
  const CITY_BOUNDS = [
    { name: "Delhi", min_lat: 28.4041, max_lat: 28.8813, min_lon: 76.8371, max_lon: 77.3319 },
    { name: "Mumbai", min_lat: 18.8941, max_lat: 19.2719, min_lon: 72.7757, max_lon: 72.9868 },
    { name: "Bangalore", min_lat: 12.8685, max_lat: 13.1615, min_lon: 77.4913, max_lon: 77.7047 },
    { name: "Kolkata", min_lat: 22.4373, max_lat: 22.7364, min_lon: 88.2444, max_lon: 88.4368 },
    { name: "Chennai", min_lat: 12.8996, max_lat: 13.1434, min_lon: 80.1638, max_lon: 80.3055 },
    { name: "Hyderabad", min_lat: 17.2782, max_lat: 17.5461, min_lon: 78.3498, max_lon: 78.5825 },
    { name: "Pune", min_lat: 18.4321, max_lat: 18.6177, min_lon: 73.7518, max_lon: 73.9842 },
    { name: "Ahmedabad", min_lat: 22.9413, max_lat: 23.1266, min_lon: 72.5021, max_lon: 72.6616 },
    { name: "Jaipur", min_lat: 26.7846, max_lat: 27.0451, min_lon: 75.7333, max_lon: 75.9616 },
    { name: "Lucknow", min_lat: 26.7674, max_lat: 27.0113, min_lon: 80.8170, max_lon: 81.0296 },
  ];

  function getRandomCoordinates() {
    const city = CITY_BOUNDS[Math.floor(Math.random() * CITY_BOUNDS.length)];
    const lat = Math.random() * (city.max_lat - city.min_lat) + city.min_lat;
    const lon = Math.random() * (city.max_lon - city.min_lon) + city.min_lon;
    return { lat, lon, city: city.name };
  }

  async function validateStreetView(lat, lon) {
    console.log(`🔍 Validating Street View for: ${lat}, ${lon}`);
    
    try {
      const response = await fetch(
        `${proxyURL}/proxy/streetview?location=${lat},${lon}`
      );
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (!response.ok) {
        console.log(`❌ API Response not OK: ${response.status} ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      console.log(`📋 API Response data:`, JSON.stringify(data, null, 2));
      
      // Only fetch images where Street View exists and verified by Google
      const isValid = data.status === "OK" && data.copyright === "© Google";
      console.log(`✅ Is valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error("❌ Error validating Street View:", error);
      return false;
    }
  }

  async function getStreetViewPoints() {
    const points = [];
    const maxPoints = 10;
    const maxAttempts = 20; // Prevent infinite loops

    // Fallback coordinates in case proxy server fails or no valid points found
    const fallbackCoords = [
      { lat: 28.6139, lon: 77.2090, city: "Delhi" },
      { lat: 19.0760, lon: 72.8777, city: "Mumbai" },
      { lat: 12.9716, lon: 77.5946, city: "Bangalore" },
      { lat: 22.5726, lon: 88.3639, city: "Kolkata" },
      { lat: 13.0827, lon: 80.2707, city: "Chennai" },
      { lat: 17.3850, lon: 78.4867, city: "Hyderabad" },
      { lat: 18.5204, lon: 73.8567, city: "Pune" },
      { lat: 23.0225, lon: 72.5714, city: "Ahmedabad" },
      { lat: 26.9124, lon: 75.7873, city: "Jaipur" },
      { lat: 26.8467, lon: 80.9462, city: "Lucknow" }
    ];

    // Check if proxy server is accessible
    try {
      const testResponse = await fetch(`${proxyURL}/health`, { timeout: 5000 });
      if (!testResponse.ok) {
        console.log("⚠️  Proxy server not accessible, using fallback coordinates");
        return fallbackCoords.slice(0, maxPoints);
      }
    } catch (error) {
      console.log("⚠️  Proxy server error, using fallback coordinates:", error.message);
      return fallbackCoords.slice(0, maxPoints);
    }

    let attempts = 0;
    while (points.length < maxPoints && attempts < maxAttempts) {
      attempts++;
      const coords = getRandomCoordinates();
      const isValid = await validateStreetView(coords.lat, coords.lon);
      if (isValid) {
        points.push(coords);
      } else {
        console.log(`No Street View available for: ${JSON.stringify(coords)} (attempt ${attempts})`);
      }
    }

    if (points.length === 0) {
      console.log("⚠️  No valid points found, using fallback coordinates");
      return fallbackCoords.slice(0, 5);
    }

    return points;
  }

  try {
    const points = await getStreetViewPoints();
    res.json(points);
  } catch (error) {
    console.error("Error fetching Street View points:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
