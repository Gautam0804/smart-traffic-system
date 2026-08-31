import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Wifi,
  XCircle,
  Activity,
  Car,
  Gauge,
  Brain,
  Radio,
  TrendingUp,
  MapPin,
  Zap,
} from "lucide-react";

import { useMemo, useState } from "react";
import useTrafficData from "../../hooks/useTrafficData";

const lanes = ["north", "south", "east", "west"];

const laneLabels = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
};

export default function Alerts() {
  const { traffic, online, loading, refresh } = useTrafficData();

  const [filter, setFilter] = useState("all");
  const [dismissed, setDismissed] = useState([]);

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // =====================================================
  // TRAFFIC ANALYSIS
  // =====================================================

  const trafficStats = useMemo(() => {
    const counts = lanes.map((lane) =>
      Number(traffic?.[lane] || 0)
    );

    const total = counts.reduce(
      (sum, value) => sum + value,
      0
    );

    const max = Math.max(...counts, 0);

    const average =
      lanes.length > 0
        ? Math.round(total / lanes.length)
        : 0;

    let level = "LOW";
    let risk = 20;

    if (max > 60 || total > 180) {
      level = "CRITICAL";
      risk = 90;
    } else if (max > 40 || total > 120) {
      level = "HIGH";
      risk = 70;
    } else if (max > 20 || total > 60) {
      level = "MODERATE";
      risk = 45;
    }

    const busiestLane =
      lanes.reduce(
        (previous, current) =>
          Number(traffic?.[current] || 0) >
          Number(traffic?.[previous] || 0)
            ? current
            : previous,
        "north"
      );

    return {
      total,
      max,
      average,
      level,
      risk,
      busiestLane,
    };
  }, [traffic]);

  // =====================================================
  // ALERT GENERATION
  // =====================================================

  const alerts = useMemo(() => {
    const result = [];

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Emergency
    if (traffic?.mode === "emergency") {
      result.push({
        id: "emergency",
        type: "emergency",
        title: "Emergency Priority Active",
        message:
          "Emergency traffic priority has been activated. Signal coordination is prioritizing emergency movement.",
        lane: traffic?.selected || "north",
        time: now,
      });
    }

    // Congestion
    lanes.forEach((lane) => {
      const count = Number(traffic?.[lane] || 0);

      if (count > 60) {
        result.push({
          id: `congestion-${lane}`,
          type: "congestion",
          title: "Heavy Congestion Detected",
          message: `${laneLabels[lane]} lane currently has ${count} detected vehicles. Immediate traffic management may be required.`,
          lane,
          time: now,
        });
      } else if (count > 40) {
        result.push({
          id: `traffic-${lane}`,
          type: "warning",
          title: "Traffic Building",
          message: `${laneLabels[lane]} lane traffic is above the normal operating threshold.`,
          lane,
          time: now,
        });
      }
    });

    // System
    if (!online) {
      result.push({
        id: "system-offline",
        type: "system",
        title: "AI Traffic Server Offline",
        message:
          "The dashboard cannot receive real-time traffic information from the AI service.",
        lane: null,
        time: now,
      });
    }

    // Normal
    if (result.length === 0) {
      result.push({
        id: "system-normal",
        type: "normal",
        title: "Traffic System Normal",
        message:
          "No critical traffic conditions are currently detected. AI monitoring is operating normally.",
        lane: null,
        time: now,
      });
    }

    return result.filter(
      (alert) => !dismissed.includes(alert.id)
    );
  }, [traffic, online, dismissed]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter(
          (alert) => alert.type === filter
        );

  // =====================================================
  // COUNTS
  // =====================================================

  const emergencyCount = alerts.filter(
    (alert) => alert.type === "emergency"
  ).length;

  const congestionCount = alerts.filter(
    (alert) =>
      alert.type === "congestion" ||
      alert.type === "warning"
  ).length;

  const systemCount = alerts.filter(
    (alert) => alert.type === "system"
  ).length;

  // =====================================================
  // ACTIONS
  // =====================================================

  const dismissAlert = (id) => {
    setDismissed((previous) => [
      ...previous,
      id,
    ]);
  };

  const clearAlerts = () => {
    setDismissed(
      alerts.map((alert) => alert.id)
    );
  };

  return (
    <div className="alerts-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-toolbar">

        <div>
          <div className="live-indicator">
            <span></span>
            LIVE ALERT CENTER
          </div>

          <h1 className="alerts-main-title">
            Traffic Alerts & Intelligence
          </h1>

          <p className="toolbar-text">
            Real-time AI-powered monitoring of traffic,
            congestion and infrastructure health.
          </p>
        </div>

        <div className="alert-toolbar-actions">

          <div className="last-updated">
            <Clock3 size={14} />
            Updated {currentTime}
          </div>

          <button
            className="refresh-button"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading ? "spin" : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="clear-alerts"
            onClick={clearAlerts}
          >
            <Trash2 size={15} />
            Clear
          </button>

        </div>
      </div>


      {/* =================================================
          CRITICAL BANNER
      ================================================= */}

      {trafficStats.level === "CRITICAL" && (
        <div className="critical-alert-banner">

          <div className="critical-banner-icon">
            <ShieldAlert size={25} />
          </div>

          <div>
            <strong>
              Critical Traffic Conditions
            </strong>

            <p>
              AI has detected severe congestion.
              Consider activating advanced signal
              optimization.
            </p>
          </div>

          <div className="critical-score">
            <span>RISK</span>
            <strong>{trafficStats.risk}%</strong>
          </div>

        </div>
      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="alert-summary-grid">

        <AlertSummary
          icon={ShieldAlert}
          label="Emergency"
          value={emergencyCount}
          active={emergencyCount > 0}
        />

        <AlertSummary
          icon={AlertTriangle}
          label="Congestion"
          value={congestionCount}
          active={congestionCount > 0}
        />

        <AlertSummary
          icon={Wifi}
          label="System"
          value={systemCount}
          active={systemCount > 0}
        />

        <AlertSummary
          icon={Bell}
          label="Total Alerts"
          value={alerts.length}
          active={alerts.length > 0}
        />

      </div>


      {/* =================================================
          LIVE TRAFFIC OVERVIEW
      ================================================= */}

      <section className="dashboard-panel traffic-intelligence-panel">

        <div className="panel-header">

          <div>
            <h2>Live Traffic Intelligence</h2>

            <p>
              AI analysis of current traffic conditions
            </p>
          </div>

          <Brain size={20} />

        </div>


        <div className="traffic-intelligence-grid">

          <div className="traffic-stat-box">
            <div className="traffic-stat-icon">
              <Car size={19} />
            </div>

            <span>Total Vehicles</span>

            <strong>
              {trafficStats.total}
            </strong>

            <small>
              Across monitored lanes
            </small>
          </div>


          <div className="traffic-stat-box">
            <div className="traffic-stat-icon">
              <Gauge size={19} />
            </div>

            <span>Traffic Risk</span>

            <strong>
              {trafficStats.risk}%
            </strong>

            <small>
              {trafficStats.level} condition
            </small>
          </div>


          <div className="traffic-stat-box">
            <div className="traffic-stat-icon">
              <MapPin size={19} />
            </div>

            <span>Busiest Lane</span>

            <strong>
              {laneLabels[trafficStats.busiestLane]}
            </strong>

            <small>
              {trafficStats.max} vehicles
            </small>
          </div>


          <div className="traffic-stat-box">
            <div className="traffic-stat-icon">
              <Activity size={19} />
            </div>

            <span>Average Density</span>

            <strong>
              {trafficStats.average}
            </strong>

            <small>
              Vehicles / lane
            </small>
          </div>

        </div>

      </section>


      {/* =================================================
          LANE MONITORING
      ================================================= */}

      <section className="dashboard-panel">

        <div className="panel-header">

          <div>
            <h2>Lane Monitoring</h2>

            <p>
              Current vehicle distribution by direction
            </p>
          </div>

          <Radio size={19} />

        </div>


        <div className="lane-monitor-grid">

          {lanes.map((lane) => {

            const count =
              Number(traffic?.[lane] || 0);

            const percentage = Math.min(
              (count / 80) * 100,
              100
            );

            let status = "NORMAL";

            if (count > 60) {
              status = "CRITICAL";
            } else if (count > 40) {
              status = "BUSY";
            } else if (count > 20) {
              status = "MODERATE";
            }

            return (
              <div
                className="lane-monitor-card"
                key={lane}
              >

                <div className="lane-card-top">

                  <div>
                    <span className="lane-direction">
                      {laneLabels[lane]} Lane
                    </span>

                    <strong>
                      {count}
                    </strong>
                  </div>

                  <span
                    className={`lane-status ${status.toLowerCase()}`}
                  >
                    {status}
                  </span>

                </div>


                <div className="lane-progress">

                  <div
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>


                <div className="lane-card-footer">

                  <span>
                    Vehicle count
                  </span>

                  <span>
                    {Math.round(percentage)}%
                    capacity
                  </span>

                </div>

              </div>
            );
          })}

        </div>

      </section>


      {/* =================================================
          AI INSIGHTS
      ================================================= */}

      <section className="dashboard-panel ai-insights-panel">

        <div className="panel-header">

          <div>
            <h2>AI Traffic Insights</h2>

            <p>
              Automatically generated operational insights
            </p>
          </div>

          <Brain size={19} />

        </div>


        <div className="ai-insights-list">

          <Insight
            icon={TrendingUp}
            title="Traffic Analysis"
            text={
              trafficStats.level === "LOW"
                ? "Traffic conditions are currently light and stable."
                : `Traffic is currently ${trafficStats.level.toLowerCase()}. Additional signal optimization may improve flow.`
            }
          />


          <Insight
            icon={MapPin}
            title="Busiest Corridor"
            text={`${laneLabels[trafficStats.busiestLane]} lane is currently carrying the highest vehicle volume with ${trafficStats.max} detected vehicles.`}
          />


          <Insight
            icon={Zap}
            title="Recommended Action"
            text={
              trafficStats.level === "CRITICAL"
                ? "Prioritize congestion management and consider adaptive signal timing."
                : "Continue monitoring traffic flow and allow the AI engine to optimize signal timing."
            }
          />

        </div>

      </section>


      {/* =================================================
          ACTIVE ALERTS
      ================================================= */}

      <section className="dashboard-panel">

        <div className="alert-filter">

          <div>

            <h2>Active Alerts</h2>

            <p>
              Automatically generated from live AI
              traffic data
            </p>

          </div>


          <div className="alert-filter-buttons">

            <FilterButton
              active={filter === "all"}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </FilterButton>


            <FilterButton
              active={filter === "emergency"}
              onClick={() =>
                setFilter("emergency")
              }
            >
              Emergency
            </FilterButton>


            <FilterButton
              active={filter === "congestion"}
              onClick={() =>
                setFilter("congestion")
              }
            >
              Congestion
            </FilterButton>


            <FilterButton
              active={filter === "system"}
              onClick={() =>
                setFilter("system")
              }
            >
              System
            </FilterButton>

          </div>

        </div>


        <div className="alerts-list">

          {filteredAlerts.length === 0 ? (
            <EmptyAlerts />
          ) : (
            filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
              />
            ))
          )}

        </div>

      </section>


      {/* =================================================
          BOTTOM GRID
      ================================================= */}

      <div className="alert-bottom-grid">

        {/* SYSTEM HEALTH */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>System Health</h2>

              <p>
                Traffic AI service status
              </p>
            </div>

            <Wifi size={19} />

          </div>


          <SystemHealth
            label="AI Traffic Engine"
            status={online}
          />

          <SystemHealth
            label="Traffic Data Stream"
            status={online}
          />

          <SystemHealth
            label="Signal Controller"
            status={online}
          />

          <SystemHealth
            label="Camera Connection"
            status={online}
          />

        </section>


        {/* ALERT RULES */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>AI Alert Rules</h2>

              <p>
                Current detection thresholds
              </p>
            </div>

            <AlertTriangle size={19} />

          </div>


          <AlertRule
            label="Heavy congestion"
            value="> 60 vehicles"
          />

          <AlertRule
            label="Traffic warning"
            value="> 40 vehicles"
          />

          <AlertRule
            label="Moderate traffic"
            value="> 20 vehicles"
          />

          <AlertRule
            label="Emergency"
            value="AI priority"
          />

          <AlertRule
            label="System failure"
            value="API offline"
          />

        </section>

      </div>

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function AlertSummary({
  icon: Icon,
  label,
  value,
  active,
}) {
  return (
    <div
      className={
        active
          ? "alert-summary-card active"
          : "alert-summary-card"
      }
    >

      <div className="alert-summary-icon">
        <Icon size={19} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      className={
        active
          ? "alert-filter-active"
          : ""
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}


/* =========================================================
   ALERT ITEM
========================================================= */

function AlertItem({
  alert,
  onDismiss,
}) {

  const config = {

    emergency: {
      icon: ShieldAlert,
      className: "emergency",
    },

    congestion: {
      icon: AlertTriangle,
      className: "congestion",
    },

    warning: {
      icon: AlertTriangle,
      className: "warning",
    },

    system: {
      icon: Wifi,
      className: "system",
    },

    normal: {
      icon: CheckCircle2,
      className: "normal",
    },

  };


  const current =
    config[alert.type] ||
    config.normal;


  const Icon = current.icon;


  return (
    <div
      className={`alert-item ${current.className}`}
    >

      <div className="alert-item-icon">
        <Icon size={20} />
      </div>


      <div className="alert-content">

        <div className="alert-title-row">

          <strong>
            {alert.title}
          </strong>

          <span>
            {alert.time}
          </span>

        </div>


        <p>
          {alert.message}
        </p>


        {alert.lane && (
          <div className="alert-lane">
            <MapPin size={13} />
            Lane:{" "}
            {alert.lane.toUpperCase()}
          </div>
        )}

      </div>


      {alert.type !== "normal" && (
        <button
          className="dismiss-alert"
          onClick={() =>
            onDismiss(alert.id)
          }
        >
          <XCircle size={17} />
        </button>
      )}

    </div>
  );
}


/* =========================================================
   EMPTY ALERTS
========================================================= */

function EmptyAlerts() {
  return (
    <div className="empty-alerts">

      <CheckCircle2 size={35} />

      <strong>
        No active alerts
      </strong>

      <span>
        Traffic conditions are currently normal.
      </span>

    </div>
  );
}


/* =========================================================
   SYSTEM HEALTH
========================================================= */

function SystemHealth({
  label,
  status,
}) {
  return (
    <div className="system-health-row">

      <div>

        <span
          className={
            status
              ? "health-dot online"
              : "health-dot offline"
          }
        />

        {label}

      </div>


      <strong
        className={
          status
            ? "health-online"
            : "health-offline"
        }
      >
        {status
          ? "OPERATIONAL"
          : "OFFLINE"}
      </strong>

    </div>
  );
}


/* =========================================================
   ALERT RULE
========================================================= */

function AlertRule({
  label,
  value,
}) {
  return (
    <div className="alert-rule">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


/* =========================================================
   AI INSIGHT
========================================================= */

function Insight({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="ai-insight">

      <div className="ai-insight-icon">
        <Icon size={18} />
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}