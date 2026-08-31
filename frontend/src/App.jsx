import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/monitoring/LiveMonitoring";
import TrafficSignals from "./pages/signals/TrafficSignals";
import Analytics from "./pages/analytics/Analytics";
import Alerts from "./pages/alerts/Alerts";
import Settings from "./pages/settings/Settings";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main-layout">
          <Header />

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/monitoring"
                element={<LiveMonitoring />}
              />

              <Route
                path="/signals"
                element={<TrafficSignals />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              <Route
                path="/alerts"
                element={<Alerts />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;