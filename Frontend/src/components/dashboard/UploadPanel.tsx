'use client';

import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

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
    <div className="max-w-xl mx-auto mt-16 bg-white/[0.04] border border-white/10 rounded-2xl p-8">
      <div 
        className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-white/40 transition-colors mb-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-12 h-12 text-white/50 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">Drop your blood report here</p>
        <p className="text-white/40 text-sm">PDF, JPG, or PNG · Max 20MB</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        {file && (
          <div className="mt-4 inline-block bg-white/10 px-4 py-2 rounded-lg text-sm text-white">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <input 
          type="number" 
          placeholder="Your age" 
          min="1" max="120"
          value={age}
          onChange={e => setAge(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
        />

        <div className="flex gap-2">
          {['Male', 'Female'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors border ${gender === g ? 'bg-white border-white text-black' : 'bg-transparent border-white/10 text-white/60 hover:border-white/40'}`}
            >
              {g}
            </button>
          ))}
        </div>

        <select 
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
        >
          {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'].map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
        <div 
          className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative flex items-center ${isDemo ? 'bg-white' : 'bg-white/20'}`}
          onClick={() => setIsDemo(!isDemo)}
        >
          <div className={`w-4 h-4 rounded-full absolute transition-transform ${isDemo ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white'}`} />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Demo Mode</p>
          <p className="text-white/40 text-xs">Skip upload and load sample data</p>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(file, age, gender, language, isDemo)}
        disabled={isSubmitDisabled}
        className="w-full bg-white text-black rounded-lg py-4 font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Report &rarr;
      </button>
    </div>
  );
}
