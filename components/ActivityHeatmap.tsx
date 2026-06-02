"use client";

import { useState, useMemo } from "react";
import type { ActivityDay } from "../services/queries";

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DAY_LABELS = ["", "Lun", "", "Mié", "", "Vie", ""];

function cellColor(count: number) {
  if (count === 0) return "bg-surface-container-high";
  if (count === 1) return "bg-primary/30";
  if (count <= 3) return "bg-primary/55";
  if (count <= 6) return "bg-primary/80";
  return "bg-primary";
}

function computeStreaks(days: ActivityDay[]) {
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else break;
  }

  let max = 0;
  let run = 0;
  for (const d of days) {
    if (d.count > 0) { run++; if (run > max) max = run; }
    else run = 0;
  }

  return { current, max };
}

type Props = {
  days: ActivityDay[];
  totalReviews: number;
};

export function ActivityHeatmap({ days, totalReviews }: Props) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { current, max } = useMemo(() => computeStreaks(days), [days]);

  const firstDay = new Date(days[0].date);
  const startPad = firstDay.getDay();
  const padded: (ActivityDay | null)[] = [...Array(startPad).fill(null), ...days];

  const weeks: (ActivityDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const monthLabels: (string | null)[] = weeks.map((week) => {
    const first = week.find((d) => d !== null);
    return first ? MONTHS[new Date(first.date).getMonth()] : null;
  });
  const dedupedMonths = monthLabels.map((label, i) =>
    i === 0 || label !== monthLabels[i - 1] ? label : null
  );

  const CELL = 14;
  const LEFT_OFFSET = 32;

  const streakStats = [
    { label: "Racha actual", value: current, suffix: current === 1 ? "día" : "días" },
    { label: "Racha máxima", value: max, suffix: max === 1 ? "día" : "días" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-md">Actividad</p>
          <h2 className="font-headline text-2xl font-black text-on-surface">
            Reviews por día
          </h2>
        </div>
        <span className="text-sm text-on-surface-variant">
          <span className="font-bold text-on-surface">{totalReviews}</span> reseñas este año
        </span>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-5 w-full">
        <div className="flex items-center gap-6">
          {/* Heatmap — fixed to content width */}
          <div className="overflow-x-auto shrink-0">
            {/* Month labels */}
            <div className="mb-1 flex" style={{ paddingLeft: LEFT_OFFSET }}>
              {dedupedMonths.map((label, i) => (
                <div
                  key={i}
                  className="shrink-0 text-[10px] text-on-surface-variant"
                  style={{ width: CELL }}
                >
                  {label ?? ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              <div className="flex flex-col gap-0.5 pr-1" style={{ width: LEFT_OFFSET }}>
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-end text-[11px] text-on-surface-variant"
                    style={{ height: CELL - 2 }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) =>
                    day === null ? (
                      <div key={di} style={{ width: CELL - 2, height: CELL - 2 }} />
                    ) : (
                      <div
                        key={di}
                        className={`rounded-sm transition-opacity hover:opacity-70 ${cellColor(day.count)} cursor-default`}
                        style={{ width: CELL - 2, height: CELL - 2 }}
                        onMouseEnter={(e) =>
                          setTooltip({ ...day, x: e.clientX, y: e.clientY })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-on-surface-variant" style={{ paddingLeft: LEFT_OFFSET }}>
              <span>Menos</span>
              {[0, 1, 3, 5, 7].map((n) => (
                <div
                  key={n}
                  className={`rounded-sm ${cellColor(n)}`}
                  style={{ width: CELL - 2, height: CELL - 2 }}
                />
              ))}
              <span>Más</span>
            </div>
          </div>

          {/* Streak stats — fill remaining space, 2 columns */}
          <div className="flex-1 grid grid-cols-2 gap-3 content-center">
            {streakStats.map((s) => (
              <div key={s.label} className="rounded-xl bg-surface-container px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {s.label}
                </p>
                <p className="font-headline text-2xl font-black text-primary leading-none mt-1">
                  {s.value}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{s.suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-zinc-900 px-3 py-2 shadow-xl ring-1 ring-white/10"
          style={{ left: tooltip.x + 12, top: tooltip.y - 48 }}
        >
          <p className="text-xs font-semibold text-white">
            {tooltip.count === 0
              ? "Sin reseñas"
              : `${tooltip.count} reseña${tooltip.count !== 1 ? "s" : ""}`}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{tooltip.date}</p>
        </div>
      )}
    </div>
  );
}
