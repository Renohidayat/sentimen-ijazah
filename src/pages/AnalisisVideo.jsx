import React, { useState, useRef, useMemo } from 'react'
import { analyzeVideo } from '../api'

/* ── Design tokens ─────────────────────────────────────────────────────── */
const D = {
  bg:      '#000000',
  bg2:     '#0d0d0d',
  bg3:     '#1a1a1a',
  bg4:     '#222222',
  border:  '#2a2a2a',
  border2: '#5e5e5e',
  text:    '#f9f9f9',
  text2:   'rgba(249,249,249,.70)',
  text3:   '#757575',
  accent:  '#76b900',
  accent2: '#94da32',
  neg:     '#ef4444',
  pos:     '#22c55e',
  net:     '#3b82f6',
}

const LABEL_CFG = {
  Positif: { color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.35)',  icon: '✅' },
  Negatif: { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.35)',  icon: '⚠️' },
  Netral:  { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.35)', icon: '⚖️' },
}

/* ── Helper: parse video ID dari URL ───────────────────────────────────── */
function parseVideoId(raw) {
  const s = raw.trim()
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

/* ── Export CSV ─────────────────────────────────────────────────────────── */
function exportCSV(comments, title) {
  const header = 'No,Author,Komentar,Label,Positif(%),Negatif(%),Netral(%)'
  const rows = comments.map((c, i) =>
    `${i + 1},"${(c.author || '').replace(/"/g, '""')}","${(c.text || '').replace(/"/g, '""')}",${c.label},${(c.confidence?.Positif ?? 0).toFixed(2)},${(c.confidence?.Negatif ?? 0).toFixed(2)},${(c.confidence?.Netral ?? 0).toFixed(2)}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `sentimen-${title.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Donut Chart (pure SVG) ─────────────────────────────────────────────── */
function DonutChart({ persen }) {
  const size = 160
  const r    = 60
  const cx   = size / 2
  const cy   = size / 2
  const circ = 2 * Math.PI * r

  const slices = [
    { key: 'Positif', color: '#22c55e', pct: persen.Positif || 0 },
    { key: 'Netral',  color: '#3b82f6', pct: persen.Netral  || 0 },
    { key: 'Negatif', color: '#ef4444', pct: persen.Negatif || 0 },
  ]

  let offset = 0
  const paths = slices.map(s => {
    const dash = (s.pct / 100) * circ
    const gap  = circ - dash
    const el = (
      <circle
        key={s.key}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={s.color}
        strokeWidth={22}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{ transition: 'stroke-dasharray .6s ease' }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
    offset += dash
    return el
  })

  const dominant = slices.reduce((a, b) => (a.pct >= b.pct ? a : b))

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth={22} />
        {paths}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: dominant.color, fontFamily: "'JetBrains Mono',monospace" }}>
          {dominant.pct.toFixed(1)}%
        </div>
        <div style={{ fontSize: 10, color: '#757575', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {dominant.key}
        </div>
      </div>
    </div>
  )
}

/* ── Progress bar row ───────────────────────────────────────────────────── */
function SentBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(249,249,249,.70)' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color, fontWeight: 700 }}>{count.toLocaleString()}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#757575' }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#2a2a2a', borderRadius: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width .6s ease' }} />
      </div>
    </div>
  )
}

/* ── Loading animation ──────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <>
      <style>{`
        @keyframes blink2{0%,100%{opacity:.2}50%{opacity:1}}
        .ldot2{display:inline-block;width:6px;height:6px;border-radius:50%;background:#76b900;animation:blink2 1.2s infinite}
        .ldot2:nth-child(2){animation-delay:.2s}
        .ldot2:nth-child(3){animation-delay:.4s}
      `}</style>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span className="ldot2" /><span className="ldot2" /><span className="ldot2" />
      </div>
    </>
  )
}

const PAGE_SIZE = 20

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function AnalisisVideo() {
  const [input,       setInput]       = useState('')
  const [maxComments, setMaxComments] = useState(200)
  const [loading,     setLoading]     = useState(false)
  const [loadMsg,     setLoadMsg]     = useState('')
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState('')
  const [filterLabel, setFilterLabel] = useState('Semua')
  const [searchCmt,   setSearchCmt]   = useState('')
  const [page,        setPage]        = useState(1)
  const resultRef = useRef(null)

  const previewId = parseVideoId(input)

  async function handleAnalyze() {
    const vid = parseVideoId(input)
    if (!vid) {
      setError('Format URL/ID YouTube tidak valid. Contoh: https://youtu.be/abc1234567 atau ID 11 karakter.')
      return
    }
    setError('')
    setResult(null)
    setFilterLabel('Semua')
    setSearchCmt('')
    setPage(1)
    setLoading(true)

    const msgs = [
      'Menghubungkan ke YouTube API...',
      `Mengambil hingga ${maxComments} komentar...`,
      'Memproses teks & menjalankan model SVM...',
      'Hampir selesai...',
    ]
    let idx = 0
    setLoadMsg(msgs[idx])
    const timer = setInterval(() => {
      idx = (idx + 1) % msgs.length
      setLoadMsg(msgs[idx])
    }, 2500)

    try {
      const res = await analyzeVideo(vid, maxComments)
      setResult(res.data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || 'Terjadi kesalahan tidak diketahui'
      setError(msg)
    } finally {
      clearInterval(timer)
      setLoading(false)
      setLoadMsg('')
    }
  }

  const filteredComments = useMemo(() => {
    if (!result) return []
    let c = result.comments
    if (filterLabel !== 'Semua') c = c.filter(x => x.label === filterLabel)
    if (searchCmt.trim()) {
      const q = searchCmt.toLowerCase()
      c = c.filter(x => x.text.toLowerCase().includes(q) || x.author.toLowerCase().includes(q))
    }
    return c
  }, [result, filterLabel, searchCmt])

  const totalPages   = Math.ceil(filteredComments.length / PAGE_SIZE)
  const pagedComments = filteredComments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="fade-up" style={{ fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ borderLeft: '2px solid #76b900', paddingLeft: 20, marginBottom: 36 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#94da32', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
          Live Analysis Engine · YouTube Data API v3
        </div>
        <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 10px', color: '#f9f9f9' }}>
          Analisis Sentimen Video YouTube
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#757575', margin: 0, lineHeight: 1.7 }}>
          Masukkan URL video YouTube → ambil komentar otomatis → klasifikasi dengan model SVM-RBF
        </p>
      </div>

      {/* ── Input Panel ── */}
      <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 2, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#76b900', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>
          Input Video
        </div>

        {/* URL input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#757575', marginBottom: 6 }}>
            URL / Video ID YouTube
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://www.youtube.com/watch?v=... atau ID 11 karakter"
              style={{
                flex: 1, minWidth: 240, padding: '11px 14px',
                background: '#000000',
                border: `1px solid ${input && !previewId ? '#ef4444' : previewId ? '#76b900' : '#2a2a2a'}`,
                borderRadius: 2, color: '#f9f9f9',
                fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, outline: 'none',
                transition: 'border-color .15s',
              }}
            />
            {previewId && (
              <div style={{
                padding: '10px 14px', background: 'rgba(118,185,0,.08)',
                border: '1px solid #76b900', borderRadius: 2,
                fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                color: '#76b900', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                ✓ {previewId}
              </div>
            )}
          </div>

          {/* Thumbnail preview */}
          {previewId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <img
                src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                alt="preview"
                style={{ width: 80, height: 45, objectFit: 'cover', border: '1px solid #2a2a2a', borderRadius: 2, opacity: .8 }}
              />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#757575' }}>
                Preview · youtu.be/{previewId}
              </span>
            </div>
          )}
        </div>

        {/* Slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#757575' }}>Jumlah Komentar</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#76b900', fontWeight: 700 }}>{maxComments} komentar</span>
          </div>
          <input
            type="range" min={50} max={500} step={50}
            value={maxComments}
            onChange={e => setMaxComments(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#76b900', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575' }}>50 (cepat)</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575' }}>500 (lengkap)</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,.08)',
            border: '1px solid rgba(239,68,68,.3)', borderRadius: 2,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
            color: '#ef4444', marginBottom: 16,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          style={{
            width: '100%', padding: '13px 24px',
            background: loading || !input.trim() ? '#1a1a1a' : '#76b900',
            color: loading || !input.trim() ? '#757575' : '#000',
            border: `1px solid ${loading || !input.trim() ? '#2a2a2a' : '#76b900'}`,
            borderRadius: 2, fontFamily: "'JetBrains Mono',monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'all .15s',
          }}
        >
          {loading ? (
            <>
              <LoadingDots />
              <span style={{ color: 'rgba(249,249,249,.70)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                {loadMsg}
              </span>
            </>
          ) : '▶ Mulai Analisis'}
        </button>

        <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575', textAlign: 'center' }}>
          Kuota YouTube API: ~10.000 unit/hari gratis · 1 halaman (100 komentar) = 1 unit
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <div ref={resultRef}>

          {/* Video info card */}
          <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 2, padding: 20, marginBottom: 20, display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <img
              src={result.video_info.thumbnail}
              alt={result.video_info.title}
              style={{ width: 180, height: 101, objectFit: 'cover', border: '1px solid #2a2a2a', borderRadius: 2, flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#76b900', marginBottom: 4 }}>
                {result.video_info.channel}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f9f9f9', margin: '0 0 12px', lineHeight: 1.4 }}>
                {result.video_info.title}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 12 }}>
                {[
                  ['👁 Views', Number(result.video_info.view_count).toLocaleString()],
                  ['💬 Total Komentar', Number(result.video_info.comment_count).toLocaleString()],
                  ['🔬 Dianalisis', result.total_analyzed.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575' }}>{k}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: '#f9f9f9', fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.open(`https://youtube.com/watch?v=${result.video_info.video_id}`, '_blank')}
                style={{
                  padding: '7px 16px', background: 'transparent',
                  border: '1px solid #5e5e5e', color: 'rgba(249,249,249,.70)',
                  borderRadius: 2, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#76b900'; e.target.style.color = '#76b900' }}
                onMouseLeave={e => { e.target.style.borderColor = '#5e5e5e'; e.target.style.color = 'rgba(249,249,249,.70)' }}
              >
                ▶ Buka di YouTube
              </button>
            </div>
          </div>

          {/* Sentiment distribution */}
          <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 2, padding: 24, marginBottom: 20 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#76b900', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>
              Distribusi Sentimen
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              <DonutChart persen={result.distribusi_persen} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <SentBar label="Positif" count={result.distribusi.Positif} total={result.total_analyzed} color="#22c55e" />
                <SentBar label="Netral"  count={result.distribusi.Netral}  total={result.total_analyzed} color="#3b82f6" />
                <SentBar label="Negatif" count={result.distribusi.Negatif} total={result.total_analyzed} color="#ef4444" />
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Dianalisis', val: result.total_analyzed.toLocaleString(),      color: '#f9f9f9', top: '#76b900' },
              { label: 'Positif',          val: result.distribusi.Positif.toLocaleString(),  color: '#22c55e', top: '#22c55e' },
              { label: 'Netral',           val: result.distribusi.Netral.toLocaleString(),   color: '#3b82f6', top: '#3b82f6' },
              { label: 'Negatif',          val: result.distribusi.Negatif.toLocaleString(),  color: '#ef4444', top: '#ef4444' },
            ].map(({ label, val, color, top }) => (
              <div key={label} style={{
                padding: '14px 16px', background: '#0d0d0d',
                border: '1px solid #2a2a2a', borderTop: `2px solid ${top}`, borderRadius: 2,
              }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Comment table */}
          <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 2, padding: 20 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#76b900', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                Daftar Komentar
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={searchCmt}
                  onChange={e => { setSearchCmt(e.target.value); setPage(1) }}
                  placeholder="Cari komentar..."
                  style={{
                    padding: '7px 12px', background: '#000000',
                    border: '1px solid #2a2a2a', borderRadius: 2, color: '#f9f9f9',
                    fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, outline: 'none', width: 160,
                  }}
                  onFocus={e => e.target.style.borderColor = '#76b900'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                <div style={{ display: 'flex', border: '1px solid #2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                  {['Semua', 'Positif', 'Netral', 'Negatif'].map(f => (
                    <button key={f} onClick={() => { setFilterLabel(f); setPage(1) }} style={{
                      padding: '7px 12px',
                      background: filterLabel === f ? '#76b900' : '#000000',
                      color: filterLabel === f ? '#000' : 'rgba(249,249,249,.70)',
                      border: 'none', borderRight: f !== 'Negatif' ? '1px solid #2a2a2a' : 'none',
                      cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                      fontWeight: filterLabel === f ? 700 : 400, transition: 'all .15s',
                    }}>{f}</button>
                  ))}
                </div>
                <button
                  onClick={() => exportCSV(filteredComments, result.video_info.title)}
                  style={{
                    padding: '7px 14px', background: 'transparent',
                    border: '1px solid #5e5e5e', borderRadius: 2,
                    color: 'rgba(249,249,249,.70)', cursor: 'pointer',
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 11, transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = '#76b900'; e.target.style.color = '#76b900' }}
                  onMouseLeave={e => { e.target.style.borderColor = '#5e5e5e'; e.target.style.color = 'rgba(249,249,249,.70)' }}
                >
                  ↓ Export CSV
                </button>
              </div>
            </div>

            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#757575', marginBottom: 12 }}>
              Menampilkan <strong style={{ color: '#76b900' }}>{filteredComments.length}</strong> dari {result.total_analyzed} komentar
              {(filterLabel !== 'Semua' || searchCmt) && ' (difilter)'}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #5e5e5e' }}>
                    {['#', 'Author', 'Komentar', 'Label', 'Confidence'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                        color: '#757575', textTransform: 'uppercase', letterSpacing: '.08em',
                        fontWeight: 600, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedComments.map((c, i) => {
                    const cfg = LABEL_CFG[c.label] || LABEL_CFG.Netral
                    return (
                      <tr
                        key={c.comment_id}
                        style={{ borderBottom: '1px solid #2a2a2a', transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#757575', whiteSpace: 'nowrap' }}>
                          {(page - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(249,249,249,.70)', whiteSpace: 'nowrap', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.author}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#f9f9f9', lineHeight: 1.5, maxWidth: 400 }}>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {c.text}
                          </div>
                          {c.like_count > 0 && (
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#757575', marginTop: 3 }}>
                              👍 {c.like_count}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', background: cfg.bg,
                            border: `1px solid ${cfg.border}`, borderRadius: 2,
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                            color: cfg.color, fontWeight: 700,
                          }}>
                            {cfg.icon} {c.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {Object.entries(c.confidence)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 2)
                              .map(([lbl, pct]) => (
                                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <div style={{ width: 40, height: 4, background: '#2a2a2a', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: LABEL_CFG[lbl]?.color || '#757575' }} />
                                  </div>
                                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: LABEL_CFG[lbl]?.color || '#757575' }}>
                                    {lbl} {pct.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '6px 14px', background: '#000000',
                    border: '1px solid #2a2a2a', borderRadius: 2,
                    color: page === 1 ? '#757575' : 'rgba(249,249,249,.70)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                  }}
                >← Prev</button>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#757575' }}>
                  <strong style={{ color: '#76b900' }}>{page}</strong> / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '6px 14px', background: '#000000',
                    border: '1px solid #2a2a2a', borderRadius: 2,
                    color: page === totalPages ? '#757575' : 'rgba(249,249,249,.70)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                  }}
                >Next →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
