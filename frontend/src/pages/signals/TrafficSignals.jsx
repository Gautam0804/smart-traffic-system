import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Car,
  CheckCircle2,
  Clock3,
  Gauge,
  RefreshCw,
  Route,
  Server,
  Signal,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import "./TrafficSignals.css";

// =========================================================
// ML API
// =========================================================

const ML_API_URL =
  import.meta.env.VITE_ML_API_URL ||
  "http://127.0.0.1:8001";


// =========================================================
// LANES
// =========================================================

const LANES = [
  {
    id: "north",
    name: "North",
    icon: ArrowUp,
  },
  {
    id: "south",
    name: "South",
    icon: ArrowDown,
  },
  {
    id: "east",
    name: "East",
    icon: ArrowRight,
  },
  {
    id: "west",
    name: "West",
    icon: ArrowLeft,
  },
];


// =========================================================
// TRAFFIC LIGHT
// =========================================================

function TrafficLight({ phase }) {
  return (
    <div className="traffic-light">

      <span
        className={`light red ${
          phase === "RED" ? "on" : ""
        }`}
      />

      <span
        className={`light yellow ${
          phase === "YELLOW" ? "on" : ""
        }`}
      />

      <span
        className={`light green ${
          phase === "GREEN" ? "on" : ""
        }`}
      />

    </div>
  );
}


// =========================================================
// CONGESTION
// =========================================================

function getCongestion(count) {
  if (count >= 70) return "HIGH";
  if (count >= 40) return "MEDIUM";
  return "LOW";
}


function getCongestionClass(level) {
  if (level === "HIGH") return "high";
  if (level === "MEDIUM") return "medium";
  return "low";
}


// =========================================================
// FORMAT
// =========================================================

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}


// =========================================================
// TRAFFIC SIGNALS
// =========================================================

export default function TrafficSignals() {

  // =======================================================
  // STATE
  // =======================================================

  const [traffic, setTraffic] = useState({
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  });

  const [selectedLane, setSelectedLane] =
    useState("north");

  const [phase, setPhase] =
    useState("GREEN");

  const [remaining, setRemaining] =
    useState(0);

  const [duration, setDuration] =
    useState(20);

  const [reason, setReason] = useState(
    "Waiting for AI traffic analysis..."
  );

  const [confidence, setConfidence] =
    useState(0);

  const [mode, setMode] =
    useState("AI OPTIMIZED");

  const [serverOnline, setServerOnline] =
    useState(false);

  const [lastUpdate, setLastUpdate] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [apiLatency, setApiLatency] =
    useState(0);


  // =======================================================
  // FETCH TRAFFIC
  // =======================================================

  const fetchTraffic = useCallback(
    async () => {

      const startTime = performance.now();

      try {

        const response = await fetch(
          `${ML_API_URL}/ml-predict`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Traffic API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        const endTime =
          performance.now();

        setApiLatency(
          Math.round(
            endTime - startTime
          )
        );

        setServerOnline(true);

        setTraffic({
          north: Number(data.north || 0),
          south: Number(data.south || 0),
          east: Number(data.east || 0),
          west: Number(data.west || 0),
        });

        setSelectedLane(
          data.selected || "north"
        );

        setReason(
          data.reason ||
            "AI is optimizing traffic flow."
        );

        setConfidence(
          Math.min(
            100,
            Math.max(
              0,
              Math.round(
                Number(
                  data.confidence || 0
                ) * 100
              )
            )
          )
        );

        setDuration(
          Number(
            data.green_time || 20
          )
        );

        setMode(
          data.mode === "emergency"
            ? "EMERGENCY"
            : data.mode === "low-traffic"
              ? "LOW TRAFFIC"
              : "AI OPTIMIZED"
        );

        setLastUpdate(
          new Date()
        );

      } catch (error) {

        console.error(
          "Traffic API:",
          error
        );

        setServerOnline(false);
      }

    },
    []
  );


  // =======================================================
  // FETCH SIGNAL
  // =======================================================

  const fetchSignal = useCallback(
    async () => {

      try {

        const response = await fetch(
          `${ML_API_URL}/signal-status`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setSelectedLane(
          data.lane || "north"
        );

        setPhase(
          data.phase || "GREEN"
        );

        setRemaining(
          Number(
            data.remaining || 0
          )
        );

        setDuration(
          Number(
            data.duration || 20
          )
        );

      } catch (error) {

        console.error(
          "Signal API:",
          error
        );

      }

    },
    []
  );


  // =======================================================
  // REFRESH
  // =======================================================

  const refreshData = async () => {

    setRefreshing(true);

    await Promise.all([
      fetchTraffic(),
      fetchSignal(),
    ]);

    setRefreshing(false);
  };


  // =======================================================
  // LIVE UPDATE
  // =======================================================

  useEffect(() => {

    fetchTraffic();
    fetchSignal();

    const trafficInterval =
      setInterval(
        fetchTraffic,
        3000
      );

    const signalInterval =
      setInterval(
        fetchSignal,
        1000
      );

    return () => {

      clearInterval(
        trafficInterval
      );

      clearInterval(
        signalInterval
      );

    };

  }, [
    fetchTraffic,
    fetchSignal,
  ]);


  // =======================================================
  // TOTAL VEHICLES
  // =======================================================

  const totalVehicles = useMemo(() => {

    return Object.values(
      traffic
    ).reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    );

  }, [traffic]);


  // =======================================================
  // AVERAGE
  // =======================================================

  const averageTraffic = useMemo(() => {

    return Math.round(
      totalVehicles /
        LANES.length
    );

  }, [totalVehicles]);


  // =======================================================
  // BUSIEST LANE
  // =======================================================

  const busiestLane = useMemo(() => {

    return LANES.reduce(
      (best, lane) => {

        return traffic[lane.id] >
          traffic[best.id]
          ? lane
          : best;

      },
      LANES[0]
    );

  }, [traffic]);


  // =======================================================
  // BEST ROUTE
  // =======================================================

  const bestRoute = useMemo(() => {

    return LANES.reduce(
      (best, lane) => {

        return traffic[lane.id] <
          traffic[best.id]
          ? lane
          : best;

      },
      LANES[0]
    );

  }, [traffic]);


  // =======================================================
  // TRAFFIC LOAD
  // =======================================================

  const trafficLoad = useMemo(() => {

    return Math.min(
      100,
      Math.round(
        (totalVehicles / 280) *
          100
      )
    );

  }, [totalVehicles]);


  // =======================================================
  // SYSTEM EFFICIENCY
  // =======================================================

  const systemEfficiency =
    useMemo(() => {

      const value =
        confidence * 0.7 +
        (100 - trafficLoad) *
          0.3;

      return Math.round(
        Math.max(
          0,
          Math.min(
            100,
            value
          )
        )
      );

    }, [
      confidence,
      trafficLoad,
    ]);


  // =======================================================
  // SELECTED VEHICLES
  // =======================================================

  const selectedVehicles =
    Number(
      traffic[selectedLane] || 0
    );


  // =======================================================
  // SIGNAL PROGRESS
  // =======================================================

  const signalProgress =
    Math.min(
      100,
      Math.max(
        0,
        (remaining /
          Math.max(
            duration,
            1
          )) *
          100
      )
    );


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main className="signals-page">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <header className="signals-header">

        <div className="header-left">

          <div className="breadcrumb">
            <span>SMART TRAFFIC AI</span>
            <b>/</b>
            <span>CONTROL CENTER</span>
            <b>/</b>
            <strong>TRAFFIC SIGNALS</strong>
          </div>

          <div className="title-row">

            <div className="title-icon">
              <Signal size={22} />
            </div>

            <div>

              <h1>
                Traffic Signal Control
              </h1>

              <p>
                Real-time intersection monitoring
                and AI-powered signal optimization
              </p>

            </div>

          </div>

        </div>


        <div className="header-right">

          <button
            className="refresh-button"
            onClick={refreshData}
            disabled={refreshing}
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>


          <div
            className={`engine-status ${
              serverOnline
                ? "online"
                : "offline"
            }`}
          >

            <span className="status-dot" />

            <div>

              <strong>
                {serverOnline
                  ? "AI ENGINE ONLINE"
                  : "AI ENGINE OFFLINE"}
              </strong>

              <small>
                {serverOnline
                  ? `${apiLatency}ms response`
                  : "Waiting for Flask API"}
              </small>

            </div>

          </div>

        </div>

      </header>


      {/* ===================================================
          TOP STATS
      =================================================== */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon blue">
            <Car size={18} />
          </div>

          <div className="stat-info">

            <span>
              LIVE VEHICLES
            </span>

            <strong>
              {formatNumber(
                totalVehicles
              )}
            </strong>

            <small>
              Across 4 monitored lanes
            </small>

          </div>

          <div className="stat-badge live">
            LIVE
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon orange">
            <TrendingUp size={18} />
          </div>

          <div className="stat-info">

            <span>
              TRAFFIC LOAD
            </span>

            <strong>
              {trafficLoad}%
            </strong>

            <small>
              Intersection capacity
            </small>

          </div>

          <div
            className={`stat-badge ${
              trafficLoad >= 70
                ? "danger"
                : "safe"
            }`}
          >
            {trafficLoad >= 70
              ? "HIGH"
              : "NORMAL"}
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon green">
            <Signal size={18} />
          </div>

          <div className="stat-info">

            <span>
              ACTIVE SIGNAL
            </span>

            <strong>
              {selectedLane.toUpperCase()}
            </strong>

            <small>
              {remaining}s remaining
            </small>

          </div>

          <div className="stat-badge active">
            {phase}
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon purple">
            <BrainCircuit size={18} />
          </div>

          <div className="stat-info">

            <span>
              AI CONFIDENCE
            </span>

            <strong>
              {confidence}%
            </strong>

            <small>
              Prediction confidence
            </small>

          </div>

          <div className="stat-badge ai">
            AI
          </div>

        </div>

      </section>


      {/* ===================================================
          LIVE INTERSECTION
      =================================================== */}

      <section className="main-panel">

        <div className="panel-heading">

          <div>

            <div className="panel-title">

              <Activity size={16} />

              <h2>
                Live Intersection
              </h2>

            </div>

            <p>
              Signal state and vehicle density
              across every direction
            </p>

          </div>

          <div className="live-pill">

            <span />

            LIVE DATA

          </div>

        </div>


        <div className="intersection-grid">

          {LANES.map((lane) => {

            const vehicles =
              Number(
                traffic[lane.id] || 0
              );

            const congestion =
              getCongestion(
                vehicles
              );

            const isActive =
              lane.id ===
              selectedLane;

            const currentPhase =
              isActive
                ? phase
                : "RED";

            const Icon =
              lane.icon;

            const laneLoad =
              Math.min(
                100,
                vehicles
              );

            return (

              <article
                key={lane.id}
                className={`lane-card ${
                  isActive
                    ? "selected"
                    : ""
                }`}
              >

                {/* LANE HEADER */}

                <div className="lane-header">

                  <div className="lane-name">

                    <div className="lane-icon">
                      <Icon size={17} />
                    </div>

                    <div>

                      <h3>
                        {lane.name}
                      </h3>

                      <span>
                        Traffic lane
                      </span>

                    </div>

                  </div>


                  <span
                    className={`phase-tag ${
                      currentPhase.toLowerCase()
                    }`}
                  >
                    {currentPhase}
                  </span>

                </div>


                {/* SIGNAL */}

                <div className="signal-display">

                  <TrafficLight
                    phase={
                      currentPhase
                    }
                  />

                  <div
                    className={`phase-label ${
                      currentPhase.toLowerCase()
                    }`}
                  >
                    {currentPhase}
                  </div>

                </div>


                {/* TIMER */}

                <div className="timer-box">

                  <div>

                    <span>
                      TIME REMAINING
                    </span>

                    <Clock3 size={13} />

                  </div>

                  <strong>
                    {isActive
                      ? remaining
                      : 0}

                    <small>s</small>
                  </strong>

                </div>


                {/* METRICS */}

                <div className="lane-metrics">

                  <div>

                    <span>
                      VEHICLES
                    </span>

                    <strong>
                      {vehicles}
                    </strong>

                  </div>

                  <div>

                    <span>
                      CONGESTION
                    </span>

                    <strong
                      className={
                        getCongestionClass(
                          congestion
                        )
                      }
                    >
                      {congestion}
                    </strong>

                  </div>

                </div>


                {/* TRAFFIC LOAD */}

                <div className="progress-section">

                  <div className="progress-label">

                    <span>
                      Traffic load
                    </span>

                    <strong>
                      {laneLoad}%
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className={`progress-bar ${
                        getCongestionClass(
                          congestion
                        )
                      }`}
                      style={{
                        width:
                          `${laneLoad}%`,
                      }}
                    />

                  </div>

                </div>


                {/* SIGNAL CYCLE */}

                <div className="progress-section">

                  <div className="progress-label">

                    <span>
                      Signal cycle
                    </span>

                    <strong>
                      {isActive
                        ? `${remaining}s`
                        : "Waiting"}
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className={`progress-bar ${
                        currentPhase.toLowerCase()
                      }`}
                      style={{
                        width:
                          isActive
                            ? `${signalProgress}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>


                {isActive && (

                  <div className="active-lane-label">

                    <CheckCircle2
                      size={13}
                    />

                    Currently controlled

                  </div>

                )}

              </article>

            );

          })}

        </div>

      </section>


      {/* ===================================================
          ANALYTICS ROW
      =================================================== */}

      <section className="analytics-grid">

        {/* TRAFFIC OVERVIEW */}

        <div className="analytics-card">

          <div className="card-header">

            <div>

              <h2>
                Traffic Overview
              </h2>

              <p>
                Current intersection analytics
              </p>

            </div>

            <Gauge size={18} />

          </div>


          <div className="analytics-content">

            <div className="big-metric">

              <span>
                TOTAL VEHICLES
              </span>

              <strong>
                {totalVehicles}
              </strong>

              <small>
                {averageTraffic}
                {" "}
                average per lane
              </small>

            </div>


            <div className="mini-stat">

              <span>
                BUSIEST
              </span>

              <strong>
                {busiestLane.name}
              </strong>

              <small>
                {traffic[
                  busiestLane.id
                ]} vehicles
              </small>

            </div>


            <div className="mini-stat">

              <span>
                BEST ROUTE
              </span>

              <strong>
                {bestRoute.name}
              </strong>

              <small>
                {traffic[
                  bestRoute.id
                ]} vehicles
              </small>

            </div>

          </div>

        </div>


        {/* SYSTEM PERFORMANCE */}

        <div className="analytics-card">

          <div className="card-header">

            <div>

              <h2>
                System Performance
              </h2>

              <p>
                AI engine health metrics
              </p>

            </div>

            <Server size={18} />

          </div>


          <div className="performance-list">

            <div className="performance-item">

              <div>

                <span>
                  AI EFFICIENCY
                </span>

                <strong>
                  {systemEfficiency}%
                </strong>

              </div>

              <div className="performance-track">

                <div
                  style={{
                    width:
                      `${systemEfficiency}%`,
                  }}
                />

              </div>

            </div>


            <div className="performance-item">

              <div>

                <span>
                  AI CONFIDENCE
                </span>

                <strong>
                  {confidence}%
                </strong>

              </div>

              <div className="performance-track">

                <div
                  style={{
                    width:
                      `${confidence}%`,
                  }}
                />

              </div>

            </div>


            <div className="performance-details">

              <div>

                <Zap size={14} />

                <span>
                  API Latency
                </span>

                <strong>
                  {apiLatency} ms
                </strong>

              </div>

              <div>

                <Timer size={14} />

                <span>
                  Signal Duration
                </span>

                <strong>
                  {duration}s
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          AI DECISION
      =================================================== */}

      <section className="ai-panel">

        <div className="ai-header">

          <div className="ai-title">

            <div className="ai-icon">
              <Sparkles size={19} />
            </div>

            <div>

              <h2>
                AI Signal Decision
              </h2>

              <p>
                Real-time traffic optimization
                recommendation
              </p>

            </div>

          </div>


          <span className="ai-mode">
            {mode}
          </span>

        </div>


        <div className="ai-body">

          <div className="recommendation">

            <span>
              RECOMMENDED DIRECTION
            </span>

            <strong>
              {selectedLane.toUpperCase()}
            </strong>

            <p>
              {reason}
            </p>

          </div>


          <div className="ai-metric">

            <span>
              AI CONFIDENCE
            </span>

            <strong>
              {confidence}%
            </strong>

            <div className="confidence-track">

              <div
                style={{
                  width:
                    `${confidence}%`,
                }}
              />

            </div>

          </div>


          <div className="ai-metric">

            <span>
              BUSIEST LANE
            </span>

            <strong>
              {busiestLane.name}
            </strong>

            <small>
              {traffic[
                busiestLane.id
              ]} vehicles
            </small>

          </div>


          <div className="ai-metric">

            <span>
              LOWEST TRAFFIC
            </span>

            <strong>
              {bestRoute.name}
            </strong>

            <small>
              {traffic[
                bestRoute.id
              ]} vehicles
            </small>

          </div>

        </div>


        <div className="ai-insight">

          <div className="insight-icon">
            <CheckCircle2 size={15} />
          </div>

          <div>

            <strong>
              Smart traffic optimization active
            </strong>

            <p>
              The AI engine is prioritizing the{" "}
              <b>
                {selectedLane}
              </b>{" "}
              direction with{" "}
              <b>
                {confidence}%
              </b>{" "}
              confidence while monitoring{" "}
              <b>
                {totalVehicles}
              </b>{" "}
              vehicles across the intersection.
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="signals-footer">

        <div>

          <Activity size={13} />

          <span>
            Smart Traffic AI
          </span>

          <b>•</b>

          <span>
            Live Signal Control
          </span>

        </div>


        <div>

          <span
            className={
              serverOnline
                ? "footer-online"
                : "footer-offline"
            }
          >
            <span />
            {serverOnline
              ? "System operational"
              : "Connection unavailable"}
          </span>

          <b>•</b>

          <span>
            {lastUpdate
              ? `Last sync ${lastUpdate.toLocaleTimeString()}`
              : "Waiting for data"}
          </span>

        </div>

      </footer>

    </main>
  );
}