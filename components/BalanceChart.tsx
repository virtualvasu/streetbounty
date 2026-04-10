'use client';

interface BalancePoint {
  timestamp: number;
  balance: number;
}

interface BalanceChartProps {
  points: BalancePoint[];
}

export default function BalanceChart({ points }: BalanceChartProps) {
  if (points.length < 2) {
    return (
      <div className="h-36 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Add more refresh points to see balance trend
      </div>
    );
  }

  const width = 460;
  const height = 160;
  const padding = 20;
  const values = points.map((p) => p.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const getX = (index: number) => {
    if (points.length === 1) return padding;
    return padding + (index * (width - padding * 2)) / (points.length - 1);
  };

  const getY = (value: number) => {
    const normalized = (value - min) / range;
    return height - padding - normalized * (height - padding * 2);
  };

  const polyline = points
    .map((point, index) => `${getX(index)},${getY(point.balance)}`)
    .join(' ');

  const latest = points[points.length - 1]?.balance ?? 0;
  const previous = points[points.length - 2]?.balance ?? latest;
  const delta = latest - previous;

  return (
    <div className="rounded-xl bg-white/75 dark:bg-slate-800/85 border border-slate-200/80 dark:border-slate-700 p-4 transition-colors duration-200 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">Balance History</p>
        <p className={`text-sm font-semibold ${delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(4)} XLM
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[360px]">
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="3"
            points={polyline}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polygon
            fill="url(#balanceGradient)"
            points={`${polyline} ${getX(points.length - 1)},${height - padding} ${getX(0)},${height - padding}`}
          />

          {points.map((point, index) => (
            <circle key={point.timestamp + index} cx={getX(index)} cy={getY(point.balance)} r="3.5" fill="#0ea5e9" />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{new Date(points[0].timestamp).toLocaleTimeString()}</span>
        <span>{new Date(points[points.length - 1].timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
