import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard     from './pages/Dashboard'
import Predict       from './pages/Predict'
import VideoSentimen from './pages/VideoSentimen'
import AnalisisVideo from './pages/AnalisisVideo'
import Evaluasi      from './pages/Evaluasi'
import Terdahulu     from './pages/Terdahulu'
import Metodologi    from './pages/Metodologi'
import Tentang       from './pages/Tentang'

const NAV = [
  { to: '/',              label: 'Overview'       },
  { to: '/metodologi',    label: 'Metodologi'     },
  { to: '/predict',       label: 'Prediksi'       },
  { to: '/analisis-video',label: 'Analisis Video' },
  { to: '/video',         label: 'Per Video'      },
  { to: '/evaluasi',      label: 'Evaluasi'       },
  { to: '/terdahulu',     label: 'Terdahulu'      },
  { to: '/tentang',       label: 'Tentang'        },
]

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) return (
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'60vh', gap:16, padding:'40px 24px', textAlign:'center',
      }}>
        <div style={{fontSize:40,color:'#ef4444',fontFamily:'var(--mono)',fontWeight:700}}>ERR</div>
        <div style={{fontWeight:800,fontSize:20,color:'#ef4444',textTransform:'uppercase',letterSpacing:'.05em'}}>Terjadi Kesalahan</div>
        <div style={{color:'var(--text3)',fontSize:13,maxWidth:480,fontFamily:'var(--mono)'}}>{this.state.error.message}</div>
        <button className="btn btn-primary" onClick={() => { this.setState({error:null}); window.location.reload() }}>
          MUAT ULANG
        </button>
      </div>
    )
    return this.props.children
  }
}

/* ── 404 ── */
function NotFound() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:16,textAlign:'center'}}>
      <div style={{fontFamily:'var(--mono)',fontSize:64,fontWeight:800,color:'var(--accent)',lineHeight:1}}>404</div>
      <div style={{fontWeight:800,fontSize:20,textTransform:'uppercase',letterSpacing:'.08em'}}>Halaman Tidak Ditemukan</div>
      <div style={{color:'var(--text3)',fontSize:13,fontFamily:'var(--mono)'}}>The requested resource does not exist.</div>
      <NavLink to="/" style={{marginTop:8}} className="btn btn-primary">← KEMBALI KE OVERVIEW</NavLink>
    </div>
  )
}



/* ── Mobile Drawer ── */
function MobileNav({ open, onClose }) {
  const location = useLocation()
  useEffect(() => { onClose() }, [location.pathname])
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:199,background:'rgba(0,0,0,.8)',backdropFilter:'blur(4px)'}}/>
      <div style={{
        position:'fixed',top:0,right:0,bottom:0,zIndex:200,
        width:240,background:'#0d0d0d',
        borderLeft:'1px solid #5e5e5e',
        display:'flex',flexDirection:'column',padding:'24px 0',
        animation:'slideIn .2s ease',
      }}>
        {/* Green top bar */}
        <div style={{height:3,background:'var(--accent)',marginBottom:24}}/>
        <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:11,color:'var(--text3)',letterSpacing:'.1em',textTransform:'uppercase',padding:'0 20px',marginBottom:16}}>
          Navigation
        </div>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to==='/'} style={({ isActive }) => ({
            padding:'12px 20px', fontSize:14, fontWeight:isActive?700:500,
            textDecoration:'none', transition:'all .15s',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            background: isActive ? 'rgba(118,185,0,.08)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            fontFamily:'var(--font)',
          })}>
            {n.label}
          </NavLink>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:none}}`}</style>
    </>
  )
}

/* ── App ── */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--bg)'}}>

      {/* NAVBAR — NVIDIA style: full black, green underline active */}
      <nav style={{
        position:'sticky',top:0,zIndex:100,
        background:'#000000',
        borderBottom:'1px solid #5e5e5e',
        padding:'0 24px',
      }}>
        <div style={{
          maxWidth:1280,margin:'0 auto',
          display:'flex',alignItems:'center',justifyContent:'space-between',height:60,
        }}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              width:28,height:28,background:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:14,fontWeight:800,color:'#000',flexShrink:0,
            }}>⚖</div>
            <div>
              <div style={{fontWeight:800,fontSize:14,letterSpacing:'-.2px',color:'#fff'}}>SentimenIjazah</div>
              <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',letterSpacing:'.04em'}}>
  SVM-RBF · TF-IDF Bigram · GridSearchCV
</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{display:'flex',gap:0}}>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to==='/'} style={({ isActive }) => ({
                padding:'0 14px',height:60,display:'flex',alignItems:'center',
                fontSize:13,fontWeight:600,
                textDecoration:'none',transition:'all .15s',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
              })}>
                {n.label}
              </NavLink>
            ))}
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(o=>!o)} style={{
            display:'none',background:'transparent',border:'1px solid #5e5e5e',
            color:'var(--text2)',cursor:'pointer',fontSize:18,padding:'4px 8px',
            borderRadius:2,
          }}>☰</button>
        </div>
      </nav>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)}/>


      {/* CONTENT */}
      <main style={{flex:1,padding:'32px 24px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <ErrorBoundary>
            <Routes>
              <Route path="/"               element={<Dashboard />}     />
              <Route path="/metodologi"     element={<Metodologi />}    />
              <Route path="/predict"        element={<Predict />}       />
              <Route path="/analisis-video" element={<AnalisisVideo />} />
              <Route path="/video"          element={<VideoSentimen />} />
              <Route path="/evaluasi"       element={<Evaluasi />}      />
              <Route path="/terdahulu"      element={<Terdahulu />}     />
              <Route path="/tentang"        element={<Tentang />}       />
              <Route path="*"               element={<NotFound />}      />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>

      {/* FOOTER — NVIDIA dark footer */}
      <footer style={{
        background:'#000000',
        borderTop:'1px solid #5e5e5e',
        padding:'24px',
      }}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontWeight:800,fontSize:13,color:'var(--accent)',fontFamily:'var(--mono)',letterSpacing:'.04em'}}>
  PENILAIAN SENTIMEN IJAZAH RESEARCH
</div>
            <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',marginTop:3}}>
              Precision Analytics Framework v1.0.0-STABLE
            </div>
          </div>
          <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',textAlign:'right'}}>
            <div>M. Reno Hidayat · 220660121005</div>
            <div style={{marginTop:2}}>
  Universitas Sebelas April Sumedang · <span style={{color:'var(--accent)'}}>SVM-RBF + TF-IDF Bigram + GridSearchCV</span>
</div>
          </div>
        </div>
      </footer>

      <style>{`
        @media(max-width:900px){
          .desktop-nav{display:none !important}
          .hamburger{display:block !important}
        }
      `}</style>
    </div>
  )
}