import React,{useEffect,useState} from 'react'
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer,Legend} from 'recharts'
import {getStats} from '../api'

const COLORS={Negatif:'#ef4444',Positif:'#22c55e',Netral:'#3b82f6'}

const CustomTooltip=({active,payload})=>{
  if(!active||!payload?.length) return null
  const d=payload[0]
  return(
    <div style={{background:'#0d0d0d',border:'1px solid #5e5e5e',borderRadius:2,padding:'10px 16px'}}>
      <div style={{fontWeight:700,marginBottom:4,fontFamily:'var(--mono)',fontSize:12,textTransform:'uppercase',letterSpacing:'.06em'}}>{d.name}</div>
      <div style={{fontSize:24,fontWeight:800,color:COLORS[d.name]}}>{d.value.toLocaleString()}</div>
      <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>{d.payload.pct}% dari total</div>
    </div>
  )
}

export default function Dashboard(){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getStats().then(r=>setData(r.data)).finally(()=>setLoading(false))},[])

  if(loading) return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,gap:12}}>
      <div className="spinner"/><span style={{color:'var(--text3)',fontFamily:'var(--mono)',fontSize:12}}>LOADING DATA...</span>
    </div>
  )

  const pie=[
    {name:'Negatif',value:data.distribusi_label.Negatif,pct:data.distribusi_persen.Negatif},
    {name:'Positif',value:data.distribusi_label.Positif,pct:data.distribusi_persen.Positif},
    {name:'Netral', value:data.distribusi_label.Netral, pct:data.distribusi_persen.Netral},
  ]

  return(
    <div className="fade-up">
{/* Hero */}
<div style={{marginBottom:32}}>
  <div style={{
    display:'inline-flex',alignItems:'center',gap:8,
    border:'1px solid var(--accent)',
    borderRadius:2,padding:'4px 12px',fontSize:11,color:'var(--accent)',
    fontWeight:700,marginBottom:16,fontFamily:'var(--mono)',letterSpacing:'.06em',
  }}>
    PENILAIAN SENTIMEN · SKRIPSI 2025-2026
  </div>
  <h1 style={{fontSize:36,fontWeight:800,letterSpacing:'-.5px',lineHeight:1.15,marginBottom:10}}>
    Penilaian Sentimen:<br/>
    <span style={{color:'var(--accent)'}}>Isu Ijazah Joko Widodo</span>
  </h1>
  <p style={{color:'var(--text3)',fontSize:14,maxWidth:560,lineHeight:1.7,fontFamily:'var(--mono)'}}>
    Penilaian komputasional 2.561 komentar YouTube dari 11 video menggunakan<br/>
    Support Vector Machine (SVM-RBF) + TF-IDF Bigram + GridSearchCV. Fleiss κ = 0.8635
  </p>
</div>

      {/* Metric cards */}
      <div className="grid-4" style={{marginBottom:28}}>
        {[
          {label:'TOTAL KOMENTAR', val:'2.561', sub:'Dataset Terverifikasi', color:'var(--accent)', icon:'◈'},
          {label:'SENTIMEN NEGATIF',val:'1.711',sub:`${data.distribusi_persen.Negatif}% · Mayoritas`,color:'var(--neg)',icon:'▼'},
          {label:'SENTIMEN POSITIF',val:'576',  sub:`${data.distribusi_persen.Positif}% · Minoritas`,color:'var(--pos)',icon:'▲'},
          {label:'SENTIMEN NETRAL', val:'274',  sub:`${data.distribusi_persen.Netral}% · Faktual`,  color:'var(--net)',icon:'◆'},
        ].map(m=>(
          <div key={m.label} className="metric-card nvidia-corner" style={{borderTop:`3px solid ${m.color}`}}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-val" style={{color:m.color}}>{m.val}</div>
            <div className="metric-sub" style={{color:m.color,opacity:.7}}>{m.icon} {m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:28}}>
        {/* Pie chart */}
        <div className="card">
          <div style={{fontWeight:800,fontSize:16,marginBottom:2}}>Distribusi Sentimen Final</div>
          <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:20}}>2.561 komentar · InSet Lexicon + Uji Pakar</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={2} dataKey="value">
                {pie.map(e=><Cell key={e.name} fill={COLORS[e.name]}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend formatter={v=><span style={{color:'var(--text2)',fontSize:13,fontFamily:'var(--mono)',fontWeight:600}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Info penelitian */}
        <div className="card">
          <div style={{fontWeight:800,fontSize:16,marginBottom:2}}>Info Penelitian</div>
          <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:20}}>Detail metodologi dan model</div>
          {[
            ['Peneliti',   'M. Reno Hidayat · 220660121005'],
            ['Institusi',  'Universitas Sebelas April Sumedang'],
            ['Metode',     'SVM-RBF Kernel + GridSearchCV 5-fold'],
            ['Fitur',      'TF-IDF Bigram · 8.000 fitur'],
            ['Akurasi',    '75.24% · F1-Score: 73.46%'],
            ['Dataset',    '11 video · 8 channel berita'],
            ['Label',      'InSet Lexicon + Uji Pakar (3 anotator)'],
            ["Fleiss' κ",  '0.8635 — Hampir Sempurna'],
          ].map(([k,v])=>(
            <div key={k} style={{display:'flex',gap:12,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{minWidth:110,color:'var(--text3)',fontSize:12,fontWeight:600,fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'.04em'}}>{k}</span>
              <span style={{fontSize:13,color:'var(--text2)'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reliabilitas — NVIDIA dark strip */}
      <div style={{
        background:'#000',border:'1px solid #5e5e5e',borderRadius:2,
        padding:'28px 32px',position:'relative',overflow:'hidden',
      }}>
        {/* Green right border — NVIDIA corner accent */}
        <div style={{position:'absolute',top:0,right:0,width:3,height:'100%',background:'var(--accent)'}}/>

        <div style={{fontWeight:800,fontSize:18,color:'var(--accent)',marginBottom:4,letterSpacing:'-.2px'}}>
          Reliabilitas Anotator
        </div>
        <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:24}}>
          50 sampel stratified · Percentage Agreement ≥ 90%
        </div>

        <div className="grid-3" style={{marginBottom:20}}>
          {[
            {label:"FLEISS' KAPPA (κ)",val:'0.8635',badge:'SANGAT KUAT',color:'var(--accent)'},
            {label:'PERCENTAGE AGREEMENT',val:'92.0%',badge:'OPTIMAL',color:'var(--pos)'},
            {label:"COHEN'S κ RATA-RATA",val:'0.8631',badge:'HAMPIR SEMPURNA',color:'var(--net)'},
          ].map(m=>(
            <div key={m.label}>
              <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:36,fontWeight:800,color:m.color,letterSpacing:'-1px',lineHeight:1,marginBottom:8}}>{m.val}</div>
              <span style={{
                background:`${m.color}22`,border:`1px solid ${m.color}`,
                borderRadius:2,padding:'2px 8px',
                fontSize:10,fontWeight:700,color:m.color,
                fontFamily:'var(--mono)',letterSpacing:'.06em',
              }}>{m.badge}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[['A1 & A2','96%','0.9326'],['A1 & A3','92%','0.8632'],['A2 & A3','88%','0.7935']].map(([pair,pa,ck])=>(
            <div key={pair} style={{background:'rgba(255,255,255,.04)',borderRadius:2,padding:'12px 16px',border:'1px solid #5e5e5e',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:700,fontSize:13,fontFamily:'var(--mono)',color:'var(--text2)'}}>{pair}</span>
              <div style={{textAlign:'right'}}>
                <div style={{color:'var(--pos)',fontWeight:700,fontFamily:'var(--mono)',fontSize:13}}>PA {pa}</div>
                <div style={{color:'var(--accent)',fontSize:11,fontFamily:'var(--mono)'}}>κ {ck}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}