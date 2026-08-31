const LANES = ["north", "south", "east", "west"];

const state = {
  activeLane: "north",
  phase: "GREEN",
  startedAt: Date.now(),
  duration: 20,
  reason: "System started",
};

function getTrafficScore(count) {
  return Math.max(0, Number(count) || 0);
}

function calculateGreenTime(count) {
  if (count >= 80) return 30;
  if (count >= 60) return 25;
  if (count >= 40) return 20;
  if (count >= 20) return 15;
  if (count > 0) return 10;

  // Empty direction doesn't need a long green phase.
  return 5;
}

function congestionLevel(count) {
  if (count >= 80) return "CRITICAL";
  if (count >= 60) return "HIGH";
  if (count >= 30) return "MEDIUM";
  if (count > 0) return "LOW";
  return "CLEAR";
}

function chooseBestLane(traffic) {
  const entries = LANES.map((lane) => ({
    lane,
    count: getTrafficScore(traffic[lane]),
  }));

  // Highest waiting traffic gets priority.
  entries.sort((a, b) => b.count - a.count);

  const best = entries[0];

  // If every direction is empty, keep the current direction
  // but use a very short cycle.
  if (best.count === 0) {
    return {
      lane: state.activeLane,
      count: 0,
      reason: "All lanes clear",
    };
  }

  return {
    lane: best.lane,
    count: best.count,
    reason: `${best.lane.toUpperCase()} has the highest traffic`,
  };
}

function calculateDecision(traffic) {
  const selected = chooseBestLane(traffic);

  const greenTime = calculateGreenTime(selected.count);

  return {
    selectedLane: selected.lane,
    greenTime,
    reason: selected.reason,
    mode: "AI",
  };
}

function updateController(traffic) {
  const now = Date.now();
  const elapsed = (now - state.startedAt) / 1000;

  /*
   * GREEN phase
   */
  if (state.phase === "GREEN") {
    if (elapsed >= state.duration) {
      state.phase = "YELLOW";
      state.startedAt = now;
      state.duration = 3;
    }
  }

  /*
   * YELLOW phase
   */
  else if (state.phase === "YELLOW") {
    if (elapsed >= 3) {
      const decision = calculateDecision(traffic);

      state.activeLane = decision.selectedLane;
      state.phase = "GREEN";
      state.startedAt = now;
      state.duration = decision.greenTime;
      state.reason = decision.reason;
    }
  }

  const remaining = Math.max(
    0,
    Math.ceil(
      state.duration -
        (Date.now() - state.startedAt) / 1000
    )
  );

  return {
    activeLane: state.activeLane,
    phase: state.phase,
    remaining,
    duration: state.duration,
    reason: state.reason,
  };
}

function getTrafficAnalysis(traffic) {
  const analysis = {};

  for (const lane of LANES) {
    const count = getTrafficScore(traffic[lane]);

    analysis[lane] = {
      vehicles: count,
      congestion: congestionLevel(count),
      greenTime: calculateGreenTime(count),
    };
  }

  return analysis;
}

module.exports = {
  updateController,
  getTrafficAnalysis,
  calculateDecision,
};