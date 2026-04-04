'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

function urgencyStyle(urgency: string) {
  switch (urgency) {
    case 'high': return { pill: 'zen-pill-critical', accent: 'var(--zen-critical-accent)' };
    case 'moderate': return { pill: 'zen-pill-mild', accent: 'var(--zen-mild-accent)' };
    default: return { pill: 'zen-pill-normal', accent: 'var(--zen-normal-accent)' };
  }
}

export default function AIInsightCards({ data }: { data: any }) {
  const narrative = data.doctors_narrative || data.health_summary || '';
  const patterns = data.patterns || [];
  const allSlides = [
    ...(narrative ? [{ type: 'narrative', content: narrative }] : []),
    ...patterns.map((p: any) => ({ type: 'pattern', content: p })),
  ];
  const [current, setCurrent] = useState(0);

  if (allSlides.length === 0) return null;

  const slide = allSlides[current];
  const canPrev = current > 0;
  const canNext = current < allSlides.length - 1;

  return (
    <div className="zen-glass-solid p-6 relative overflow-hidden" style={{ minHeight: '280px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: 'var(--zen-brand-solid)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--zen-text)' }}>AI Clinical Insights</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); if (canPrev) setCurrent(c => c - 1); }}
            disabled={!canPrev}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: canPrev ? 'var(--zen-brand)' : '#F3F4F6',
              color: canPrev ? 'var(--zen-brand-text)' : '#D1D5DB',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (canNext) setCurrent(c => c + 1); }}
            disabled={!canNext}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: canNext ? 'var(--zen-brand)' : '#F3F4F6',
              color: canNext ? 'var(--zen-brand-text)' : '#D1D5DB',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {slide.type === 'narrative' ? (
            <div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--zen-text-secondary)' }}>
                {slide.content}
              </p>
            </div>
          ) : (
            <PatternSlide pattern={slide.content} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {allSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i === current ? 'var(--zen-brand-solid)' : '#E5E7EB',
              width: i === current ? '16px' : '8px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PatternSlide({ pattern }: { pattern: any }) {
  const style = urgencyStyle(pattern.urgency);
  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {pattern.urgency === 'high'
            ? <AlertTriangle className="w-4 h-4" style={{ color: 'var(--zen-critical-accent)' }} />
            : <CheckCircle className="w-4 h-4" style={{ color: 'var(--zen-normal-accent)' }} />
          }
          <h4 className="font-semibold text-sm" style={{ color: 'var(--zen-text)' }}>{pattern.name}</h4>
        </div>
        <span className={`zen-pill ${style.pill}`} style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
          {pattern.urgency}
        </span>
      </div>

      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--zen-text-muted)' }}>
        {pattern.explanation}
      </p>

      {/* Confidence */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ color: 'var(--zen-text-faint)' }}>Confidence</span>
        <div className="flex-1 zen-progress-track" style={{ height: '5px' }}>
          <motion.div
            className="zen-progress-fill"
            style={{ background: style.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(pattern.confidence * 100)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: style.accent }}>
          {Math.round(pattern.confidence * 100)}%
        </span>
      </div>

      {/* Symptom Highlight Bubbles */}
      {pattern.symptoms && pattern.symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pattern.symptoms.map((s: string, j: number) => (
            <span
              key={j}
              className="zen-pill zen-pill-brand"
              style={{ fontSize: '0.68rem', padding: '3px 10px' }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
