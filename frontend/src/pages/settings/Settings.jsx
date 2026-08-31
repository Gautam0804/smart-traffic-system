import {
  Activity,
  Bell,
  Bot,
  Camera,
  Check,
  Download,
  Gauge,
  Globe,
  Info,
  Monitor,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Upload,
  Video,
  Wifi,
  Zap,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";


// =========================================================
// DEFAULT SETTINGS
// =========================================================

const defaultSettings = {
  general: {
    systemName: "Smart Traffic AI",
    location: "Main Intersection",
    refreshRate: "2",
    timezone: "Asia/Kolkata",
    environment: "development",
    autoRefresh: true,
  },

  notifications: {
    emergency: true,
    congestion: true,
    system: true,
    sound: true,
    prediction: true,
    cameraOffline: true,
  },

  camera: {
    cameraEnabled: true,
    detectionEnabled: true,
    detectionInterval: "2",
    confidence: "50",
    nightMode: true,
    vehicleTracking: true,
  },

  signals: {
    controlMode: "auto",
    minGreenTime: "10",
    maxGreenTime: "30",
    yellowTime: "3",
    emergencyPriority: true,
    pedestrianPriority: true,
  },

  ai: {
    aiEnabled: true,
    predictionEnabled: true,
    autoOptimization: true,
    confidenceThreshold: "70",
    predictionWindow: "15",
    learningMode: true,
  },
};


// =========================================================
// SETTINGS PAGE
// =========================================================

export default function Settings() {

  const [activeTab, setActiveTab] =
    useState("general");

  const [settings, setSettings] =
    useState(defaultSettings);

  const [saved, setSaved] =
    useState(false);

  const [hasChanges, setHasChanges] =
    useState(false);

  const [showResetConfirm, setShowResetConfirm] =
    useState(false);

  const fileInputRef = useRef(null);


  // =======================================================
  // LOAD SETTINGS
  // =======================================================

  useEffect(() => {

    const stored =
      localStorage.getItem(
        "smartTrafficSettings"
      );

    if (!stored) return;

    try {

      const parsed =
        JSON.parse(stored);

      setSettings({
        general: {
          ...defaultSettings.general,
          ...(parsed.general || {}),
        },

        notifications: {
          ...defaultSettings.notifications,
          ...(parsed.notifications || {}),
        },

        camera: {
          ...defaultSettings.camera,
          ...(parsed.camera || {}),
        },

        signals: {
          ...defaultSettings.signals,
          ...(parsed.signals || {}),
        },

        ai: {
          ...defaultSettings.ai,
          ...(parsed.ai || {}),
        },
      });

    } catch (error) {

      console.error(
        "Invalid saved settings:",
        error
      );

    }

  }, []);


  // =======================================================
  // SAVE SETTINGS
  // =======================================================

  const saveSettings = () => {

    localStorage.setItem(
      "smartTrafficSettings",
      JSON.stringify(settings)
    );

    setSaved(true);
    setHasChanges(false);

    setTimeout(() => {
      setSaved(false);
    }, 2500);

  };


  // =======================================================
  // RESET SETTINGS
  // =======================================================

  const resetSettings = () => {

    setSettings(defaultSettings);

    localStorage.setItem(
      "smartTrafficSettings",
      JSON.stringify(defaultSettings)
    );

    setHasChanges(false);
    setSaved(false);
    setShowResetConfirm(false);

  };


  // =======================================================
  // UPDATE SETTING
  // =======================================================

  const updateSetting = (
    section,
    key,
    value
  ) => {

    setSettings((previous) => ({

      ...previous,

      [section]: {

        ...previous[section],

        [key]: value,

      },

    }));

    setHasChanges(true);
    setSaved(false);

  };


  // =======================================================
  // EXPORT SETTINGS
  // =======================================================

  const exportSettings = () => {

    const data = JSON.stringify(
      settings,
      null,
      2
    );

    const blob = new Blob(
      [data],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "smart-traffic-settings.json";

    link.click();

    URL.revokeObjectURL(url);

  };


  // =======================================================
  // IMPORT SETTINGS
  // =======================================================

  const importSettings = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {

      try {

        const imported =
          JSON.parse(reader.result);

        setSettings({

          general: {
            ...defaultSettings.general,
            ...(imported.general || {}),
          },

          notifications: {
            ...defaultSettings.notifications,
            ...(imported.notifications || {}),
          },

          camera: {
            ...defaultSettings.camera,
            ...(imported.camera || {}),
          },

          signals: {
            ...defaultSettings.signals,
            ...(imported.signals || {}),
          },

          ai: {
            ...defaultSettings.ai,
            ...(imported.ai || {}),
          },

        });

        setHasChanges(true);

      } catch (error) {

        alert(
          "Invalid settings file."
        );

      }

    };

    reader.readAsText(file);

    event.target.value = "";

  };


  // =======================================================
  // QUICK PRESETS
  // =======================================================

  const applyPreset = (preset) => {

    if (preset === "balanced") {

      setSettings({
        ...defaultSettings,
      });

    }

    if (preset === "highTraffic") {

      setSettings({

        ...defaultSettings,

        camera: {
          ...defaultSettings.camera,
          detectionInterval: "1",
          confidence: "45",
        },

        signals: {
          ...defaultSettings.signals,
          minGreenTime: "15",
          maxGreenTime: "60",
        },

        ai: {
          ...defaultSettings.ai,
          confidenceThreshold: "65",
          predictionWindow: "30",
        },

      });

    }

    if (preset === "performance") {

      setSettings({

        ...defaultSettings,

        camera: {
          ...defaultSettings.camera,
          detectionInterval: "5",
          confidence: "60",
        },

        ai: {
          ...defaultSettings.ai,
          confidenceThreshold: "80",
          predictionWindow: "15",
        },

      });

    }

    setHasChanges(true);

  };


  // =======================================================
  // TABS
  // =======================================================

  const tabs = [

    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "camera",
      label: "Camera & Vision",
      icon: Camera,
    },

    {
      id: "signals",
      label: "Traffic Signals",
      icon: SlidersHorizontal,
    },

    {
      id: "ai",
      label: "AI Configuration",
      icon: Bot,
    },

  ];


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="settings-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-toolbar">

        <div>

          <div className="live-indicator">

            <span></span>

            SYSTEM SETTINGS

          </div>

          <h1 className="settings-main-title">
            Smart Traffic Control Center
          </h1>

          <p className="toolbar-text">
            Configure AI, cameras, signals,
            notifications and system behavior.
          </p>

        </div>


        <div className="settings-actions">

          {hasChanges && (

            <div className="unsaved-status">

              <span></span>

              Unsaved changes

            </div>

          )}


          <button
            className="reset-button"
            onClick={() =>
              setShowResetConfirm(true)
            }
          >

            <RotateCcw size={16} />

            Reset

          </button>


          <button
            className="save-settings-button"
            onClick={saveSettings}
          >

            {saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}

            {saved
              ? "Saved"
              : "Save Changes"}

          </button>

        </div>

      </div>


      {/* =================================================
          SYSTEM OVERVIEW
      ================================================= */}

      <div className="settings-overview">


        <StatusCard
          icon={Activity}
          title="System"
          value="Operational"
          status="Online"
        />


        <StatusCard
          icon={Bot}
          title="AI Engine"
          value={
            settings.ai.aiEnabled
              ? "Active"
              : "Disabled"
          }
          status={
            settings.ai.aiEnabled
              ? "Ready"
              : "Offline"
          }
        />


        <StatusCard
          icon={Camera}
          title="Camera"
          value={
            settings.camera.cameraEnabled
              ? "Connected"
              : "Disabled"
          }
          status={
            settings.camera.cameraEnabled
              ? "Live"
              : "Offline"
          }
        />


        <StatusCard
          icon={Wifi}
          title="Signal Control"
          value={
            settings.signals.controlMode ===
            "auto"
              ? "Automatic"
              : "Manual"
          }
          status="Configured"
        />

      </div>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="quick-settings-panel">

        <div className="quick-settings-header">

          <div>

            <h3>
              Quick Configuration
            </h3>

            <p>
              Apply a predefined configuration
              for common traffic scenarios.
            </p>

          </div>

          <Zap size={20} />

        </div>


        <div className="preset-buttons">

          <button
            onClick={() =>
              applyPreset("balanced")
            }
          >
            <Gauge size={16} />
            Balanced
          </button>


          <button
            onClick={() =>
              applyPreset("highTraffic")
            }
          >
            <Activity size={16} />
            High Traffic
          </button>


          <button
            onClick={() =>
              applyPreset("performance")
            }
          >
            <Zap size={16} />
            Performance
          </button>


          <button
            onClick={exportSettings}
          >
            <Download size={16} />
            Export
          </button>


          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload size={16} />
            Import
          </button>


          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={importSettings}
          />

        </div>

      </div>


      {/* =================================================
          SETTINGS LAYOUT
      ================================================= */}

      <div className="settings-layout">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="settings-sidebar">

          <div className="settings-sidebar-title">
            CONFIGURATION
          </div>


          {tabs.map((tab) => {

            const Icon =
              tab.icon;

            return (

              <button
                key={tab.id}

                className={
                  activeTab === tab.id
                    ? "settings-tab active"
                    : "settings-tab"
                }

                onClick={() =>
                  setActiveTab(tab.id)
                }
              >

                <Icon size={17} />

                <span>
                  {tab.label}
                </span>

              </button>

            );

          })}


          {/* DEVICE STATUS */}

          <div className="device-status-box">

            <div className="device-status-title">

              <Monitor size={16} />

              Deployment

            </div>


            <div className="device-status-row">

              <span>
                Environment
              </span>

              <strong>
                {settings.general.environment}
              </strong>

            </div>


            <div className="device-status-row">

              <span>
                Device
              </span>

              <strong>
                Local Network
              </strong>

            </div>


            <div className="device-status-row">

              <span>
                Timezone
              </span>

              <strong>
                IST
              </strong>

            </div>

          </div>

        </aside>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="settings-content">


          {activeTab === "general" && (

            <GeneralSettings
              settings={settings.general}
              update={(key, value) =>
                updateSetting(
                  "general",
                  key,
                  value
                )
              }
            />

          )}


          {activeTab === "notifications" && (

            <NotificationSettings
              settings={
                settings.notifications
              }
              update={(key, value) =>
                updateSetting(
                  "notifications",
                  key,
                  value
                )
              }
            />

          )}


          {activeTab === "camera" && (

            <CameraSettings
              settings={settings.camera}
              update={(key, value) =>
                updateSetting(
                  "camera",
                  key,
                  value
                )
              }
            />

          )}


          {activeTab === "signals" && (

            <SignalSettings
              settings={settings.signals}
              update={(key, value) =>
                updateSetting(
                  "signals",
                  key,
                  value
                )
              }
            />

          )}


          {activeTab === "ai" && (

            <AISettings
              settings={settings.ai}
              update={(key, value) =>
                updateSetting(
                  "ai",
                  key,
                  value
                )
              }
            />

          )}

        </main>

      </div>


      {/* =================================================
          RESET MODAL
      ================================================= */}

      {showResetConfirm && (

        <div className="settings-modal-overlay">

          <div className="settings-modal">

            <div className="modal-icon">
              <RotateCcw size={22} />
            </div>

            <h3>
              Reset Configuration?
            </h3>

            <p>
              All current settings will be
              restored to the default
              Smart Traffic AI configuration.
            </p>


            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setShowResetConfirm(false)
                }
              >
                Cancel
              </button>


              <button
                className="modal-confirm"
                onClick={resetSettings}
              >
                Reset Settings
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


// =========================================================
// STATUS CARD
// =========================================================

function StatusCard({
  icon: Icon,
  title,
  value,
  status,
}) {

  return (

    <div className="settings-status-card">

      <div className="status-card-icon">

        <Icon size={20} />

      </div>


      <div className="status-card-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          <i></i>
          {status}
        </small>

      </div>

    </div>

  );

}


// =========================================================
// GENERAL SETTINGS
// =========================================================

function GeneralSettings({
  settings,
  update,
}) {

  return (

    <SettingsSection
      icon={Globe}
      title="General Settings"
      description="Basic system and intersection configuration."
    >

      <SettingInput
        label="System Name"
        value={settings.systemName}
        onChange={(value) =>
          update(
            "systemName",
            value
          )
        }
      />


      <SettingInput
        label="Intersection Location"
        value={settings.location}
        onChange={(value) =>
          update(
            "location",
            value
          )
        }
      />


      <SettingSelect
        label="Data Refresh Rate"
        value={settings.refreshRate}
        onChange={(value) =>
          update(
            "refreshRate",
            value
          )
        }
        options={[
          ["1", "1 second"],
          ["2", "2 seconds"],
          ["5", "5 seconds"],
          ["10", "10 seconds"],
        ]}
      />


      <SettingSelect
        label="Timezone"
        value={settings.timezone}
        onChange={(value) =>
          update(
            "timezone",
            value
          )
        }
        options={[
          [
            "Asia/Kolkata",
            "India — Asia/Kolkata",
          ],
          [
            "UTC",
            "UTC",
          ],
          [
            "America/New_York",
            "US — New York",
          ],
        ]}
      />


      <SettingSelect
        label="Environment"
        value={settings.environment}
        onChange={(value) =>
          update(
            "environment",
            value
          )
        }
        options={[
          [
            "development",
            "Development",
          ],
          [
            "production",
            "Production",
          ],
        ]}
      />


      <ToggleSetting
        label="Automatic Refresh"
        description="Automatically refresh dashboard traffic data."
        value={settings.autoRefresh}
        onChange={(value) =>
          update(
            "autoRefresh",
            value
          )
        }
      />

    </SettingsSection>

  );

}


// =========================================================
// NOTIFICATION SETTINGS
// =========================================================

function NotificationSettings({
  settings,
  update,
}) {

  return (

    <SettingsSection
      icon={Bell}
      title="Notification Settings"
      description="Control traffic and system notifications."
    >

      <ToggleSetting
        label="Emergency Alerts"
        description="Notify when emergency priority is detected."
        value={settings.emergency}
        onChange={(value) =>
          update(
            "emergency",
            value
          )
        }
      />


      <ToggleSetting
        label="Congestion Alerts"
        description="Notify when traffic exceeds the congestion threshold."
        value={settings.congestion}
        onChange={(value) =>
          update(
            "congestion",
            value
          )
        }
      />


      <ToggleSetting
        label="Prediction Alerts"
        description="Notify when AI predicts a major traffic increase."
        value={settings.prediction}
        onChange={(value) =>
          update(
            "prediction",
            value
          )
        }
      />


      <ToggleSetting
        label="Camera Offline Alerts"
        description="Notify when a connected traffic camera becomes unavailable."
        value={settings.cameraOffline}
        onChange={(value) =>
          update(
            "cameraOffline",
            value
          )
        }
      />


      <ToggleSetting
        label="System Alerts"
        description="Notify about AI server and system failures."
        value={settings.system}
        onChange={(value) =>
          update(
            "system",
            value
          )
        }
      />


      <ToggleSetting
        label="Alert Sound"
        description="Play sound when a critical alert appears."
        value={settings.sound}
        onChange={(value) =>
          update(
            "sound",
            value
          )
        }
      />

    </SettingsSection>

  );

}


// =========================================================
// CAMERA SETTINGS
// =========================================================

function CameraSettings({
  settings,
  update,
}) {

  return (

    <SettingsSection
      icon={Camera}
      title="Camera & Vision"
      description="Configure live camera processing and vehicle detection."
    >

      <ToggleSetting
        label="Camera System"
        description="Enable live camera input."
        value={settings.cameraEnabled}
        onChange={(value) =>
          update(
            "cameraEnabled",
            value
          )
        }
      />


      <ToggleSetting
        label="Vehicle Detection"
        description="Enable AI vehicle detection using YOLO."
        value={settings.detectionEnabled}
        onChange={(value) =>
          update(
            "detectionEnabled",
            value
          )
        }
      />


      <ToggleSetting
        label="Vehicle Tracking"
        description="Track detected vehicles across consecutive frames."
        value={settings.vehicleTracking}
        onChange={(value) =>
          update(
            "vehicleTracking",
            value
          )
        }
      />


      <ToggleSetting
        label="Night Mode"
        description="Optimize camera processing for low-light conditions."
        value={settings.nightMode}
        onChange={(value) =>
          update(
            "nightMode",
            value
          )
        }
      />


      <SettingSelect
        label="Detection Interval"
        value={settings.detectionInterval}
        onChange={(value) =>
          update(
            "detectionInterval",
            value
          )
        }
        options={[
          ["1", "Every 1 second"],
          ["2", "Every 2 seconds"],
          ["5", "Every 5 seconds"],
        ]}
      />


      <RangeSetting
        label="Detection Confidence"
        value={settings.confidence}
        min="10"
        max="95"
        suffix="%"
        onChange={(value) =>
          update(
            "confidence",
            value
          )
        }
      />

    </SettingsSection>

  );

}


// =========================================================
// SIGNAL SETTINGS
// =========================================================

function SignalSettings({
  settings,
  update,
}) {

  return (

    <SettingsSection
      icon={SlidersHorizontal}
      title="Traffic Signal Configuration"
      description="Configure automatic traffic signal behavior and safety."
    >

      <SettingSelect
        label="Control Mode"
        value={settings.controlMode}
        onChange={(value) =>
          update(
            "controlMode",
            value
          )
        }
        options={[
          [
            "auto",
            "AI Automatic",
          ],
          [
            "manual",
            "Manual",
          ],
        ]}
      />


      <RangeSetting
        label="Minimum Green Time"
        value={settings.minGreenTime}
        min="5"
        max="30"
        suffix=" sec"
        onChange={(value) =>
          update(
            "minGreenTime",
            value
          )
        }
      />


      <RangeSetting
        label="Maximum Green Time"
        value={settings.maxGreenTime}
        min="10"
        max="60"
        suffix=" sec"
        onChange={(value) =>
          update(
            "maxGreenTime",
            value
          )
        }
      />


      <RangeSetting
        label="Yellow Signal Time"
        value={settings.yellowTime}
        min="2"
        max="10"
        suffix=" sec"
        onChange={(value) =>
          update(
            "yellowTime",
            value
          )
        }
      />


      <ToggleSetting
        label="Emergency Priority"
        description="Give emergency traffic automatic priority."
        value={settings.emergencyPriority}
        onChange={(value) =>
          update(
            "emergencyPriority",
            value
          )
        }
      />


      <ToggleSetting
        label="Pedestrian Priority"
        description="Allow pedestrian demand to influence signal timing."
        value={settings.pedestrianPriority}
        onChange={(value) =>
          update(
            "pedestrianPriority",
            value
          )
        }
      />

    </SettingsSection>

  );

}


// =========================================================
// AI SETTINGS
// =========================================================

function AISettings({
  settings,
  update,
}) {

  return (

    <SettingsSection
      icon={Bot}
      title="AI Configuration"
      description="Configure the Smart Traffic AI engine."
    >

      <ToggleSetting
        label="AI Engine"
        description="Enable AI traffic optimization."
        value={settings.aiEnabled}
        onChange={(value) =>
          update(
            "aiEnabled",
            value
          )
        }
      />


      <ToggleSetting
        label="Traffic Prediction"
        description="Predict upcoming traffic volume and congestion."
        value={settings.predictionEnabled}
        onChange={(value) =>
          update(
            "predictionEnabled",
            value
          )
        }
      />


      <ToggleSetting
        label="Automatic Optimization"
        description="Allow AI to automatically select the best signal timing."
        value={settings.autoOptimization}
        onChange={(value) =>
          update(
            "autoOptimization",
            value
          )
        }
      />


      <ToggleSetting
        label="Continuous Learning"
        description="Allow the AI system to adapt using incoming traffic patterns."
        value={settings.learningMode}
        onChange={(value) =>
          update(
            "learningMode",
            value
          )
        }
      />


      <RangeSetting
        label="AI Confidence Threshold"
        value={settings.confidenceThreshold}
        min="40"
        max="95"
        suffix="%"
        onChange={(value) =>
          update(
            "confidenceThreshold",
            value
          )
        }
      />


      <SettingSelect
        label="Prediction Window"
        value={settings.predictionWindow}
        onChange={(value) =>
          update(
            "predictionWindow",
            value
          )
        }
        options={[
          ["5", "Next 5 minutes"],
          ["15", "Next 15 minutes"],
          ["30", "Next 30 minutes"],
          ["60", "Next 60 minutes"],
        ]}
      />


      <div className="ai-info-box">

        <ShieldCheck size={20} />

        <div>

          <strong>
            AI Safety Layer Enabled
          </strong>

          <p>
            Signal optimization remains within
            configured minimum and maximum timing
            limits.
          </p>

        </div>

      </div>

    </SettingsSection>

  );

}


// =========================================================
// SHARED SETTINGS SECTION
// =========================================================

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}) {

  return (

    <section className="settings-panel">

      <div className="settings-section-header">

        <div className="settings-section-icon">

          <Icon size={20} />

        </div>


        <div>

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

        </div>

      </div>


      <div className="settings-fields">

        {children}

      </div>

    </section>

  );

}


// =========================================================
// INPUT
// =========================================================

function SettingInput({
  label,
  value,
  onChange,
}) {

  return (

    <div className="setting-field">

      <label>
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>

  );

}


// =========================================================
// SELECT
// =========================================================

function SettingSelect({
  label,
  value,
  onChange,
  options,
}) {

  return (

    <div className="setting-field">

      <label>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >

        {options.map(
          ([optionValue, optionLabel]) => (

            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>

          )
        )}

      </select>

    </div>

  );

}


// =========================================================
// TOGGLE
// =========================================================

function ToggleSetting({
  label,
  description,
  value,
  onChange,
}) {

  return (

    <div className="toggle-setting">

      <div>

        <strong>
          {label}
        </strong>

        <p>
          {description}
        </p>

      </div>


      <button
        className={
          value
            ? "toggle active"
            : "toggle"
        }
        onClick={() =>
          onChange(!value)
        }
        type="button"
        aria-label={label}
      >

        <span></span>

      </button>

    </div>

  );

}


// =========================================================
// RANGE
// =========================================================

function RangeSetting({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}) {

  return (

    <div className="range-setting">

      <div className="range-header">

        <label>
          {label}
        </label>

        <strong>

          {value}
          {suffix}

        </strong>

      </div>


      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>

  );

}