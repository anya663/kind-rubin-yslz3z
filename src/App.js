import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Thermometer, Zap, Info, Sun, Droplets } from "lucide-react";

/**
 * PROJECT SOLRIX: App.js (Updated with Solar Park & Water Recycling)
 */
export default function App() {
  const [hour, setHour] = useState(0);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [dataHistory, setDataHistory] = useState([]);

  const dubaiTemps = [
    28, 27, 26, 26, 27, 30, 34, 38, 41, 43, 44, 45, 44, 42, 40, 38, 36, 33, 31,
    30, 29, 29, 28, 28,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHour((prev) => (prev + 1) % 24);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const temp = dubaiTemps[hour];
    const isPeak = hour >= 11 && hour <= 17;
    const isDaylight = hour >= 6 && hour <= 18;

    // Solar Power Logic (Peaks at noon)
    const solarGen = isDaylight
      ? Math.max(0, 50 * Math.sin(((hour - 6) * Math.PI) / 12))
      : 0;

    // Cooling Load Logic
    const tradLoad = 20 + (temp - 20) * 2.5;
    const tintEffect = temp > 32 && isAiEnabled ? 0.6 : 1;
    const iceDischarge = isPeak && isAiEnabled ? 15 : 0;
    const aiLoad = 20 + (temp - 20) * 1.2 * tintEffect - iceDischarge;

    const currentLoad = isAiEnabled ? aiLoad : tradLoad;

    // Water Recycling (Condensate) Logic
    // High humidity/heat = more water collected from AC units
    const waterCollected = (currentLoad * 0.4).toFixed(1);

    const iceLevel = isAiEnabled
      ? hour < 6
        ? hour * 15
        : isPeak
        ? 90 - (hour - 11) * 15
        : 90
      : 0;

    let analysis = "System online...";
    if (isAiEnabled) {
      if (hour >= 12 && hour <= 15) {
        analysis =
          "PEAK HEAT: Using stored ice and solar power to keep the building cool without stressing the city grid.";
      } else if (isDaylight) {
        analysis =
          "SUNNY: Using clean energy from MBR Solar Park. AC water is being saved to water our local parks.";
      } else {
        analysis =
          "NIGHT TIME: Making ice now while electricity is cheaper, saving it for the hot day ahead.";
      }
    } else {
      analysis =
        "MANUAL MODE: Traditional cooling is running. We are wasting solar energy and AC water.";
    }

    return {
      temp,
      load: currentLoad.toFixed(1),
      ice: Math.max(0, Math.min(100, iceLevel)),
      solar: solarGen.toFixed(1),
      water: waterCollected,
      analysis,
    };
  }, [hour, isAiEnabled]);

  useEffect(() => {
    const newData = {
      time: `${hour}:00`,
      load: parseFloat(stats.load),
      solar: parseFloat(stats.solar),
    };
    setDataHistory((prev) => [...prev.slice(-15), newData]);
  }, [hour, stats.load, stats.solar]);

  return (
    <div className="solrix-container">
      <div className="dashboard-wrapper">
        <header className="header">
          <div>
            <h1>PROJECT SOLNIX</h1>
            <p className="subtitle"></p>
          </div>
          <div className="toggle-section">
            <span className={isAiEnabled ? "status-on" : "status-off"}>
              {isAiEnabled ? "AI OPTIMIZED" : "MANUAL"}
            </span>
            <button
              onClick={() => setIsAiEnabled(!isAiEnabled)}
              className={`toggle-btn ${isAiEnabled ? "btn-active" : ""}`}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>
        </header>

        <div className="main-grid">
          <div className="card tower-card">
            <div className="temp-badge">
              <Thermometer size={18} /> {stats.temp}°C
            </div>
            <div className="skyscraper">
              <div
                className={`windows ${
                  isAiEnabled && stats.temp > 35 ? "tinted" : ""
                }`}
              >
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="window-pane" />
                ))}
              </div>
              <div className="ice-tank" style={{ height: `${stats.ice}%` }} />
            </div>
            <div className="stat-row">
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "5px",
                }}
              >
                THERMAL STORAGE (ICE): {stats.ice}%
              </p>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${stats.ice}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-4 flex flex-col">
            {/* Energy Chart */}
            <div className="card flex-1">
              <div className="chart-header">
                <Zap size={20} className="text-cyan-400" />
                <h3 className="text-sm font-bold">Grid Demand vs. Solar Gen</h3>
                <div className="time-display">{hour}:00</div>
              </div>
              <div className="chart-container" style={{ height: "180px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataHistory}>
                    <defs>
                      <linearGradient
                        id="colorLoad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22d3ee"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22d3ee"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorSolar"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#fbbf24"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#fbbf24"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "10px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="load"
                      name="Grid Load"
                      stroke="#22d3ee"
                      fill="url(#colorLoad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="solar"
                      name="Solar Park"
                      stroke="#fbbf24"
                      fill="url(#colorSolar)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Local Integration Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 flex flex-col items-center justify-center text-center">
                <Sun size={24} className="text-yellow-400 mb-2" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Solar Input
                </span>
                <span className="text-xl font-bold">
                  {stats.solar}{" "}
                  <small className="text-xs font-normal text-slate-500">
                    kW
                  </small>
                </span>
              </div>
              <div className="card p-4 flex flex-col items-center justify-center text-center">
                <Droplets size={24} className="text-blue-400 mb-2" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Irrigation Recovery
                </span>
                <span className="text-xl font-bold">
                  {stats.water}{" "}
                  <small className="text-xs font-normal text-slate-500">
                    L/h
                  </small>
                </span>
              </div>
            </div>

            <div className="log-box">
              <Info size={16} />
              <p>{stats.analysis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
