"use client";

import { useMemo, useState } from "react";
import { Heart, Sparkles, TrendingUp } from "lucide-react";

export default function WishlistTrendChart({ data = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Summary statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalSaves: 0, peakSaves: 0, avgSaves: 0 };
    let totalSaves = 0;
    let peakSaves = 0;

    data.forEach((d) => {
      const saves = d.saves || 0;
      totalSaves += saves;
      if (saves > peakSaves) peakSaves = saves;
    });

    const avgSaves = (totalSaves / data.length).toFixed(1);

    return { totalSaves, peakSaves, avgSaves };
  }, [data]);

  // Chart dimensions
  const width = 800;
  const height = 220;
  const pad = { top: 20, right: 20, bottom: 35, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVal = useMemo(() => {
    if (!data || data.length === 0) return 5;
    const max = Math.max(...data.map((d) => d.saves || 0), 1);
    // Round up with headroom
    return Math.max(Math.ceil(max * 1.25), 4);
  }, [data]);

  // Point coordinates
  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    const len = data.length;

    return data.map((d, i) => {
      const x = pad.left + (len === 1 ? innerW / 2 : (i / (len - 1)) * innerW);
      const y = pad.top + innerH - ((d.saves || 0) / maxVal) * innerH;
      return { x, y, val: d.saves, date: d.date, raw_date: d.raw_date };
    });
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
  const activePt = hoverIndex !== null ? points[hoverIndex] : null;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0F1E] p-8 text-center text-sm text-slate-500">
        <Heart className="mx-auto mb-2 text-slate-600" size={24} />
        No wishlist trend telemetry recorded for this period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stat Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3">
          <span className="flex items-center gap-1.5 text-xs text-pink-300">
            <Heart size={14} /> Total Period Saves
          </span>
          <p className="mt-1 text-lg font-bold text-white">+{stats.totalSaves.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Cumulative customer saves</span>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
          <span className="flex items-center gap-1.5 text-xs text-rose-300">
            <TrendingUp size={14} /> Peak Daily Saves
          </span>
          <p className="mt-1 text-lg font-bold text-white">+{stats.peakSaves}</p>
          <span className="text-[10px] text-slate-500">Highest single-day spike</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <span className="text-xs text-slate-400">Daily Average</span>
          <p className="mt-1 text-lg font-bold text-pink-400">+{stats.avgSaves}</p>
          <span className="text-[10px] text-slate-500">Saves per day</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <span className="text-xs text-slate-400">Trend Horizon</span>
          <p className="mt-1 text-lg font-bold text-violet-300">{data.length} Days</p>
          <span className="text-[10px] text-slate-500">Daily resolution</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0F1E] p-4 sm:p-5">
        {/* Top hover indicator */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-pink-300">
              <span className="h-2 w-2 rounded-full bg-pink-500" /> Daily Wishlist Additions
            </span>
          </div>

          {activeItem ? (
            <div className="flex items-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs">
              <span className="font-semibold text-white">{activeItem.date}:</span>
              <span className="font-bold text-pink-300">+{activeItem.saves} saves</span>
            </div>
          ) : (
            <span className="text-slate-500 text-[11px]">Hover over chart to inspect daily save spikes</span>
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
              <linearGradient id="wishlistAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
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

            {/* Area Fill */}
            <path d={makeAreaPath(points)} fill="url(#wishlistAreaGrad)" />

            {/* Line */}
            <path
              d={makeLinePath(points)}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Dots (when fewer points or on hover) */}
            {points.length <= 15 &&
              points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#0A0F1E"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
              ))}

            {/* Hover Cursor and Marker */}
            {activePt && (
              <g>
                {/* Vertical cursor guide */}
                <line
                  x1={activePt.x}
                  y1={pad.top}
                  x2={activePt.x}
                  y2={pad.top + innerH}
                  stroke="rgba(236, 72, 153, 0.4)"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
                {/* Outer pulsing ring */}
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="7"
                  fill="rgba(236, 72, 153, 0.25)"
                />
                {/* Center marker */}
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="4"
                  fill="#ec4899"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* X-axis ticks & date labels */}
            {xLabels.map((lbl, i) => (
              <text
                key={i}
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
      </div>
    </div>
  );
}
