const calculateRouteScore = ({
  travelTime,
  congestion,
  distance,
}) => {
  return (
    travelTime * 0.5 +
    congestion * 0.35 +
    distance * 0.15
  );
};

const findBestRoute = (routes) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  const scoredRoutes = routes.map((route) => ({
    ...route,

    score: calculateRouteScore(route),
  }));

  scoredRoutes.sort((a, b) => a.score - b.score);

  return scoredRoutes[0];
};

module.exports = {
  calculateRouteScore,
  findBestRoute,
};