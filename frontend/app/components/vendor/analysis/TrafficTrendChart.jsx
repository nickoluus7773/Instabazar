"use client";

import { useMemo, useState } from "react";
import { Eye, TrendingUp, Users } from "lucide-react";

export default function TrafficTrendChart({ data = [], period = "30", onPeriodChange, isAdvanced = false }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [activeMetric, setActiveMetric] = useState("all"); // "all" | "visits" | "views"

  // Summary statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalVisits: 0, totalViews: 0, peakVisits: 0, peakViews: 0 };
    let totalVisits = 0;
    let totalViews = 0;
    let peakVisits = 0;
    let peakViews = 0;

    data.forEach((d) => {
      totalVisits += d.visits || 0;
      totalViews += d.views || 0;
      if ((d.visits || 0) > peakVisits) peakVisits = d.visits;
      if ((d.views || 0) > peakViews) peakViews = d.views;
    });

    return { totalVisits, totalViews, peakVisits, peakViews };
  }, [data]);

  // Chart dimensions
  const width = 800;
  const height = 240;
  const pad = { top: 20, right: 20, bottom: 35, left: 45 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVal = useMemo(() => {
    if (!data || data.length === 0) return 10;
    const max = Math.max(...data.map((d) => Math.max(d.views || 0, d.visits || 0)), 1);
    // Round up to nice number
    return Math.ceil(max * 1.15) || 10;
  }, [data]);

  // Point coordinates
  const points = useMemo(() => {
    if (!data || data.length === 0) return { visits: [], views: [] };
    const len = data.length;

    const visits = data.map((d, i) => {
      const x = pad.left + (len === 1 ? innerW / 2 : (i / (len - 1)) * innerW);
      const y = pad.top + innerH - ((d.visits || 0) / maxVal) * innerH;
      return { x, y, val: d.visits, date: d.date };
    });

    const views = data.map((d, i) => {
      const x = pad.left + (len === 1 ? innerW / 2 : (i / (len - 1)) * innerW);
      const y = pad.top + innerH - ((d.views || 0) / maxVal) * innerH;
      return { x, y, val: d.views, date: d.date };
    });

    return { visits, views };
  }, [data, innerW, innerH, maxVal]);

  const makeLinePath = (pts) => {
    if (pts.length === 0) return "";
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  };

  const makeAreaPath = (pts) => {
    if (pts.length === 0) return "";
    const line = makeLinePath(pts);
    const bottom = pad.top + innerH;
    return `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${bottom} L ${pts[0].x.toFixed(1)} ${bottom} Z`;
  };

  // Sample labels for X-axis (between 4 and 7 labels)
  const xLabels = useMemo(() => {
    if (!data || data.length === 0) return [];
    const len = data.length;
    const step = Math.max(1, Math.floor(len / 6));
    const indices = [];
    for (let i = 0; i < len; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== len - 1) {
      indices.push(len - 1);
    }
    return indices.map((idx) => ({
      text: data[idx]?.date || "",
      x: pad.left + (len === 1 ? innerW / 2 : (idx / (len - 1)) * innerW),
    }));
  }, [data, innerW]);

  // Y-axis gridlines
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  // Mouse hover calculation
  const handleMouseMove = (e) => {
    if (!data || data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - pad.left * (rect.width / width)) / (innerW * (rect.width / width))));
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
  };

  const activeItem = hoverIndex !== null ? data[hoverIndex] : null;
  const activeVisitsPt = hoverIndex !== null ? points.visits[hoverIndex] : null;
  const activeViewsPt = hoverIndex !== null ? points.views[hoverIndex] : null;

  return (
    <div className="space-y-4">
      {/* Header Stat Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
          <span className="flex items-center gap-1.5 text-xs text-violet-300">
            <Users size={14} /> Total Visits
          </span>
          <p className="mt-1 text-lg font-bold text-white">{stats.totalVisits.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Peak: {stats.peakVisits} / day</span>
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
          <span className="flex items-center gap-1.5 text-xs text-sky-300">
            <Eye size={14} /> Product Views
          </span>
          <p className="mt-1 text-lg font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Peak: {stats.peakViews} / day</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <span className="text-xs text-slate-400">View / Visit Ratio</span>
          <p className="mt-1 text-lg font-bold text-emerald-400">
            {stats.totalVisits ? (stats.totalViews / stats.totalVisits).toFixed(1) : "0"}x
          </p>
          <span className="text-[10px] text-slate-500">Pages per visitor</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <span className="text-xs text-slate-400">Selected Range</span>
          <p className="mt-1 text-lg font-bold text-fuchsia-300">{data.length} Days</p>
          <span className="text-[10px] text-slate-500">Continuous telemetry</span>
        </div>
      </div>

      {/* Chart Canvas & Controls */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0F1E] p-4 sm:p-5">
        {/* Top bar with metric filters and period selector */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMetric("all")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                activeMetric === "all" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All Metrics
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("visits")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                activeMetric === "visits" ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30" : "text-slate-400 hover:text-violet-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-violet-400" /> Store Visits
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("views")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                activeMetric === "views" ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30" : "text-slate-400 hover:text-sky-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Product Views
            </button>
          </div>

          {/* Hover readout indicator */}
          {activeItem && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs">
              <span className="font-semibold text-white">{activeItem.date}:</span>
              <span className="text-violet-300">{activeItem.visits} visits</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-300">{activeItem.views} views</span>
            </div>
          )}
        </div>

        {/* Responsive SVG Chart */}
        <div
          className="relative w-full cursor-crosshair overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="visitsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {yTicks.map((val) => {
              const y = pad.top + innerH - (val / maxVal) * innerH;
              return (
                <g key={val}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={pad.left + innerW}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="inherit"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            {(activeMetric === "all" || activeMetric === "views") && (
              <path d={makeAreaPath(points.views)} fill="url(#viewsAreaGrad)" />
            )}
            {(activeMetric === "all" || activeMetric === "visits") && (
              <path d={makeAreaPath(points.visits)} fill="url(#visitsAreaGrad)" />
            )}

            {/* Lines */}
            {(activeMetric === "all" || activeMetric === "views") && (
              <path
                d={makeLinePath(points.views)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {(activeMetric === "all" || activeMetric === "visits") && (
              <path
                d={makeLinePath(points.visits)}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active Hover Guide and Points */}
            {hoverIndex !== null && activeVisitsPt && (
              <g>
                <line
                  x1={activeVisitsPt.x}
                  y1={pad.top}
                  x2={activeVisitsPt.x}
                  y2={pad.top + innerH}
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />

                {/* Visits point */}
                {(activeMetric === "all" || activeMetric === "visits") && (
                  <circle
                    cx={activeVisitsPt.x}
                    cy={activeVisitsPt.y}
                    r="5"
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  />
                )}

                {/* Views point */}
                {(activeMetric === "all" || activeMetric === "views") && activeViewsPt && (
                  <circle
                    cx={activeViewsPt.x}
                    cy={activeViewsPt.y}
                    r="5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  />
                )}
              </g>
            )}

            {/* X-axis date labels */}
            {xLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={lbl.x}
                y={pad.top + innerH + 18}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="inherit"
              >
                {lbl.text}
              </text>
            ))}
          </svg>
        </div>

        {/* Bottom Legend */}
        <div className="mt-3 flex items-center justify-center gap-6 border-t border-white/[0.06] pt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Store Visits (Daily)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Product Views (Daily)
          </span>
          <span className="hidden sm:inline text-slate-500">• Hover over chart to inspect dates</span>
        </div>
      </div>
    </div>
  );
}
