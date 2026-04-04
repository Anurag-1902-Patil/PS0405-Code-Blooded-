'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--sage)';
  if (score >= 60) return 'var(--amber-matte)';
  return 'var(--terracotta)';
}

function gradeLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
}

export default function HealthScoreGauge({ data }: { data: any }) {
  const [animScore, setAnimScore] = useState(0);
  const score = data.health_score ?? 0;
  const color = scoreColor(score);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const inc = score / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= score) {
        setAnimScore(score);
        clearInterval(timer);
      } else {
        setAnimScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const tests = data.all_tests || data.tests || [];
  const normalCount = tests.filter((t: any) => t.status === 'normal').length;
  const mildCount = tests.filter((t: any) => t.severity === 'mild').length;
  const moderateCount = tests.filter((t: any) => t.severity === 'moderate').length;
  const criticalCount = tests.filter((t: any) => t.severity === 'critical').length;

  return (
    <div className="matte-card p-8" style={{ perspective: '800px' }}>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Gauge */}
        <div className="relative w-44 h-44 flex-shrink-0" style={{ transform: 'rotateX(4deg) rotateY(-2deg)' }}>
          <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="88" cy="88" r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <motion.circle
              cx="88" cy="88" r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{ filter: 'none' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <span className="text-4xl font-bold" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>{animScore}</span>
            <span className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color }}>{gradeLabel(score)}</span>
          </div>
        </div>

        {/* Summary + Breakdown */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>
            {data.health_summary || 'Your health report has been analyzed.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--sage-bg)', border: '1px solid rgba(124,154,114,0.15)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--sage-light)' }}>{normalCount}</span>
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--sage)' }}>Normal</span>
            </div>
            {mildCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--amber-bg)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--amber-matte)' }}>{mildCount}</span>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--amber-matte)' }}>Mild</span>
              </div>
            )}
            {moderateCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--terracotta-bg)', border: '1px solid rgba(196,99,75,0.1)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--terracotta-light)' }}>{moderateCount}</span>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--terracotta)' }}>Moderate</span>
              </div>
            )}
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(196,99,75,0.2)', border: '1px solid rgba(196,99,75,0.25)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--terracotta)' }}>{criticalCount}</span>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--terracotta)' }}>Critical</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
