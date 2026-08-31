const express = require("express");

const router = express.Router();

/*
=========================================================
TRAFFIC STATE
=========================================================
*/

const traffic = {
  north: 0,
  south: 0,
  east: 0,
  west: 0,
};

let lastUpdate = null;


/*
=========================================================
LANES
=========================================================
*/

const LANES = [
  "north",
  "south",
  "east",
  "west",
];


/*
=========================================================
SIGNAL STATE
=========================================================
*/

const signal = {
  lane: "north",
  phase: "GREEN",

  startedAt: Date.now(),

  duration: 10,

  reason: "System started",

  mode: "AI",
};


/*
=========================================================
CONGESTION
=========================================================
*/

function getCongestion(count) {

  if (count >= 80)
    return "CRITICAL";

  if (count >= 60)
    return "HIGH";

  if (count >= 30)
    return "MEDIUM";

  if (count > 0)
    return "LOW";

  return "CLEAR";
}


/*
=========================================================
GREEN TIME
=========================================================
*/

function getGreenTime(count) {

  /*
   * VERY LOW TRAFFIC
   *
   * Don't keep the signal open
   * unnecessarily.
   */

  if (count === 0)
    return 3;

  if (count <= 5)
    return 5;

  if (count <= 15)
    return 8;

  if (count <= 30)
    return 12;

  if (count <= 50)
    return 18;

  if (count <= 70)
    return 25;

  return 30;
}


/*
=========================================================
BEST LANE
=========================================================
*/

function getBestLane() {

  let bestLane = LANES[0];

  for (const lane of LANES) {

    if (
      traffic[lane] >
      traffic[bestLane]
    ) {

      bestLane = lane;

    }

  }

  return bestLane;
}


/*
=========================================================
AI DECISION
=========================================================
*/

function getAIDecision() {

  const bestLane = getBestLane();

  const count = traffic[bestLane];

  /*
   * If there is almost no traffic anywhere,
   * rotate quickly.
   */

  const totalVehicles =
    Object.values(traffic)
      .reduce(
        (sum, value) => sum + value,
        0
      );


  if (totalVehicles === 0) {

    return {

      lane: bestLane,

      greenTime: 3,

      reason:
        "No traffic detected — short signal cycle",

      mode: "LOW_TRAFFIC",

    };

  }


  /*
   * Highest traffic gets priority.
   */

  return {

    lane: bestLane,

    greenTime:
      getGreenTime(count),

    reason:
      `Highest traffic detected in ${bestLane}`,

    mode: "AI",

  };

}


/*
=========================================================
SIGNAL UPDATE ENGINE
=========================================================
*/

function updateSignal() {

  const now = Date.now();

  const elapsed =
    (now - signal.startedAt) / 1000;


  /*
   * Current green period finished
   */

  if (
    signal.phase === "GREEN" &&
    elapsed >= signal.duration
  ) {

    /*
     * Select NEW lane using
     * current traffic.
     */

    const decision =
      getAIDecision();


    /*
     * If current lane still has
     * the highest traffic, continue
     * intelligently.
     */

    signal.lane =
      decision.lane;

    signal.phase =
      "GREEN";

    signal.startedAt =
      now;

    signal.duration =
      decision.greenTime;

    signal.reason =
      decision.reason;

    signal.mode =
      decision.mode;

  }

}


/*
=========================================================
LIVE SIGNAL STATUS
=========================================================
*/

function getSignalStatus() {

  updateSignal();


  const elapsed =
    (Date.now() - signal.startedAt) / 1000;


  const remaining =
    Math.max(
      0,
      Math.ceil(
        signal.duration - elapsed
      )
    );


  return {

    lane:
      signal.lane,

    phase:
      signal.phase,

    remaining,

    duration:
      signal.duration,

    reason:
      signal.reason,

    mode:
      signal.mode,

  };

}


/*
=========================================================
TRAFFIC ANALYSIS
=========================================================
*/

function getAnalysis() {

  const analysis = {};


  for (const lane of LANES) {

    const count =
      Number(
        traffic[lane] || 0
      );


    analysis[lane] = {

      vehicles:
        count,

      congestion:
        getCongestion(count),

      recommendedGreenTime:
        getGreenTime(count),

    };

  }


  return analysis;

}


/*
=========================================================
GET LIVE TRAFFIC
=========================================================
*/

router.get("/live", (req, res) => {

  const totalVehicles =
    Object.values(traffic)
      .reduce(
        (sum, value) =>
          sum + value,
        0
      );


  res.json({

    success: true,

    traffic: {
      ...traffic,
    },

    totalVehicles,

    analysis:
      getAnalysis(),

    signal:
      getSignalStatus(),

    lastUpdate,

    source:
      lastUpdate
        ? "YOLO_CAMERA"
        : "WAITING_FOR_CAMERA",

  });

});


/*
=========================================================
YOLO → NODE.JS
=========================================================
*/

router.post("/update", (req, res) => {

  const body =
    req.body || {};


  for (const lane of LANES) {

    if (
      body[lane] !== undefined
    ) {

      const value =
        Number(body[lane]);


      if (
        Number.isFinite(value) &&
        value >= 0
      ) {

        traffic[lane] =
          Math.floor(value);

      }

    }

  }


  lastUpdate =
    new Date().toISOString();


  /*
   * Immediately reconsider
   * traffic priority.
   */

  const decision =
    getAIDecision();


  /*
   * If current lane has almost
   * no traffic and another lane
   * has traffic, switch priority.
   */

  if (
    signal.lane !==
      decision.lane
  ) {

    const currentCount =
      traffic[signal.lane];


    const newCount =
      traffic[decision.lane];


    /*
     * Smart early switching.
     *
     * Don't make a vehicle wait
     * behind an empty lane.
     */

    if (
      currentCount <= 5 &&
      newCount > currentCount
    ) {

      signal.lane =
        decision.lane;

      signal.phase =
        "GREEN";

      signal.startedAt =
        Date.now();

      signal.duration =
        decision.greenTime;

      signal.reason =
        `Switched early — ${decision.lane} has more traffic`;

      signal.mode =
        "ADAPTIVE";

    }

  }


  res.json({

    success: true,

    message:
      "Live traffic updated",

    traffic: {
      ...traffic,
    },

    priorityLane:
      decision.lane,

    analysis:
      getAnalysis(),

    signal:
      getSignalStatus(),

    timestamp:
      lastUpdate,

  });

});


/*
=========================================================
SIGNAL ONLY
=========================================================
*/

router.get("/", (req, res) => {

  res.json({

    success: true,

    signal:
      getSignalStatus(),

    traffic: {
      ...traffic,
    },

  });

});


/*
=========================================================
TRAFFIC SUMMARY
=========================================================
*/

router.get("/summary", (req, res) => {

  const totalVehicles =
    Object.values(traffic)
      .reduce(
        (sum, value) =>
          sum + value,
        0
      );


  const priorityLane =
    getBestLane();


  res.json({

    success: true,

    totalVehicles,

    priorityLane,

    priorityVehicles:
      traffic[priorityLane],

    congestion:
      getCongestion(
        traffic[priorityLane]
      ),

    signal:
      getSignalStatus(),

    lastUpdate,

  });

});


/*
=========================================================
EXPORT
=========================================================
*/

module.exports = router;