import React, { useState } from 'react'
import renoImage from '/public/reno.jpg'

const ABSTRAK_ID = `Penelitian ini bertujuan menganalisis sentimen komentar YouTube terhadap isu ijazah Joko Widodo menggunakan metode Support Vector Machine (SVM) dengan kernel Radial Basis Function (RBF) dan representasi fitur TF-IDF Bigram. Data dikumpulkan dari 11 video YouTube pada 8 channel berita nasional menggunakan YouTube Data API v3, menghasilkan 2.783 komentar mentah yang setelah preprocessing menjadi 2.561 komentar bersih.

Pelabelan dilakukan secara otomatis menggunakan InSet Lexicon (Indonesian Sentiment Lexicon), kemudian divalidasi melalui uji reliabilitas inter-anotator dengan melibatkan 3 anotator pakar pada 50 sampel stratified. Hasil uji menunjukkan Fleiss' Kappa sebesar 0,8635 (hampir sempurna) dan Percentage Agreement rata-rata 92%, membuktikan kualitas label yang tinggi.

Model SVM-RBF Baseline dengan parameter optimal C=10, γ=0,1 yang diperoleh melalui GridSearchCV 5-fold cross-validation menghasilkan akurasi 75,24% dan F1-Score 73,46% pada data uji. Distribusi sentimen menunjukkan dominasi sentimen negatif sebesar 66,81% (1.711 komentar), diikuti positif 22,49% (576 komentar), dan netral 10,70% (274 komentar), mencerminkan tingginya skeptisisme publik terhadap isu tersebut.`

const ABSTRAK_EN = `This study aims to analyze the sentiment of YouTube comments regarding the diploma issue of Joko Widodo using Support Vector Machine (SVM) with Radial Basis Function (RBF) kernel and TF-IDF Bigram feature representation. Data were collected from 11 YouTube videos across 8 national news channels using the YouTube Data API v3, yielding 2,783 raw comments which were reduced to 2,561 clean comments after preprocessing.

Labeling was performed automatically using InSet Lexicon (Indonesian Sentiment Lexicon), then validated through an inter-annotator reliability test involving 3 expert annotators on 50 stratified samples. The test results showed a Fleiss' Kappa of 0.8635 (almost perfect) and an average Percentage Agreement of 92%, demonstrating high label quality.

The SVM-RBF Baseline model with optimal parameters C=10, γ=0.1 obtained through 5-fold cross-validation GridSearchCV achieved an accuracy of 75.24% and an F1-Score of 73.46% on the test data. The sentiment distribution showed a dominance of negative sentiment at 66.81% (1,711 comments), followed by positive at 22.49% (576 comments), and neutral at 10.70% (274 comments), reflecting high public skepticism toward the issue.`

const INFO = [
  { label: 'Nama',          value: 'M. Reno Hidayat'                    },
  { label: 'NIM',           value: '220660121005'                        },
  { label: 'Program Studi', value: 'Teknik Informatika'                  },
  { label: 'Fakultas',      value: 'FTI'                              },
  { label: 'Institusi',     value: 'Universitas Sebelas April Sumedang'  },
  { label: 'Tahun',         value: '2025-2026'                                },
]

const PEMBIMBING = [
  { label: 'Pembimbing I',  value: 'Asep Saeppani, S.Kom., M.Kom.' },
  { label: 'Pembimbing II', value: 'Irfan Fadil, S.Kom., M.Kom.' },
]

const KEYWORDS_ID = ['Analisis Sentimen', 'SVM', 'TF-IDF Bigram', 'YouTube', 'Ijazah Jokowi', 'InSet Lexicon', 'Fleiss Kappa', 'NLP', 'GridSearchCV']
const KEYWORDS_EN = ['Sentiment Analysis', 'SVM', 'TF-IDF Bigram', 'YouTube', 'Jokowi Diploma', 'InSet Lexicon', 'Fleiss Kappa', 'NLP', 'GridSearchCV']

const STATS = [
  { val: '2.561',  label: 'Total komentar',   sub: 'Verified Dataset',    color: '#3b82f6' },
  { val: '66.81%', label: 'Sentimen negatif', sub: 'Dominant Class',      color: '#ef4444' },
  { val: '75.24%', label: 'Akurasi model',    sub: 'SVM-RBF Optimized',   color: '#76b900' },
  { val: '0.8635', label: "Fleiss' κ",        sub: 'High Reliability',    color: '#f59e0b' },
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

export default function Tentang() {
  const [lang, setLang] = useState('id')
  const [copied, setCopied] = useState(false)

  const abstrak  = lang === 'id' ? ABSTRAK_ID : ABSTRAK_EN
  const keywords = lang === 'id' ? KEYWORDS_ID : KEYWORDS_EN

  const handleCopy = () => {
    navigator.clipboard.writeText(abstrak).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fade-up" style={{ fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero header — identik dengan Predict & Terdahulu ── */}
      <div style={{
        borderLeft: `2px solid ${D.accent}`,
        paddingLeft: 20,
        marginBottom: 36,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 11,
          color: D.accent2,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: 8,
        }}>
          Research Overview
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: D.text,
        }}>
          Tentang Penelitian
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          color: D.text3,
          margin: 0,
          lineHeight: 1.7,
        }}>
          Abstrak · Identitas peneliti · Ringkasan hasil
        </p>
      </div>

      {/* ── Judul skripsi ── */}
      <div style={{
        background: D.bg3,
        border: `1px solid ${D.border2}`,
        borderRadius: 2,
        padding: '28px 24px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* corner diamond */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 32, height: 32,
          background: `${D.accent}20`,
          transform: 'rotate(45deg) translate(8px,-8px)',
          borderBottom: `1px solid ${D.accent}`,
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${D.accent}18`,
          border: `1px solid ${D.accent}50`,
          borderRadius: 2,
          padding: '5px 16px',
          fontSize: 12,
          color: D.accent2,
          fontFamily: "'JetBrains Mono',monospace",
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Skripsi · Teknik Informatika · 2025-2026
        </div>

        <h2 style={{
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          fontWeight: 800,
          lineHeight: 1.55,
          letterSpacing: '-0.2px',
          maxWidth: 700,
          margin: '0 auto 14px',
          color: D.text,
        }}>
          Penilaian Sentimen Komentar YouTube Terhadap Isu Ijazah Joko Widodo
          Menggunakan Metode{' '}
          <span style={{ color: D.accent }}>Support Vector Machine</span>{' '}
          berbasis GridSearchCV
        </h2>

        <div style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          color: D.text3,
        }}>
          M. Reno Hidayat · 220660121005 · Universitas Sebelas April Sumedang
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: D.bg3,
            border: `1px solid ${D.border2}`,
            borderTop: `3px solid ${s.color}`,
            borderRadius: 2,
            padding: '16px',
            position: 'relative',
          }}>
            {/* corner dot */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 10, height: 10,
              background: D.accent,
            }} />
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}>{s.label}</div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 28,
              fontWeight: 800,
              color: s.color,
              lineHeight: 1,
              marginBottom: 8,
            }}>{s.val}</div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main 2-column ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 16,
        alignItems: 'start',
        marginBottom: 16,
      }}>

        {/* ══ Left: Abstrak ══ */}
        <div style={{
          background: D.bg3,
          border: `1px solid ${D.border2}`,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Corner accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 12, height: 12,
            borderTop: `2px solid ${D.accent}`,
            borderLeft: `2px solid ${D.accent}`,
            zIndex: 1,
          }} />

          {/* Header bar */}
          <div style={{
            padding: '13px 18px',
            background: D.bg2,
            borderBottom: `1px solid ${D.border2}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              color: D.text,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>Abstrak</div>

            <div style={{ display: 'flex', gap: 8 }}>
              {/* Lang toggle */}
              <div style={{
                display: 'flex',
                background: D.bg,
                border: `1px solid ${D.border2}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                {['id', 'en'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                      padding: '4px 12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: lang === l ? D.accent : 'transparent',
                      color: lang === l ? '#000' : D.text3,
                      transition: 'all .15s',
                    }}
                  >{l}</button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: `1px solid ${D.border2}`,
                  borderRadius: 2,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: copied ? D.accent : D.text3,
                  transition: 'all .2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >{copied ? '✓ Tersalin' : 'Salin'}</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '18px', fontSize: 13, color: D.text2, lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {abstrak}
          </div>

          {/* Keywords */}
          <div style={{
            padding: '14px 18px',
            borderTop: `1px solid ${D.border2}`,
            background: D.bg2,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}>
              {lang === 'id' ? 'Kata Kunci' : 'Keywords'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {keywords.map(k => (
                <span key={k} style={{
                  background: `${D.accent}12`,
                  border: `1px solid ${D.accent}40`,
                  borderRadius: 2,
                  padding: '3px 10px',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: D.accent2,
                  fontWeight: 700,
                }}>{k}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Right: Sidebar cards ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Identitas Peneliti */}
          <div style={{
            background: D.bg3,
            border: `1px solid ${D.border2}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              background: D.bg2,
              borderBottom: `1px solid ${D.border2}`,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              fontWeight: 700,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>Identitas Peneliti</div>

            {/* Profile row */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${D.border2}` }}>
              <img
                src={renoImage}
                alt="M. Reno Hidayat"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
                style={{
                  width: 56, height: 56,
                  borderRadius: 2,
                  objectFit: 'cover',
                  border: `1px solid ${D.border2}`,
                  filter: 'grayscale(30%)',
                  flexShrink: 0,
                }}
              />
              {/* Fallback initials */}
              <div style={{
                display: 'none',
                width: 56, height: 56,
                borderRadius: 2,
                background: `${D.accent}18`,
                border: `1px solid ${D.accent}40`,
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
                fontSize: 16,
                color: D.accent,
                flexShrink: 0,
              }}>MR</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: D.text, marginBottom: 3 }}>
                  M. Reno Hidayat
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: D.text3,
                }}>NIM: 220660121005</div>
              </div>
            </div>

            {INFO.map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex',
                gap: 12,
                padding: '9px 16px',
                borderBottom: `1px solid ${D.border}`,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  minWidth: 110,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: D.text3,
                  flexShrink: 0,
                }}>{label}</span>
                <span style={{ fontSize: 13, color: D.text2 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Pembimbing */}
          <div style={{
            background: D.bg3,
            border: `1px solid ${D.border2}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              background: D.bg2,
              borderBottom: `1px solid ${D.border2}`,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              fontWeight: 700,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>Pembimbing</div>
            {PEMBIMBING.map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', gap: 12,
                padding: '10px 16px',
                borderBottom: `1px solid ${D.border}`,
                alignItems: 'center',
              }}>
                <span style={{
                  minWidth: 110,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: D.text3,
                }}>{label}</span>
                <span style={{ fontSize: 13, color: value === '—' ? D.border2 : D.text2 }}>{value}</span>
              </div>
            ))}
          
          </div>

          {/* Tech stack */}
          <div style={{
            background: D.bg3,
            border: `1px solid ${D.border2}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              background: D.bg2,
              borderBottom: `1px solid ${D.border2}`,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              fontWeight: 700,
              color: D.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>Technology Stack</div>
            {[
              ['Backend',  'FastAPI · Python · PySastrawi',        '#22c55e'],
              ['Frontend', 'React · Recharts · React Router',      '#3b82f6'],
              ['Model',    'SVM-RBF · scikit-learn · GridSearchCV','#76b900'],
              ['Fitur',    'TF-IDF Bigram · 8.000 fitur',          '#f59e0b'],
              ['Label',    'InSet Lexicon · 3 Anotator Pakar',     '#ef4444'],
              ['Deploy',   'Google Cloud Run (backend) · Vercel (frontend)', '#8b5cf6'],
            ].map(([k, v, c]) => (
              <div key={k} style={{
                display: 'flex', gap: 12,
                padding: '9px 16px',
                borderBottom: `1px solid ${D.border}`,
                alignItems: 'center',
              }}>
                <span style={{
                  minWidth: 70,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: c,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>{k}</span>
                <span style={{ fontSize: 12, color: D.text3 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Catatan Metodologi ── */}
      <div style={{
        background: D.bg3,
        border: `1px solid ${D.border2}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        {/* Header with accent bar */}
        <div style={{
          padding: '14px 20px',
          background: D.bg2,
          borderBottom: `1px solid ${D.border2}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ width: 3, height: 20, background: D.accent, borderRadius: 0 }} />
          <span style={{
            fontWeight: 700,
            fontSize: 13,
            color: D.text,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>Catatan Metodologi</span>
        </div>

        <div style={{
          padding: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 12,
        }}>
          {[
            {
              color: '#f59e0b',
              judul: 'Mengapa akurasi 75.24%?',
              isi: 'Fitur InSet Lexicon sengaja tidak digunakan sebagai fitur model karena label dibentuk dari skor yang sama, sehingga akan menyebabkan data leakage dan hasil yang bias.',
            },
            {
              color: '#22c55e',
              judul: 'Validitas hasil',
              isi: 'Meski akurasi di bawah rata-rata penelitian sejenis, hasil ini paling dapat dipertanggungjawabkan secara metodologis karena bebas dari kontaminasi fitur target.',
            },
            {
              color: '#6366f1',
              judul: "Reliabilitas label",
              isi: "Fleiss' κ = 0.8635 menunjukkan tingkat kesepakatan 'hampir sempurna' antara 3 anotator pakar, membuktikan kualitas label yang objektif dan konsisten.",
            },
            {
              color: '#3b82f6',
              judul: 'Imbalanced dataset',
              isi: 'Dataset tidak seimbang (Negatif 66.81%, Positif 22.49%, Netral 10.70%). Model menangani ini dengan class_weight=balanced pada SVC.',
            },
          ].map(c => (
            <div key={c.judul} style={{
              background: D.bg2,
              borderRadius: 2,
              padding: '16px',
              border: `1px solid ${c.color}22`,
              borderLeft: `3px solid ${c.color}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: c.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.judul}
              </div>
              <div style={{ fontSize: 13, color: D.text3, lineHeight: 1.75 }}>
                {c.isi}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}