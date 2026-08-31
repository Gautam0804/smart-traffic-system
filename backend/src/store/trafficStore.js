const LANES = ["north", "south", "east", "west"];

const traffic = {
  north: 0,
  south: 0,
  east: 0,
  west: 0,
};

let lastUpdate = null;

function updateTraffic(data = {}) {
  for (const lane of LANES) {
    if (data[lane] !== undefined) {
      const value = Number(data[lane]);

      if (Number.isFinite(value) && value >= 0) {
        traffic[lane] = Math.floor(value);
      }
    }
  }

  lastUpdate = new Date().toISOString();
}

function getTraffic() {
  return {
    ...traffic,
  };
}

function getLastUpdate() {
  return lastUpdate;
}

function getTotalVehicles() {
  return Object.values(traffic).reduce(
    (sum, value) => sum + value,
    0
  );
}

module.exports = {
  LANES,
  traffic,
  updateTraffic,
  getTraffic,
  getLastUpdate,
  getTotalVehicles,
};