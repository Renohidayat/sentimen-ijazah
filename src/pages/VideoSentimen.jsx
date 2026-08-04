import React, { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getVideos } from '../api'

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

const TC = { Pro: D.pos, Netral: D.net, Kontra: D.neg }
const BADGE_BG = { Pro: D.pos, Netral: D.net, Kontra: D.neg }

const SORT_OPTIONS = [
  { val: 'default',  label: 'Urutkan: Default'    },
  { val: 'neg_desc', label: 'Negatif Terbanyak'   },
  { val: 'pos_desc', label: 'Positif Terbanyak'   },
  { val: 'total',    label: 'Total Terbanyak'      },
]

function sortVideos(videos, sort) {
  const v = [...videos]
  if (sort === 'neg_desc') return v.sort((a, b) => b.Negatif - a.Negatif)
  if (sort === 'pos_desc') return v.sort((a, b) => b.Positif - a.Positif)
  if (sort === 'total')    return v.sort((a, b) => (b.Negatif+b.Positif+b.Netral) - (a.Negatif+a.Positif+a.Netral))
  return v
}

function dominant(v) {
  if (v.Negatif >= v.Positif && v.Negatif >= v.Netral) return { label: 'Kontra', color: D.neg }
  if (v.Positif >= v.Negatif && v.Positif >= v.Netral) return { label: 'Pro',    color: D.pos }
  return { label: 'Netral', color: D.net }
}

const thumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

/* ── Video Card ─────────────────────────────────────────────────────────── */
function VideoCard({ v, onClick }) {
  const total  = v.Negatif + v.Positif + v.Netral
  const negPct = +((v.Negatif / total) * 100).toFixed(1)
  const posPct = +((v.Positif / total) * 100).toFixed(1)
  const netPct = +((v.Netral  / total) * 100).toFixed(1)
  const dom    = dominant(v)
  const [imgErr, setImgErr] = useState(false)
  const [hovered, setHovered] = useState(false)

  const fmtK = (n) => n >= 1000 ? (n/1000).toFixed(1)+'k' : n

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: D.bg2,
        border: `1px solid ${hovered ? D.accent : D.border}`,
        borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color .2s',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: D.bg3, overflow: 'hidden' }}>
        {!imgErr ? (
          <img
            src={thumb(v.video_id)}
            alt={v.judul}
            onError={() => setImgErr(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: hovered ? 0.8 : 0.6,
              transition: 'opacity .2s',
            }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 36, color: D.text3 }}>
            🎬
          </div>
        )}

        {/* Play overlay */}
        {hovered && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.5)' }}>
            <div style={{ fontSize: 48, color: D.accent }}>▶</div>
          </div>
        )}

        {/* Badge tipe — solid color like screenshot */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: BADGE_BG[v.tipe] || D.accent,
          color: '#fff',
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10, fontWeight: 700,
          padding: '3px 8px', borderRadius: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {v.tipe === 'Pro' ? 'PRO' : v.tipe === 'Kontra' ? 'KONTRA' : 'NETRAL'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Channel */}
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 11, color: D.text3,
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {v.channel}
        </p>

        {/* Judul */}
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: D.text, lineHeight: 1.5,
          margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {v.judul}
        </h3>

        {/* Sentiment distribution */}
        <div style={{ marginTop: 4 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10, color: D.text3, marginBottom: 5,
          }}>
            <span>Sentiment Distribution</span>
            <span>{fmtK(total)} Comments</span>
          </div>

          {/* Bar */}
          <div style={{ height: 6, background: D.border, borderRadius: 0, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${posPct}%`, background: D.pos, transition: 'width .4s' }} />
            <div style={{ width: `${netPct}%`, background: D.net, transition: 'width .4s' }} />
            <div style={{ width: `${negPct}%`, background: D.neg, transition: 'width .4s' }} />
          </div>

          {/* Legend dots */}
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {[
              { color: D.pos, pct: posPct },
              { color: D.net, pct: netPct },
              { color: D.neg, pct: negPct },
            ].map(({ color, pct }) => (
              <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: D.text3 }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
function VideoModal({ v, onClose }) {
  if (!v) return null
  const total  = v.Negatif + v.Positif + v.Netral
  const negPct = +((v.Negatif / total) * 100).toFixed(1)
  const posPct = +((v.Positif / total) * 100).toFixed(1)
  const netPct = +((v.Netral  / total) * 100).toFixed(1)
  const dom    = dominant(v)
  const [imgErr, setImgErr] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.9)', backdropFilter:'blur(8px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 301,
        transform: 'translate(-50%,-50%)',
        width: 'min(860px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
        background: D.bg2,
        border: `1px solid ${D.border2}`,
        borderRadius: 2,
        fontFamily: "'Hanken Grotesk','Plus Jakarta Sans',sans-serif",
      }}>
        {/* Modal header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:`1px solid ${D.border}`, background: D.bg3 }}>
          <span style={{
            background: D.accent, color: '#000',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 2,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>ANALYSIS REPORT</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color: D.text3, cursor:'pointer', fontSize:22, lineHeight:1 }}>×</button>
        </div>

        {/* Modal body — 2 cols on desktop */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>

          {/* Left: thumbnail + info */}
          <div>
            <div style={{ aspectRatio:'16/9', background: D.bg3, borderRadius:2, overflow:'hidden', border:`1px solid ${D.border}`, marginBottom:14 }}>
              {!imgErr ? (
                <img src={thumb(v.video_id)} alt={v.judul} onError={() => setImgErr(true)}
                  style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.8 }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>🎬</div>
              )}
            </div>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: D.accent, margin:'0 0 6px' }}>{v.channel}</p>
            <h2 style={{ fontSize:18, fontWeight:800, color: D.text, margin:'0 0 14px', lineHeight:1.4 }}>{v.judul}</h2>

            {/* Interpretation block */}
            <div style={{ padding:'12px 16px', background: D.bg3, borderLeft:`3px solid ${D.accent}`, borderRadius:2 }}>
              <p style={{ fontWeight:700, fontSize:13, color: D.text, margin:'0 0 6px' }}>Interpretation Summary</p>
              <p style={{ fontSize:13, color: D.text2, lineHeight:1.7, margin:0 }}>
                {dom.label === 'Pro'
                  ? 'Video ini mendapatkan respon mayoritas positif dari penonton, dengan sentimen pendukung ijazah yang kuat.'
                  : dom.label === 'Kontra'
                  ? 'Konten ini memicu reaksi negatif signifikan, mayoritas komentar menyatakan keraguan atau kritik tajam.'
                  : 'Respon penonton cenderung terbagi atau mendiskusikan fakta secara objektif tanpa kecenderungan emosional yang ekstrem.'
                }
              </p>
            </div>
          </div>

          {/* Right: stats */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color: D.text3, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Data Metrics</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Total Comments', val: (total).toLocaleString(), color: D.text },
                { label:'Netral',         val: v.Netral.toLocaleString(), color: D.net },
                { label:'Positif',        val: v.Positif.toLocaleString(), color: D.pos, topBorder: D.pos },
                { label:'Negatif',        val: v.Negatif.toLocaleString(), color: D.neg, topBorder: D.neg },
              ].map(({ label, val, color, topBorder }) => (
                <div key={label} style={{
                  padding:'12px 14px', background: D.bg3,
                  border:`1px solid ${D.border}`,
                  borderTop: topBorder ? `2px solid ${topBorder}` : `1px solid ${D.border}`,
                  borderRadius:2,
                }}>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color: D.text3, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>{label}</p>
                  <p style={{ fontSize:22, fontWeight:800, color, margin:0 }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Sentiment bar */}
            <div>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color: D.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Sentiment Distribution</p>
              <div style={{ height:10, display:'flex', overflow:'hidden', borderRadius:2, marginBottom:8 }}>
                <div style={{ width:`${posPct}%`, background: D.pos, transition:'width .5s' }} />
                <div style={{ width:`${netPct}%`, background: D.net, transition:'width .5s' }} />
                <div style={{ width:`${negPct}%`, background: D.neg, transition:'width .5s' }} />
              </div>
              <div style={{ display:'flex', gap:16 }}>
                {[['Positif', D.pos, posPct], ['Netral', D.net, netPct], ['Negatif', D.neg, negPct]].map(([label, color, pct]) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: D.text2, fontWeight:700 }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => window.open(`https://youtube.com/watch?v=${v.video_id}`, '_blank')}
              className="btn btn-primary"
              style={{ marginTop:'auto', width:'100%', justifyContent:'center', gap:8 }}
            >
              ▶ BUKA VIDEO DI YOUTUBE
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function VideoSentimen() {
  const [videos,   setVideos]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('Semua')
  const [sort,     setSort]     = useState('default')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [view,     setView]     = useState('grid')

  useEffect(() => {
    getVideos().then(r => setVideos(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let v = filter === 'Semua' ? videos : videos.filter(v => v.tipe === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      v = v.filter(v => v.judul.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q))
    }
    return sortVideos(v, sort)
  }, [videos, filter, sort, search])

  const chartData = filtered.map(v => ({ name: v.channel, Negatif: v.Negatif, Positif: v.Positif, Netral: v.Netral }))

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12 }}>
      <div className="spinner" /><span style={{ color: D.text3, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>MEMUAT DATA...</span>
    </div>
  )

  return (
    <div className="fade-up" style={{ fontFamily:"'Hanken Grotesk','Plus Jakarta Sans',sans-serif" }}>

      {/* ── Hero header — gaya Metodologi ── */}
      <div style={{ borderLeft:`2px solid ${D.accent}`, paddingLeft:20, marginBottom:36 }}>
        <div style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:11,
          color: D.accent2, textTransform:'uppercase',
          letterSpacing:'0.2em', marginBottom:8,
        }}>
          Analytics Engine V2.0
        </div>
        <h1 style={{
          fontSize:'clamp(22px,4vw,34px)', fontWeight:800,
          lineHeight:1.15, margin:'0 0 10px', color: D.text,
        }}>
          Sentimen Per Video YouTube
        </h1>
        <p style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:12,
          color: D.text3, margin:0, lineHeight:1.7,
        }}>
          Distribusi sentimen dari 11 video · 3 kategori: Pro, Netral, Kontra
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: D.bg2,
        border: `1px solid ${D.border}`,
        borderRadius: 2,
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1', minWidth:180 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color: D.text3, fontSize:13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul video atau channel..."
            style={{
              width:'100%', boxSizing:'border-box',
              padding:'8px 32px 8px 30px',
              background: D.bg,
              border: `1px solid ${D.border}`,
              borderRadius:2, color: D.text,
              fontFamily:"'Hanken Grotesk',sans-serif",
              fontSize:13, outline:'none',
              transition:'border-color .15s',
            }}
            onFocus={e => e.target.style.borderColor = D.accent}
            onBlur={e => e.target.style.borderColor = D.border}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color: D.text3, cursor:'pointer', fontSize:16 }}>×</button>
          )}
        </div>

        {/* Filter buttons */}
        <div style={{ display:'flex', border:`1px solid ${D.border}`, borderRadius:2, overflow:'hidden' }}>
          {['Semua','Pro','Netral','Kontra'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'7px 14px',
              background: filter === f ? D.accent : D.bg,
              color: filter === f ? '#000' : D.text2,
              border:'none',
              borderRight: f !== 'Kontra' ? `1px solid ${D.border}` : 'none',
              cursor:'pointer',
              fontFamily:"'Hanken Grotesk',sans-serif",
              fontWeight: filter === f ? 700 : 500,
              fontSize:13, transition:'all .15s',
            }}>{f}</button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            padding:'7px 12px',
            background: D.bg,
            border: `1px solid ${D.border}`,
            borderRadius:2, color: D.text,
            fontFamily:"'Hanken Grotesk',sans-serif",
            fontSize:13, cursor:'pointer', outline:'none',
          }}
        >
          {SORT_OPTIONS.map(o => <option key={o.val} value={o.val} style={{ background: D.bg }}>{o.label}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ display:'flex', border:`1px solid ${D.border}`, borderRadius:2, overflow:'hidden' }}>
          {[['grid','⊞'],['chart','▦']].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:'7px 12px',
              background: view === v ? D.bg3 : D.bg,
              color: view === v ? D.text : D.text3,
              border:'none',
              borderRight: v === 'grid' ? `1px solid ${D.border}` : 'none',
              cursor:'pointer', fontSize:16, transition:'all .15s',
            }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Search result count */}
      {(search || filter !== 'Semua') && (
        <div style={{ marginBottom:14, fontSize:12, color: D.text3, fontFamily:"'JetBrains Mono',monospace" }}>
          Menampilkan <strong style={{ color: D.accent }}>{filtered.length}</strong> dari {videos.length} video
          {search && <> · "<strong style={{ color: D.text }}>{search}</strong>"</>}
        </div>
      )}

      {/* ── Chart view ── */}
      {view === 'chart' && (
        <div className="card" style={{ marginBottom:24, background: D.bg2, border:`1px solid ${D.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ fontWeight:800, fontSize:16, color: D.text }}>Sentiment Comparison Overview</div>
            <div style={{ display:'flex', gap:14 }}>
              {[['Positif', D.pos],['Netral', D.net],['Negatif', D.neg]].map(([label, color]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, background:color }} />
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: D.text3 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top:4, right:16, left:-10, bottom:60 }}>
              <XAxis dataKey="name" tick={{ fill: D.text3, fontSize:11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: D.text3, fontSize:11 }} />
              <Tooltip contentStyle={{ background: D.bg3, border:`1px solid ${D.border2}`, borderRadius:2, fontSize:13 }} />
              <Legend wrapperStyle={{ paddingTop:16, fontSize:13 }} />
              <Bar dataKey="Positif" fill={D.pos} radius={[2,2,0,0]} />
              <Bar dataKey="Netral"  fill={D.net} radius={[2,2,0,0]} />
              <Bar dataKey="Negatif" fill={D.neg} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Grid view ── */}
      {view === 'grid' && (
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'48px 24px', color: D.text3 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontWeight:700 }}>Tidak ada video ditemukan</div>
            <div style={{ fontSize:13, marginTop:6 }}>Coba ubah kata kunci atau filter</div>
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))',
            gap:16,
          }}>
            {filtered.map(v => (
              <VideoCard key={v.video_id} v={v} onClick={() => setSelected(v)} />
            ))}
          </div>
        )
      )}

      {/* ── Modal ── */}
      <VideoModal v={selected} onClose={() => setSelected(null)} />
    </div>
  )
}