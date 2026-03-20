import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PixelTransition from "../components/PixelTransition";
import { firePixelBlast } from "../components/PixelBlast";
import { getSubjectMeta, getStaticBooks, getStaticDatasets } from "../data/syllabus";
import useProgressStore from "../store/useProgressStore";

const STUDY_MODES = [
  { key:"books",      icon:"📚", label:"Textbooks",      desc:"Chapter-by-chapter from standard textbooks",   color:"#FFC107", shadow:"#92610A" },
  { key:"datasets",   icon:"🗃️", label:"Exam Datasets",  desc:"Real questions from MEDMCQA · USMLE · HeadQA", color:"#8B5CF6", shadow:"#2E1065" },
  { key:"flashcards", icon:"🃏", label:"Flashcards",     desc:"Anki-style rapid memorization cards",           color:"#F97316", shadow:"#7C2D12" },
  { key:"fill",       icon:"✏️", label:"Fill-in-Blank",  desc:"Complete the sentence questions",              color:"#22C55E", shadow:"#14532D" },
  { key:"images",     icon:"🩻", label:"Image MCQ",      desc:"X-rays, CT, MRI & histology slides",           color:"#06B6D4", shadow:"#0E4A5C" },
];

const DIFF_OPTIONS = [
  { key:0, label:"All",          icon:"📊", color:"#9CA3AF" },
  { key:1, label:"Basic",        icon:"🟢", color:"#22C55E" },
  { key:2, label:"Intermediate", icon:"🟡", color:"#F59E0B" },
  { key:3, label:"Advanced",     icon:"🔴", color:"#EF4444" },
];

export default function SubjectScreen() {
  const { subject } = useParams();
  const navigate    = useNavigate();
  const decoded     = decodeURIComponent(subject);
  const m           = getSubjectMeta(decoded);

  const completedTopics = useProgressStore(s => s.completedTopics);
  const doneCount = completedTopics.filter(k => k.startsWith(`${decoded}__`)).length;

  const books    = getStaticBooks(decoded);
  const datasets = getStaticDatasets(decoded);

  const [gameMode, setGameMode] = useState(null);  // "competitive" | "practice"
  const [selMode,  setSelMode]  = useState(null);
  const [selDiff,  setSelDiff]  = useState(0);

  // Filter modes based on available content
  const availableModes = STUDY_MODES.filter(mode => {
    if (mode.key === "books")      return books.length > 0;
    if (mode.key === "datasets")   return datasets.filter(d=>!["PATH_VQA","VQA_RAD","Flashcards"].includes(d.topic)).length > 0;
    if (mode.key === "flashcards") return true; // always available (global Flashcards topic)
    if (mode.key === "fill")       return true;
    if (mode.key === "images")     return true; // PATH_VQA + VQA_RAD available globally
    return false;
  });

  const handleGo = e => {
    if (!gameMode || !selMode) return;
    firePixelBlast(e.clientX, e.clientY, "gold");
    const params = new URLSearchParams({ diff: selDiff, gamemode: gameMode });
    navigate(`/path/${encodeURIComponent(decoded)}/${selMode}?${params}`);
  };

  const dn = e => { e.currentTarget.style.transform="translateY(5px)"; e.currentTarget.style.boxShadow="none"; };
  const up = (shadow) => e => { e.currentTarget.style.transform=""; if(shadow) e.currentTarget.style.boxShadow=shadow; };

  return (
    <PixelTransition id={decoded}>
      <main style={{ maxWidth:"600px", margin:"0 auto", padding:"12px 14px 100px", width:"100%", boxSizing:"border-box" }}>

        <button onClick={()=>navigate("/")} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"14px",padding:"4px 0",WebkitTapHighlightColor:"transparent" }}>
          ← BACK
        </button>

        {/* Subject hero */}
        <div style={{ background:`linear-gradient(135deg,${m.bg} 0%,#111827 100%)`, border:`3px solid ${m.color}45`, borderRadius:"20px", padding:"20px", marginBottom:"20px", boxShadow:"0 6px 0 0 #0a0e1a", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute",top:"-30px",right:"-30px",width:"120px",height:"120px",borderRadius:"50%",background:`radial-gradient(circle,${m.color}15 0%,transparent 70%)`,pointerEvents:"none" }}/>
          <div style={{ fontSize:"36px", marginBottom:"10px" }}>{m.icon}</div>
          <h1 style={{ fontFamily:"'Press Start 2P',monospace",color:"#F9FAFB",fontSize:"clamp(10px,3vw,14px)",lineHeight:1.7,marginBottom:"8px" }}>{m.label}</h1>
          <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
            <span style={{ backgroundColor:"#00000050",border:`2px solid ${m.color}25`,borderRadius:"9999px",padding:"4px 10px",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"11px",color:m.color }}>
              {books.length} books · {datasets.length} datasets
            </span>
            {doneCount > 0 && (
              <span style={{ backgroundColor:"#00000050",border:"2px solid #22C55E25",borderRadius:"9999px",padding:"4px 10px",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"11px",color:"#22C55E" }}>
                ✓ {doneCount} completed
              </span>
            )}
          </div>
        </div>

        {/* STEP 1: Choose game mode */}
        <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"12px" }}>STEP 1 — CHOOSE MODE</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px" }}>
          {/* Practice Zone */}
          <button
            onClick={()=>setGameMode("practice")}
            style={{ padding:"18px 14px",backgroundColor:gameMode==="practice"?"#052e1690":"#111827",border:`3px solid ${gameMode==="practice"?"#22C55E":"#2D3748"}`,borderRadius:"16px",cursor:"pointer",boxShadow:gameMode==="practice"?"0 5px 0 0 #14532D":"0 5px 0 0 #0a0e1a",textAlign:"center",WebkitTapHighlightColor:"transparent",transition:"all 0.15s" }}
            onPointerDown={dn} onPointerUp={up(gameMode==="practice"?"0 5px 0 0 #14532D":"0 5px 0 0 #0a0e1a")}
          >
            <div style={{ fontSize:"28px",marginBottom:"8px" }}>🎯</div>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:gameMode==="practice"?"#22C55E":"#F9FAFB",fontSize:"8px",marginBottom:"6px",lineHeight:1.5 }}>PRACTICE ZONE</p>
            <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#6B7280",fontSize:"11px",lineHeight:1.4 }}>No hearts lost · Learn freely</p>
            {gameMode==="practice"&&<p style={{ marginTop:"6px",fontSize:"14px" }}>✅</p>}
          </button>

          {/* Competitive */}
          <button
            onClick={()=>setGameMode("competitive")}
            style={{ padding:"18px 14px",backgroundColor:gameMode==="competitive"?"#45000a90":"#111827",border:`3px solid ${gameMode==="competitive"?"#EF4444":"#2D3748"}`,borderRadius:"16px",cursor:"pointer",boxShadow:gameMode==="competitive"?"0 5px 0 0 #7F1D1D":"0 5px 0 0 #0a0e1a",textAlign:"center",WebkitTapHighlightColor:"transparent",transition:"all 0.15s" }}
            onPointerDown={dn} onPointerUp={up(gameMode==="competitive"?"0 5px 0 0 #7F1D1D":"0 5px 0 0 #0a0e1a")}
          >
            <div style={{ fontSize:"28px",marginBottom:"8px" }}>⚔️</div>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:gameMode==="competitive"?"#EF4444":"#F9FAFB",fontSize:"8px",marginBottom:"6px",lineHeight:1.5 }}>COMPETITIVE</p>
            <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#6B7280",fontSize:"11px",lineHeight:1.4 }}>Hearts system · XP rewards</p>
            {gameMode==="competitive"&&<p style={{ marginTop:"6px",fontSize:"14px" }}>✅</p>}
          </button>
        </div>

        {/* STEP 2: Choose study content */}
        {gameMode && (
          <div style={{ animation:"slide-down 0.2s ease-out" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"12px" }}>STEP 2 — STUDY CONTENT</p>
            <div style={{ display:"flex",flexDirection:"column",gap:"10px",marginBottom:"20px" }}>
              {availableModes.map(mode => {
                const isSel = selMode === mode.key;
                return (
                  <button key={mode.key} onClick={()=>setSelMode(mode.key)} style={{ width:"100%",display:"flex",alignItems:"center",gap:"14px",backgroundColor:isSel?`${mode.color}10`:"#111827",border:`3px solid ${isSel?mode.color:"#2D3748"}`,borderRadius:"16px",padding:"14px",cursor:"pointer",boxSizing:"border-box",boxShadow:isSel?`0 5px 0 0 ${mode.shadow}`:"0 5px 0 0 #0a0e1a",textAlign:"left",WebkitTapHighlightColor:"transparent" }}
                    onPointerDown={dn} onPointerUp={up(isSel?`0 5px 0 0 ${mode.shadow}`:"0 5px 0 0 #0a0e1a")} onPointerLeave={up(isSel?`0 5px 0 0 ${mode.shadow}`:"0 5px 0 0 #0a0e1a")}>
                    <div style={{ width:"44px",height:"44px",flexShrink:0,backgroundColor:isSel?`${mode.color}15`:"#1a2235",borderRadius:"12px",border:`2px solid ${isSel?mode.color:"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px" }}>{mode.icon}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontFamily:"'Press Start 2P',monospace",color:isSel?mode.color:"#F9FAFB",fontSize:"8px",marginBottom:"3px" }}>{mode.label}</p>
                      <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#6B7280",fontSize:"11px" }}>{mode.desc}</p>
                    </div>
                    {isSel && <span style={{ fontSize:"18px",flexShrink:0 }}>✅</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Difficulty */}
        {gameMode && selMode && (
          <div style={{ animation:"slide-down 0.2s ease-out",marginBottom:"20px" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"12px" }}>STEP 3 — DIFFICULTY</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px" }}>
              {DIFF_OPTIONS.map(d => {
                const isSel = selDiff === d.key;
                return (
                  <button key={d.key} onClick={()=>setSelDiff(d.key)} style={{ padding:"13px",backgroundColor:isSel?`${d.color}12`:"#111827",border:`3px solid ${isSel?d.color:"#2D3748"}`,borderRadius:"14px",cursor:"pointer",boxShadow:"0 4px 0 0 #0a0e1a",display:"flex",alignItems:"center",gap:"8px",minHeight:"48px",WebkitTapHighlightColor:"transparent" }}
                    onPointerDown={dn} onPointerUp={up("0 4px 0 0 #0a0e1a")}>
                    <span style={{ fontSize:"16px" }}>{d.icon}</span>
                    <span style={{ fontFamily:"'Press Start 2P',monospace",color:isSel?d.color:"#6B7280",fontSize:"7px" }}>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* GO button */}
        {gameMode && selMode && (
          <button onClick={handleGo} style={{ width:"100%",backgroundColor:"#FFC107",border:"3px solid #111827",borderRadius:"16px",padding:"18px",cursor:"pointer",boxShadow:"0 6px 0 0 #92610A",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#111827",animation:"pop-in 0.3s cubic-bezier(.34,1.56,.64,1)",minHeight:"58px",WebkitTapHighlightColor:"transparent" }}
            onPointerDown={e=>{e.currentTarget.style.transform="translateY(6px)";e.currentTarget.style.boxShadow="none";}} onPointerUp={e=>{e.currentTarget.style.transform="";}}>
            {gameMode==="practice"?"🎯":"⚔️"} START {STUDY_MODES.find(md=>md.key===selMode)?.label.toUpperCase()} →
          </button>
        )}
      </main>

      <style>{`
        @keyframes slide-down{0%{transform:translateY(-12px);opacity:0;}100%{transform:translateY(0);opacity:1;}}
        @keyframes pop-in{0%{transform:scale(0.8);opacity:0;}70%{transform:scale(1.04);}100%{transform:scale(1);opacity:1;}}
      `}</style>
    </PixelTransition>
  );
}
