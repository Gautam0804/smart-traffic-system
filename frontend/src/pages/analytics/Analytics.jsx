import {
  Activity,
  BarChart3,
  Car,
  Clock3,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import { useEffect, useMemo, useState } from "react";
import useTrafficData from "../../hooks/useTrafficData";

const lanes = ["north", "south", "east", "west"];

export default function Analytics() {
  const { traffic, online, loading, refresh } = useTrafficData();

  const [history, setHistory] = useState([]);

  // Capture traffic readings
  useEffect(() => {
    if (!online) return;

    const total =
      Number(traffic.north || 0) +
      Number(traffic.south || 0) +
      Number(traffic.east || 0) +
      Number(traffic.west || 0);

    const point = {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      north: Number(traffic.north || 0),
      south: Number(traffic.south || 0),
      east: Number(traffic.east || 0),
      west: Number(traffic.west || 0),
      total,
    };

    setHistory((previous) =>
      [...previous, point].slice(-20)
    );
  }, [
    traffic.north,
    traffic.south,
    traffic.east,
    traffic.west,
    online,
  ]);

  const totalVehicles = useMemo(() => {
    return lanes.reduce(
      (sum, lane) =>
        sum + Number(traffic[lane] || 0),
      0
    );
  }, [traffic]);

  const averageVehicles = useMemo(() => {
    if (!history.length) return 0;

    const total = history.reduce(
      (sum, item) => sum + item.total,
      0
    );

    return Math.round(total / history.length);
  }, [history]);

  const busiestLane = useMemo(() => {
    if (!history.length) return "--";

    const totals = {
      north: 0,
      south: 0,
      east: 0,
      west: 0,
    };

    history.forEach((item) => {
      lanes.forEach((lane) => {
        totals[lane] += item[lane];
      });
    });

    return Object.keys(totals).reduce((a, b) =>
      totals[a] > totals[b] ? a : b
    );
  }, [history]);

  const peakTraffic = useMemo(() => {
    if (!history.length) return 0;

    return Math.max(
      ...history.map((item) => item.total)
    );
  }, [history]);

  const laneComparison = lanes.map((lane) => ({
    lane: lane.toUpperCase(),
    vehicles: Number(traffic[lane] || 0),
  }));

  return (
    <div className="analytics-page">

      {/* TOOLBAR */}

      <div className="page-toolbar">

        <div>
          <div className="live-indicator">
            <span></span>
            TRAFFIC ANALYTICS
          </div>

          <p className="toolbar-text">
            Real-time traffic trends and historical analysis
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

      {/* ANALYTICS CARDS */}

      <div className="analytics-stats">

        <AnalyticsCard
          icon={Car}
          title="Current Vehicles"
          value={totalVehicles}
          subtitle="All monitored lanes"
        />

        <AnalyticsCard
          icon={Activity}
          title="Average Traffic"
          value={averageVehicles}
          subtitle="Average detected vehicles"
        />

        <AnalyticsCard
          icon={TrendingUp}
          title="Peak Traffic"
          value={peakTraffic}
          subtitle="Highest recorded reading"
        />

        <AnalyticsCard
          icon={BarChart3}
          title="Busiest Lane"
          value={busiestLane.toUpperCase()}
          subtitle="Based on recorded traffic"
        />

      </div>

      {/* TRAFFIC TREND */}

      <section className="dashboard-panel analytics-chart-panel">

        <div className="panel-header">

          <div>
            <h2>Traffic Trends</h2>

            <p>
              Vehicle volume over recent readings
            </p>
          </div>

          <div className="chart-time">
            <Clock3 size={15} />
            Live data
          </div>

        </div>

        <div className="analytics-chart">

          {history.length > 1 ? (
            <ResponsiveContainer
              width="100%"
              height={330}
            >
              <LineChart data={history}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1c2838"
                />

                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={9}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={9}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0d1420",
                    border: "1px solid #263044",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyAnalytics />
          )}

        </div>

      </section>

      {/* LANE COMPARISON */}

      <div className="analytics-grid">

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>Lane Comparison</h2>

              <p>
                Current vehicle distribution
              </p>
            </div>

            <Car size={19} />

          </div>

          <div className="analytics-bar-chart">

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart data={laneComparison}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1c2838"
                />

                <XAxis
                  dataKey="lane"
                  stroke="#64748b"
                  fontSize={9}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={9}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0d1420",
                    border: "1px solid #263044",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="vehicles"
                  fill="#38bdf8"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </section>

        {/* LANE TABLE */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>Lane Statistics</h2>

              <p>
                Current intersection conditions
              </p>
            </div>

            <Activity size={19} />

          </div>

          <div className="lane-stat-table">

            <div className="lane-stat-header">
              <span>LANE</span>
              <span>VEHICLES</span>
              <span>STATUS</span>
            </div>

            {lanes.map((lane) => {
              const count =
                Number(traffic[lane] || 0);

              let status = "LOW";

              if (count > 60) {
                status = "HIGH";
              } else if (count > 30) {
                status = "MODERATE";
              }

              return (
                <div
                  className="lane-stat-row"
                  key={lane}
                >
                  <strong>
                    {lane.toUpperCase()}
                  </strong>

                  <span>
                    {count}
                  </span>

                  <b className={status.toLowerCase()}>
                    {status}
                  </b>
                </div>
              );
            })}

          </div>

        </section>

      </div>

      {/* PEAK HOURS */}

      <section className="dashboard-panel peak-panel">

        <div className="panel-header">

          <div>
            <h2>Peak Hour Analysis</h2>

            <p>
              Traffic intensity classification
            </p>
          </div>

          <TrendingUp size={19} />

        </div>

        <div className="peak-grid">

          <PeakHour
            time="Morning"
            range="06:00 - 10:00"
            level="High"
          />

          <PeakHour
            time="Midday"
            range="11:00 - 15:00"
            level="Moderate"
          />

          <PeakHour
            time="Evening"
            range="16:00 - 20:00"
            level="High"
          />

          <PeakHour
            time="Night"
            range="21:00 - 05:00"
            level="Low"
          />

        </div>

      </section>

    </div>
  );
}


/* =========================
   ANALYTICS CARD
========================= */

function AnalyticsCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="analytics-stat-card">

      <div className="analytics-card-icon">
        <Icon size={19} />
      </div>

      <span>{title}</span>

      <strong>{value}</strong>

      <small>{subtitle}</small>

    </div>
  );
}


/* =========================
   EMPTY
========================= */

function EmptyAnalytics() {
  return (
    <div className="empty-chart">

      <BarChart3 size={30} />

      <p>
        Waiting for enough traffic readings...
      </p>

    </div>
  );
}


/* =========================
   PEAK HOUR
========================= */

function PeakHour({
  time,
  range,
  level,
}) {
  return (
    <div className="peak-card">

      <div className="peak-icon">
        <Clock3 size={18} />
      </div>

      <div>
        <strong>{time}</strong>

        <span>{range}</span>
      </div>

      <b className={level.toLowerCase()}>
        {level}
      </b>

    </div>
  );
}