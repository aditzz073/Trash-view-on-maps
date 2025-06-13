require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// Environment Variables
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SIGNING_SECRET = process.env.SIGNING_SECRET;

// Function to generate signed URLs
function generateSignedUrl(path, secret) {
  if (!secret) {
    return path; // Return unsigned URL if no secret
  }
  try {
    const decodedSecret = Buffer.from(secret, "base64");
    const signature = crypto
      .createHmac("sha1", decodedSecret)
      .update(path)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    return `${path}&signature=${signature}`;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return path; // Return unsigned URL on error
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Proxy endpoint for the Street View Static API
app.get("/proxy/streetview", async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location parameter is required" });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: "Google Maps API key not configured" });
  }

  const basePath = "/maps/api/streetview/metadata";
  const params = `location=${location}&key=${API_KEY}`;
  const signedUrl = generateSignedUrl(`${basePath}?${params}`, SIGNING_SECRET);

  try {
    const response = await fetch(`https://maps.googleapis.com${signedUrl}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Proxy endpoint for the Maps JavaScript API
app.get("/proxy/maps", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).send("Google Maps API key not configured");
  }

  const basePath = "/maps/api/js";
  const params = `key=${API_KEY}&callback=${req.query.callback || "initializeMap"}`;
  const signedUrl = generateSignedUrl(`${basePath}?${params}`, SIGNING_SECRET);

  try {
    const response = await fetch(`https://maps.googleapis.com${signedUrl}`);
    if (!response.ok) {
      throw new Error("Failed to fetch Maps API script");
    }
    const script = await response.text();
    res.type("application/javascript").send(script);
  } catch (error) {
    console.error("Error proxying Maps API script:", error);
    res.status(500).send("Error loading Maps API");
  }
});

// Serve the Google Maps API script via proxy (simplified for Vercel)
app.get("/api/maps", async (req, res) => {
  const callback = req.query.callback || "initializeMap";
  
  if (!API_KEY) {
    return res.status(500).send("Google Maps API key not configured");
  }

  const basePath = "/maps/api/js";
  const params = `key=${API_KEY}&callback=${callback}`;
  const signedUrl = generateSignedUrl(`${basePath}?${params}`, SIGNING_SECRET);

  try {
    const response = await fetch(`https://maps.googleapis.com${signedUrl}`);
    if (!response.ok) {
      throw new Error("Failed to fetch Maps API script");
    }
    const script = await response.text();
    res.type("application/javascript").send(script);
  } catch (error) {
    console.error("Error fetching Maps API script:", error);
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
      // Use local proxy endpoint for validation
      const response = await fetch(
        `${req.protocol}://${req.get('host')}/proxy/streetview?location=${lat},${lon}`
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

    // Fallback coordinates in case validation fails
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

module.exports = app;
