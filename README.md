
# Trash Detection Game 🎮

**Find Trash in Indian Cities** is an interactive game where players explore random street view locations from top Indian cities and identify whether they see trash. It aims to raise awareness about urban cleanliness and the importance of keeping cities clean.

Cities included in this game:
- Delhi
- Mumbai
- Bangalore
- Kolkata
- Chennai
- Hyderabad
- Pune
- Ahmedabad
- Jaipur
- Lucknow

---

## **Table of Contents**
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Proxy Server Details](#proxy-server-details)
7. [How It Works](#how-it-works)
8. [Future Enhancements](#future-enhancements)
9. [License](#license)

---

## **Features**
- 🌐 Explore random street views from India's top 10 cities.
- 🎯 Identify trash with simple "Yes" and "No" buttons.
- 📝 Tracks your score as you progress through 10 rounds.
- 🕹️ Retro game-inspired design with responsive UI.
- 🎥 End screen with an embedded YouTube video to promote awareness.
- 🖥️ Proxy server for securely accessing Google Maps API.

---

## **Tech Stack**
- **Frontend**:
  - HTML, CSS (Retro Design)
  - JavaScript
  - Google Maps JavaScript API
- **Backend**:
  - Node.js
  - Express.js
  - Google Street View API
- **Deployment**:
  - Docker
  - Google Cloud Run
  - GitHub for version control

---

## **Setup Instructions**

### Prerequisites
1. Install [Node.js](https://nodejs.org/) and npm.
2. Install [Docker](https://www.docker.com/).
3. A Google Cloud Project with Maps API enabled.
4. Install [gcloud CLI](https://cloud.google.com/sdk/docs/install)

### Clone the Repository
```bash
git clone https://github.com/your-username/trash-detection-game.git
cd trash-detection-game
```

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
node proxy.js
node server.js
```

> Note: Update the localhost proxy address (http://localhost:3000) in the script.js for running the proxy server locally.

Visit `http://localhost:3001` in your browser to access the game.

---

## **Environment Variables**

This project uses a `.env` file to securely store API keys. Create a `.env` file in the proxy server directory with the following keys:

```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SIGNING_SECRET=your-google-digital-signature-key
```

> Note: The `GOOGLE_MAPS_API_KEY` should have HTTP referrer restrictions to secure it.

---

## **Deployment**

### Docker
1. Build the Docker image:
   ```bash
   docker build -t proxy-server .
   docker build -t trash-detection-game .
   ```
2. Run the container:
   ```bash
   docker run -p 3001:3001 proxy-server
   docker run -p 3001:3001 trash-detection-game
   ```

### Google Cloud Run
1. Tag your Docker image:
   ```bash
   docker tag trash-detection-game asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/trash-detection-game
   docker tag trash-detection-game asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/proxy-server
   ```
2. Push the image to Google Cloud Container Registry:
   ```bash
   docker push asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/trash-detection-game
   docker push asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/proxy-server
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy trash-detection-game \
     --image=asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/trash-detection-game \
     --region=asia-south1 \
     --platform=managed \
     --allow-unauthenticated
   ```
   ```bash
   gcloud run deploy proxy-server \
     --image=asia-south1-docker.pkg.dev/<your-project-id>/<your-repo-name>/proxy-server \
     --region=asia-south1 \
     --platform=managed \
     --allow-unauthenticated
     --set-env-vars GOOGLE_MAPS_API_KEY=AIzaSyBW8u-4mYqMtU6if52ECi7rNO4_B_TvbWk
     --set-env-vars SIGNING_SECRET=uwsd2zpXs7UoMy_nLOVzO1E4JJA=
   ```


---

## **Proxy Server Details**

The proxy server serves the Google Maps API script and handles signed requests for Google Street View metadata.

### Endpoints

#### `/api/maps`
- **Description**: Fetches the Google Maps JavaScript API script via a proxy and serves it to the client. The script initializes the map by calling the `initializeMap` callback.
- **Method**: `GET`
- **Query Parameters**:
  - `callback` (optional): The name of the callback function. Defaults to `initializeMap`.
- **Response**: The Google Maps JavaScript API script pre-configured with the specified callback.

#### `/proxy/streetview`
- **Description**: Fetches Street View metadata for a specific location.
- **Parameters**:
  - `location`: Latitude and longitude of the desired location.
- **Example Usage**:
  ```bash
  curl "http://localhost:3000/proxy/streetview?location=28.6139,77.2090"
  ```

#### `/proxy/maps`
- **Description**: Serves the Google Maps JavaScript API script via the proxy.
- **Parameters**:
  - `callback` (optional): The name of the callback function. Defaults to `initializeMap`.
- **Example Usage**:
  ```bash
  curl "http://localhost:3000/proxy/maps?callback=initializeMap"
  ```

---

## **How It Works**

1. The game fetches 10 random valid Street View locations using Google Maps and Street View APIs.
2. Players view the locations and decide if trash is visible by clicking **Yes** or **No**.
3. A score is tracked across 10 rounds.
4. At the end, the game displays the player’s score along with our [YouTube video](https://www.youtube.com/watch?v=Be-QX2fkb30), raising awareness for a demand on Cleaner Cities.

---

## **Future Enhancements**
- 📱 Make the Mobile UI better.
- 🔊 Enhance animations and add sound effects for an immersive experience.

---

## **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.
