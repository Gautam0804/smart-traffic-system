import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";

import "leaflet/dist/leaflet.css";


/* =========================================================
   DEFAULT LOCATION
   Used only when GPS is not available yet.
========================================================= */

const DEFAULT_LOCATION = [28.6139, 77.2090];


/* =========================================================
   GPS FOLLOWER
========================================================= */

function LocationFollower({ position, follow }) {

  const map = useMap();

  useEffect(() => {

    if (!position || !follow) {
      return;
    }

    map.flyTo(position, 16, {
      duration: 0.8,
    });

  }, [position, follow, map]);

  return null;
}


/* =========================================================
   USER GPS ICON
========================================================= */

const userIcon = L.divIcon({

  className: "user-gps-icon",

  html: `
    <div class="gps-pulse">
      <div class="gps-dot"></div>
    </div>
  `,

  iconSize: [30, 30],

  iconAnchor: [15, 15],

});


/* =========================================================
   SIGNAL ICON
========================================================= */

const createSignalIcon = (
  phase,
  active
) => {

  let color = "#ef4444";

  if (phase === "GREEN") {
    color = "#22c55e";
  }

  if (phase === "YELLOW") {
    color = "#f59e0b";
  }

  return L.divIcon({

    className: "traffic-signal-marker",

    html: `
      <div
        class="signal-marker ${active ? "active" : ""}"
      >

        <div
          class="signal-light"
          style="
            background:${color};
            box-shadow:0 0 14px ${color};
          "
        ></div>

        <span>🚦</span>

      </div>
    `,

    iconSize: [46, 46],

    iconAnchor: [23, 23],

  });

};


/* =========================================================
   TRAFFIC MAP
========================================================= */

export default function TrafficMap({

  traffic = {},

  activeLane = "north",

  greenTime = 20,

}) {


  /* =======================================================
     STATE
  ======================================================= */

  const [position, setPosition] =
    useState(null);

  const [accuracy, setAccuracy] =
    useState(null);

  const [gpsStatus, setGpsStatus] =
    useState("SEARCHING");

  const [followUser, setFollowUser] =
    useState(true);


  /* =======================================================
     LIVE GPS
  ======================================================= */

  useEffect(() => {

    if (!navigator.geolocation) {

      setGpsStatus("UNAVAILABLE");

      return;

    }


    const watchId =
      navigator.geolocation.watchPosition(

        (location) => {

          const coords = [

            location.coords.latitude,

            location.coords.longitude,

          ];

          setPosition(coords);

          setAccuracy(
            location.coords.accuracy
          );

          setGpsStatus("LIVE");

        },

        (error) => {

          console.error(
            "GPS error:",
            error
          );

          setGpsStatus("ERROR");

        },

        {

          enableHighAccuracy: true,

          maximumAge: 2000,

          timeout: 10000,

        }

      );


    return () => {

      navigator.geolocation.clearWatch(
        watchId
      );

    };

  }, []);


  /* =======================================================
     MAP CENTER
  ======================================================= */

  const mapCenter =
    position || DEFAULT_LOCATION;


  /* =======================================================
     INTERSECTION
     
     For now the intersection follows the user's GPS.
     
     Later we can replace this with actual intersection
     coordinates from your backend/database.
  ======================================================= */

  const intersection =
    position || DEFAULT_LOCATION;


  /* =======================================================
     SIGNAL DATA
  ======================================================= */

  const signal = traffic.signal || {};

  const currentSignalLane =
    signal.lane || activeLane;

  const currentPhase =
    signal.phase || "GREEN";

  const remaining =
    Number(signal.remaining ?? greenTime);


  /* =======================================================
     LANE DATA
  ======================================================= */

  const lanes = useMemo(() => [

    {
      lane: "north",
      name: "NORTH",
      offset: [0.0015, 0],
    },

    {
      lane: "south",
      name: "SOUTH",
      offset: [-0.0015, 0],
    },

    {
      lane: "east",
      name: "EAST",
      offset: [0, 0.0015],
    },

    {
      lane: "west",
      name: "WEST",
      offset: [0, -0.0015],
    },

  ], []);


  /* =======================================================
     SIGNAL POSITION
  ======================================================= */

  const getSignalPosition =
    (signalItem) => {

      return [

        intersection[0]
          + signalItem.offset[0],

        intersection[1]
          + signalItem.offset[1],

      ];

    };


  /* =======================================================
     VEHICLE COUNT
  ======================================================= */

  const getVehicleCount =
    (lane) => {

      return Number(
        traffic[lane] || 0
      );

    };


  /* =======================================================
     CONGESTION
  ======================================================= */

  const getCongestion =
    (count) => {

      if (count >= 80) {
        return "HIGH";
      }

      if (count >= 50) {
        return "MODERATE";
      }

      if (count >= 20) {
        return "LOW";
      }

      return "CLEAR";

    };


  /* =======================================================
     SIGNAL PHASE
     
     The backend controls the active lane.
  ======================================================= */

  const getPhase =
    (lane) => {

      if (lane === currentSignalLane) {

        return currentPhase;

      }

      return "RED";

    };


  /* =======================================================
     ROUTE
     
     This is currently a visual optimized route.
     It is NOT pretending to be Google Maps navigation.
     
     Later we can connect this to a real routing engine.
  ======================================================= */

  const route = position

    ? [

        position,

        [
          position[0] + 0.0006,
          position[1] + 0.0007,
        ],

        [
          position[0] + 0.0012,
          position[1] + 0.0014,
        ],

        [
          position[0] + 0.0018,
          position[1] + 0.0023,
        ],

      ]

    : [];


  /* =======================================================
     FOLLOW GPS
  ======================================================= */

  const handleFollowUser = () => {

    if (!position) {
      return;
    }

    setFollowUser(true);

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="traffic-map-container">


      {/* =================================================
          TOP MAP OVERLAY
      ================================================= */}

      <div className="map-overlay">


        {/* GPS STATUS */}

        <div className="map-live">

          <span />

          {gpsStatus === "LIVE"

            ? "LIVE GPS"

            : `GPS ${gpsStatus}`}

        </div>


        {/* MAP TITLE */}

        <div className="map-title">

          <strong>
            Traffic Optimization Map
          </strong>

          <small>
            AI-controlled intersection
          </small>

        </div>


      </div>


      {/* =================================================
          FOLLOW GPS BUTTON
      ================================================= */}

      <button

        className="gps-follow-button"

        onClick={handleFollowUser}

        disabled={!position}

        title="Center map on your location"

      >

        ◎

      </button>


      {/* =================================================
          LEAFLET MAP
      ================================================= */}

      <MapContainer

        center={mapCenter}

        zoom={15}

        scrollWheelZoom={true}

        zoomControl={true}

        className="traffic-leaflet-map"

      >


        {/* =================================================
            OPEN STREET MAP
        ================================================= */}

        <TileLayer

          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        {/* =================================================
            GPS FOLLOW
        ================================================= */}

        <LocationFollower

          position={position}

          follow={followUser}

        />


        {/* =================================================
            USER LOCATION
        ================================================= */}

        {position && (

          <Marker

            position={position}

            icon={userIcon}

          >

            <Popup>

              <strong>
                Your Live Location
              </strong>

              <br />

              GPS tracking active

              <br />

              <br />

              Latitude:

              {" "}

              {position[0].toFixed(6)}

              <br />

              Longitude:

              {" "}

              {position[1].toFixed(6)}

              <br />

              Accuracy:

              {" "}

              {accuracy
                ? `${Math.round(accuracy)}m`
                : "Unknown"}

            </Popup>

          </Marker>

        )}


        {/* =================================================
            OPTIMIZED ROUTE
        ================================================= */}

        {route.length > 1 && (

          <Polyline

            positions={route}

            pathOptions={{

              color: "#38bdf8",

              weight: 6,

              opacity: 0.85,

              lineCap: "round",

              lineJoin: "round",

              dashArray: "1 10",

            }}

          />

        )}


        {/* =================================================
            INTERSECTION
        ================================================= */}

        <CircleMarker

          center={intersection}

          radius={13}

          pathOptions={{

            color: "#38bdf8",

            fillColor: "#0ea5e9",

            fillOpacity: 0.25,

            weight: 2,

          }}

        >

          <Popup>

            <strong>
              Smart Traffic Intersection
            </strong>

            <br />

            AI Signal:

            {" "}

            {currentSignalLane.toUpperCase()}

            <br />

            Phase:

            {" "}

            {currentPhase}

            <br />

            Remaining:

            {" "}

            {remaining}s

          </Popup>

        </CircleMarker>


        {/* =================================================
            TRAFFIC SIGNALS
        ================================================= */}

        {lanes.map((lane) => {

          const phase =
            getPhase(lane.lane);

          const signalPosition =
            getSignalPosition(lane);

          const count =
            getVehicleCount(lane.lane);

          const congestion =
            getCongestion(count);

          const active =
            lane.lane ===
            currentSignalLane;


          return (

            <Marker

              key={lane.lane}

              position={signalPosition}

              icon={createSignalIcon(
                phase,
                active
              )}

            >

              <Popup>

                <strong>

                  {lane.name} SIGNAL

                </strong>

                <br />

                Status:

                {" "}

                <b>
                  {phase}
                </b>

                <br />

                Vehicles:

                {" "}

                <b>
                  {count}
                </b>

                <br />

                Congestion:

                {" "}

                <b>
                  {congestion}
                </b>

                {active && (

                  <>

                    <br />

                    Remaining:

                    {" "}

                    <b>
                      {remaining}s
                    </b>

                  </>

                )}

              </Popup>

            </Marker>

          );

        })}


      </MapContainer>


      {/* =================================================
          GPS INFO CARD
      ================================================= */}

      <div className="gps-info">


        <div>

          <span className="gps-dot-small" />

          <strong>
            GPS TRACKING
          </strong>

        </div>


        {position ? (

          <>

            <span>

              {position[0].toFixed(5)}

              {", "}

              {position[1].toFixed(5)}

            </span>


            {accuracy && (

              <span className="gps-accuracy">

                ±{Math.round(accuracy)}m

              </span>

            )}

          </>

        ) : (

          <span>
            Waiting for GPS permission...
          </span>

        )}


      </div>


      {/* =================================================
          AI SIGNAL CARD
      ================================================= */}

      <div className="signal-map-card">


        <span>
          AI SIGNAL
        </span>


        <strong>

          {currentSignalLane.toUpperCase()}

        </strong>


        <div className="signal-card-phase">

          <i
            className={
              currentPhase.toLowerCase()
            }
          />

          {currentPhase}

        </div>


        <small>

          {remaining}s remaining

        </small>


      </div>


      {/* =================================================
          TRAFFIC LEGEND
      ================================================= */}

      <div className="traffic-map-legend">


        <div>

          <span className="legend-dot green" />

          Green

        </div>


        <div>

          <span className="legend-dot yellow" />

          Yellow

        </div>


        <div>

          <span className="legend-dot red" />

          Red

        </div>


        <div>

          <span className="legend-line" />

          Optimized route

        </div>


      </div>


    </div>

  );

}