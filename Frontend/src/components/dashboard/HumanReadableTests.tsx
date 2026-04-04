'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/* Maps technical test names → human-readable labels */
const HUMAN_NAMES: Record<string, string> = {
  'hemoglobin': 'Energy Levels',
  'rbc': 'Red Blood Cell Count',
  'wbc': 'Immune Defense',
  'platelets': 'Clotting Ability',
  'hematocrit': 'Blood Thickness',
  'mcv': 'Red Cell Size',
  'mch': 'Oxygen per Cell',
  'mchc': 'Oxygen Density',
  'rdw': 'Cell Size Variation',
  'neutrophils': 'Bacterial Defense',
  'lymphocytes': 'Viral Defense',
  'monocytes': 'Tissue Repair Cells',
  'eosinophils': 'Allergy Response',
  'basophils': 'Inflammation Markers',
  'esr': 'Inflammation Speed',
  'crp': 'Inflammation Level',
  'glucose': 'Blood Sugar',
  'fasting glucose': 'Fasting Blood Sugar',
  'hba1c': 'Long-term Sugar Control',
  'insulin': 'Sugar Hormone',
  'total cholesterol': 'Total Cholesterol',
  'ldl cholesterol': 'Bad Cholesterol',
  'ldl': 'Bad Cholesterol',
  'hdl cholesterol': 'Good Cholesterol',
  'hdl': 'Good Cholesterol',
  'triglycerides': 'Blood Fats',
  'vldl': 'Very Bad Cholesterol',
  'tsh': 'Thyroid Control',
  't3': 'Active Thyroid',
  't4': 'Thyroid Storage',
  'free t3': 'Active Thyroid',
  'free t4': 'Thyroid Storage',
  'creatinine': 'Kidney Filter',
  'bun': 'Kidney Waste Marker',
  'blood urea nitrogen': 'Kidney Waste Marker',
  'urea': 'Kidney Waste',
  'egfr': 'Kidney Speed',
  'uric acid': 'Joint Health',
  'sgpt': 'Liver Enzyme (ALT)',
  'sgot': 'Liver Enzyme (AST)',
  'alt': 'Liver Health (ALT)',
  'ast': 'Liver Health (AST)',
  'alp': 'Bone & Liver Enzyme',
  'alkaline phosphatase': 'Bone & Liver Enzyme',
  'bilirubin': 'Liver Pigment',
  'total bilirubin': 'Liver Pigment',
  'direct bilirubin': 'Liver Processing',
  'albumin': 'Blood Protein',
  'total protein': 'Body Protein',
  'globulin': 'Immune Protein',
  'vitamin d': 'Sunshine Vitamin',
  'vitamin b12': 'Nerve Vitamin',
  'iron': 'Iron Stores',
  'ferritin': 'Iron Reserve',
  'tibc': 'Iron Transport',
  'transferrin': 'Iron Carrier',
  'calcium': 'Bone Mineral',
  'phosphorus': 'Bone Partner',
  'magnesium': 'Muscle Mineral',
  'sodium': 'Salt Balance',
  'potassium': 'Heart Mineral',
  'chloride': 'Fluid Balance',
};

function getHumanName(testName: string): string {
  const key = testName.toLowerCase().trim();
  // Try exact match first
  if (HUMAN_NAMES[key]) return HUMAN_NAMES[key];
  // Try partial match
  for (const [k, v] of Object.entries(HUMAN_NAMES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return testName; // fallback to original
}

function getShieldClass(status: string, severity: string): string {
  if (status === 'normal') return 'shield-normal';
  if (severity === 'mild') return 'shield-mild';
  return 'shield-abnormal';
}

function getPillColor(status: string, severity: string): string {
  if (status === 'normal') return 'var(--sage)';
  if (severity === 'mild') return 'var(--amber-matte)';
  return 'var(--terracotta)';
}

export default function HumanReadableTests({ tests }: { tests: any[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!tests || tests.length === 0) {
    return (
      <div className="matte-card p-6">
        <p style={{ color: 'var(--slate-light)', fontFamily: 'Inter', fontSize: '0.875rem' }}>
          No test results to display.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map((test, i) => {
        const humanName = getHumanName(test.test_name);
        const isExpanded = expandedIdx === i;
        const shieldClass = getShieldClass(test.status, test.severity);
        const pillColor = getPillColor(test.status, test.severity);
        const gaugePos = test.gauge_position != null ? test.gauge_position : 0.5;

        return (
          <motion.div
            key={i}
            className="matte-card overflow-hidden cursor-pointer"
            onClick={() => setExpandedIdx(isExpanded ? null : i)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Status Shield */}
              <div className={`status-shield ${shieldClass}`}>
                {test.status === 'normal' ? '✓' : test.status === 'high' || test.status === 'critical_high' ? '↑' : '↓'}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
                  {humanName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>
                  {test.test_name}
                </p>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-sm" style={{ color: 'var(--cream)' }}>{test.value}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--slate-light)' }}>{test.unit}</span>
              </div>

              {/* Chevron */}
              <ChevronDown
                className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                style={{ color: 'var(--slate-light)' }}
              />
            </div>

            {/* Pill chart bar */}
            <div className="px-4 pb-3">
              <div className="pill-chart-track">
                <motion.div
                  className="pill-chart-fill"
                  style={{ background: pillColor }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(100, Math.max(5, gaugePos * 100))}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--slate)', fontFamily: 'Inter' }}>
                  Ref: {test.reference_range || '—'}
                </span>
                <span className={`status-shield ${shieldClass}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                  {test.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Expanded explanation */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--frost-border)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}>
                      {test.explanation || 'No additional explanation available.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
