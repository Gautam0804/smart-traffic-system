import {
  Camera,
  Car,
  Activity,
  Radio,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useTrafficData from "../../hooks/useTrafficData";

import "./LiveMonitoring.css";

const ML_API_URL =
  import.meta.env.VITE_ML_API_URL ||
  "http://127.0.0.1:8001";

const DEFAULT_TRAFFIC = {
  north: 0,
  south: 0,
  east: 0,
  west: 0,
};

const lanes = [
  {
    key: "north",
    name: "North",
    camera: "CAM-01",
  },
  {
    key: "south",
    name: "South",
    camera: "CAM-02",
  },
  {
    key: "east",
    name: "East",
    camera: "CAM-03",
  },
  {
    key: "west",
    name: "West",
    camera: "CAM-04",
  },
];

export default function LiveMonitoring() {
  const trafficData = useTrafficData();

  /*
   * IMPORTANT:
   * Never assume API data exists during first render.
   */
  const traffic = trafficData?.traffic ?? DEFAULT_TRAFFIC;

  const online = trafficData?.online ?? false;

  const loading = trafficData?.loading ?? false;

  const refresh =
    trafficData?.refresh ??
    (() => {});

  const lastUpdated =
    trafficData?.lastUpdated ?? null;

  const totalVehicles =
    Number(traffic.north || 0) +
    Number(traffic.south || 0) +
    Number(traffic.east || 0) +
    Number(traffic.west || 0);

  return (
    <div className="monitoring-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-toolbar">

        <div>

          <div className="live-indicator">
            <span />
            LIVE MONITORING
          </div>

          <h1 className="monitoring-title">
            Traffic Camera Network
          </h1>

          <p className="toolbar-text">
            Real-time camera feeds and AI vehicle detection
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="monitor-stats">

        <StatCard
          icon={<Camera size={20} />}
          label="CAMERAS"
          value="1 / 4"
          description="Webcam stream connected"
        />

        <StatCard
          icon={<Car size={20} />}
          label="VEHICLES DETECTED"
          value={totalVehicles}
          description="Across monitored lanes"
        />

        <StatCard
          icon={<Activity size={20} />}
          label="DETECTION ENGINE"
          value={online ? "ACTIVE" : "OFFLINE"}
          description="YOLO AI processing"
        />

        <StatCard
          icon={<Radio size={20} />}
          label="DATA STREAM"
          value={online ? "LIVE" : "OFFLINE"}
          description={
            lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for data"
          }
        />

      </div>


      {/* =====================================================
          LIVE CAMERA
      ===================================================== */}

      <section className="monitoring-panel main-camera-panel">

        <div className="panel-header">

          <div>

            <h2>
              Live Camera Feed
            </h2>

            <p>
              Real webcam stream with AI vehicle detection
            </p>

          </div>

          <div className="panel-status live">

            <span />

            CAMERA LIVE

          </div>

        </div>


        <div className="main-camera-layout">

          <CameraCard
            lane={lanes[0]}
            vehicles={Number(traffic.north || 0)}
            primary
          />


          <div className="camera-side-list">

            {lanes.slice(1).map((lane) => (

              <MiniCameraCard
                key={lane.key}
                lane={lane}
                vehicles={Number(
                  traffic[lane.key] || 0
                )}
              />

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          VEHICLE DETECTION
      ===================================================== */}

      <section className="monitoring-bottom-grid">

        <div className="monitoring-panel">

          <div className="panel-header">

            <div>

              <h2>
                Vehicle Detection
              </h2>

              <p>
                Current AI vehicle count by lane
              </p>

            </div>

            <Car size={20} />

          </div>


          <div className="vehicle-detection-list">

            {lanes.map((lane) => {

              const count =
                Number(
                  traffic[lane.key] || 0
                );

              const percentage =
                Math.min(
                  100,
                  count
                );

              return (

                <div
                  className="vehicle-row"
                  key={lane.key}
                >

                  <div className="vehicle-row-info">

                    <div className="lane-name">

                      <span className="lane-dot" />

                      {lane.name}

                    </div>

                    <strong>
                      {count}
                    </strong>

                  </div>


                  <div className="vehicle-progress">

                    <span
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>


        {/* ===================================================
            DETECTION SYSTEM
        =================================================== */}

        <div className="monitoring-panel">

          <div className="panel-header">

            <div>

              <h2>
                Detection System
              </h2>

              <p>
                AI camera processing status
              </p>

            </div>

            <Video size={20} />

          </div>


          <div className="detection-status">

            <StatusRow
              label="Camera Stream"
              status={true}
            />

            <StatusRow
              label="Traffic API"
              status={online}
            />

            <StatusRow
              label="AI Processing"
              status={online}
            />

            <StatusRow
              label="Vehicle Detection"
              status={online}
            />

          </div>


          {!online && (

            <div className="detection-warning">

              <AlertTriangle size={18} />

              <div>

                <strong>
                  Traffic API unavailable
                </strong>

                <p>
                  Start Node.js backend and
                  YOLO camera service.
                </p>

              </div>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}) {

  return (

    <div className="monitor-stat">

      <div className="monitor-stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>

  );
}


/* =========================================================
   MAIN CAMERA
========================================================= */

function CameraCard({
  lane,
  vehicles,
  primary = false,
}) {

 const imageRef = useRef(null);
const videoRef = useRef(null);
const canvasRef = useRef(null);

const [streamError, setStreamError] =
  useState(false);

const [cameraStream, setCameraStream] =
  useState(null);

const [detecting, setDetecting] =
  useState(false);

  const startCamera = async () => {

    try {

      setStreamError(false);

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

      setStreamError(true);

    }

  };


  const stopCamera = () => {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setStreamError(true);
    setDetecting(false);
    setLiveVehicles(0);

  };


  useEffect(() => {

    if (
      cameraStream &&
      videoRef.current
    ) {

      videoRef.current.srcObject =
        cameraStream;

      videoRef.current
        .play()
        .catch((error) =>
          console.warn(
            "Video play warning:",
            error
          )
        );

    }

  }, [cameraStream]);


  const detectVehicles = async () => {

    if (
      !videoRef.current ||
      !canvasRef.current ||
      !cameraStream
    ) {
      return;
    }

    if (detecting) {
      return;
    }

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (video.readyState < 2) {
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    try {

      setDetecting(true);

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const image =
        canvas.toDataURL(
          "image/jpeg",
          0.7
        );

      const response =
        await fetch(
          `${ML_API_URL}/detect`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              image,
            }),
          }
        );

      if (!response.ok) {

        throw new Error(
          `YOLO API failed: ${response.status}`
        );

      }

      const result =
        await response.json();

      console.log(
        "YOLO RESULT:",
        result
      );

      if (result.success) {

        setLiveVehicles(
          Number(
            result.vehicles || 0
          )
        );

      }

    } catch (error) {

      console.error(
        "Vehicle detection error:",
        error
      );

    } finally {

      setDetecting(false);

    }

  };


  useEffect(() => {

    if (!cameraStream) {
      return;
    }

    const interval =
      setInterval(
        detectVehicles,
        1500
      );

    return () => {
      clearInterval(interval);
    };

  }, [cameraStream, detecting]);


  useEffect(() => {

    return () => {

      if (cameraStream) {

        cameraStream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

      }

    };

  }, [cameraStream]);


  const handleFullscreen = () => {

    if (!videoRef.current) {
      return;
    }

    if (
      videoRef.current.requestFullscreen
    ) {

      videoRef.current.requestFullscreen();

    }

  };


  return (

    <div
      className={`camera-card ${
        primary
          ? "primary-camera"
          : ""
      }`}
    >

      <div className="camera-view">

        {/* TOP OVERLAY */}

        <div className="camera-overlay">

          <div className="camera-name">

            <Camera size={15} />

            {lane.camera}

          </div>


          <div className="camera-live">

            <span />

            LIVE

          </div>

        </div>


        {/* REAL CAMERA */}

        {cameraStream ? (

          <video
            ref={videoRef}
            className="real-camera-stream"
            autoPlay
            muted
            playsInline
          />

        ) : (

          <div className="camera-error">

            <Video size={38} />

            <strong>
              Camera Offline
            </strong>

            <span>
              Click camera button to start
            </span>

          </div>

        )}

        <canvas
          ref={canvasRef}
          style={{
            display: "none",
          }}
        />


        {/* CONTROLS */}

        <div className="camera-controls">

          <button
            type="button"
            title={
              cameraStream
                ? "Stop Camera"
                : "Start Camera"
            }
            className={
              cameraStream
                ? "camera-online-button"
                : ""
            }
            onClick={
              cameraStream
                ? stopCamera
                : startCamera
            }
          >
            <Radio size={15} />
          </button>


          <button
            title="Fullscreen"
            onClick={
              handleFullscreen
            }
          >
            <Maximize2 size={15} />
          </button>

        </div>


        {/* BOTTOM OVERLAY */}

        <div className="camera-bottom-overlay">

          <div>

            <span>
              LIVE VIDEO
            </span>

            <strong>
              {lane.name.toUpperCase()}
              {" "}
              INTERSECTION
            </strong>

          </div>


          <div className="vehicle-live-count">

            <Car size={14} />

            {cameraStream
              ? liveVehicles
              : vehicles}

          </div>

        </div>

      </div>


      {/* INFO */}

      <div className="camera-info">

        <div>

          <span className="camera-label">
            CAMERA
          </span>

          <h3>
            {lane.camera}
          </h3>

        </div>


        <div className="camera-vehicles">

          <Car size={17} />

          <strong>
            {cameraStream
              ? liveVehicles
              : vehicles}
          </strong>

          <span>
            vehicles
          </span>

        </div>

      </div>


      <div className="camera-status">

        <CheckCircle2 size={14} />

        {cameraStream
          ? detecting
            ? "Camera live • YOLO analyzing"
            : "Live camera connected"
          : "Camera disconnected"}

      </div>

    </div>

  );
}


/* =========================================================
   MINI CAMERA
========================================================= */

function MiniCameraCard({
  lane,
  vehicles,
}) {

  return (

    <div className="mini-camera-card">

      <div className="mini-camera-view">

        <div className="mini-camera-offline">

          <Video size={20} />

          <span>
            CAMERA OFFLINE
          </span>

        </div>


        <div className="mini-camera-top">

          <span>
            {lane.camera}
          </span>

          <b>
            OFFLINE
          </b>

        </div>

      </div>


      <div className="mini-camera-info">

        <strong>
          {lane.name}
        </strong>

        <span>
          {vehicles} vehicles
        </span>

      </div>

    </div>

  );
}


/* =========================================================
   STATUS
========================================================= */

function StatusRow({
  label,
  status,
}) {

  return (

    <div className="detection-row">

      <div className="detection-label">

        <span
          className={`status-circle ${
            status
              ? "online"
              : "offline"
          }`}
        />

        {label}

      </div>


      <strong
        className={
          status
            ? "status-online"
            : "status-offline"
        }
      >

        {status
          ? "ONLINE"
          : "OFFLINE"}

      </strong>

    </div>

  );
}