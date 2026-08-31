const {
  LANES,
  getTraffic,
  getLastUpdate,
} = require("../store/trafficStore");


// =========================================================
// SIGNAL STATE
// =========================================================

const signalState = {
  lane: "north",

  phase: "GREEN",

  remaining: 10,

  duration: 10,

  startedAt: Date.now(),

  reason: "System started",

  mode: "AI",

  cycle: 1,
};


// =========================================================
// CONFIG
// =========================================================

const YELLOW_TIME = 3;

const MIN_GREEN = 5;

const MAX_GREEN = 15;


// =========================================================
// GET GREEN TIME
// =========================================================

function calculateGreenTime(vehicleCount) {

  /*
   * We DON'T wait for a specific
   * vehicle threshold.
   *
   * Every lane can receive green.
   */

  if (vehicleCount <= 5) {
    return 5;
  }

  if (vehicleCount <= 15) {
    return 7;
  }

  if (vehicleCount <= 30) {
    return 10;
  }

  if (vehicleCount <= 60) {
    return 12;
  }

  return MAX_GREEN;
}


// =========================================================
// SELECT BEST DIRECTION
// =========================================================

function selectBestLane() {

  const traffic = getTraffic();

  /*
   * Select the lane with the LOWEST
   * current traffic.
   *
   * No minimum vehicle count required.
   */

  let bestLane = null;

  let lowestCount = Infinity;

  for (const lane of LANES) {

    const count = Number(
      traffic[lane] || 0
    );

    if (count < lowestCount) {

      lowestCount = count;

      bestLane = lane;
    }
  }

  return {
    lane: bestLane,
    vehicles: lowestCount,
  };
}


// =========================================================
// NEXT LANE
// =========================================================

function getNextLane(currentLane) {

  const currentIndex =
    LANES.indexOf(currentLane);

  const nextIndex =
    (currentIndex + 1) % LANES.length;

  return LANES[nextIndex];
}


// =========================================================
// CHANGE SIGNAL
// =========================================================

function changeSignal() {

  const selected =
    selectBestLane();

  const lane =
    selected.lane;

  const vehicles =
    selected.vehicles;

  const greenTime =
    calculateGreenTime(vehicles);


  signalState.lane = lane;

  signalState.phase = "GREEN";

  signalState.duration = greenTime;

  signalState.remaining = greenTime;

  signalState.startedAt = Date.now();

  signalState.reason =
    vehicles === 0
      ? `No vehicles waiting on ${lane}`
      : `Lowest traffic on ${lane}`;

  signalState.mode = "AI";

  signalState.cycle++;
}


// =========================================================
// SIGNAL UPDATE LOOP
// =========================================================

function updateSignal() {

  const elapsed =
    Math.floor(
      (Date.now() - signalState.startedAt) /
        1000
    );


  const remaining =
    Math.max(
      0,
      signalState.duration - elapsed
    );


  signalState.remaining =
    remaining;


  // =======================================================
  // GREEN FINISHED
  // =======================================================

  if (
    signalState.phase === "GREEN" &&
    remaining <= 0
  ) {

    signalState.phase = "YELLOW";

    signalState.duration =
      YELLOW_TIME;

    signalState.remaining =
      YELLOW_TIME;

    signalState.startedAt =
      Date.now();

    return;
  }


  // =======================================================
  // YELLOW FINISHED
  // =======================================================

  if (
    signalState.phase === "YELLOW" &&
    remaining <= 0
  ) {

    /*
     * Immediately calculate the
     * next direction using LIVE
     * traffic data.
     */

    const selected =
      selectBestLane();


    signalState.lane =
      selected.lane;


    signalState.phase =
      "GREEN";


    signalState.duration =
      calculateGreenTime(
        selected.vehicles
      );


    signalState.remaining =
      signalState.duration;


    signalState.startedAt =
      Date.now();


    signalState.reason =
      selected.vehicles === 0
        ? `No vehicles waiting on ${selected.lane}`
        : `Lowest traffic on ${selected.lane}`;


    signalState.cycle++;
  }
}


// =========================================================
// START CONTROLLER
// =========================================================

setInterval(
  updateSignal,
  1000
);


// =========================================================
// API
// =========================================================

function getSignals() {

  const traffic =
    getTraffic();


  const lane =
    signalState.lane;


  const currentVehicles =
    traffic[lane] || 0;


  return {

    success: true,

    signal: {

      lane: signalState.lane,

      phase: signalState.phase,

      remaining: signalState.remaining,

      duration: signalState.duration,

      reason: signalState.reason,

      mode: signalState.mode,

      cycle: signalState.cycle,

    },

    traffic,

    currentVehicles,

    lastTrafficUpdate:
      getLastUpdate(),

    timestamp:
      new Date().toISOString(),

  };
}


module.exports = {
  getSignals,
};