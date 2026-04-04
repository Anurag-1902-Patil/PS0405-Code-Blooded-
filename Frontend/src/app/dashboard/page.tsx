'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import HealthScoreGauge from '../../components/dashboard/HealthScoreGauge';
import HumanReadableTests from '../../components/dashboard/HumanReadableTests';
import TrendRibbon from '../../components/dashboard/TrendRibbon';
import AIInsightCards from '../../components/dashboard/AIInsightCards';
import DrNearby from '../../components/dashboard/DrNearby';
import SmartArticles from '../../components/dashboard/SmartArticles';
import DownloadPDF from '../../components/dashboard/DownloadPDF';
import UploadPanel from '../../components/dashboard/UploadPanel';
import CanvasSequence from "@/components/CanvasSequence";

/* ──────────────────────────────────────────── */
/* MOCK DATA (for demo mode)                    */
/* ──────────────────────────────────────────── */
const MOCK_DATA = {
  health_score: 62, health_grade: "Fair",
  health_summary: "Your report shows mild anemia patterns and borderline cholesterol. Most values are within normal range.",
  doctors_narrative: "Your hemoglobin is significantly below normal, indicating iron deficiency anemia. Combined with borderline fasting glucose (118 mg/dL) and elevated LDL cholesterol (148 mg/dL), there are early indicators of metabolic stress. The low Vitamin D (14 ng/mL) may contribute to fatigue and weakened immunity. These markers together suggest a need for dietary improvements and targeted supplementation.",
  tests: [
    { test_name: "Hemoglobin", value: 10.2, unit: "g/dL", status: "critical_low", severity: "critical", reference_range: "12.0 – 15.5 g/dL", category: "CBC", explanation: "Hemoglobin carries oxygen in your blood. Your level is significantly below normal, indicating anemia.", gauge_position: 0.25, deviation_pct: -22.0 },
    { test_name: "TSH", value: 2.1, unit: "uIU/mL", status: "normal", severity: "normal", reference_range: "0.5 – 4.5 uIU/mL", category: "Thyroid", explanation: "Your thyroid-stimulating hormone is normal.", gauge_position: 0.45, deviation_pct: 0 },
    { test_name: "LDL Cholesterol", value: 148, unit: "mg/dL", status: "high", severity: "mild", reference_range: "< 130 mg/dL", category: "Lipids", explanation: "LDL is slightly elevated. Diet and exercise can help.", gauge_position: 0.68, deviation_pct: 13.8 },
    { test_name: "Glucose (Fasting)", value: 118, unit: "mg/dL", status: "high", severity: "mild", reference_range: "70 – 100 mg/dL", category: "Metabolic", explanation: "Your fasting glucose is in the prediabetes range. Monitor diet.", gauge_position: 0.72, deviation_pct: 18.0 },
    { test_name: "Vitamin D", value: 14, unit: "ng/mL", status: "low", severity: "moderate", reference_range: "30 – 100 ng/mL", category: "Vitamins", explanation: "Vitamin D is significantly low. Consider supplementation.", gauge_position: 0.15, deviation_pct: -53.3 },
    { test_name: "Platelets", value: 210, unit: "×10³/μL", status: "normal", severity: "normal", reference_range: "150 – 400 ×10³/μL", category: "CBC", explanation: "Platelet count is normal.", gauge_position: 0.38, deviation_pct: 0 },
    { test_name: "Total Cholesterol", value: 195, unit: "mg/dL", status: "normal", severity: "normal", reference_range: "< 200 mg/dL", category: "Lipids", explanation: "Total cholesterol is within acceptable range.", gauge_position: 0.55, deviation_pct: 0 }
  ],
  patterns: [
    { name: "Iron Deficiency Anemia", confidence: 0.82, severity: "moderate", urgency: "moderate", explanation: "Your hemoglobin and related markers suggest iron deficiency anemia. This can cause fatigue, weakness, and pale skin.", symptoms: ["Fatigue", "Pale skin", "Shortness of breath"], doctor_questions: ["Should I start iron supplements?", "Do I need further testing?"], matched_tests: ["Hemoglobin"], icd10: "D50.9", dietary_note: "Include iron-rich foods like spinach, lentils, and fortified cereals." }
  ],
  doctor_questions: ["Should I start iron supplements?", "Is my prediabetes risk significant?", "Do I need a Vitamin D supplement?"],
  path_to_normal: {
    dietary_swaps: ["Replace red meat with plant-based proteins", "Add leafy greens for iron and folate", "Choose whole grains over refined carbs"],
    activity_prescription: "30 minutes of moderate walking daily, plus 2 strength training sessions per week."
  },
  curated_resources: {
    youtube: [{ title: "Mayo Clinic: Understanding Iron Deficiency Anemia", url: "https://www.youtube.com/results?search_query=iron+deficiency+anemia+explained" }],
    articles: [
      { title: "Managing Iron Through Diet — Harvard Health", url: "https://www.health.harvard.edu/staying-healthy/iron-and-your-health" },
      { title: "Sunlight & Supplements: A Vitamin D Guide", url: "https://www.healthline.com/nutrition/vitamin-d-101" }
    ]
  },
  recommended_specialists: [
    { specialty: "Hematologist", emoji: "🩸", reason: "To evaluate low hemoglobin and potential iron deficiency anemia.", maps_query: "Hematologist near me" },
    { specialty: "Endocrinologist", emoji: "🧬", reason: "To assess borderline glucose levels and metabolic health.", maps_query: "Endocrinologist near me" },
    { specialty: "Dietitian", emoji: "🥗", reason: "For a personalized meal plan addressing iron, Vitamin D, and cholesterol.", maps_query: "Dietitian nutritionist near me" }
  ]
};

/* ──────────────────────────────────────────── */
/* LOADING SEQUENCE (preserved exactly)         */
/* ──────────────────────────────────────────── */
const LoadingSequence = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Extracting text from report...",
    "Identifying medical parameters...",
    "Checking reference ranges...",
    "Detecting clinical patterns...",
    "Generating your health summary..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < 4 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl flex flex-col justify-center items-center mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-12">
      <div className="space-y-6 w-full max-w-sm mx-auto">
        {steps.map((text, i) => {
          const isActive = i === step;
          const isCompleted = i < step;
          return (
            <div key={i} className={`flex items-center space-x-4 transition-opacity duration-300 ${!isActive && !isCompleted ? 'opacity-40' : 'opacity-100'}`}>
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="text-emerald-500 w-6 h-6" />
                ) : isActive ? (
                  <Loader2 className="animate-spin text-white w-6 h-6" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                )}
              </div>
              <span className={`font-medium ${isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/50'}`}>
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────── */
/* RESULTS VIEW (new 3D Clinical Matte layout)  */
/* ──────────────────────────────────────────── */
function ResultsView({ results, onReset }: { results: any; onReset: () => void }) {
  const allTests = results.all_tests || results.tests || [];
  const doctorQuestions = results.doctor_questions || [];

  return (
    <div className="results-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <HealthScoreGauge data={{ ...results, all_tests: allTests }} />
        </motion.div>

        {/* Main Grid: 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN — Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trend Ribbon Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <TrendRibbon tests={allTests} />
            </motion.div>

            {/* Human-Readable Tests */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <h3 className="section-header">Your Biomarkers</h3>
              <p className="section-subtitle" style={{ marginBottom: '16px' }}>Tap any marker to see a plain-English explanation</p>
              <HumanReadableTests tests={allTests} />
            </motion.div>

            {/* Doctor Questions */}
            {doctorQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="section-header" style={{ marginBottom: '2px' }}>Questions for Your Doctor</h3>
                    <p className="section-subtitle">Bring these to your next appointment</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(doctorQuestions.join('\n'))}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: 'var(--frost)',
                      color: 'var(--cream-dim)',
                      border: '1px solid var(--frost-border)',
                      fontFamily: 'Inter',
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All
                  </button>
                </div>
                <div className="space-y-2">
                  {doctorQuestions.map((q: string, i: number) => (
                    <div
                      key={i}
                      className="matte-card p-4 flex gap-3 items-start cursor-pointer group"
                      onClick={() => navigator.clipboard.writeText(q)}
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: 'var(--frost)',
                          color: 'var(--slate-light)',
                          border: '1px solid var(--frost-border)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}>
                        {q}
                      </p>
                      <Copy
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--slate-light)' }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Smart Articles */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <SmartArticles resources={results.curated_resources} />
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Sidebar */}
          <div className="space-y-6">
            {/* AI Insight Cards */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <AIInsightCards data={results} />
            </motion.div>

            {/* Path to Normal */}
            {results.path_to_normal && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="matte-card p-5"
              >
                <h3 className="section-header" style={{ marginBottom: '12px' }}>Path to Normal</h3>
                {results.path_to_normal.dietary_swaps && results.path_to_normal.dietary_swaps.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--sage)', fontFamily: 'Inter' }}>
                      Dietary Swaps
                    </span>
                    <ul className="space-y-1.5">
                      {results.path_to_normal.dietary_swaps.map((s: string, i: number) => (
                        <li key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}>
                          <span style={{ color: 'var(--sage-light)' }}>→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.path_to_normal.activity_prescription && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--amber-matte)', fontFamily: 'Inter' }}>
                      Activity Rx
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)', fontFamily: 'Inter' }}>
                      {results.path_to_normal.activity_prescription}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Dr. Nearby */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <DrNearby specialists={results.recommended_specialists} />
            </motion.div>

            {/* Download PDF */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <DownloadPDF analysisData={results} />
            </motion.div>
          </div>
        </div>

        {/* Analyze Another */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-12 text-center"
        >
          <button
            onClick={onReset}
            className="px-8 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'transparent',
              color: 'var(--slate-light)',
              border: '1px solid var(--frost-border)',
              fontFamily: 'Inter',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--frost)';
              e.currentTarget.style.color = 'var(--cream)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--slate-light)';
            }}
          >
            ← Analyze Another Report
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/* MAIN DASHBOARD (auth/upload/loading preserved) */
/* ──────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [viewState, setViewState] = useState<'upload' | 'loading' | 'results'>('upload');
  const [results, setResults] = useState<any>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('medreport_user');
    if (!saved) {
      router.push('/auth');
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.name || !parsed.email) throw new Error('Invalid user');
      setUser(parsed);
    } catch (e) {
      localStorage.removeItem('medreport_user');
      router.push('/auth');
    }

    fetch('http://127.0.0.1:8000/')
      .then(res => {
        setIsBackendOnline(res.ok);
      })
      .catch(() => setIsBackendOnline(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('medreport_user');
    router.push('/auth');
  };

  const handleAnalyze = async (file: File | null, age: string, gender: string, language: string, isDemo: boolean) => {
    setErrorBanner(null);
    setViewState('loading');

    if (isDemo || !isBackendOnline) {
      setTimeout(() => {
        setResults({ ...MOCK_DATA });
        setViewState('results');
      }, 10000);
    } else {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('language', language);

      try {
        const res = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(errBody || 'Analysis failed');
        }
        const data = await res.json();

        // Normalize backend response
        data.all_tests = data.tests || [];
        data.doctor_questions = data.doctor_questions || [];
        if (data.doctor_questions.length === 0) {
          (data.patterns || []).forEach((p: any) => {
            if (p.doctor_questions) data.doctor_questions.push(...p.doctor_questions);
          });
          data.doctor_questions = Array.from(new Set(data.doctor_questions));
        }

        setTimeout(() => {
          setResults(data);
          setViewState('results');
        }, 100);
      } catch (err: any) {
        console.error('Analysis error:', err);
        setErrorBanner(err.message || 'Failed to analyze the report with backend.');
        setViewState('upload');
      }
    }
  };

  const handleReset = () => {
    setResults(null);
    setViewState('upload');
  };

  if (!user) return <div className="min-h-screen bg-black" />;

  /* ── Results View: completely different layout ── */
  if (viewState === 'results' && results) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
        {/* Navbar (same styling but on navy bg) */}
        <nav
          className="w-full px-6 py-4 flex justify-between items-center sticky top-0 z-50"
          style={{
            background: 'rgba(27,38,59,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--frost-border)',
          }}
        >
          <Link href="/" className="font-bold text-xl tracking-tight transition-colors" style={{ color: 'var(--cream)', fontFamily: 'Inter' }}>
            MediSense AI
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{user.name}</span>
              <span className="text-xs" style={{ color: 'var(--slate-light)' }}>{user.email}</span>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: 'var(--frost)', color: 'var(--cream)', border: '1px solid var(--frost-border)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-lg transition-colors ml-4"
              style={{
                border: '1px solid var(--frost-border)',
                color: 'var(--slate-light)',
                fontFamily: 'Inter',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--frost)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Log Out
            </button>
          </div>
        </nav>

        <ResultsView results={results} onReset={handleReset} />
      </div>
    );
  }

  /* ── Upload / Loading: original layout preserved ── */
  return (
    <div className="min-h-screen bg-[#050B18] text-white pb-20">
      <CanvasSequence className="pointer-events-none" />
      
      <div className="relative z-10">
        {/* NAVBAR (preserved) */}
        <nav className="w-full border-b border-white/10 px-6 py-4 flex justify-between items-center bg-[#050B18]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-bold text-xl tracking-tight text-white/90 hover:text-white transition-colors">
          MedReport AI
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-white/50">{user.email}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm border border-white/20 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors ml-4"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* BACKEND STATUS BANNER (preserved) */}
      {!isBackendOnline && (
        <div className="w-full bg-amber-500/20 px-6 py-3 border-b border-amber-500/30 flex justify-center items-center text-amber-200">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">⚠️ Backend offline — Demo Mode active</span>
        </div>
      )}

      {/* ERROR BANNER (preserved) */}
      {errorBanner && viewState === 'upload' && (
        <div className="max-w-xl mx-auto mt-8 flex justify-between items-center bg-red-500/10 border border-red-500/30 px-6 py-4 rounded-xl text-red-300">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span className="text-sm">{errorBanner}</span>
          </div>
          <button 
            onClick={() => handleAnalyze(null, '30', 'Male', 'English', true)}
            className="ml-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Switch to Demo Mode
          </button>
        </div>
      )}

      <main className="px-6 relative">
        <AnimatePresence mode="wait">
          {viewState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <UploadPanel onAnalyze={handleAnalyze} />
            </motion.div>
          )}

          {viewState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingSequence />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
