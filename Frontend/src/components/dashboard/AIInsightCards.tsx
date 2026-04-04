'use client';

import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';

function urgencyBadge(urgency: string) {
  switch (urgency) {
    case 'high': return { bg: 'var(--terracotta-bg)', color: 'var(--terracotta)', border: 'rgba(196,99,75,0.2)', label: 'High Priority' };
    case 'moderate': return { bg: 'var(--amber-bg)', color: 'var(--amber-matte)', border: 'rgba(201,168,76,0.2)', label: 'Moderate' };
    default: return { bg: 'var(--sage-bg)', color: 'var(--sage)', border: 'rgba(124,154,114,0.2)', label: 'Low Priority' };
  }
}

export default function AIInsightCards({ data }: { data: any }) {
  const narrative = data.doctors_narrative || data.health_summary || '';
  const patterns = data.patterns || [];

  return (
    <div className="space-y-4">
      {/* Doctor's Narrative */}
      {narrative && (
        <motion.div
          className="frost-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" style={{ color: 'var(--sage-light)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
              AI Clinical Analysis
            </h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}>
            {narrative}
          </p>
        </motion.div>
      )}

      {/* Pattern Cards */}
      {patterns.map((pattern: any, i: number) => {
        const badge = urgencyBadge(pattern.urgency);
        return (
          <motion.div
            key={i}
            className="frost-card p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {pattern.urgency === 'high'
                  ? <AlertTriangle className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
                  : <CheckCircle className="w-4 h-4" style={{ color: 'var(--sage)' }} />
                }
                <h4 className="font-semibold text-sm" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
                  {pattern.name}
                </h4>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-md"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  fontFamily: 'Inter',
                }}
              >
                {badge.label}
              </span>
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>
              {pattern.explanation}
            </p>

            {/* Confidence */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs" style={{ color: 'var(--slate)', fontFamily: 'Inter' }}>Confidence</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: badge.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(pattern.confidence * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: badge.color }}>{Math.round(pattern.confidence * 100)}%</span>
            </div>

            {/* Symptoms */}
            {pattern.symptoms && pattern.symptoms.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slate)', fontFamily: 'Inter' }}>Watch for:</span>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.symptoms.map((s: string, j: number) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{
                        background: 'var(--frost)',
                        border: '1px solid var(--frost-border)',
                        color: 'var(--cream-dim)',
                        fontFamily: 'Inter',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
