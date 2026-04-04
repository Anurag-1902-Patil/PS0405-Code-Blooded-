'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function getBarColor(status: string, severity: string): string {
  if (status === 'normal') return '#7C9A72';    // sage
  if (severity === 'mild') return '#C9A84C';    // amber-matte
  if (severity === 'moderate') return '#D48B78'; // terracotta-light
  return '#C4634B';                              // terracotta
}

function truncateName(name: string, maxLen: number = 10): string {
  return name.length > maxLen ? name.substring(0, maxLen) + '…' : name;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="matte-card p-3" style={{ border: '1px solid var(--frost-border)', maxWidth: '200px' }}>
        <p className="font-semibold text-xs mb-1" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
          {d.fullName}
        </p>
        <p className="text-xs" style={{ color: 'var(--slate-light)' }}>
          <span className="font-bold" style={{ color: 'var(--cream)' }}>{d.value}</span> {d.unit}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--slate)' }}>
          Ref: {d.reference_range || '—'}
        </p>
      </div>
    );
  }
  return null;
};

export default function TrendRibbon({ tests }: { tests: any[] }) {
  if (!tests || tests.length === 0) return null;

  // Use deviation_pct for the chart - this shows how far from normal each test is
  const chartData = tests.slice(0, 12).map((t: any) => ({
    name: truncateName(t.test_name),
    fullName: t.test_name,
    value: t.value,
    unit: t.unit,
    reference_range: t.reference_range,
    deviation: Math.abs(t.deviation_pct || 0),
    barColor: getBarColor(t.status, t.severity),
    status: t.status,
    severity: t.severity,
    // Use gauge_position to determine bar height proportionally
    barHeight: Math.max(8, (t.gauge_position || 0.5) * 100),
  }));

  return (
    <div className="matte-card p-6" style={{ perspective: '600px' }}>
      <h3 className="section-header">Test Overview</h3>
      <p className="section-subtitle" style={{ marginBottom: '20px' }}>Visual summary of your biomarker levels</p>

      <div style={{ transform: 'rotateX(2deg)', transformOrigin: 'center bottom' }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="18%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#718096', fontSize: 10, fontFamily: 'Inter' }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="barHeight" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#7C9A72' }} />
          <span className="text-xs" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#C9A84C' }} />
          <span className="text-xs" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>Mild</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#C4634B' }} />
          <span className="text-xs" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>Abnormal</span>
        </div>
      </div>
    </div>
  );
}
