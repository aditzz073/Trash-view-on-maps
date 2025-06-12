require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); 

// Environment Variables
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SIGNING_SECRET = process.env.SIGNING_SECRET;

// Function to generate signed URLs
function generateSignedUrl(path, secret) {
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
    throw error; 
  }
}

// Proxy endpoint for the Street View Static API
app.get("/proxy/streetview", async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location parameter is required" });
  }

  const basePath = "/maps/api/streetview/metadata";
  const params = `location=${location}&key=${API_KEY}`;
  const signedUrl = generateSignedUrl(`${basePath}?${params}`, SIGNING_SECRET);


  try {
    const response = await fetch(`https://maps.googleapis.com${signedUrl}`);
    const data = await response.json();

    // Forward the API response to the client
    res.json(data);
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Proxy endpoint for the Maps JavaScript API
app.get("/proxy/maps", (req, res) => {
  const basePath = "/maps/api/js";
  const params = `key=${API_KEY}&callback=${req.query.callback || "initializeMap"}`;
  const signedUrl = generateSignedUrl(`${basePath}?${params}`, SIGNING_SECRET);

  // Proxy the script content directly to the client
  fetch(`https://maps.googleapis.com${signedUrl}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch Maps API script");
      }
      return response.text();
    })
    .then((script) => {
      res.type("application/javascript").send(script);
    })
    .catch((error) => {
      console.error("Error proxying Maps API script:", error);
      res.status(500).send("Error loading Maps API");
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Proxy server is running" });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});