import React, { useEffect, useRef, useState } from 'react'

/* ─── Data ─────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 'step-01', no: '01', judul: 'Pengumpulan Data (Scraping)',
    sub: 'Tahapan ekstraksi data primer dari platform media sosial.',
    detail: [
      'Menggunakan YouTube Data API v3 untuk ekstraksi komentar.',
      'Target: 11 video viral terkait isu ijazah Presiden Jokowi.',
      'Total raw data yang diperoleh: 2.783 baris komentar.',
      'Channel: Metro TV, iNews, Kompas TV, tvOneNews, Tribun Jatim, ILC, Forum Keadilan TV, KOMPAS TV.',
      'Periode pengumpulan: Maret–April 2025.',
    ],
    output: 'Raw CSV Dataset (2,783 rows)',
  },
  {
    id: 'step-02', no: '02', judul: 'Preprocessing Teks',
    sub: 'Transformasi teks mentah (unstructured) menjadi format terstruktur (structured).',
    detail: [
      'Case Folding: Penyeragaman huruf menjadi kecil.',
      'Cleaning: Penghapusan angka, simbol, URL, dan whitespace berlebih.',
      'Tokenisasi: Pemecahan kalimat menjadi kata tunggal.',
      'Stopword Removal: Menghilangkan kata yang tidak memiliki makna signifikan.',
      'Stemming: Mengembalikan kata ke bentuk dasar menggunakan PySastrawi.',
      'TF-IDF Bigram: Representasi numerik dengan max 8.000 fitur.',
    ],
    output: 'Preprocessed Tokens (2,561 clean)',
  },
  {
    id: 'step-03', no: '03', judul: 'Pelabelan (InSet Lexicon)',
    sub: 'Pemberian label awal secara otomatis menggunakan pendekatan leksikon.',
    detail: [
      'Pemanfaatan kamus InSet (Indonesia Sentiment Lexicon).',
      'Penghitungan skor polaritas untuk setiap komentar.',
      'Klasifikasi ke dalam 3 kelas: Positif, Negatif, dan Netral.',
      'Hasil: Negatif 1.711 | Positif 576 | Netral 274.',
    ],
    output: 'Lexicon Labeled Dataset',
  },
  {
    id: 'step-04', no: '04', judul: 'Uji Pakar (Reliabilitas)',
    sub: 'Validasi kualitas label mesin oleh annotator manusia ahli.',
    detail: [
      'Pelibatan 3 orang pakar untuk melakukan anotasi manual.',
      "Penghitungan tingkat kesepakatan menggunakan Fleiss' Kappa.",
      'Hasil: 0.8635 (Interpretasi: Almost Perfect Agreement).',
      'Percentage Agreement rata-rata: 92% ≥ 90% ✓',
    ],
    output: 'Validated Ground Truth Data',
  },
  {
    id: 'step-05', no: '05', judul: 'Pembagian Dataset',
    sub: 'Persiapan data untuk proses training dan validasi model ML.',
    detail: [
      'Rasio pembagian data: 80% Training dan 20% Testing.',
      'Total Data Train: 2.048 sampel.',
      'Total Data Test: 513 sampel.',
      'Metode: train_test_split stratified (random_state=42).',
    ],
    output: 'Train/Test Split Matrices',
  },
  {
    id: 'step-06', no: '06', judul: 'SVM + Grid Search CV',
    sub: 'Pembangunan model klasifikasi dengan optimasi parameter.',
    detail: [
      'Penerapan algoritma Support Vector Machine (SVM).',
      'Hyperparameter tuning menggunakan GridSearchCV 5-fold CV.',
      'Parameter terbaik: C=10, Gamma=0.1, Kernel=RBF.',
      'class_weight=balanced untuk menangani imbalanced dataset.',
    ],
    output: 'Optimized SVM Model (.pkl)',
  },
  {
    id: 'step-07', no: '07', judul: 'Evaluasi Model',
    sub: 'Pengukuran performa model pada data yang belum pernah dilihat.',
    detail: [
      'Analisis Accuracy, Precision, Recall, dan F1-Score.',
      'Pembuatan Confusion Matrix untuk melihat error klasifikasi.',
      'Accuracy: 75.24% | F1-Score: 73.46%.',
    ],
    output: 'Performance Metrics Report',
  },
  {
    id: 'step-08', no: '08', judul: 'Dashboard Visualisasi',
    sub: 'Implementasi hasil analisis ke dalam sistem interaktif.',
    detail: [
      'Pengembangan antarmuka menggunakan React.js.',
      'Integrasi API Backend berbasis FastAPI.',
      'Visualisasi distribusi sentimen secara real-time.',
      'Deploy: backend → Google Cloud Run, frontend → Vercel.',
    ],
    output: 'Live Research Dashboard',
  },
]

const STACK = [
  { label: 'YouTube API', sub: 'Ingestion'  },
  { label: 'PySastrawi',  sub: 'Stemming'   },
  { label: 'Scikit-learn',sub: 'ML Engine'  },
  { label: 'Pandas',      sub: 'Wrangling'  },
  { label: 'FastAPI',     sub: 'Backend'    },
  { label: 'React.js',    sub: 'Frontend'   },
]

const NAV_LABELS = [
  'Scraping','Preprocessing','InSet Lexicon','Uji Pakar',
  'Split Data','SVM + GridCV','Evaluasi','Dashboard',
]

const D = {
  bg:      '#000000',
  bg2:     '#0d0d0d',
  bg3:     '#1a1a1a',
  border:  'rgba(255,255,255,0.08)',
  border2: '#5e5e5e',
  text:    '#ffffff',
  text2:   'rgba(255,255,255,0.70)',
  text3:   '#898989',
  accent:  '#76b900',
  accent2: '#94da32',
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Metodologi() {
  const [activeStep, setActiveStep] = useState('step-01')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const stepRefs = useRef({})

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveStep(e.target.id) }),
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    Object.values(stepRefs.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSidebarOpen(false)
  }

  return (
    <div style={{
      fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif",
      color: D.text,
      background: D.bg,
      margin: '-32px -24px',
      padding: 0,
    }}>

      {/* ── Hero ── */}
      <section style={{
        background: D.bg,
        borderBottom: `1px solid ${D.border2}`,
        padding: 'clamp(32px, 5vw, 56px) clamp(16px, 5vw, 48px) clamp(28px, 4vw, 48px)',
      }}>
        <div style={{
          borderLeft: `2px solid ${D.accent}`,
          paddingLeft: 20,
          marginBottom: 0,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            color: D.accent2,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 8,
          }}>Research Framework</div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 12px',
            color: D.text,
          }}>Metodologi Penelitian</h1>
          <p style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 12,
            color: D.text3,
            margin: 0,
            lineHeight: 1.7,
          }}>8 tahapan lengkap · Scraping → Dashboard · SVM-RBF + TF-IDF Bigram</p>
        </div>
      </section>

      {/* ── Flowchart ── */}
      <div style={{
        margin: '0 clamp(16px, 5vw, 48px)',
        border: `1px solid ${D.border2}`,
        background: D.bg2,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '8px 16px',
          borderBottom: `1px solid ${D.border2}`,
          background: D.bg3,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 14, color: D.accent }}>⬡</span>
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10,
            color: D.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>Technical Research Pipeline: End-to-End Workflow</span>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <FlowchartSVG />
        </div>
        <p style={{
          textAlign: 'center',
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10,
          color: D.text3,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '10px 0 14px',
          margin: 0,
        }}>Visualisasi Alur Kerja Sistem Analisis Sentimen</p>
      </div>

      {/* ── Mobile: Chapter nav toggle ── */}
      <div className="_mob-chapbtn" style={{ display: 'none', padding: '12px 16px', borderBottom: `1px solid ${D.border2}` }}>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: D.bg3,
            border: `1px solid ${D.border2}`,
            borderRadius: 2,
            color: D.text,
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <span>📋 Daftar Tahapan</span>
          <span style={{ color: D.accent, fontSize: 14, transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▾</span>
        </button>

        {sidebarOpen && (
          <div style={{
            marginTop: 8,
            border: `1px solid ${D.border2}`,
            background: D.bg2,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {STEPS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(s.id) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderBottom: `1px solid ${D.border}`,
                  textDecoration: 'none',
                  borderLeft: activeStep === s.id ? `3px solid ${D.accent}` : '3px solid transparent',
                  background: activeStep === s.id ? `rgba(118,185,0,0.06)` : 'transparent',
                }}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: activeStep === s.id ? D.accent : D.text3,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>{s.no}</span>
                <span style={{
                  fontSize: 13,
                  color: activeStep === s.id ? D.text : D.text2,
                  fontWeight: activeStep === s.id ? 700 : 400,
                }}>{NAV_LABELS[i]}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Content: sidebar + rail ── */}
      <section style={{
        background: D.bg,
        padding: 'clamp(32px, 5vw, 56px) clamp(16px, 5vw, 48px)',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          gap: 48,
          alignItems: 'flex-start',
        }} className="_metodo-inner">

          {/* Desktop Sidebar */}
          <aside style={{
            width: 200,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
          }} className="_metodo-aside">
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 14,
            }}>Chapters</div>
            {STEPS.map((s, i) => {
              const active = activeStep === s.id
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => { e.preventDefault(); scrollTo(s.id) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '7px 0 7px 14px',
                    borderLeft: active ? `2px solid ${D.accent}` : `2px solid transparent`,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    marginBottom: 2,
                    background: active ? `rgba(118,185,0,0.06)` : 'transparent',
                  }}
                >
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    color: active ? D.accent : D.text3,
                    fontWeight: 700,
                  }}>{s.no}</span>
                  <span style={{
                    fontSize: 13,
                    color: active ? D.text : D.text3,
                    fontWeight: active ? 700 : 400,
                  }}>{NAV_LABELS[i]}</span>
                </a>
              )
            })}
          </aside>

          {/* Step rail */}
          <div style={{
            flex: 1,
            minWidth: 0,
            borderLeft: `1px solid ${D.border2}`,
            paddingLeft: 'clamp(24px, 5vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(32px, 5vw, 56px)',
          }} className="_metodo-rail">
            {STEPS.map((s) => (
              <div
                key={s.id}
                id={s.id}
                ref={(el) => (stepRefs.current[s.id] = el)}
                style={{ position: 'relative' }}
              >
                {/* Step number badge — repositions on mobile via CSS */}
                <div style={{
                  background: D.accent,
                  color: '#000',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 2,
                  position: 'absolute',
                  left: -66,
                  top: 0,
                  flexShrink: 0,
                }} className="_step-num">
                  {s.no}
                </div>
                <StepCard step={s} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Engineering Stack ── */}
      <section style={{
        background: D.bg2,
        borderTop: `1px solid ${D.border2}`,
        borderBottom: `1px solid ${D.border2}`,
        padding: 'clamp(32px, 5vw, 56px) clamp(16px, 5vw, 48px)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, marginBottom: 6, color: D.text }}>
          Engineering Stack
        </h2>
        <p style={{ color: D.text3, marginBottom: 28, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
          Library inti dan infrastruktur pendukung riset.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 10,
          maxWidth: 860,
          margin: '0 auto',
        }}>
          {STACK.map((t) => <StackBlock key={t.label} label={t.label} sub={t.sub} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(32px, 5vw, 56px) clamp(16px, 5vw, 48px)',
        background: D.bg,
      }}>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, marginBottom: 10, color: D.text }}>
          Siap untuk eksplorasi data?
        </h2>
        <p style={{ color: D.text3, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7, fontSize: 14 }}>
          Akses dashboard penuh untuk melihat distribusi sentimen real-time dan pola wacana yang telah dianalisis.
        </p>
        <a href="/" className="btn btn-primary">Lihat Dashboard →</a>
      </section>

      {/* ── Responsive styles ── */}
      <style>{`
        /* Desktop: number badge visible to the left */
        ._step-num {
          display: flex;
        }

        /* Mobile-first breakpoint ≤ 640px */
        @media (max-width: 640px) {
          ._metodo-inner {
            flex-direction: column !important;
            gap: 0 !important;
          }
          ._metodo-aside {
            display: none !important;
          }
          ._mob-chapbtn {
            display: block !important;
          }
          ._metodo-rail {
            border-left: none !important;
            padding-left: 0 !important;
            gap: 20px !important;
          }
          /* Hide absolute-positioned badge; show inline badge inside card */
          ._step-num {
            display: none !important;
          }
          ._step-num-inline {
            display: inline-flex !important;
          }
        }

        /* Tablet 641–900px: keep rail but hide sidebar */
        @media (min-width: 641px) and (max-width: 900px) {
          ._metodo-inner {
            flex-direction: column !important;
            gap: 0 !important;
          }
          ._metodo-aside {
            display: none !important;
          }
          ._mob-chapbtn {
            display: block !important;
          }
          ._metodo-rail {
            border-left: 1px solid ${D.border2} !important;
            padding-left: 40px !important;
          }
          ._step-num {
            left: -56px !important;
            width: 38px !important;
            height: 38px !important;
            font-size: 13px !important;
          }
        }

        /* Desktop 901px+: everything visible */
        @media (min-width: 901px) {
          ._metodo-aside {
            display: block !important;
          }
          ._mob-chapbtn {
            display: none !important;
          }
          ._step-num-inline {
            display: none !important;
          }
        }

        ._mcard:hover { border-color: #5e5e5e !important; }
        ._mstack:hover { border-color: #76b900 !important; }
      `}</style>
    </div>
  )
}

/* ─── StepCard ───────────────────────────────────────────────────────────── */
function StepCard({ step }) {
  const D = {
    bg2: '#0d0d0d', border: 'rgba(255,255,255,0.08)', border2: '#5e5e5e',
    text: '#ffffff', text2: 'rgba(255,255,255,0.70)', text3: '#898989',
    accent: '#76b900',
  }
  return (
    <div className="_mcard" style={{
      border: `1px solid ${D.border}`,
      background: D.bg2,
      borderRadius: 2,
      padding: 'clamp(16px, 3vw, 24px)',
      transition: 'border-color 0.2s',
    }}>
      {/* Inline badge for mobile — hidden on desktop via CSS */}
      <div className="_step-num-inline" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        background: D.accent,
        color: '#000',
        width: 36,
        height: 36,
        borderRadius: 2,
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 12,
        flexShrink: 0,
      }}>{step.no}</div>

      <h3 style={{
        fontSize: 'clamp(15px, 2.5vw, 18px)',
        fontWeight: 800,
        margin: '0 0 6px',
        color: D.text,
        lineHeight: 1.3,
      }}>{step.judul}</h3>
      <p style={{
        fontSize: 12,
        color: D.text3,
        margin: '0 0 16px',
        fontFamily: "'JetBrains Mono',monospace",
        lineHeight: 1.5,
      }}>{step.sub}</p>
      <div>
        {step.detail.map((d, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 10,
            fontSize: 'clamp(13px, 2vw, 14px)',
            marginBottom: 8,
            lineHeight: 1.6,
            color: D.text2,
          }}>
            <span style={{ color: D.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
            <span>{d}</span>
          </div>
        ))}
      </div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        background: 'rgba(118,185,0,0.08)',
        border: '1px solid rgba(118,185,0,0.25)',
        borderRadius: 2,
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 11,
        textTransform: 'uppercase',
        color: D.accent,
        marginTop: 16,
        flexWrap: 'wrap',
        wordBreak: 'break-word',
      }}>
        ▸ OUTPUT: {step.output}
      </div>
    </div>
  )
}

/* ─── StackBlock ─────────────────────────────────────────────────────────── */
function StackBlock({ label, sub }) {
  const D = { bg3: '#1a1a1a', border: 'rgba(255,255,255,0.08)', text: '#ffffff', text3: '#898989' }
  return (
    <div className="_mstack" style={{
      border: `1px solid ${D.border}`,
      background: D.bg3,
      borderRadius: 2,
      padding: '14px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      transition: 'border-color 0.15s',
      cursor: 'default',
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: D.text, textAlign: 'center' }}>{label}</span>
      <span style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 10,
        color: D.text3,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>{sub}</span>
    </div>
  )
}

/* ─── Flowchart SVG ──────────────────────────────────────────────────────── */
function FlowchartSVG() {
  const D = { bg3: '#1a1a1a', text3: '#898989' }
  const nodes = [
    { id: 1, label: 'SCRAPING',      sub: '(YouTube API)', x: 80,  y: 70  },
    { id: 2, label: 'PREPROCESSING', sub: '(PySastrawi)',  x: 240, y: 150 },
    { id: 3, label: 'INSET LEXICON', sub: '(Auto-label)',  x: 420, y: 150 },
    { id: 5, label: 'SPLIT DATA',    sub: '(80/20)',       x: 600, y: 150 },
    { id: 6, label: 'SVM+GRIDCV',    sub: '',              x: 760, y: 150 },
    { id: 4, label: 'UJI PAKAR',     sub: '(κ=0.8635)',   x: 240, y: 250 },
    { id: 7, label: 'EVALUASI',      sub: '(Acc 75.24%)', x: 600, y: 250 },
    { id: 8, label: 'DASHBOARD',     sub: '(Deploy)',      x: 760, y: 250 },
  ]
  const lines = [
    { x1:148, y1:70,  x2:172, y2:150, dash:false },
    { x1:308, y1:150, x2:352, y2:150, dash:false },
    { x1:488, y1:150, x2:532, y2:150, dash:false },
    { x1:668, y1:150, x2:692, y2:150, dash:false },
    { x1:240, y1:170, x2:240, y2:230, dash:false },
    { x1:600, y1:170, x2:600, y2:230, dash:false },
    { x1:668, y1:250, x2:692, y2:250, dash:false },
    { x1:760, y1:170, x2:760, y2:230, dash:true  },
  ]
  return (
    <svg viewBox="0 0 880 310" style={{ width:'100%', minWidth: 600, maxHeight: 240, display:'block', background: D.bg3 }}>
      <defs>
        <marker id="marr" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 2L8 5L2 8" fill="none" stroke="#76b900" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#76b900" strokeWidth={1.5}
          strokeDasharray={l.dash ? '4 3' : undefined}
          markerEnd="url(#marr)"/>
      ))}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x-68} y={n.y-22} width={136} height={44}
            fill={n.id===1 ? '#76b900' : '#000'}
            stroke="#76b900" strokeWidth={1} rx={1}/>
          <text x={n.x} y={n.y-5} textAnchor="middle"
            style={{ fill: n.id===1?'#000':'#fff', fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
            {n.label}
          </text>
          {n.sub && (
            <text x={n.x} y={n.y+10} textAnchor="middle"
              style={{ fill: n.id===1?'#102000':'#76b900', fontSize:9, fontFamily:"'JetBrains Mono',monospace" }}>
              {n.sub}
            </text>
          )}
        </g>
      ))}
      <line x1={20} y1={290} x2={50} y2={290} stroke="#76b900" strokeWidth={1.5} markerEnd="url(#marr)"/>
      <text x={57} y={294} style={{ fill:D.text3, fontSize:9, fontFamily:"'JetBrains Mono',monospace" }}>MAIN FLOW</text>
      <line x1={160} y1={290} x2={190} y2={290} stroke="#76b900" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#marr)"/>
      <text x={197} y={294} style={{ fill:D.text3, fontSize:9, fontFamily:"'JetBrains Mono',monospace" }}>FEEDBACK LOOP</text>
    </svg>
  )
}