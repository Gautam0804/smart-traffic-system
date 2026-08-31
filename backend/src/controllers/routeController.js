const {
  findBestRoute,
} = require("../services/routeService");

const getBestRoute = async (req, res) => {
  try {
    const routes = [
      {
        direction: "north",
        travelTime: 18,
        congestion: 25,
        distance: 5.2,
      },

      {
        direction: "south",
        travelTime: 29,
        congestion: 80,
        distance: 6.1,
      },

      {
        direction: "east",
        travelTime: 22,
        congestion: 45,
        distance: 5.8,
      },

      {
        direction: "west",
        travelTime: 14,
        congestion: 10,
        distance: 4.9,
      },
    ];

    const bestRoute = findBestRoute(routes);

    res.json({
      success: true,
      bestRoute,
      alternatives: routes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Route optimization failed",
    });
  }
};

module.exports = {
  getBestRoute,
};