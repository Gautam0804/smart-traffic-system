/*
=========================================================
SMART TRAFFIC AI - API
=========================================================
*/


// =======================================================
// API CONFIGURATION
// =======================================================

const NODE_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://192.168.1.5:5000/api";


const ML_API_URL =
  import.meta.env.VITE_ML_API_URL ||
  "http://192.168.1.5:8001";


// =======================================================
// GENERIC REQUEST
// =======================================================

async function request(url, options = {}) {

  try {

    const response = await fetch(
      url,
      options
    );


    if (!response.ok) {

      let message =
        `HTTP ${response.status} ${response.statusText}`;

      try {

        const errorData =
          await response.json();

        if (errorData.message) {

          message = errorData.message;

        }

      } catch {
        // Ignore invalid JSON error response
      }


      throw new Error(message);
    }


    return await response.json();

  } catch (error) {

    console.error(
      `API request failed: ${url}`,
      error
    );

    throw error;
  }
}


// =======================================================
// TRAFFIC PREDICTION
// GET /ml-predict
// =======================================================

export async function getTrafficPrediction() {

  try {

    return await request(
      `${ML_API_URL}/ml-predict`
    );

  } catch (error) {

    console.error(
      "Traffic Prediction API:",
      error
    );

    throw error;
  }
}


// =======================================================
// YOLO VEHICLE DETECTION
// POST /detect
// =======================================================

export async function detectVehicles(imageData) {

  try {

    if (!imageData) {

      throw new Error(
        "Image data is required"
      );
    }


    return await request(
      `${ML_API_URL}/detect`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          image: imageData
        })
      }
    );

  } catch (error) {

    console.error(
      "Vehicle Detection API:",
      error
    );

    throw error;
  }
}


// =======================================================
// CHECK ML SERVER
// GET /
// =======================================================

export async function checkMLBackend() {

  try {

    return await request(
      `${ML_API_URL}/`
    );

  } catch (error) {

    console.error(
      "ML Backend:",
      error
    );

    throw error;
  }
}


// =======================================================
// CHECK NODE SERVER
// GET /
// =======================================================

export async function checkNodeBackend() {

  try {

    return await request(
      `${NODE_API_URL}/`
    );

  } catch (error) {

    console.error(
      "Node Backend:",
      error
    );

    throw error;
  }
}


// =======================================================
// EXPORT API URLS
// =======================================================

export {
  NODE_API_URL,
  ML_API_URL
};