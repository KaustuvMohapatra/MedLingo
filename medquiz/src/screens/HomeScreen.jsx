import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import useProgressStore from "../store/useProgressStore";
import PixelTransition from "../components/PixelTransition";
import { firePixelBlast } from "../components/PixelBlast";
import { getAllSubjects, getSubjectStats } from "../api/supabaseService";
import { useAuth } from "../hooks/useAuth";

const CATALOGUE = {
  anatomy:                   { label:"Anatomy",                  icon:"🦴", color:"#EF4444", bg:"#3B0A0A", desc:"Gross, micro & neuro anatomy" },
  physiology:                { label:"Physiology",               icon:"⚡", color:"#F59E0B", bg:"#3B2500", desc:"Body systems & homeostasis" },
  pathology:                 { label:"Pathology",                icon:"🔬", color:"#8B5CF6", bg:"#1E0A3B", desc:"Disease mechanisms & slides" },
  pharmacology:              { label:"Pharmacology",             icon:"💉", color:"#10B981", bg:"#0A2A1E", desc:"Drugs, mechanisms & side effects" },
  microbiology:              { label:"Microbiology",             icon:"🦠", color:"#06B6D4", bg:"#0A1E2A", desc:"Bugs, viruses & immunology" },
  biochemistry:              { label:"Biochemistry",             icon:"🧪", color:"#F97316", bg:"#3B1500", desc:"Pathways & molecular biology" },
  genetics:                  { label:"Genetics",                 icon:"🧬", color:"#EC4899", bg:"#3B0A1E", desc:"Inheritance & genomics" },
  nutrition:                 { label:"Nutrition",                icon:"🥗", color:"#84CC16", bg:"#1A2A0A", desc:"Vitamins, minerals & dietetics" },
  psychiatry:                { label:"Psychiatry",               icon:"🧠", color:"#A855F7", bg:"#1E0A3B", desc:"Mental health & psychopharm" },
  radiology:                 { label:"Radiology",                icon:"🩻", color:"#94A3B8", bg:"#1A1A2A", desc:"X-ray, CT, MRI · image MCQs" },
  obgyn:                     { label:"OB/GYN",                   icon:"👶", color:"#F472B6", bg:"#3B0A1E", desc:"Obstetrics & gynaecology" },
  internal_medicine:         { label:"Internal Medicine",        icon:"🫀", color:"#EF4444", bg:"#3B0A0A", desc:"Cardiology, nephrology & more" },
  clinical_medicine:         { label:"Clinical Medicine",        icon:"🩺", color:"#3B82F6", bg:"#0A1A3B", desc:"Clinical reasoning & cases" },
  general_medicine:          { label:"General Medicine",         icon:"💊", color:"#6366F1", bg:"#0A0A3B", desc:"Broad clinical & preventive" },
  surgery:                   { label:"Surgery",                  icon:"🔪", color:"#DC2626", bg:"#3B0A0A", desc:"Operative & post-op care" },
  pediatrics:                { label:"Pediatrics",               icon:"🧒", color:"#FBBF24", bg:"#3B2500", desc:"Child health & development" },
  anaesthesia:               { label:"Anaesthesia",              icon:"😴", color:"#67E8F9", bg:"#0A2A2A", desc:"Anaesthetic agents & critical care" },
  forensic_medicine:         { label:"Forensic Medicine",        icon:"⚖️", color:"#9CA3AF", bg:"#1A1A1A", desc:"Legal medicine & toxicology" },
  social_preventive_medicine:{ label:"Preventive Medicine",      icon:"🏥", color:"#34D399", bg:"#0A2A1A", desc:"Epidemiology & biostatistics" },
  ophthalmology:             { label:"Ophthalmology",            icon:"👁️", color:"#60A5FA", bg:"#0A1A3B", desc:"Eye diseases & optics" },
  ent:                       { label:"ENT",                      icon:"👂", color:"#A78BFA", bg:"#1E0A3B", desc:"Ear, nose & throat" },
  dermatology:               { label:"Dermatology",              icon:"🩹", color:"#FDE68A", bg:"#3B2A00", desc:"Skin disorders & image Dx" },
  biology:                   { label:"Biology",                  icon:"🌱", color:"#22C55E", bg:"#0A2A0A", desc:"Cell biology & life sciences" },
  dental:                    { label:"Dental",                   icon:"🦷", color:"#E2E8F0", bg:"#1A1A2A", desc:"Oral medicine & surgery" },
  orthopaedics:              { label:"Orthopaedics",             icon:"🦴", color:"#FB923C", bg:"#3B1500", desc:"Fractures & musculoskeletal" },
  research_medicine:         { label:"Research & Stats",         icon:"📊", color:"#818CF8", bg:"#0A0A3B", desc:"Biostatistics & EBM" },
};
const meta = s => CATALOGUE[s?.toLowerCase()] ?? { label:(s||"").replace(/_/g," "), icon:"📚", color:"#6B7280", bg:"#1A1A1A", desc:"" };

const MASONRY_COLS = { default:2, 640:2, 480:1 };

export default function HomeScreen() {
  const navigate        = useNavigate();
  const completedTopics = useProgressStore(s => s.completedTopics);
  const xp              = useProgressStore(s => s.xp);
  const streak          = useProgressStore(s => s.streak);
  const { user }        = useAuth();

  const [subjects,     setSubjects]     = useState([]);
  const [statsMap,     setStatsMap]     = useState({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [transitionId, setTransitionId] = useState(0);

  useEffect(() => {
    getAllSubjects().then(async subs => {
      setSubjects(subs);
      setLoading(false);
      const pairs = await Promise.all(subs.map(s => getSubjectStats(s).then(st => [s,st])));
      setStatsMap(Object.fromEntries(pairs));
    });
  }, []);

  const filtered = search
    ? subjects.filter(s => meta(s).label.toLowerCase().includes(search.toLowerCase()))
    : subjects;

  const totalDone = completedTopics.length;

  return (
    <PixelTransition id={transitionId}>
      <main style={{ maxWidth:"680px", margin:"0 auto", padding:"16px 14px 100px", width:"100%", boxSizing:"border-box" }}>

        {/* Welcome banner */}
        <div style={{ background:"linear-gradient(135deg, #1a0a3b 0%, #0a1a3b 100%)", border:"3px solid #6D28D9", borderRadius:"20px", padding:"20px", marginBottom:"20px", boxShadow:"0 6px 0 0 #0a0e1a", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, right:0, width:"80px", height:"80px", background:"radial-gradient(circle, #FFC10720 0%, transparent 70%)", pointerEvents:"none" }}/>
          <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#9CA3AF", fontSize:"12px", marginBottom:"4px" }}>
            {user?.email ? `Welcome back, ${user.email.split("@")[0]}` : "Welcome, Guest"}
          </p>
          <h1 style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"clamp(12px,3.5vw,16px)", lineHeight:1.6, marginBottom:"14px" }}>MED QUEST</h1>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {[
              { icon:"⚡", val:`${xp.toLocaleString()} XP`, color:"#FFC107" },
              { icon:"🔥", val:`${streak} streak`,          color:"#F97316" },
              { icon:"👑", val:`${totalDone} chapters`,     color:"#A78BFA" },
            ].map(({ icon,val,color }) => (
              <span key={val} style={{ backgroundColor:"#0a0e1a", border:`2px solid ${color}30`, borderRadius:"9999px", padding:"5px 12px", fontFamily:"Nunito,sans-serif", fontWeight:800, fontSize:"12px", color }}>
                {icon} {val}
              </span>
            ))}
          </div>
          {/* Progress to progress screen */}
          <button onClick={()=>navigate("/progress")} style={{ marginTop:"12px", backgroundColor:"transparent", border:"2px solid #374151", borderRadius:"10px", padding:"7px 14px", cursor:"pointer", fontFamily:"'Press Start 2P',monospace", fontSize:"7px", color:"#6B7280" }}>
            VIEW STATS →
          </button>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:"16px" }}>
          <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"16px", pointerEvents:"none" }}>🔍</span>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={`Search ${subjects.length} subjects...`}
            style={{ width:"100%", backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"14px", padding:"13px 14px 13px 42px", color:"#F9FAFB", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:"14px", outline:"none", boxSizing:"border-box", boxShadow:"0 4px 0 0 #0a0e1a" }}
          />
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"10px", animation:"pulse 1s ease-in-out infinite" }}>LOADING SUBJECTS...</p>
          </div>
        )}

        {/* Masonry grid */}
        <Masonry breakpointCols={MASONRY_COLS} className="masonry-grid" columnClassName="masonry-col">
          {filtered.map((subject, i) => {
            const m     = meta(subject);
            const stats = statsMap[subject];
            const done  = completedTopics.filter(k => k.startsWith(`${subject}__`)).length;

            return (
              <div
                key={subject}
                onClick={e => {
                  firePixelBlast(e.clientX, e.clientY, "gold");
                  setTransitionId(t => t+1);
                  setTimeout(() => navigate(`/subject/${encodeURIComponent(subject)}`), 120);
                }}
                style={{
                  backgroundColor: m.bg,
                  border:`3px solid ${m.color}50`,
                  borderRadius:"18px",
                  padding:"16px",
                  cursor:"pointer",
                  boxShadow:`0 5px 0 0 #0a0e1a`,
                  marginBottom:"12px",
                  transition:"transform 0.15s, box-shadow 0.15s",
                  animation:`slide-down 0.3s ${i*0.04}s ease-out both`,
                  position:"relative",
                  overflow:"hidden",
                }}
                onMouseDown={e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}}
                onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 5px 0 0 #0a0e1a`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 5px 0 0 #0a0e1a`;}}
              >
                {/* Glow blob */}
                <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"70px", height:"70px", borderRadius:"50%", background:`radial-gradient(circle, ${m.color}25 0%, transparent 70%)`, pointerEvents:"none" }}/>

                <div style={{ fontSize:"28px", marginBottom:"10px" }}>{m.icon}</div>
                <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#F9FAFB", fontSize:"8px", marginBottom:"6px", lineHeight:1.6 }}>{m.label}</p>
                <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:m.color+"99", fontSize:"11px", marginBottom:"10px", lineHeight:1.4 }}>{m.desc}</p>

                {stats && (
                  <>
                    <div style={{ backgroundColor:"#00000040", borderRadius:"9999px", height:"4px", overflow:"hidden", marginBottom:"5px" }}>
                      <div style={{ height:"100%", backgroundColor:m.color, width:`${Math.min(done*3,100)}%`, borderRadius:"9999px", transition:"width 0.6s" }}/>
                    </div>
                    <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:m.color+"70", fontSize:"10px" }}>
                      {stats.total.toLocaleString()} Qs{stats.imageCount > 0 ? ` · 🩻` : ""}
                    </p>
                  </>
                )}

                {done > 0 && (
                  <div style={{ position:"absolute", top:"10px", right:"10px", backgroundColor:m.color, borderRadius:"9999px", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </Masonry>

        {search && filtered.length === 0 && !loading && (
          <p style={{ textAlign:"center", fontFamily:"Nunito,sans-serif", color:"#6B7280", fontSize:"13px", padding:"32px 0" }}>No subjects match "{search}"</p>
        )}
      </main>

      <style>{`
        .masonry-grid { display:flex; gap:12px; width:100%; }
        .masonry-col  { background-clip:padding-box; }
        @keyframes slide-down{0%{transform:translateY(-16px);opacity:0;}100%{transform:translateY(0);opacity:1;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
      `}</style>
    </PixelTransition>
  );
}
