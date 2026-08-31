import {
  LayoutDashboard,
  Video,
  TrafficCone,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Live Monitoring",
    path: "/monitoring",
    icon: Video,
  },
  {
    name: "Traffic Signals",
    path: "/signals",
    icon: TrafficCone,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">
            <Radio size={22} />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <h2>SMART TRAFFIC</h2>
              <span>AI CONTROL CENTER</span>
            </div>
          )}
        </div>

        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <div className="sidebar-section">
        {!collapsed && <p className="section-title">CONTROL CENTER</p>}

        <nav className="navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                title={collapsed ? item.name : ""}
              >
                <Icon size={20} />

                {!collapsed && (
                  <span>{item.name}</span>
                )}

                {item.name === "Alerts" && !collapsed && (
                  <span className="notification-dot">3</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-pulse"></span>

            <div>
              <strong>System Online</strong>
              <small>AI services operational</small>
            </div>
          </div>

          <div className="version">
            Smart Traffic AI v1.0
          </div>
        </div>
      )}
    </aside>
  );
}