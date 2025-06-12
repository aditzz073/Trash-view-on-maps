let panorama; // Street View instance
let score = 0; // User's score
let points = []; // List of Street View points
let currentIndex = 0; // Current point index
let trashFound = false; // Tracks if user selected "Yes"

// Initialize the Street View map
function initializeMap() {
  const mapContainer = document.getElementById("map");
  panorama = new google.maps.StreetViewPanorama(mapContainer, {
    pov: { heading: 34, pitch: 10 },
    visible: false,
  });
}

// Start the game
async function startGame() {
  const startScreen = document.getElementById("start-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const gameContainer = document.getElementById("game-container");
  const mapContainer = document.getElementById("map");
  const gameControls = document.getElementById("game-controls");

  const startButton = document.getElementById("start-button");
  const understoodButton = document.getElementById("understood-button");

  // Disable Start Button and show loading screen
  startButton.disabled = true;
  startButton.textContent = "Loading...";
  startScreen.style.display = "none";
  loadingScreen.style.display = "flex";

  // Handle "I've Understood" Button Click
  understoodButton.addEventListener("click", async () => {
    understoodButton.disabled = true;
    understoodButton.textContent = "Loading...";

    // Simulate a loading animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Fetch Street View points
      const response = await fetch("/api/streetview");
      points = await response.json();

      if (points.length > 0) {
        // Show the first point
        currentIndex = 0;
        loadStreetView(points[currentIndex]);

        // Hide Loading Screen and show Game UI
        loadingScreen.style.display = "none";
        gameContainer.style.display = "block";
        mapContainer.style.display = "block";
        gameControls.style.display = "block";
      } else {
        throw new Error("No valid points received from the backend.");
      }
    } catch (error) {
      console.error("Error starting game:", error);

      // Hide Loading Screen and return to Start Screen
      loadingScreen.style.display = "none";
      startScreen.style.display = "flex";
      startButton.disabled = false;
      startButton.textContent = "START GAME";

      // More helpful error message
      if (error.message && error.message.includes('fetch')) {
        alert("Unable to connect to game servers. Please ensure both the proxy and main servers are running:\n\n1. Run 'npm run dev' to start both servers\n2. Or start them separately:\n   - npm run start:proxy\n   - npm run start:server");
      } else {
        alert("Error starting the game. Please try again later.");
      }
    }
  });
}

// Load a specific Street View point
function loadStreetView(point) {
  panorama.setPosition({ lat: point.lat, lng: point.lon });
  panorama.setVisible(true);

  // Enable the YES and NO buttons
  const yesButton = document.getElementById("yes-button");
  const noButton = document.getElementById("no-button");
  const nextButton = document.getElementById("next-button");

  yesButton.disabled = false;
  noButton.disabled = false;
  yesButton.style.backgroundColor = ""; // Reset to default
  noButton.style.backgroundColor = ""; // Reset to default
  nextButton.style.display = "none"; // Hide next button initially

  // Reset trashFound for the new point
  trashFound = false;
}

// Handle the "YES" button
function foundTrash() {
  trashFound = true;

  const yesButton = document.getElementById("yes-button");
  const noButton = document.getElementById("no-button");
  const nextButton = document.getElementById("next-button");

  yesButton.style.backgroundColor = "green"; // Turn green
  noButton.style.backgroundColor = ""; // Reset No button

  // Enable the Next button
  nextButton.style.display = "inline-block";
}

// Handle the "NO" button
function noTrash() {
  trashFound = false;

  const yesButton = document.getElementById("yes-button");
  const noButton = document.getElementById("no-button");
  const nextButton = document.getElementById("next-button");

  noButton.style.backgroundColor = "red"; // Turn red
  yesButton.style.backgroundColor = ""; // Reset Yes button

  // Enable the Next button
  nextButton.style.display = "inline-block";
}

// Show the "NEXT" button and handle the score update
function nextPoint() {
  const yesButton = document.getElementById("yes-button");
  const noButton = document.getElementById("no-button");
  const nextButton = document.getElementById("next-button");

  // Update the score if trash was found
  if (trashFound) {
    score++;
    document.getElementById("score").textContent = score;
  }

  // Disable and grey out Yes and No buttons
  yesButton.disabled = true;
  noButton.disabled = true;
  yesButton.style.backgroundColor = "grey";
  noButton.style.backgroundColor = "grey";

  currentIndex++;
  if (currentIndex < points.length) {
    loadStreetView(points[currentIndex]);
  } else {
    endGame();
  }

  // Hide the Next button after moving to the next point
  nextButton.style.display = "none";
}

// End the game
function endGame() {
  // Hide the map and game controls
  document.getElementById("map").style.display = "none";
  document.getElementById("game-controls").style.display = "none";

  // Display the end screen
  const endScreen = document.getElementById("end-screen");
  endScreen.style.display = "block";

  // Update the final score
  document.getElementById("final-score").textContent = score;

  // Attach event listener to restart the game
  document.getElementById("restart-button").addEventListener("click", () => {
    location.reload(); // Reload the game
  });
}

// Attach event listeners
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("yes-button").addEventListener("click", foundTrash);
document.getElementById("no-button").addEventListener("click", noTrash);
document.getElementById("next-button").addEventListener("click", nextPoint);
