import React, { useEffect, useMemo, useRef, useState } from "react";
import { getUser, signOut } from "../auth";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- BACKEND CONFIG ---
// main app API (unchanged)
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
const COUNT_URL = `${API_BASE.replace(/\/$/, "")}/count`;
const POLL_MS = 1500;
const MAX_HISTORY = 20;

// ANGLE backend via nginx proxy (same origin). nginx proxies /api_new/ -> 127.0.0.1:8001
const ANGLE_PREFIX =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_ANGLE_BASE) ||
  (typeof window !== "undefined" ? window.location.origin + "/api_new" : "http://localhost:8001");

function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 h-full p-5 hidden md:block">
      <div className="text-sm text-white/90 mb-6">Navigation</div>
      <ul className="space-y-2 text-sm text-white/90">
        <li className="p-2 rounded hover:bg-white/6"><a href="#">Overview</a></li>
        <li className="p-2 rounded hover:bg-white/6"><a href="#">Simulations</a></li>
        <li className="p-2 rounded hover:bg-white/6"><a href="#">Reports</a></li>
      </ul>
      <div className="mt-6">
        <button
          onClick={onLogout}
          className="text-sm px-3 py-2 rounded border border-white/20 text-white/90 hover:bg-white/6"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, color = "text-gray-800" }) {
  const display =
    value === null || value === undefined || value === "--" ? "--" : value;
  return (
    <div className="p-4 bg-gray-50 rounded-xl shadow-inner text-center min-w-[120px]">
      <h4 className="text-sm text-gray-500">{label}</h4>
      <p className={`text-2xl font-bold ${color}`}>{display}</p>
    </div>
  );
}

/* ----------------- Client Camera Panel -----------------
   opens browser camera, preview, sends single frames to server
   uses ANGLE_PREFIX + "/api/process_frame" (proxied via nginx)
---------------------------------------------------------*/
function ClientCameraPanel({ processFrameUrl = ANGLE_PREFIX + "/api/process_frame" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("stopped");
  const [facing, setFacing] = useState("environment"); // environment | user

  async function startCamera() {
    setStatus("requesting");
    try {
      const constraints = { video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // fallback to any camera
        s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
      setStatus("running");
    } catch (err) {
      console.error("getUserMedia error:", err);
      setStatus("error: " + (err.message || err.name));
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setStatus("stopped");
  }

  function toggleFacing() {
    setFacing(prev => (prev === "environment" ? "user" : "environment"));
    stopCamera();
    setTimeout(startCamera, 150);
  }

  async function captureAndSend() {
    if (!videoRef.current) return setStatus("no-video");
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setStatus("capture-failed");
        return;
      }
      const form = new FormData();
      form.append("frame", blob, "frame.jpg");
      try {
        setStatus("sending");
        const resp = await fetch(processFrameUrl, { method: "POST", body: form, credentials: "same-origin" });
        if (!resp.ok) {
          const text = await resp.text();
          setStatus(`server ${resp.status}: ${text}`);
        } else {
          const json = await resp.json();
          setStatus("sent: ok");
          console.log("process_frame result:", json);
        }
      } catch (err) {
        console.error("send error:", err);
        setStatus("send-failed: " + err.message);
      }
    }, "image/jpeg", 0.9);
  }

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-3 bg-white/5 rounded">
      <h4 className="mb-2">Client Camera</h4>
      <video
        ref={videoRef}
        className="w-[320px] h-auto bg-black rounded"
        playsInline
        muted
        autoPlay
      />
      <div className="mt-2 flex gap-2">
        <button onClick={startCamera} className="px-3 py-1 rounded bg-indigo-600">Start</button>
        <button onClick={stopCamera} className="px-3 py-1 rounded bg-gray-600">Stop</button>
        <button onClick={toggleFacing} className="px-3 py-1 rounded bg-yellow-600">Toggle Camera</button>
        <button onClick={captureAndSend} className="px-3 py-1 rounded bg-green-600">Send Frame</button>
      </div>
      <div className="mt-2 text-xs text-gray-300">Status: {status}</div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

/* ----------------- Main Dashboard ----------------- */
export default function Dashboard() {
  const user = getUser() || { name: "User" };
  const navigate = useNavigate();
  const [latest, setLatest] = useState(null);
  const [prickHistory, setPrickHistory] = useState([]);
  const [expertHistory, setExpertHistory] = useState([]);
  const [forceHistory, setForceHistory] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([]);
  const lastSeenRef = useRef({ prick_count: null });

  // Gauge selector state
  const [needleGauge, setNeedleGauge] = useState("22g");

  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await fetch(COUNT_URL, { cache: "no-store" });
        if (!res.ok) return console.error("Failed to fetch /count", res.status);
        const data = await res.json();
        const prick = data.prick_count ?? null;
        const expert = data.expert_pressure ?? null;
        const avg = data.avg_force_g ?? null;
        const acc = data.accuracy_percent ?? null;
        const dur = data.duration_ms ?? null;
        const fsr = data.fsr_value ?? null;
        if (!mounted) return;
        setLatest({
          prick_count: prick,
          expert_pressure: expert,
          avg_force_g: avg,
          accuracy_percent: acc,
          duration_ms: dur,
          fsr_value: fsr,
          timestamp: data.timestamp,
        });
        if (prick !== null && lastSeenRef.current.prick_count !== prick) {
          setPrickHistory((p) => [...p, prick].slice(-MAX_HISTORY));
          setExpertHistory((p) => [...p, expert].slice(-MAX_HISTORY));
          setForceHistory((p) => [...p, avg].slice(-MAX_HISTORY));
          setAccuracyHistory((p) => [...p, acc].slice(-MAX_HISTORY));
          lastSeenRef.current.prick_count = prick;
        }
      } catch (err) {
        console.error("Error fetching /count:", err);
      }
    }
    fetchCount();
    const id = setInterval(fetchCount, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // --- YOLOv8 Syringe Angle Detection Integration (via ANGLE_PREFIX) ---
  const [angleStatus, setAngleStatus] = useState({});
  const [snapshotUrl, setSnapshotUrl] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${ANGLE_PREFIX}/api/status`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) return { ready: false };
          return res.json();
        })
        .then((data) => setAngleStatus(data))
        .catch((err) => {
          console.warn("status fetch error:", err);
          setAngleStatus({ ready: false });
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshotUrl(`${ANGLE_PREFIX}/api/snapshot?cacheBust=${Date.now()}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  // --- END YOLOv8 Integration ---

  const labels = useMemo(
    () => Array.from({ length: prickHistory.length }, (_, i) => `#${i + 1}`),
    [prickHistory]
  );

  const prickBarData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Prick Count",
          data: prickHistory,
          backgroundColor: "rgba(59,130,246,0.9)",
          borderRadius: 6,
        },
      ],
    }),
    [labels, prickHistory]
  );

  const avgForceLineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Avg Force (g)",
          data: forceHistory,
          borderColor: "rgba(99,102,241,0.9)",
          backgroundColor: "rgba(99,102,241,0.06)",
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    }),
    [labels, forceHistory]
  );

  function doLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  const renderVal = (v, fixed = 2) =>
    v === null || v === undefined
      ? <span className="text-white/60">--</span>
      : typeof v === "number"
      ? (Number.isInteger(v) ? v : v.toFixed(fixed))
      : v;

  const safeAngle = angleStatus?.angle ?? null;
  const safeConf = angleStatus?.confidence ?? null;
  const safeFps = angleStatus?.fps ?? null;

  return (
    <div className="min-h-screen w-full bg-gradient-hero text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <Sidebar onLogout={doLogout} />
        <main>
          <div className="relative rounded-lg overflow-hidden mb-6">
            <div className="absolute inset-0 bg-black/18 pointer-events-none" />
            <div className="relative px-6 py-10">
              <h1 className="text-4xl font-bold drop-shadow-md">Simulation Dashboard</h1>
              <p className="text-sm opacity-90 mt-2">
                Welcome back, <strong className="text-white/95">{user.name}</strong>
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/95 text-gray-800 rounded-xl p-4 shadow">
              <div className="text-xs text-gray-500">Total Pricks</div>
              <div className="mt-2 text-2xl font-bold text-indigo-700">
                {latest ? renderVal(latest.prick_count, 0) : "--"}
              </div>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-xl p-4 shadow">
              <div className="text-xs text-gray-500">Expert Pressure (g)</div>
              <div className="mt-2 text-2xl font-bold text-green-600">
                {latest ? renderVal(latest.expert_pressure, 2) : "--"}
              </div>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-xl p-4 shadow">
              <div className="text-xs text-gray-500">Avg Force (g)</div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {latest ? renderVal(latest.avg_force_g, 2) : "--"}
              </div>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-xl p-4 shadow">
              <div className="text-xs text-gray-500">Accuracy (%)</div>
              <div
                className={`mt-2 text-2xl font-bold ${
                  latest?.accuracy_percent >= 90
                    ? "text-green-600"
                    : latest?.accuracy_percent >= 70
                    ? "text-yellow-500"
                    : "text-red-600"
                }`}
              >
                {latest ? renderVal(latest.accuracy_percent, 1) : "--"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Duration: {latest ? renderVal(latest.duration_ms, 0) : "--"} ms
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Prick Count History</h3>
              <div className="h-56">
                {labels.length === 0 ? (
                  <div className="text-gray-400 p-6">Waiting for backend updates...</div>
                ) : (
                  <Bar
                    data={prickBarData}
                    options={{ responsive: true, plugins: { legend: { display: false } } }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Avg Force History</h3>
              <div className="h-56">
                {labels.length === 0 ? (
                  <div className="text-gray-400 p-6">Waiting for backend updates...</div>
                ) : (
                  <Line data={avgForceLineData} options={{ responsive: true }} />
                )}
              </div>
            </div>
          </div>

          {/* Expert vs Trainee Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Expert vs Trainee (Time Series)
              </h3>
              <div className="h-64">
                {labels.length === 0 ? (
                  <div className="text-gray-400 p-6">Waiting for backend updates...</div>
                ) : (
                  <Line
                    data={{
                      labels,
                      datasets: [
                        {
                          label: "Expert Pressure (g)",
                          data: expertHistory,
                          borderColor: "rgba(34,197,94,1)",
                          backgroundColor: "rgba(34,197,94,0.1)",
                          tension: 0.3,
                          fill: true,
                        },
                        {
                          label: "Trainee Avg Force (g)",
                          data: forceHistory,
                          borderColor: "rgba(59,130,246,1)",
                          backgroundColor: "rgba(59,130,246,0.1)",
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: "Force (g)" } } },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Expert vs Trainee Correlation
              </h3>
              <div className="h-64">
                {expertHistory.length === 0 ? (
                  <div className="text-gray-400 p-6">Waiting for backend updates...</div>
                ) : (
                  <Line
                    data={{
                      datasets: [
                        {
                          label: "Prick Comparison",
                          data: expertHistory.map((exp, i) => ({
                            x: exp,
                            y: forceHistory[i] ?? 0,
                          })),
                          borderColor: "rgba(99,102,241,1)",
                          backgroundColor: accuracyHistory.map((a) =>
                            a > 90
                              ? "rgba(34,197,94,0.8)"
                              : a > 70
                              ? "rgba(234,179,8,0.8)"
                              : "rgba(239,68,68,0.8)"
                          ),
                          showLine: false,
                          pointRadius: 6,
                        },
                        {
                          label: "Perfect Match Line",
                          data: [
                            { x: 0, y: 0 },
                            {
                              x: Math.max(...expertHistory, ...(forceHistory || [0])),
                              y: Math.max(...expertHistory, ...(forceHistory || [0])),
                            },
                          ],
                          borderColor: "rgba(34,197,94,0.7)",
                          borderDash: [5, 5],
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" } },
                      scales: {
                        x: { title: { display: true, text: "Expert Pressure (g)" }, beginAtZero: true },
                        y: { title: { display: true, text: "Trainee Avg Force (g)" }, beginAtZero: true },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* --- Syringe Detection Section (Port 8001) --- */}
          <div className="mt-10 bg-white rounded-xl shadow p-4 text-gray-800">
            <h3 className="text-lg font-semibold mb-4">💉 Real-time Syringe Angle Detection</h3>

            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
              <div className="rounded-xl border overflow-hidden">
                {angleStatus?.ready ? (
                  <img
                    src={snapshotUrl}
                    alt="Syringe angle detection"
                    className="w-[640px] h-[480px] object-contain"
                  />
                ) : (
                  <div className="w-[640px] h-[480px] flex items-center justify-center text-gray-500">
                    🚫 Waiting for detector feed...
                  </div>
                )}
              </div>

              {/* Right column: Client camera panel + Gauge Selector + Detection Stats */}
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <ClientCameraPanel />

                {/* Gauge Selector */}
                <div className="p-3 bg-gray-50 rounded-xl shadow-inner">
                  <label htmlFor="gauge-select" className="block text-sm text-gray-600 mb-2">
                    Select Gauge of your Needle
                  </label>
                  <select
                    id="gauge-select"
                    value={needleGauge}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setNeedleGauge(v);
                    }}
                    className="w-full md:w-44 px-3 py-2 rounded border border-gray-200 bg-white text-gray-800"
                  >
                    <option value="18g">18g</option>
                    <option value="20g">20g</option>
                    <option value="22g">22g</option>
                    <option value="24g">24g</option>
                    <option value="25g">25g</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-500">
                    Selected: <strong className="text-gray-700">{needleGauge}</strong>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    label="Angle (°)"
                    value={safeAngle !== null ? Number(safeAngle).toFixed(1) : "--"}
                    color="text-blue-600"
                  />
                  <StatCard
                    label="Confidence"
                    value={safeConf !== null ? `${(safeConf * 100).toFixed(1)}%` : "--"}
                    color="text-green-600"
                  />
                  <StatCard label="Class" value={angleStatus?.class ?? "--"} color="text-purple-600" />
                  <StatCard
                    label="FPS"
                    value={safeFps !== null ? Number(safeFps).toFixed(1) : "--"}
                    color="text-orange-600"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* --- End Syringe Detection --- */}
        </main>
      </div>
    </div>
  );
}
