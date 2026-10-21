import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Post } from '../types/index.ts';
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Eye,
  ThumbsUp,
  Share2,
  Lock,
  ArrowUpRight,
  PenSquare,
  FileText,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface DashboardProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onNewPost: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  posts,
  onSelectPost,
  onEditPost,
  onNewPost,
}) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ date: string; views: number; reads: number } | null>(null);

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-900 dark:text-slate-100">
        <h2 className="text-xl font-bold">Access Restricted to Administrator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          The global engagement telemetry and platform performance dashboard are restricted to Administrator accounts.
        </p>
      </div>
    );
  }

  const relevantPosts = posts;

  // Compute aggregate metrics
  const totalViews = relevantPosts.reduce((acc, p) => acc + (p.metrics?.views || 0), 0);
  const totalUnique = relevantPosts.reduce((acc, p) => acc + (p.metrics?.uniqueVisitors || 0), 0);
  const totalClaps = relevantPosts.reduce((acc, p) => acc + (p.metrics?.claps || 0), 0);
  const totalShares = relevantPosts.reduce((acc, p) => acc + (p.metrics?.shares || 0), 0);
  const publishedCount = relevantPosts.filter(p => p.status === 'published').length;
  const draftCount = relevantPosts.filter(p => p.status === 'draft').length;
  const encryptedCount = relevantPosts.filter(p => p.isEncrypted).length;

  const avgReadRatio = relevantPosts.length > 0
    ? (relevantPosts.reduce((acc, p) => acc + (p.metrics?.readRatio || 70), 0) / relevantPosts.length).toFixed(1)
    : '0';

  // Aggregate daily history for chart
  const historyMap: Record<string, { views: number; reads: number }> = {};
  relevantPosts.forEach(p => {
    (p.metrics?.viewsHistory || []).forEach(h => {
      if (!historyMap[h.date]) {
        historyMap[h.date] = { views: 0, reads: 0 };
      }
      historyMap[h.date].views += h.views;
      historyMap[h.date].reads += h.reads;
    });
  });

  const chartData = Object.keys(historyMap).length > 0
    ? Object.entries(historyMap).map(([date, vals]) => ({ date, ...vals }))
    : [
        { date: 'Oct 14', views: 820, reads: 610 },
        { date: 'Oct 15', views: 1420, reads: 1100 },
        { date: 'Oct 16', views: 3200, reads: 2450 },
        { date: 'Oct 17', views: 4900, reads: 3780 },
        { date: 'Oct 18', views: 5600, reads: 4200 },
        { date: 'Oct 19', views: 3900, reads: 2950 },
      ];

  const maxViews = Math.max(...chartData.map(d => d.views), 100);

  // SVG dimensions
  const svgWidth = 650;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.views / maxViews) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title and Quick Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {user.role === 'admin'
              ? 'Publisher Intelligence'
              : user.role === 'editor'
              ? 'Editorial Engagement Dashboard'
              : 'Author Telemetry & Metrics'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time reader engagement, read-depth ratios, and vault cryptographic status for <strong className="text-slate-700 dark:text-slate-300">{user.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Time Filter Button (Allowed interactive tabs) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={onNewPost}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalViews.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium font-mono tabular-nums">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.6% vs last period</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Unique Visitors</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalUnique.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            68% organic reach
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Average Read Ratio</span>
            <CheckCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {avgReadRatio}%
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            High completion depth
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Engagements & Claps</span>
            <ThumbsUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalClaps.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {totalShares} external shares
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 30-day views curve (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Audience Trajectory & Deep Reads
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily aggregated page impressions vs verified full reads
              </p>
            </div>
            {hoveredDataPoint && (
              <div className="text-right text-xs font-mono">
                <span className="text-slate-500">{hoveredDataPoint.date}: </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {hoveredDataPoint.views} views
                </span>
                <span className="text-slate-400"> · </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {hoveredDataPoint.reads} reads
                </span>
              </div>
            )}
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Area path */}
              <path d={areaD} fill="url(#viewsAreaGrad)" />

              {/* Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredDataPoint?.date === pt.data.date ? 6 : 4}
                    className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2 transition-all"
                    onMouseEnter={() => setHoveredDataPoint(pt.data)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {pt.data.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Impressions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completion Depth</span>
              </div>
            </div>
            <span className="font-mono text-[11px]">Latency: &le;12ms</span>
          </div>
        </div>

        {/* Traffic Sources & Device Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Traffic Sources */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Traffic Attribution
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Aggregators (HN / Lobsters)</span>
                  <span className="font-mono tabular-nums font-semibold">46%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '46%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Direct & Subscribed RSS</span>
                  <span className="font-mono tabular-nums font-semibold">24%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Search Engines</span>
                  <span className="font-mono tabular-nums font-semibold">18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Newsletters & Social</span>
                  <span className="font-mono tabular-nums font-semibold">12%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-300 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Device Formats
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="text-base font-bold font-mono tabular-nums">54%</div>
                  <div className="text-[11px] text-slate-500">Mobile Web</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
                <Monitor className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="text-base font-bold font-mono tabular-nums">46%</div>
                  <div className="text-[11px] text-slate-500">Desktop / Tablet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Articles Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Content Performance Roster
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed metrics across published manuscripts and encrypted drafts
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {publishedCount} Published · {draftCount} Drafts · {encryptedCount} E2EE Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3">Document Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Avg Read Time</th>
                <th className="px-4 py-3">Read Ratio</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {relevantPosts.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5 max-w-xs truncate">
                    <button
                      onClick={() => onSelectPost(p)}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors cursor-pointer"
                    >
                      {p.title}
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{p.category}</span>
                      {p.isEncrypted && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Lock className="w-3 h-3" />
                            <span>AES-256</span>
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={p.authorAvatar}
                        alt={p.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{p.authorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        p.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : p.status === 'draft'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums font-semibold whitespace-nowrap">
                    {p.metrics?.views?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums whitespace-nowrap text-slate-500">
                    {p.metrics?.avgReadTime || `${p.readTime}m 00s`}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums whitespace-nowrap">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {p.metrics?.readRatio || 72}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectPost(p)}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => onEditPost(p)}
                        className="px-2.5 py-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
