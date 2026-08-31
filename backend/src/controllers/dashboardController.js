const axios = require("axios");

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

const getDashboard = async (req, res) => {
  try {
    const mlResponse = await axios.get(
      `${ML_API_URL}/ml-predict`,
      {
        timeout: 5000,
      }
    );

    const traffic = mlResponse.data;

    const lanes = ["north", "south", "east", "west"];

    const congestion = {};

    lanes.forEach((lane) => {
      const vehicles = Number(traffic[lane] || 0);

      let level = "LOW";

      if (vehicles >= 70) {
        level = "HIGH";
      } else if (vehicles >= 40) {
        level = "MEDIUM";
      }

      congestion[lane] = {
        vehicles,
        level,
      };
    });

    res.json({
      success: true,

      timestamp: new Date().toISOString(),

      traffic: congestion,

      signal: {
        activeLane: traffic.selected || "north",
        mode: traffic.mode || "ai",
        greenTime: traffic.green_time || 20,
      },

      recommendation: {
        lane: traffic.selected || "north",
        reason:
          traffic.reason ||
          "Traffic conditions analyzed by AI",
        confidence: traffic.confidence || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    res.status(503).json({
      success: false,
      message: "ML traffic service unavailable",
    });
  }
};

module.exports = {
  getDashboard,
};