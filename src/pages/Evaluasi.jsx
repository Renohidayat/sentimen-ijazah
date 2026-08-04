import React, { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
} from 'recharts'
import { getModel, getCompar } from '../api'

/* ── Design tokens ─────────────────────────────────────────────────────── */
const D = {
  bg:      '#000000',
  bg2:     '#0d0d0d',
  bg3:     '#1a1a1a',
  bg4:     '#2a2a2a',
  border:  '#2a2a2a',
  border2: '#5e5e5e',
  text:    '#f9f9f9',
  text2:   'rgba(249,249,249,.70)',
  text3:   '#898989',
  accent:  '#76b900',
  accent2: '#94da32',
  neg:     '#ef4444',
  pos:     '#22c55e',
  net:     '#3b82f6',
  warn:    '#f59e0b',
  purple:  '#c084fc',
}

const LC = {
  Negatif: { color: '#ef4444', border: 'rgba(239,68,68,.3)',  bg: 'rgba(239,68,68,.08)'  },
  Netral:  { color: '#3b82f6', border: 'rgba(59,130,246,.3)', bg: 'rgba(59,130,246,.08)' },
  Positif: { color: '#22c55e', border: 'rgba(34,197,94,.3)',  bg: 'rgba(34,197,94,.08)'  },
}

const TABS = [
  { id: 'ringkasan',    label: 'Ringkasan'          },
  { id: 'perkelas',     label: 'Per Kelas'          },
  { id: 'confusion',    label: 'Confusion Matrix'   },
  { id: 'perbandingan', label: 'Perbandingan Model' },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */
function buildClassReport(cm) {
  const labels = cm.labels
  const matrix = cm.matrix
  const n = labels.length
  const report = []
  let totalSupport = 0, macroP = 0, macroR = 0, macroF = 0
  let weightedP = 0, weightedR = 0, weightedF = 0

  for (let i = 0; i < n; i++) {
    const tp = matrix[i][i]
    const fp = matrix.reduce((s, row, r) => r !== i ? s + row[i] : s, 0)
    const fn = matrix[i].reduce((s, v, c) => c !== i ? s + v : s, 0)
    const support = matrix[i].reduce((s, v) => s + v, 0)
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall    = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1        = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0
    report.push({ label: labels[i], precision, recall, f1, support, tp, fp, fn })
    totalSupport += support
    macroP += precision; macroR += recall; macroF += f1
    weightedP += precision * support
    weightedR += recall    * support
    weightedF += f1        * support
  }

  const accuracy = matrix.reduce((s, row, i) => s + row[i], 0) / totalSupport
  return {
    perKelas: report, accuracy, totalSupport,
    macro:    { precision: macroP/n,               recall: macroR/n,               f1: macroF/n               },
    weighted: { precision: weightedP/totalSupport,  recall: weightedR/totalSupport,  f1: weightedF/totalSupport  },
  }
}

/* Bangun daftar pola misklasifikasi dari confusion matrix */
function buildMisklas(cm) {
  const result = []
  const labels = cm.labels
  const matrix = cm.matrix
  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < labels.length; j++) {
      if (i !== j && matrix[i][j] > 0) {
        const total = matrix[i].reduce((s, v) => s + v, 0)
        result.push({
          dari:   labels[i],
          ke:     labels[j],
          jumlah: matrix[i][j],
          persen: +((matrix[i][j] / total) * 100).toFixed(1),
        })
      }
    }
  }
  return result.sort((a, b) => b.jumlah - a.jumlah)
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function MetricBar({ value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value*100}%`, background:color, transition:'width .6s ease' }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color, minWidth:44, textAlign:'right' }}>
        {(value*100).toFixed(1)}%
      </span>
    </div>
  )
}

/* Shared card style */
const card = {
  background: D.bg2,
  border:     `1px solid ${D.border}`,
  borderRadius: 2,
  padding: 24,
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Evaluasi() {
  const [model,   setModel]   = useState(null)
  const [compar,  setCompar]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('ringkasan')

  useEffect(() => {
    Promise.all([getModel(), getCompar()])
      .then(([m, c]) => { setModel(m.data); setCompar(c.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12 }}>
      <div className="spinner" />
      <span style={{ color:D.text3, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>MEMUAT DATA...</span>
    </div>
  )

  const best  = model.model_terbaik
  const cm    = model.confusion_matrix
  const cr    = buildClassReport(cm)
  const misk  = buildMisklas(cm)   // ← selalu dibuat dari confusion matrix, bukan dari API field

  const maxMisk = misk.length > 0 ? misk[0].jumlah : 1

  const radarData = [
    { subject: 'Akurasi',  val: best.akurasi  },
    { subject: 'Presisi',  val: best.presisi  },
    { subject: 'Recall',   val: best.recall   },
    { subject: 'F1-Score', val: best.f1       },
    { subject: 'CV F1',    val: best.cv_f1    },
  ]

  return (
    <div className="fade-up" style={{ fontFamily:"'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero header ── */}
      <div style={{ borderLeft:`2px solid ${D.accent}`, paddingLeft:20, marginBottom:36 }}>
        <div style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:11,
          color:D.accent2, textTransform:'uppercase',
          letterSpacing:'0.2em', marginBottom:8,
        }}>
          Model Evaluation
        </div>
        <h1 style={{
          fontSize:'clamp(22px,4vw,34px)', fontWeight:800,
          lineHeight:1.15, margin:'0 0 10px', color:D.text,
          textTransform:'uppercase', letterSpacing:'-0.01em',
        }}>
          Evaluasi Model SVM
        </h1>
        <p style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:12,
          color:D.text3, margin:0,
        }}>
          Perbandingan 4 varian · Model terbaik:{' '}
          <span style={{ color:D.accent2, fontWeight:700 }}>SVM-RBF Baseline</span>
        </p>
      </div>

      {/* ── Tab nav ── */}
      <nav style={{
        display:'flex', gap:0,
        borderBottom:`1px solid ${D.border2}`,
        marginBottom:28,
        overflowX:'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding:'12px 18px',
              background:'transparent', border:'none',
              borderBottom: tab === t.id ? `2px solid ${D.accent}` : '2px solid transparent',
              color: tab === t.id ? D.accent : D.text3,
              fontFamily:"'Hanken Grotesk',sans-serif",
              fontWeight: tab === t.id ? 700 : 500,
              fontSize:14, cursor:'pointer',
              whiteSpace:'nowrap',
              transition:'all .15s',
              marginBottom:-1,
            }}
          >{t.label}</button>
        ))}
      </nav>

      {/* ════════════════════════════════════════════════
          TAB: RINGKASAN
      ═══════════════════════════════════════════════════ */}
      {tab === 'ringkasan' && (
        <div className="fade-up">

          {/* Row 1: best model card + 4 metric cards */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,180px),1fr))',
            gap:14, marginBottom:18,
          }}>
            {/* Best model */}
            <div style={{ ...card, position:'relative', overflow:'hidden', gridColumn:'span 1' }}>
              <div style={{ position:'absolute', top:0, right:0, width:3, height:'100%', background:D.accent }} />
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:D.accent, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                ★ Best Architecture
              </div>
              <div style={{ fontSize:15, fontWeight:800, color:D.text, marginBottom:14, lineHeight:1.3 }}>{best.nama}</div>
              <div style={{ borderTop:`1px solid ${D.border2}`, paddingTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['Kernel',   best.best_params?.kernel ?? 'rbf'],
                  ['C',        best.best_params?.C ?? 10],
                  ['Gamma',    best.best_params?.gamma ?? 0.1],
                  ['N Sampel', cr.totalSupport],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:12, color:D.text3 }}>{k}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:D.accent2, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 metric cards */}
            {[
              { label:'ACCURACY',  val:`${best.akurasi}%`,  topColor:D.pos    },
              { label:'PRECISION', val:`${best.presisi}%`,  topColor:D.net    },
              { label:'RECALL',    val:`${best.recall}%`,   topColor:D.warn   },
              { label:'F1-SCORE',  val:`${best.f1}%`,       topColor:D.purple },
            ].map(({ label, val, topColor }) => (
              <div key={label} style={{
                ...card,
                borderTop:`3px solid ${topColor}`,
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:0, right:0, width:12, height:12, background:D.accent }} />
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:D.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{label}</div>
                <div style={{ fontSize:30, fontWeight:800, color:D.text, fontFamily:"'JetBrains Mono',monospace" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Row 2: Radar + Misklasifikasi */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap:14 }}>

            {/* Radar chart */}
            <div style={{ ...card }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:D.text, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:D.accent }}>◉</span> Model Balance (Radar)
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top:10, right:30, bottom:10, left:30 }}>
                  <PolarGrid stroke={D.border2} strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill:D.text3, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}
                  />
                  <Radar
                    dataKey="val"
                    stroke={D.accent}
                    fill={D.accent}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pola Misklasifikasi — selalu dari confusion matrix */}
            <div style={{ ...card }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:D.text, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:D.neg }}>⚠</span> Pola Misklasifikasi
              </div>

              {misk.length === 0 ? (
                <div style={{ color:D.text3, fontSize:13, textAlign:'center', padding:'24px 0' }}>
                  Tidak ada misklasifikasi
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {misk.map((m, i) => {
                    const fromColor = LC[m.dari]?.color  || D.text3
                    const toColor   = LC[m.ke]?.color    || D.text3
                    const barColor  = toColor
                    const pct       = (m.jumlah / maxMisk) * 100
                    return (
                      <div key={i}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:D.text2 }}>
                            <span style={{ color:fromColor, fontWeight:700 }}>{m.dari}</span>
                            <span style={{ color:D.text3, margin:'0 4px' }}>→</span>
                            <span style={{ color:toColor, fontWeight:700 }}>{m.ke}</span>
                          </span>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:D.text3 }}>{m.persen}%</span>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:toColor, fontWeight:700 }}>{m.jumlah}</span>
                          </div>
                        </div>
                        <div style={{ height:10, background:D.bg4, overflow:'hidden', borderRadius:2 }}>
                          <div style={{
                            height:'100%', width:`${pct}%`,
                            background:barColor, transition:'width .5s ease',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB: PER KELAS
      ═══════════════════════════════════════════════════ */}
      {tab === 'perkelas' && (
        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Kartu per kelas */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap:14 }}>
            {cr.perKelas.map(k => {
              const c = LC[k.label] || { color:D.text3, border:D.border, bg:D.bg3 }
              const cls = { Negatif:'CLASS_0', Netral:'CLASS_1', Positif:'CLASS_2' }
              return (
                <div key={k.label} style={{ ...card, borderLeft:`3px solid ${c.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h4 style={{ fontSize:16, fontWeight:800, color:c.color, margin:0 }}>{k.label}</h4>
                    <span style={{
                      background:`${c.color}20`, color:c.color,
                      fontFamily:"'JetBrains Mono',monospace",
                      fontSize:10, padding:'2px 8px', borderRadius:2,
                    }}>{cls[k.label]}</span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                    {[
                      ['Presisi',  k.precision],
                      ['Recall',   k.recall   ],
                      ['F1-Score', k.f1       ],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:12, color:D.text3 }}>{lbl}</span>
                        </div>
                        <MetricBar value={val} color={c.color} />
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop:`1px solid ${D.border2}`, paddingTop:12, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, textAlign:'center' }}>
                    {[['TP',k.tp,D.pos],['FP',k.fp,D.warn],['FN',k.fn,D.neg]].map(([lbl,val,col]) => (
                      <div key={lbl} style={{ background:D.bg3, borderRadius:2, padding:'6px 4px' }}>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:D.text3, marginBottom:3 }}>{lbl}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:col, fontFamily:"'JetBrains Mono',monospace" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Classification report table */}
          <div style={card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, color:D.text }}>Classification Report Lengkap</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:D.text3, marginBottom:16 }}>
              Dihitung dari confusion matrix · TP = True Positive · FP = False Positive · FN = False Negative
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{['Kelas','Precision','Recall','F1-Score','Support'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {cr.perKelas.map(k => {
                    const c = LC[k.label]?.color || D.text
                    return (
                      <tr key={k.label}>
                        <td style={{ color:c, fontWeight:700, fontSize:13 }}>{k.label}</td>
                        <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text }}>{(k.precision*100).toFixed(2)}%</span></td>
                        <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text }}>{(k.recall*100).toFixed(2)}%</span></td>
                        <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text }}>{(k.f1*100).toFixed(2)}%</span></td>
                        <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{k.support}</span></td>
                      </tr>
                    )
                  })}
                  <tr style={{ background:'rgba(255,255,255,.02)' }}>
                    <td style={{ color:D.text3, fontWeight:700, fontSize:11 }}>accuracy</td>
                    <td colSpan={2} />
                    <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.accent, fontWeight:700 }}>{(cr.accuracy*100).toFixed(2)}%</span></td>
                    <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{cr.totalSupport}</span></td>
                  </tr>
                  {[['macro avg',cr.macro],['weighted avg',cr.weighted]].map(([lbl,avg]) => (
                    <tr key={lbl}>
                      <td style={{ color:D.text3, fontWeight:700, fontSize:11 }}>{lbl}</td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{(avg.precision*100).toFixed(2)}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{(avg.recall*100).toFixed(2)}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{(avg.f1*100).toFixed(2)}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{cr.totalSupport}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB: CONFUSION MATRIX
      ═══════════════════════════════════════════════════ */}
      {tab === 'confusion' && (
        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, flexWrap:'wrap', gap:8 }}>
              <div style={{ fontWeight:700, fontSize:14, color:D.text }}>Confusion Matrix Analysis</div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:D.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                Predicted Labels →
              </span>
            </div>
            <div style={{ fontSize:12, color:D.text3, marginBottom:20, fontFamily:"'JetBrains Mono',monospace" }}>
              Baris = label aktual · Kolom = label prediksi · Diagonal ungu = prediksi benar
            </div>

            {/* Responsive matrix wrapper */}
            <div style={{ overflowX:'auto' }}>
              <div style={{
                display:'grid',
                gridTemplateColumns:`110px repeat(${cm.labels.length}, minmax(80px,1fr))`,
                gap:2,
                minWidth: 360,
                maxWidth:540,
                margin:'0 auto',
                background:D.bg3,
                padding:2,
                border:`1px solid ${D.border2}`,
                borderRadius:2,
              }}>
                {/* Header row */}
                <div style={{ padding:'10px 8px', background:D.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:D.text3, textAlign:'center' }}>Aktual ↓ / Prediksi →</span>
                </div>
                {cm.labels.map(l => (
                  <div key={l} style={{ padding:'10px 8px', background:D.bg, textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:LC[l]?.color || D.text3 }}>
                    {l}
                  </div>
                ))}

                {/* Data rows */}
                {cm.matrix.map((row, i) => (
                  <React.Fragment key={i}>
                    <div style={{ padding:'10px 8px', background:D.bg, display:'flex', alignItems:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:LC[cm.labels[i]]?.color || D.text3 }}>
                      {cm.labels[i]}
                    </div>
                    {row.map((val, j) => {
                      const isDiag = i === j
                      return (
                        <div
                          key={j}
                          style={{
                            background: isDiag ? 'rgba(192,132,252,.18)' : D.bg2,
                            border:`1px solid ${D.border2}`,
                            display:'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center',
                            padding:'14px 6px', transition:'border-color .15s',
                            minHeight:64, cursor:'default',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = D.accent}
                          onMouseLeave={e => e.currentTarget.style.borderColor = D.border2}
                        >
                          <span style={{
                            fontFamily:"'JetBrains Mono',monospace",
                            fontSize:20, fontWeight:800,
                            color: isDiag ? '#c084fc' : D.text3,
                          }}>{val}</span>
                          {isDiag && (
                            <span style={{ fontSize:9, color:'#c084fc', marginTop:3, fontFamily:"'JetBrains Mono',monospace", opacity:.7 }}>TP</span>
                          )}
                          {cm.persen && (
                            <span style={{ fontSize:10, color:D.text3, marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>
                              {cm.persen[i][j]}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Interpretasi per kelas */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:12 }}>
            {cr.perKelas.map(k => {
              const c = LC[k.label] || { color:D.text3, border:D.border, bg:D.bg3 }
              return (
                <div key={k.label} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:2, padding:'14px 16px' }}>
                  <div style={{ fontWeight:700, fontSize:13, color:c.color, marginBottom:10 }}>{k.label}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {[
                      { label:'✓ Benar diprediksi', val:k.tp, color:D.pos },
                      { label:'✗ Salah prediksi ke kelas lain', val:k.fn, color:D.neg },
                      { label:'✗ Kelas lain salah prediksi ini', val:k.fp, color:D.warn },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:D.text3, lineHeight:1.8 }}>
                        <span>{label}</span>
                        <strong style={{ color, fontFamily:"'JetBrains Mono',monospace" }}>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB: PERBANDINGAN MODEL
      ═══════════════════════════════════════════════════ */}
      {tab === 'perbandingan' && (
        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Horizontal progress bars */}
          <div style={card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:24, color:D.text }}>Cross-Architecture Comparison</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {compar.map((m, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <span style={{
                    fontFamily:"'JetBrains Mono',monospace", fontSize:12,
                    color: m.terbaik ? D.accent : D.text3,
                    minWidth:100, fontWeight: m.terbaik ? 700 : 400,
                  }}>
                    {m.nama.replace(' (Baseline)','')}
                  </span>
                  <div style={{ flex:1, minWidth:120, height:32, background:D.bg4, display:'flex', alignItems:'center', borderRadius:2, overflow:'hidden' }}>
                    <div style={{
                      height:'100%',
                      width:`${(m.akurasi / 100) * 100}%`,
                      background: m.terbaik ? D.accent : D.bg3,
                      transition:'width .6s ease',
                    }} />
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color: m.terbaik ? D.accent : D.text2, fontWeight:700, minWidth:54 }}>
                    {m.akurasi}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:20, color:D.text }}>Akurasi & F1-Score per Model</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compar} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                <XAxis
                  dataKey="nama"
                  tick={{ fill:D.text3, fontSize:10 }}
                  tickFormatter={n => n.replace(' (Baseline)','')}
                />
                <YAxis domain={[55, 80]} tick={{ fill:D.text3, fontSize:11 }} />
                <Tooltip
                  contentStyle={{ background:D.bg3, border:`1px solid ${D.border2}`, borderRadius:2, fontSize:13 }}
                  labelStyle={{ color:D.text }}
                />
                <Legend wrapperStyle={{ fontSize:12, color:D.text3 }} />
                <Bar dataKey="akurasi" name="Akurasi (%)" radius={[2,2,0,0]}>
                  {compar.map((m, i) => <Cell key={i} fill={m.terbaik ? D.accent : D.bg4} />)}
                </Bar>
                <Bar dataKey="f1" name="F1-Score (%)" radius={[2,2,0,0]}>
                  {compar.map((m, i) => <Cell key={i} fill={m.terbaik ? D.accent2 : D.border2} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detail table */}
          <div style={card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:D.text }}>Detail Semua Model</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{['Model','Akurasi','Presisi','Recall','F1-Score','CV F1','Status'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {compar.map((m, i) => (
                    <tr key={i} style={{ background: m.terbaik ? 'rgba(118,185,0,.06)' : 'transparent' }}>
                      <td style={{ fontWeight:m.terbaik?700:400, color:m.terbaik?D.accent:D.text, fontSize:13 }}>{m.nama}</td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:D.text }}>{m.akurasi}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text2 }}>{m.presisi}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text2 }}>{m.recall}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text2 }}>{m.f1}%</span></td>
                      <td><span style={{ fontFamily:"'JetBrains Mono',monospace", color:D.text3 }}>{m.cv_f1}%</span></td>
                      <td>
                        {m.terbaik
                          ? <span className="badge badge-pos">✅ Terbaik</span>
                          : <span style={{ fontSize:12, color:D.text3 }}>Pembanding</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}