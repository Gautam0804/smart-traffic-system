import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Car,
  CheckCircle2,
  Clock3,
  Gauge,
  MapPin,
  Navigation,
  Radio,
  Route,
  Signal,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import TrafficMap from "../components/TrafficMap";

import {
  getTrafficPrediction,
} from "../services/api";

import "./Dashboard.css";


/*
=========================================================
LANES
=========================================================
*/

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


/*
=========================================================
DEFAULT TRAFFIC
=========================================================
*/

const DEFAULT_TRAFFIC = {
  north: 0,
  south: 0,
  east: 0,
  west: 0,

  selected: "north",

  green_time: 3,

  signal: {
    lane: "north",
    phase: "GREEN",
    remaining: 3,
    duration: 3,
  },

  best_route: "north",

  best_route_vehicles: 0,

  signal_reason:
    "Waiting for AI traffic data...",

  route_reason:
    "Calculating best route...",

  confidence: 0,

  analysis: {},
};


/*
=========================================================
STATUS
=========================================================
*/

function getStatus(value) {
  if (value >= 70) {
    return "HEAVY";
  }

  if (value >= 40) {
    return "MODERATE";
  }

  return "LOW";
}


function getStatusClass(value) {
  if (value >= 70) {
    return "heavy";
  }

  if (value >= 40) {
    return "moderate";
  }

  return "low";
}


/*
=========================================================
DASHBOARD
=========================================================
*/

export default function Dashboard() {

  /*
  =======================================================
  TRAFFIC STATE
  =======================================================
  */

  const [traffic, setTraffic] =
    useState(DEFAULT_TRAFFIC);


  /*
  =======================================================
  HISTORY
  =======================================================
  */

  const [history, setHistory] =
    useState([]);


  /*
  =======================================================
  API STATUS
  =======================================================
  */

  const [apiStatus, setApiStatus] =
    useState("CONNECTING");


  /*
  =======================================================
  LAST UPDATE
  =======================================================
  */

  const [lastUpdate, setLastUpdate] =
    useState(null);


  /*
  =======================================================
  LIVE AI DATA
  =======================================================
  */

  useEffect(() => {

    let mounted = true;


    const loadTraffic = async () => {

      try {

        /*
        ---------------------------------------------------
        IMPORTANT

        Dashboard NO LONGER calls:

        http://127.0.0.1:8000/ml-predict

        api.js handles that.
        ---------------------------------------------------
        */

        const result =
          await getTrafficPrediction();


        if (!mounted) {
          return;
        }


        console.log(
          "ML Traffic Response:",
          result
        );


        /*
        ===================================================
        TRAFFIC DATA
        ===================================================
        */

        const liveTraffic =
          result?.traffic ??
          result ??
          {};


        const north =
          Number(
            liveTraffic.north ?? 0
          );


        const south =
          Number(
            liveTraffic.south ?? 0
          );


        const east =
          Number(
            liveTraffic.east ?? 0
          );


        const west =
          Number(
            liveTraffic.west ?? 0
          );


        /*
        ===================================================
        SIGNAL
        ===================================================
        */

        const signal =
          result?.signal ??
          {
            lane: "north",
            phase: "GREEN",
            remaining: 3,
            duration: 3,
          };


        /*
        ===================================================
        ANALYSIS
        ===================================================
        */

        const analysis =
          result?.analysis ??
          {};


        /*
        ===================================================
        FIND BEST ROUTE

        Use backend value if available.
        Otherwise calculate from traffic.
        ===================================================
        */

        let bestRoute =
          result?.best_route;


        let bestRouteVehicles =
          result?.best_route_vehicles;


        if (!bestRoute) {

          const routeValues = [
            {
              lane: "north",
              vehicles: north,
            },
            {
              lane: "south",
              vehicles: south,
            },
            {
              lane: "east",
              vehicles: east,
            },
            {
              lane: "west",
              vehicles: west,
            },
          ];


          routeValues.sort(
            (a, b) =>
              a.vehicles - b.vehicles
          );


          bestRoute =
            routeValues[0].lane;


          bestRouteVehicles =
            routeValues[0].vehicles;

        }


        /*
        ===================================================
        SIGNAL REASON
        ===================================================
        */

        const signalReason =
          result?.signal_reason ??
          signal?.reason ??
          "AI traffic signal optimization";


        /*
        ===================================================
        ROUTE REASON
        ===================================================
        */

        const routeReason =
          result?.route_reason ??
          `Use ${bestRoute} route to avoid traffic.`;


        /*
        ===================================================
        GREEN TIME
        ===================================================
        */

        const greenTime =
          Number(
            result?.green_time ??
            signal?.duration ??
            3
          );


        /*
        ===================================================
        CONFIDENCE
        ===================================================
        */

        const confidence =
          Number(
            result?.confidence ?? 0
          );


        /*
        ===================================================
        NORMALIZED TRAFFIC OBJECT
        ===================================================
        */

        const normalizedTraffic = {

          /*
          Traffic
          */

          north,

          south,

          east,

          west,


          /*
          Selected lane
          */

          selected:
            result?.selected ??
            signal?.lane ??
            "north",


          /*
          Signal
          */

          signal: {

            lane:
              signal?.lane ??
              "north",

            phase:
              signal?.phase ??
              "GREEN",

            remaining:
              Number(
                signal?.remaining ?? 3
              ),

            duration:
              Number(
                signal?.duration ??
                greenTime
              ),

          },


          /*
          Green time
          */

          green_time:
            greenTime,


          /*
          Best route
          */

          best_route:
            bestRoute,


          best_route_vehicles:
            Number(
              bestRouteVehicles ?? 0
            ),


          /*
          Reasons
          */

          signal_reason:
            signalReason,


          route_reason:
            routeReason,


          /*
          AI confidence
          */

          confidence,


          /*
          Backend analysis
          */

          analysis,

        };


        /*
        ===================================================
        SAVE TRAFFIC
        ===================================================
        */

        setTraffic(
          normalizedTraffic
        );


        /*
        ===================================================
        API LIVE
        ===================================================
        */

        setApiStatus(
          "LIVE"
        );


        /*
        ===================================================
        LAST UPDATE
        ===================================================
        */

        setLastUpdate(

          result?.lastUpdate
            ? new Date(
                result.lastUpdate
              )
            : new Date()

        );


        /*
        ===================================================
        TOTAL
        ===================================================
        */

        const total =
          north +
          south +
          east +
          west;


        /*
        ===================================================
        HISTORY
        ===================================================
        */

        setHistory(
          (previous) => {

            const point = {

              time:
                new Date()
                  .toLocaleTimeString(
                    [],
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  ),

              traffic:
                total,
            };


            return [
              ...previous,
              point,
            ].slice(-12);

          }
        );

      } catch (error) {

        console.error(
          "Traffic API:",
          error
        );


        if (mounted) {

          setApiStatus(
            "OFFLINE"
          );

        }

      }

    };


    /*
    =====================================================
    FIRST REQUEST
    =====================================================
    */

    loadTraffic();


    /*
    =====================================================
    REFRESH EVERY 2 SECONDS
    =====================================================
    */

    const interval =
      setInterval(
        loadTraffic,
        2000
      );


    /*
    =====================================================
    CLEANUP
    =====================================================
    */

    return () => {

      mounted = false;

      clearInterval(
        interval
      );

    };

  }, []);


  /*
  =======================================================
  TOTAL VEHICLES
  =======================================================
  */

  const totalVehicles =
    LANES.reduce(
      (sum, lane) =>
        sum +
        Number(
          traffic[lane.id] || 0
        ),
      0
    );


  /*
  =======================================================
  ACTIVE LANE
  =======================================================
  */

  const activeLane =
    traffic.signal?.lane ||
    traffic.selected ||
    "north";


  /*
  =======================================================
  PHASE
  =======================================================
  */

  const phase =
    traffic.signal?.phase ||
    "RED";


  /*
  =======================================================
  REMAINING
  =======================================================
  */

  const remaining =
    Number(
      traffic.signal?.remaining ??
      0
    );


  /*
  =======================================================
  GREEN TIME
  =======================================================
  */

  const greenTime =
    Number(
      traffic.green_time ||
      traffic.signal?.duration ||
      3
    );


  /*
  =======================================================
  BEST ROUTE
  =======================================================
  */

  const bestRoute =
    traffic.best_route ||
    "north";


  /*
  =======================================================
  BEST ROUTE VEHICLES
  =======================================================
  */

  const bestRouteVehicles =
    traffic.best_route_vehicles ??
    traffic[bestRoute] ??
    0;


  /*
  =======================================================
  AVERAGE TRAFFIC
  =======================================================
  */

  const averageTraffic =
    Math.round(
      totalVehicles / 4
    );


  /*
  =======================================================
  CONGESTION
  =======================================================
  */

  const congestion =
    averageTraffic >= 70
      ? "SEVERE"
      : averageTraffic >= 45
        ? "HIGH"
        : averageTraffic >= 25
          ? "MODERATE"
          : "LOW";


  const congestionClass =
    averageTraffic >= 70
      ? "severe"
      : averageTraffic >= 45
        ? "high"
        : averageTraffic >= 25
          ? "moderate"
          : "low";


  /*
  =======================================================
  ACTIVE LANE DATA
  =======================================================
  */

  const activeLaneData =
    LANES.find(
      (lane) =>
        lane.id === activeLane
    ) ||
    LANES[0];


  /*
  =======================================================
  AI RECOMMENDATION
  =======================================================
  */

  const recommendation =
    traffic.route_reason ||
    `Use ${bestRoute} route to avoid traffic.`;


  /*
  =======================================================
  SIGNAL CARDS
  =======================================================
  */

  const signalCards =
    useMemo(
      () =>
        LANES.map(
          (lane) => {

            const count =
              Number(
                traffic[lane.id] ||
                0
              );


            const isActive =
              lane.id ===
              activeLane;


            const lanePhase =
              isActive
                ? phase
                : "RED";


            return {

              ...lane,

              count,

              status:
                getStatus(count),

              statusClass:
                getStatusClass(count),

              isActive,

              phase:
                lanePhase,

            };

          }
        ),

      [
        traffic,
        activeLane,
        phase,
      ]
    );


  /*
  =======================================================
  RENDER
  =======================================================
  */

  return (

    <div className="dashboard-page">


      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>

          <div className="eyebrow">
            SMART TRAFFIC AI
          </div>

          <h1>
            Traffic Operations Dashboard
          </h1>

          <p>
            Real-time traffic intelligence,
            adaptive signals and route optimization.
          </p>

        </div>


        <div className="dashboard-status">

          <div
            className={`connection-status ${
              apiStatus.toLowerCase()
            }`}
          >

            <span />

            {apiStatus === "LIVE"
              ? "AI SYSTEM LIVE"
              : apiStatus}

          </div>


          {lastUpdate && (

            <div className="last-update">

              <Clock3 size={12} />

              Updated{" "}

              {lastUpdate.toLocaleTimeString()}

            </div>

          )}

        </div>

      </header>


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="kpi-grid">


        <div className="kpi-card">

          <div className="kpi-icon blue">
            <Car size={19} />
          </div>

          <div className="kpi-content">

            <span>
              LIVE VEHICLES
            </span>

            <strong>
              {totalVehicles}
            </strong>

            <small>
              Across 4 directions
            </small>

          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon green">
            <Signal size={19} />
          </div>

          <div className="kpi-content">

            <span>
              ACTIVE SIGNAL
            </span>

            <strong>
              {activeLaneData.name}
            </strong>

            <small>
              {phase} • {remaining}s remaining
            </small>

          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon orange">
            <Gauge size={19} />
          </div>

          <div className="kpi-content">

            <span>
              CONGESTION
            </span>

            <strong className={congestionClass}>
              {congestion}
            </strong>

            <small>
              Average {averageTraffic} vehicles/lane
            </small>

          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon purple">
            <Route size={19} />
          </div>

          <div className="kpi-content">

            <span>
              BEST ROUTE
            </span>

            <strong>
              {bestRoute.toUpperCase()}
            </strong>

            <small>
              {bestRouteVehicles} vehicles
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <section className="dashboard-main-grid">


        {/* =================================================
            MAP
        ================================================= */}

        <div className="dashboard-panel map-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                LIVE MAP
              </span>

              <h2>
                Traffic Intelligence Map
              </h2>

            </div>


            <div className="map-live-badge">

              <Radio size={12} />

              LIVE GPS

            </div>

          </div>


          <div className="dashboard-map">

            <TrafficMap
              traffic={traffic}
              activeLane={activeLane}
              greenTime={greenTime}
              bestRoute={bestRoute}
            />

          </div>

        </div>


        {/* =================================================
            AI CONTROL
        ================================================= */}

        <div className="dashboard-panel ai-control-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                AI CONTROL
              </span>

              <h2>
                Intersection Controller
              </h2>

            </div>

            <BrainCircuit size={19} />

          </div>


          <div className="active-signal">

            <div className="active-signal-top">

              <span>
                ACTIVE DIRECTION
              </span>

              <span className="active-badge">
                AI CONTROLLED
              </span>

            </div>


            <div className="active-direction">

              <div className="direction-big">

                {activeLane === "north" && (
                  <ArrowUp size={25} />
                )}

                {activeLane === "south" && (
                  <ArrowDown size={25} />
                )}

                {activeLane === "east" && (
                  <ArrowRight size={25} />
                )}

                {activeLane === "west" && (
                  <ArrowLeft size={25} />
                )}

              </div>


              <div>

                <strong>
                  {activeLaneData.name}
                </strong>

                <span>
                  {traffic[activeLane] || 0}
                  {" "}vehicles detected
                </span>

              </div>

            </div>


            <div
              className={`phase-display ${phase.toLowerCase()}`}
            >

              <div className="phase-light">

                <span className="red-light" />

                <span className="yellow-light" />

                <span className="green-light" />

              </div>


              <div>

                <strong>
                  {phase}
                </strong>

                <span>
                  Signal phase
                </span>

              </div>


              <div className="phase-countdown">

                <strong>
                  {remaining}
                </strong>

                <span>
                  SEC
                </span>

              </div>

            </div>


            <div className="green-time">

              <div>

                <span>
                  AI GREEN TIME
                </span>

                <strong>
                  {greenTime}s
                </strong>

              </div>

              <Timer size={18} />

            </div>

          </div>


          <div className="ai-reason">

            <div className="ai-reason-icon">
              <Zap size={16} />
            </div>

            <div>

              <span>
                SIGNAL DECISION
              </span>

              <strong>
                {traffic.signal_reason ||
                  "AI analyzing traffic..."}
              </strong>

            </div>

          </div>


          <div className="route-recommendation">

            <div className="route-icon">
              <Navigation size={17} />
            </div>

            <div>

              <span>
                BEST LOW-TRAFFIC ROUTE
              </span>

              <strong>
                {bestRoute.toUpperCase()}
              </strong>

              <small>
                {recommendation}
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SIGNAL GRID
      ================================================= */}

      <section className="dashboard-panel signal-panel">

        <div className="panel-header">

          <div>

            <span className="panel-eyebrow">
              SIGNAL NETWORK
            </span>

            <h2>
              Real-Time Traffic Signals
            </h2>

          </div>


          <div className="signal-network-status">

            <span />

            4 INTERSECTIONS MONITORED

          </div>

        </div>


        <div className="signal-grid">

          {signalCards.map(
            (lane) => {

              const Icon =
                lane.icon;


              return (

                <div
                  key={lane.id}
                  className={`signal-card ${
                    lane.isActive
                      ? "active"
                      : ""
                  }`}
                >


                  <div className="signal-card-header">

                    <div className="signal-direction">

                      <div className="direction-icon">

                        <Icon size={16} />

                      </div>


                      <div>

                        <strong>
                          {lane.name}
                        </strong>

                        <span>
                          {lane.count} vehicles
                        </span>

                      </div>

                    </div>


                    {lane.isActive && (

                      <span className="active-label">
                        ACTIVE
                      </span>

                    )}

                  </div>


                  <div className="traffic-light">

                    <span
                      className={`bulb red ${
                        lane.phase === "RED"
                          ? "on"
                          : ""
                      }`}
                    />

                    <span
                      className={`bulb yellow ${
                        lane.phase === "YELLOW"
                          ? "on"
                          : ""
                      }`}
                    />

                    <span
                      className={`bulb green ${
                        lane.phase === "GREEN"
                          ? "on"
                          : ""
                      }`}
                    />

                  </div>


                  <div className="signal-card-data">

                    <div>

                      <span>
                        VEHICLES
                      </span>

                      <strong>
                        {lane.count}
                      </strong>

                    </div>


                    <div>

                      <span>
                        STATUS
                      </span>

                      <strong
                        className={
                          lane.statusClass
                        }
                      >
                        {lane.status}
                      </strong>

                    </div>


                    <div>

                      <span>
                        SIGNAL
                      </span>

                      <strong>
                        {lane.phase}
                      </strong>

                    </div>

                  </div>


                  {lane.isActive && (

                    <div className="signal-progress">

                      <div
                        style={{
                          width:
                            `${Math.min(
                              100,
                              greenTime > 0
                                ? (
                                    remaining /
                                    greenTime
                                  ) * 100
                                : 0
                            )}%`,
                        }}
                      />

                    </div>

                  )}

                </div>

              );

            }
          )}

        </div>

      </section>


      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="dashboard-bottom-grid">


        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                LIVE ANALYTICS
              </span>

              <h2>
                Traffic Flow
              </h2>

            </div>

            <TrendingUp size={17} />

          </div>


          <div className="chart-container">

            {history.length > 1 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={history}
                >

                  <CartesianGrid
                    stroke="#1d2939"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#0d1420",
                      border:
                        "1px solid #243247",
                      borderRadius:
                        "8px",
                      color:
                        "#e2e8f0",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="traffic"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="chart-empty">

                <Activity size={20} />

                Waiting for live traffic data...

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            AI RECOMMENDATION
        ================================================= */}

        <div className="dashboard-panel recommendation-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                AI RECOMMENDATIONS
              </span>

              <h2>
                Congestion Prevention
              </h2>

            </div>

            <BrainCircuit size={17} />

          </div>


          <div className="recommendation-main">

            <div className="recommendation-icon">

              <Route size={20} />

            </div>


            <div>

              <span>
                RECOMMENDED ROUTE
              </span>

              <strong>
                {bestRoute.toUpperCase()}
              </strong>

              <p>
                {recommendation}
              </p>

            </div>

          </div>


          <div className="recommendation-stats">

            <div>

              <span>
                ROUTE VEHICLES
              </span>

              <strong>
                {bestRouteVehicles}
              </strong>

            </div>


            <div>

              <span>
                AI CONFIDENCE
              </span>

              <strong>

                {Math.round(
                  Number(
                    traffic.confidence ||
                    0
                  ) * 100
                )}%

              </strong>

            </div>


            <div>

              <span>
                MODE
              </span>

              <strong>
                AI
              </strong>

            </div>

          </div>


          <div className="prevention-note">

            <CheckCircle2 size={15} />

            <span>
              Route is selected proactively
              based on current vehicle density.
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER STATUS
      ================================================= */}

      <footer className="dashboard-footer">

        <div>

          <span className="footer-dot" />

          Smart Traffic AI

        </div>


        <span>
          Live optimization engine
        </span>


        <span>
          API : ML SERVICE
        </span>

      </footer>


    </div>

  );

}