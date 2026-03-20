import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../hooks/useAuth";
import useProgressStore from "../store/useProgressStore";
import PixelTransition from "../components/PixelTransition";

/* ── Mini bar chart ──────────────────────────────────────────── */
function BarChart({ data, color }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"4px", height:"60px" }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
          <div style={{ width:"100%", backgroundColor:color, borderRadius:"3px 3px 0 0", height:`${Math.round((d.value/max)*52)+4}px`, transition:"height 0.5s ease-out", animationDelay:`${i*0.05}s`, minHeight:"4px" }}/>
          <span style={{ fontFamily:"Nunito,sans-serif", color:"#4B5563", fontSize:"9px", whiteSpace:"nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Radial progress ring ────────────────────────────────────── */
function RingProgress({ pct, size=100, stroke=10, color="#FFC107", label, value }) {
  const r   = (size - stroke) / 2;
  const circ= 2 * Math.PI * r;
  const off = circ - (pct/100) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1F2937" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div style={{ marginTop:"-70px", textAlign:"center", pointerEvents:"none" }}>
        <p style={{ fontFamily:"'Press Start 2P',monospace", color, fontSize:"14px" }}>{value}</p>
        <p style={{ fontFamily:"Nunito,sans-serif", color:"#6B7280", fontSize:"10px", marginTop:"2px" }}>{label}</p>
      </div>
      <div style={{ height:"32px" }}/>
    </div>
  );
}

/* ── Stat tile ───────────────────────────────────────────────── */
function StatTile({ icon, value, label, color, sub }) {
  return (
    <div style={{ backgroundColor:"#111827", border:`3px solid ${color}25`, borderRadius:"16px", padding:"16px", textAlign:"center" }}>
      <div style={{ fontSize:"24px", marginBottom:"6px" }}>{icon}</div>
      <p style={{ fontFamily:"'Press Start 2P',monospace", color, fontSize:"13px", marginBottom:"4px" }}>{value}</p>
      <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#6B7280", fontSize:"11px" }}>{label}</p>
      {sub && <p style={{ fontFamily:"Nunito,sans-serif", color:`${color}70`, fontSize:"10px", marginTop:"2px" }}>{sub}</p>}
    </div>
  );
}

/* ── Leaderboard row ─────────────────────────────────────────── */
function LeaderRow({ rank, name, xp, chapters, isMe }) {
  const rankIcon = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":`#${rank}`;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", backgroundColor:isMe?"#4C1D9520":"#111827", border:`2px solid ${isMe?"#FFC107":"#2D3748"}`, borderRadius:"12px" }}>
      <span style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"10px", flexShrink:0, minWidth:"28px" }}>{rankIcon}</span>
      <span style={{ fontFamily:"Nunito,sans-serif", fontWeight:800, color:isMe?"#F9FAFB":"#9CA3AF", fontSize:"13px", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}{isMe?" (you)":""}</span>
      <span style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"8px", flexShrink:0 }}>{xp.toLocaleString()} XP</span>
    </div>
  );
}

export default function ProgressScreen() {
  const navigate = useNavigate();
  const { xp, hearts, streak, completedTopics } = useProgressStore();

  const [leaderboard, setLeaderboard] = useState([]);
  const [userId,      setUserId]      = useState(null);
  const [weekData,    setWeekData]    = useState([]);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));

    // Load leaderboard
    supabase.from("leaderboard").select("*").limit(10).then(({ data }) => {
      if (data) setLeaderboard(data);
    });

    // Build weekly XP chart (mock from local data for now)
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    setWeekData(days.map((d,i) => ({ label:d, value:Math.round(Math.random()*80+10) })));
  }, []);

  const totalChapters  = completedTopics.length;
  const xpToNextLevel  = 1000 - (xp % 1000);
  const currentLevel   = Math.floor(xp / 1000) + 1;
  const levelPct       = Math.round(((xp % 1000) / 1000) * 100);

  return (
    <PixelTransition id="progress">
      <main style={{ maxWidth:"640px", margin:"0 auto", padding:"16px 14px 100px", width:"100%", boxSizing:"border-box" }}>

        {/* Back */}
        <button onClick={()=>navigate("/")} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"16px",padding:0 }}>
          ← BACK
        </button>

        <h1 style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"clamp(12px,3vw,16px)", marginBottom:"20px" }}>YOUR PROGRESS</h1>

        {/* Level + XP ring */}
        <div style={{ backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", padding:"24px", marginBottom:"16px", boxShadow:"0 5px 0 0 #0a0e1a", display:"flex", alignItems:"center", gap:"20px" }}>
          <RingProgress pct={levelPct} color="#FFC107" label="to next level" value={`Lv.${currentLevel}`}/>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"10px", marginBottom:"6px" }}>LEVEL {currentLevel}</p>
            <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#9CA3AF", fontSize:"13px", marginBottom:"4px" }}>{xp.toLocaleString()} total XP</p>
            <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#6B7280", fontSize:"12px" }}>{xpToNextLevel} XP to Level {currentLevel+1}</p>
            {/* XP bar */}
            <div style={{ backgroundColor:"#1F2937", borderRadius:"9999px", height:"8px", overflow:"hidden", marginTop:"10px" }}>
              <div style={{ height:"100%", backgroundColor:"#FFC107", width:`${levelPct}%`, borderRadius:"9999px", backgroundImage:"linear-gradient(90deg,#FFC107,#FFD54F)", transition:"width 0.8s" }}/>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
          <StatTile icon="🔥" value={streak} label="Day Streak" color="#F97316" sub={streak>=7?"🏆 Week streak!":null}/>
          <StatTile icon="❤️" value={`${hearts}/5`} label="Hearts" color="#EF4444"/>
          <StatTile icon="👑" value={totalChapters} label="Chapters Done" color="#A78BFA"/>
          <StatTile icon="⚡" value={`${xp.toLocaleString()}`} label="Total XP" color="#FFC107"/>
        </div>

        {/* Weekly activity */}
        <div style={{ backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", padding:"20px", marginBottom:"16px", boxShadow:"0 5px 0 0 #0a0e1a" }}>
          <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#6D28D9", fontSize:"8px", marginBottom:"16px" }}>THIS WEEK</p>
          <BarChart data={weekData} color="#6D28D9"/>
        </div>

        {/* Subject breakdown */}
        {totalChapters > 0 && (
          <div style={{ backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", padding:"20px", marginBottom:"16px", boxShadow:"0 5px 0 0 #0a0e1a" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#22C55E", fontSize:"8px", marginBottom:"14px" }}>CHAPTERS COMPLETED</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {Object.entries(
                completedTopics.reduce((acc, k) => {
                  const subj = k.split("__")[0];
                  acc[subj] = (acc[subj]||0) + 1;
                  return acc;
                }, {})
              ).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([subj, count]) => (
                <div key={subj} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontFamily:"Nunito,sans-serif", fontWeight:800, color:"#9CA3AF", fontSize:"12px", minWidth:"120px", textTransform:"capitalize" }}>{subj.replace(/_/g," ")}</span>
                  <div style={{ flex:1, backgroundColor:"#1F2937", borderRadius:"9999px", height:"8px", overflow:"hidden" }}>
                    <div style={{ height:"100%", backgroundColor:"#22C55E", width:`${Math.min(count*10,100)}%`, borderRadius:"9999px" }}/>
                  </div>
                  <span style={{ fontFamily:"'Press Start 2P',monospace", color:"#22C55E", fontSize:"7px", flexShrink:0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div style={{ backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", padding:"20px", boxShadow:"0 5px 0 0 #0a0e1a" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"8px", marginBottom:"14px" }}>🏆 LEADERBOARD</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {leaderboard.map((row, i) => (
                <LeaderRow
                  key={row.id}
                  rank={i+1}
                  name={row.display_name ?? "Medic"}
                  xp={row.xp ?? 0}
                  chapters={row.chapters_done ?? 0}
                  isMe={row.id === userId}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </PixelTransition>
  );
}
