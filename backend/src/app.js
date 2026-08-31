const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");
const trafficRoutes = require("./routes/trafficRoutes");
const signalRoutes = require("./routes/signalRoutes");
const routeRoutes = require("./routes/routeRoutes");

const app = express();


// =========================================================
// CORS
// =========================================================

app.use(
  cors({
    origin: true,
    credentials: true
  })
);


// =========================================================
// JSON
// =========================================================

app.use(
  express.json({
    limit: "10mb"
  })
);


// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {

  res.json({

    success: true,

    message: "Smart Traffic AI API is running",

    version: "1.0.0"

  });

});


// =========================================================
// ROUTES
// =========================================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/traffic",
  trafficRoutes
);

app.use(
  "/api/signals",
  signalRoutes
);

app.use(
  "/api/routes",
  routeRoutes
);


// =========================================================
// 404
// =========================================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "API endpoint not found",

    path: req.originalUrl

  });

});


// =========================================================
// ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {

  console.error(
    "❌ Server error:",
    err
  );

  res.status(500).json({

    success: false,

    message: "Internal server error"

  });

});


module.exports = app;