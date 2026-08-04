import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts'
import { getTerdahulu } from '../api'

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

export default function Terdahulu() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTerdahulu().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div className="spinner" />
      <span style={{ color: D.text3, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>Memuat data…</span>
    </div>
  )

  const others = data.filter(d => !d.ini)
  const avg = +(others.reduce((a, d) => a + d.akurasi, 0) / others.length).toFixed(2)
  const myData = data.find(d => d.ini)

  return (
    <div className="fade-up" style={{ fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero header — sama seperti halaman Prediksi ── */}
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
          Comparative Literature Review
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: D.text,
        }}>
          Perbandingan Penelitian Terdahulu
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          color: D.text3,
          margin: 0,
          lineHeight: 1.7,
        }}>
          Posisi penelitian ini terhadap 4 penelitian sejenis · Domain analisis sentimen
        </p>
      </div>

      {/* ── Bento Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 16,
      }}>

        {/* ══ Card 1: Current Benchmark (5 col) ══ */}
        <div style={{
          gridColumn: 'span 5',
          background: D.bg3,
          border: `1px solid ${D.border2}`,
          borderRadius: 2,
          padding: '22px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}>
          {/* Corner accent diamond */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 32, height: 32,
            background: `${D.accent}20`,
            transform: 'rotate(45deg) translate(8px,-8px)',
            borderBottom: `1px solid ${D.accent}`,
          }} />

          <div>
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, background: D.accent, borderRadius: 0 }} />
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                color: D.accent2,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}>Current Benchmark</span>
            </div>

            <div style={{ fontWeight: 700, fontSize: 15, color: D.text, marginBottom: 12 }}>
              M. Reno Hidayat, 2025-2026
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <span style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1,
                color: D.accent,
                fontFamily: "'JetBrains Mono',monospace",
              }}>{myData?.akurasi}%</span>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                color: D.text3,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>Accuracy Index</span>
            </div>
          </div>

          {/* Quote block */}
          <div style={{
            background: `${D.accent}08`,
            borderLeft: `3px solid ${D.accent}`,
            padding: '12px 14px',
            borderRadius: 0,
          }}>
            <p style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              color: D.text3,
              lineHeight: 1.7,
              margin: 0,
              fontStyle: 'italic',
            }}>
              Lebih rendah dari rata-rata ({avg}%) namun{' '}
              <span style={{ color: '#22c55e', fontStyle: 'normal', fontWeight: 700 }}>valid tanpa data leakage</span>.
              Fitur InSet Lexicon dihapus untuk mencegah kebocoran data.
            </p>
          </div>
        </div>

        {/* ══ Card 2: Bar Chart (7 col) ══ */}
        <div style={{
          gridColumn: 'span 7',
          background: D.bg3,
          border: `1px solid ${D.border2}`,
          borderRadius: 2,
          padding: '22px',
          position: 'relative',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {/* Corner accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 12, height: 12,
            borderTop: `2px solid ${D.accent}`,
            borderLeft: `2px solid ${D.accent}`,
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10, color: D.text3,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4,
              }}>Accuracy Benchmark</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: D.text }}>
                Perbandingan Akurasi · Rata-rata {avg}%
              </div>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10, color: D.text3,
              padding: '3px 8px',
              background: D.bg2,
              border: `1px solid ${D.border2}`,
              borderRadius: 2,
            }}>METRIC: ACCURACY</span>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 8, right: 32, left: -8, bottom: 0 }}>
              <XAxis
                dataKey="peneliti"
                tick={{ fill: D.text3, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}
                tickFormatter={n => n.split(' ')[0] + ' ' + n.split(' ')[1]}
                axisLine={{ stroke: D.border2 }}
                tickLine={false}
              />
              <YAxis
                domain={[65, 100]}
                tick={{ fill: D.text3, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}
                unit="%"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: D.bg3,
                  border: `1px solid ${D.border2}`,
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: D.text,
                }}
                formatter={v => [`${v}%`, 'Akurasi']}
              />
              <ReferenceLine
                y={avg}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                label={{ value: `Rata-rata ${avg}%`, fill: '#f59e0b', fontSize: 11, position: 'right', fontFamily: "'JetBrains Mono',monospace" }}
              />
              <Bar dataKey="akurasi" radius={[2, 2, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.ini ? D.accent : '#2a2a2a'}
                    stroke={d.ini ? D.accent2 : D.border2}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ══ Card 3: Detail Table (12 col) ══ */}
        <div style={{
          gridColumn: 'span 12',
          background: D.bg3,
          border: `1px solid ${D.border2}`,
          borderRadius: 2,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {/* Table header bar */}
          <div style={{
            padding: '14px 20px',
            background: D.bg2,
            borderBottom: `1px solid ${D.border2}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: D.text }}>
              Mekanisme Validasi &amp; Perbandingan Metode
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[D.accent, '#3b82f6', '#ef4444'].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>

          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border2}` }}>
                  {['Peneliti / Tahun', 'Metode Utama', 'Akurasi', 'F1-Score', 'Status Validasi'].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px',
                      textAlign: 'left',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 10,
                      color: D.text3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 400,
                      background: D.bg,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => {
                  const isThis = d.ini
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: isThis
                          ? `2px solid ${D.accent}`
                          : `1px solid ${D.border}`,
                        background: isThis ? `${D.accent}0d` : 'transparent',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => { if (!isThis) e.currentTarget.style.background = D.bg3 }}
                      onMouseLeave={e => { if (!isThis) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{
                        padding: '14px 20px',
                        fontWeight: isThis ? 700 : 400,
                        color: isThis ? D.accent : D.text,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        {isThis && <span style={{ color: D.accent, fontSize: 14 }}>★</span>}
                        {d.peneliti}
                      </td>
                      <td style={{ padding: '14px 20px', color: isThis ? D.accent2 : D.text3, fontSize: 12 }}>
                        {d.metode}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 700,
                          fontSize: 13,
                          color: isThis ? D.accent : D.text,
                        }}>{d.akurasi}%</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 12,
                          color: D.text3,
                        }}>{d.f1}%</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {isThis ? (
                          <span style={{
                            padding: '3px 10px',
                            background: D.accent,
                            color: '#000',
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            borderRadius: 2,
                          }}>Certified Valid</span>
                        ) : (
                          d.leakage ? (
                            <span style={{
                              padding: '3px 10px',
                              border: '1px solid #f59e0b',
                              color: '#f59e0b',
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderRadius: 2,
                            }}>Leakage Risk</span>
                          ) : (
                            <span style={{
                              padding: '3px 10px',
                              border: `1px solid ${D.border2}`,
                              color: D.text3,
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderRadius: 2,
                            }}>Standard</span>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ Card 4: Keterbatasan (6 col) ══ */}
        <div style={{
          gridColumn: 'span 6',
          background: 'rgba(239,68,68,.04)',
          border: '1px solid rgba(239,68,68,.25)',
          borderRadius: 2,
          padding: '20px',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: '#ef4444', fontSize: 16 }}>⚠</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Keterbatasan
            </span>
          </div>
          <p style={{ fontSize: 13, color: D.text2, lineHeight: 1.7, margin: 0 }}>
            Penurunan akurasi dibandingkan dataset benchmark disebabkan eliminasi{' '}
            <strong style={{ color: D.text }}>InSet Lexicon</strong>. Tindakan ini krusial untuk mencegah{' '}
            <em>data leakage</em> di mana model menghafal label alih-alih mempelajari pola semantik murni.
          </p>
        </div>

        {/* ══ Card 5: Keunggulan (6 col) ══ */}
        <div style={{
          gridColumn: 'span 6',
          background: `${D.accent}08`,
          border: `1px solid ${D.accent}40`,
          borderRadius: 2,
          padding: '20px',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: D.accent, fontSize: 16 }}>✓</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: D.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Keunggulan
            </span>
          </div>
          <p style={{ fontSize: 13, color: D.text2, lineHeight: 1.7, margin: 0 }}>
            Meskipun numerik lebih rendah, hasil{' '}
            <strong style={{ color: D.accent }}>75.24%</strong>{' '}
            menunjukkan performa real-world yang lebih akuntabel. Model memiliki generalisasi lebih tinggi
            terhadap data baru yang belum pernah dilihat sebelumnya.
          </p>
        </div>

      </div>

      {/* Responsive collapse */}
      <style>{`
        @media (max-width: 720px) {
          .bento-5 { grid-column: span 12 !important; }
          .bento-7 { grid-column: span 12 !important; }
          .bento-6 { grid-column: span 12 !important; }
        }
      `}</style>

    </div>
  )
}