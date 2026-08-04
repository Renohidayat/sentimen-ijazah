
import React, { useState, useEffect } from 'react'
import { predict } from '../api'

/* ─── Config ─────────────────────────────────────────────────────────────── */
const CFG = {
  Negatif: { emoji: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,.10)', border: 'rgba(239,68,68,.3)', badge: 'badge-neg' },
  Positif: { emoji: '🚀', color: '#22c55e', bg: 'rgba(34,197,94,.10)',  border: 'rgba(34,197,94,.3)',  badge: 'badge-pos' },
  Netral:  { emoji: '⚖️', color: '#3b82f6', bg: 'rgba(59,130,246,.10)', border: 'rgba(59,130,246,.3)', badge: 'badge-net' },
}

const EXAMPLES = [
  'Universitas Gadjah Mada telah mengonfirmasi keaslian ijazah Jokowi.',
  'Jokowi penipu, ijazahnya palsu dan harus diperiksa kembali.',
  'Banyak informasi yang masih belum dijelaskan secara rinci sehingga wajar jika publik mempertanyakan dan meragukan kejelasan kasus ini',
  'Sampai sekarang saya masih meragukan keaslian ijazah Jokowi.',
  'Alhamdulillah semua tuduhan terbantahkan dan ijazah Jokowi dinyatakan asli.',
]

const STOPWORDS = new Set([
  'yang','di','dan','ke','dari','untuk','ini','itu','dengan','adalah',
  'pada','juga','akan','tidak','bisa','dalam','sudah','ada','kita',
  'saya','anda','dia','mereka','kami','kamu','karena','tapi','atau',
  'lebih','setelah','saat','oleh','jadi','bukan','namun','agar','atas',
  'lagi','ya','pun','nya','gak','ga','yg','lah','deh','dong',
])

const LS_KEY  = 'sentimen_history'
const MAX_HIST = 20

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveHistory(h) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(h)) } catch {}
}

function simulasiPreprocess(rawText) {
  const step1 = rawText.toLowerCase()
  const step2 = step1
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/www\.\S+/g, ' ')
    .replace(/@\w+/g, ' ')
    .replace(/#\w+/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const tokens = step2.split(' ').filter(t => t.length > 0)
  const nostop = tokens.filter(t => !STOPWORDS.has(t) && t.length > 2)
  return { step1, step2, tokens, nostop, removed: tokens.length - nostop.length }
}

function exportCSV(history) {
  const header = 'No,Teks Asli,Teks Proses,Label,Negatif(%),Positif(%),Netral(%),Waktu'
  const rows = history.map((h, i) => {
    const neg = h.confidence?.Negatif?.toFixed(2) ?? ''
    const pos = h.confidence?.Positif?.toFixed(2) ?? ''
    const net = h.confidence?.Netral?.toFixed(2)  ?? ''
    return `${i+1},"${(h.text_asli||'').replace(/"/g,'""')}","${(h.text_proses||'').replace(/"/g,'""')}",${h.label},${neg},${pos},${net},${h.time}`
  })
  const blob = new Blob(['\uFEFF'+[header,...rows].join('\n')], { type:'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `riwayat_prediksi_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

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

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Predict() {
  const [text, setText]         = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [history, setHistory]   = useState(loadHistory)
  const [showPrep, setShowPrep] = useState(false)
  const [prep, setPrep]         = useState(null)

  useEffect(() => { saveHistory(history) }, [history])

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    setPrep(simulasiPreprocess(text))
    try {
      const res = await predict(text)
      setResult(res.data)
      setHistory(h => [{ ...res.data, time: new Date().toLocaleTimeString('id') }, ...h].slice(0, MAX_HIST))
    } catch (e) {
      setError(e.response?.data?.detail || 'Gagal terhubung ke server. Pastikan backend aktif.')
    } finally { setLoading(false) }
  }

  const cfg     = result ? CFG[result.label] : null
  const confPos = result?.confidence?.Positif ?? 0
  const confNet = result?.confidence?.Netral  ?? 0
  const confNeg = result?.confidence?.Negatif ?? 0

  return (
    <div className="fade-up" style={{ fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero header — sama seperti Metodologi ── */}
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
          Real-time Classification
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: D.text,
        }}>
          Prediksi Sentimen Real-time
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          color: D.text3,
          margin: 0,
          lineHeight: 1.7,
        }}>
          Masukkan komentar YouTube · Model SVM-RBF Baseline · TF-IDF Bigram
        </p>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ══ LEFT: Input + Examples ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Textarea block */}
          <div style={{ position: 'relative' }}>
            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: 12, height: 12,
              borderTop: `2px solid ${D.accent}`,
              borderLeft: `2px solid ${D.accent}`,
              zIndex: 1,
            }} />

            <label style={{
              display: 'block',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10, color: D.text3,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              marginBottom: 6,
            }}>
              Teks Komentar
            </label>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleSubmit() }}
              placeholder="Tulis atau paste komentar YouTube di sini..."
              rows={10}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: D.bg2,
                border: `1px solid ${D.border2}`,
                borderRadius: 2, padding: '14px 16px',
                color: D.text, fontSize: 14, lineHeight: 1.7,
                outline: 'none', resize: 'vertical',
                fontFamily: "'Hanken Grotesk',sans-serif",
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = D.accent}
              onBlur={e => e.target.style.borderColor = D.border2}
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              style={{
                marginTop: 10, width: '100%', height: 44,
                background: loading || !text.trim() ? `${D.accent}66` : D.accent,
                color: '#000', border: 'none', borderRadius: 2,
                fontFamily: "'Hanken Grotesk',sans-serif",
                fontWeight: 700, fontSize: 14,
                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'background .15s',
              }}
            >
              {loading
                ? <><div className="spinner" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} /> MENGANALISIS...</>
                : <>ANALISIS SEKARANG</>
              }
            </button>

            <div style={{
              marginTop: 5, fontSize: 11, color: D.text3,
              fontFamily: "'JetBrains Mono',monospace",
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Ctrl+Enter untuk analisis</span>
              <span>{text.length} karakter</span>
            </div>
          </div>

          {/* Examples */}
          <div style={{
            background: D.bg3,
            border: `1px solid ${D.border}`,
            borderRadius: 2, padding: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: D.accent }}>💡</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: D.text }}>Coba contoh komentar</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(ex)}
                  style={{
                    textAlign: 'left', padding: '10px 14px',
                    background: 'rgba(0,0,0,.4)',
                    border: `1px solid ${D.border2}`,
                    borderRadius: 2, color: D.text2, fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk',sans-serif",
                    transition: 'border-color .15s',
                    lineHeight: 1.5,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = D.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = D.border2}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Result + Preprocessing + History ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Result card */}
          <div style={{
            background: D.bg3,
            border: `1px solid ${cfg ? cfg.border : D.border2}`,
            borderRadius: 2, padding: '22px',
            position: 'relative', overflow: 'hidden',
            transition: 'border-color .3s',
          }}>
            {/* Corner diamond */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 32, height: 32,
              background: `${D.accent}20`,
              transform: 'rotate(45deg) translate(8px,-8px)',
              borderBottom: `1px solid ${D.accent}`,
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>{cfg ? cfg.emoji : '🤔'}</div>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10, color: D.text3,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4,
                }}>Hasil Prediksi</div>
                <div style={{
                  fontSize: 26, fontWeight: 800,
                  color: cfg ? cfg.color : D.text3,
                }}>
                  {result ? result.label : 'Menunggu...'}
                </div>
                {result && (
                  <div style={{ fontSize: 12, color: D.text3, marginTop: 3 }}>
                    Confidence: {Math.max(confPos, confNet, confNeg).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Confidence bars */}
            {[
              { label: 'Positif', val: confPos, color: '#22c55e' },
              { label: 'Netral',  val: confNet, color: '#3b82f6' },
              { label: 'Negatif', val: confNeg, color: '#ef4444' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 12, color: D.text2, marginBottom: 5,
                }}>
                  <span>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>
                    {val > 0 ? val.toFixed(1) + '%' : '0%'}
                  </span>
                </div>
                <div style={{
                  height: 6, background: 'rgba(0,0,0,.5)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${val}%`,
                    background: color, borderRadius: 2,
                    transition: 'width .7s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}

            {error && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.25)',
                borderRadius: 2, fontSize: 13, color: '#ef4444',
              }}>⚠ {error}</div>
            )}

            {!result && !error && (
              <div style={{ marginTop: 8, textAlign: 'center', color: D.text3, fontSize: 13 }}>
                Masukkan teks dan klik Analisis
              </div>
            )}
          </div>

          {/* Detail Preprocessing accordion */}
          <div style={{
            background: D.bg,
            border: `1px solid ${D.border2}`,
            borderRadius: 2,
          }}>
            <button
              onClick={() => setShowPrep(p => !p)}
              style={{
                width: '100%', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 16px', background: 'transparent',
                border: 'none', cursor: 'pointer', color: D.text,
                fontFamily: "'Hanken Grotesk',sans-serif",
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = D.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: D.text3, fontSize: 15 }}>⚙</span>
                <span style={{
                  fontWeight: 700, fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>🔧 Detail Preprocessing</span>
              </div>
              <span style={{
                color: D.text3, fontSize: 18,
                transform: showPrep ? 'rotate(180deg)' : 'none',
                transition: 'transform .2s',
                display: 'inline-block',
              }}>▾</span>
            </button>

            {showPrep && (
              <div style={{
                borderTop: `1px solid ${D.border2}`,
                padding: '16px',
                animation: 'fadeUp .2s ease both',
              }}>
                {prep ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { no: '01', label: 'Case Folding',          val: prep.step1 },
                      { no: '02', label: 'Filtering & Cleaning',  val: prep.step2 || '—' },
                      { no: '03', label: 'Tokenization',          val: prep.tokens.join(' | ') },
                      { no: '04', label: 'Stopword Removal',      val: `${prep.nostop.join(', ')} · (${prep.removed} dihapus)` },
                      { no: '05', label: 'Stemming (PySastrawi)', val: result?.text_proses || prep.nostop.join(' ') },
                      { no: '06', label: 'TF-IDF Bigram',        val: 'Bigram · max 8.000 fitur · sparse matrix → SVM-RBF' },
                    ].map(({ no, label, val }) => (
                      <div key={no} style={{ display: 'flex', gap: 12 }}>
                        <span style={{
                          background: D.accent, color: '#000',
                          padding: '2px 7px', borderRadius: 2,
                          fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 700, fontSize: 11,
                          flexShrink: 0, height: 'fit-content', marginTop: 1,
                        }}>{no}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: D.text, fontWeight: 700,
                            fontSize: 12, marginBottom: 5,
                          }}>{label}</div>
                          <div style={{
                            background: '#000', padding: '8px 10px',
                            border: `1px solid ${D.border2}`,
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 11, color: D.text3,
                            lineHeight: 1.7, wordBreak: 'break-word',
                            borderRadius: 2,
                          }}>{val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: D.text3, fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                    Analisis teks terlebih dahulu untuk melihat detail preprocessing.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Riwayat */}
          <div style={{
            background: D.bg,
            border: `1px solid ${D.border2}`,
            borderRadius: 2, padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: D.text3 }}>🕐</span>
                <span style={{
                  fontWeight: 700, fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: D.text,
                }}>Riwayat Prediksi</span>
              </div>
              <button
                onClick={() => exportCSV(history)}
                disabled={history.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'transparent', border: `1px solid ${D.border2}`,
                  color: D.text3, borderRadius: 2, padding: '4px 10px',
                  fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                  cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => { if(history.length > 0) e.currentTarget.style.borderColor = D.accent }}
                onMouseLeave={e => e.currentTarget.style.borderColor = D.border2}
              >
                ⬇ EXPORT CSV
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ color: D.text3, fontSize: 13, textAlign: 'center', padding: '14px 0' }}>
                Belum ada riwayat prediksi
              </div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {history.map((h, i) => {
                  const hc = CFG[h.label]
                  return (
                    <div
                      key={i}
                      onClick={() => setText(h.text_asli)}
                      title="Klik untuk isi ulang"
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '8px 0',
                        borderBottom: `1px solid ${D.border}`,
                        cursor: 'pointer', transition: 'background .1s',
                        gap: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        fontSize: 13, color: D.text2,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', flex: 1, minWidth: 0,
                      }}>"{h.text_asli}"</div>
                      <span className={`badge ${hc?.badge}`} style={{ flexShrink: 0 }}>{h.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media(max-width: 640px) {
          textarea { font-size: 16px !important; }
        }
      `}</style>
    </div>
  )
}
