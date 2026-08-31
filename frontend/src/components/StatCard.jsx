export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  type = "default",
}) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={21} />
        </div>

        <span className="stat-live">LIVE</span>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      {subtitle && (
        <div className="stat-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
}