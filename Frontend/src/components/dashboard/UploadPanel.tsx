'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadPanel({ onAnalyze }: { onAnalyze: (file: File | null, age: string, gender: string, language: string, isDemo: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('English');
  const [isDemo, setIsDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const isSubmitDisabled = !file && !isDemo;

  return (
    <div className="relative max-w-lg mx-auto mt-16">
      {/* === Ambient depth blobs === */}
      <div className="absolute -top-24 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-28 w-80 h-80 rounded-full bg-violet-500/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-0 w-48 h-48 rounded-full bg-cyan-400/[0.08] blur-2xl pointer-events-none" />

      {/* === Glass Card === */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] border-t-white/20 rounded-3xl p-10"
      >
        {/* — Header — */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/10 rounded-full px-4 py-1 mb-4">
            <span className="text-emerald-400 text-xs">●</span>
            <span className="text-xs text-white/50 font-medium">AI Analysis Ready</span>
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Upload Your Report</h2>
          <p className="text-sm text-white/40 mt-1">Powered by medical-grade AI</p>
        </div>

        {/* — Drag Zone — */}
        <div
          className="group border border-white/10 bg-white/[0.03] rounded-2xl p-10 text-center cursor-pointer hover:border-white/25 hover:bg-white/[0.06] hover:ring-1 hover:ring-white/10 transition-all duration-300 mb-8"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-white/70 font-medium mt-4">Drop your blood report here</p>
          <p className="text-white/30 text-xs mt-1">PDF, JPG, or PNG · Max 20MB</p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {file && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-full px-4 py-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* — Form Fields — */}
        <div className="flex flex-col gap-5 mb-6">
          {/* Age */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-1.5">Age</label>
            <input
              type="number"
              placeholder="Your age"
              min="1" max="120"
              value={age}
              onChange={e => setAge(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06] transition-all outline-none"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-1.5">Biological Sex</label>
            <div className="grid grid-cols-2 gap-3">
              {['Male', 'Female'].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-xl font-medium transition-all duration-200 border ${
                    gender === g
                      ? 'bg-white/10 border-white/25 text-white'
                      : 'bg-white/[0.04] border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  {g === 'Male' ? '♂ ' : '♀ '}{g}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs text-white/40 font-medium mb-1.5">Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-white/30 focus:bg-white/[0.06] transition-all outline-none pr-10"
              >
                {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'].map(lang => (
                  <option key={lang} value={lang} className="bg-neutral-900 text-white">{lang}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* — Demo Mode — */}
        <div className="flex items-center justify-between py-3 border-t border-white/[0.06] mt-2 mb-6">
          <div>
            <p className="text-sm text-white/60">Demo Mode</p>
            <p className="text-xs text-white/30">Skip upload, load sample data</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 relative flex items-center ${isDemo ? 'bg-emerald-500/80' : 'bg-white/10'}`}
            onClick={() => setIsDemo(!isDemo)}
          >
            <div className={`w-4 h-4 rounded-full absolute transition-transform duration-200 ${isDemo ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white/70'}`} />
          </div>
        </div>

        {/* — CTA — */}
        <button
          onClick={() => onAnalyze(file, age, gender, language, isDemo)}
          disabled={isSubmitDisabled}
          className={`w-full rounded-2xl py-4 font-semibold transition-all duration-200 ${
            isSubmitDisabled
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              : 'bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]'
          }`}
        >
          Analyze Report &rarr;
        </button>
      </motion.div>
    </div>
  );
}
