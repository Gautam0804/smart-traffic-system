import { TrafficCone, Clock3 } from "lucide-react";

export default function SignalCard({
  lane,
  vehicles,
  selected,
  greenTime,
}) {
  const isActive = lane === selected;

  return (
    <div className={`signal-card ${isActive ? "selected" : ""}`}>
      <div className="signal-header">
        <div>
          <span className="signal-label">LANE</span>
          <h3>{lane}</h3>
        </div>

        <TrafficCone size={22} />
      </div>

      <div className="traffic-light">
        <span
          className={
            isActive ? "light red inactive" : "light red"
          }
        ></span>

        <span
          className={
            isActive ? "light yellow inactive" : "light yellow"
          }
        ></span>

        <span
          className={
            isActive ? "light green" : "light green inactive"
          }
        ></span>
      </div>

      <div className="signal-data">
        <div>
          <span>Vehicles</span>
          <strong>{vehicles}</strong>
        </div>

        <div>
          <span>Green Time</span>
          <strong>
            <Clock3 size={14} /> {isActive ? greenTime : "--"}s
          </strong>
        </div>
      </div>

      <div className={`signal-status ${isActive ? "active" : ""}`}>
        {isActive ? "GREEN SIGNAL" : "WAITING"}
      </div>
    </div>
  );
}