'use client';

import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';

export default function DrNearby({ specialists }: { specialists: any[] }) {
  if (!specialists || specialists.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4" style={{ color: 'var(--sage)' }} />
        <h3 className="section-header" style={{ marginBottom: 0 }}>Recommended For You</h3>
      </div>
      <p className="section-subtitle" style={{ marginBottom: '16px' }}>Specialists based on your report findings</p>

      <div className="space-y-3">
        {specialists.map((spec: any, i: number) => (
          <motion.div
            key={i}
            className="matte-card p-4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
          >
            <div className="flex items-start gap-3">
              {/* Emoji Icon */}
              <div className="specialist-emoji">
                {spec.emoji || '🩺'}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
                  {spec.specialty}
                </h4>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--slate-light)', fontFamily: 'Inter' }}>
                  {spec.reason}
                </p>

                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(spec.maps_query || spec.specialty + ' near me')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: 'var(--sage-bg)',
                    color: 'var(--sage-light)',
                    border: '1px solid rgba(124,154,114,0.2)',
                    fontFamily: 'Inter',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124,154,114,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--sage-bg)';
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  Find on Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
