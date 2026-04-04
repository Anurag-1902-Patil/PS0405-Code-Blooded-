'use client';

import { motion } from 'framer-motion';
import { ExternalLink, PlayCircle, FileText } from 'lucide-react';

export default function SmartArticles({ resources }: { resources: any }) {
  if (!resources) return null;

  const youtube = resources.youtube || [];
  const articles = resources.articles || [];
  const allItems = [
    ...youtube.map((r: any) => ({ ...r, type: 'video' })),
    ...articles.map((r: any) => ({ ...r, type: 'article' })),
  ];

  if (allItems.length === 0) return null;

  return (
    <div>
      <h3 className="section-header">Curated For You</h3>
      <p className="section-subtitle" style={{ marginBottom: '16px' }}>Articles and videos matched to your results</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allItems.slice(0, 6).map((item: any, i: number) => (
          <motion.a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="clay-card p-4 block group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.type === 'video' ? 'var(--terracotta-bg)' : 'var(--sage-bg)',
                  border: item.type === 'video'
                    ? '1px solid rgba(196,99,75,0.15)'
                    : '1px solid rgba(124,154,114,0.15)',
                }}
              >
                {item.type === 'video'
                  ? <PlayCircle className="w-4 h-4" style={{ color: 'var(--terracotta-light)' }} />
                  : <FileText className="w-4 h-4" style={{ color: 'var(--sage-light)' }} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`resource-badge ${item.type === 'video' ? 'badge-video' : 'badge-article'}`}>
                    {item.type === 'video' ? 'Video' : 'Article'}
                  </span>
                </div>
                <p
                  className="text-xs font-medium leading-snug group-hover:underline"
                  style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}
                >
                  {item.title}
                </p>
              </div>

              <ExternalLink
                className="w-3.5 h-3.5 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--slate-light)' }}
              />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
