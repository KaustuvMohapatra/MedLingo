import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PixelTransition from "../components/PixelTransition";
import { firePixelBlast } from "../components/PixelBlast";
import { getSubjectMeta, getStaticBooks, getStaticChapters, getStaticDatasets, FLASHCARD_DATASET, IMAGE_DATASETS } from "../data/syllabus";
import useProgressStore from "../store/useProgressStore";

/* ── Path node ───────────────────────────────────────────────── */
function PathNode({ item, index, status, color, onClick }) {
  const isLeft = index % 2 === 0;
  const isDone = status === "completed";
  const isAct  = status === "active";
  const isLock = status === "locked";

  const SIZE   = isAct ? 70 : 60;
  const border = isDone ? color+"60" : isAct ? "#FFC107" : "#2D3748";
  const bg     = isDone ? color+"18" : isAct ? "#4C1D95" : "#111827";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", justifyContent:isLeft?"flex-start":"flex-end", padding:isLeft?"0 20px 0 6px":"0 6px 0 20px" }}>
      {!isLeft && (
        <div style={{ flex:1, minWidth:0, textAlign:"right" }}>
          <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:800, color:isAct?"#F9FAFB":"#6B7280", fontSize:"13px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</p>
          {item.sub && <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#374151", fontSize:"10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.sub}</p>}
        </div>
      )}

      <button
        onClick={isLock ? undefined : onClick}
        style={{ position:"relative", width:`${SIZE}px`, height:`${SIZE}px`, flexShrink:0, borderRadius:"18px", border:`3px solid ${border}`, backgroundColor:bg, opacity:isLock?0.3:1, boxShadow:isLock?"none":isAct?`0 6px 0 0 #2E1065, 0 0 22px ${color}30`:"0 5px 0 0 #0a0e1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:isAct?"24px":"20px", cursor:isLock?"not-allowed":"pointer", transition:"transform 0.1s", animation:isAct?"bounce-slow 1.6s ease-in-out infinite":"none", WebkitTapHighlightColor:"transparent" }}
        onPointerDown={e=>{ if(!isLock){e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}}}
        onPointerUp={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=isAct?`0 6px 0 0 #2E1065`:"0 5px 0 0 #0a0e1a"; }}
        onPointerLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=isAct?`0 6px 0 0 #2E1065`:"0 5px 0 0 #0a0e1a"; }}
      >
        {isDone ? "👑" : isLock ? "🔒" : (item.nodeIcon ?? "▶")}
        {isAct && <span style={{ position:"absolute",inset:0,borderRadius:"15px",border:"2px solid #FFC107",opacity:0.5,animation:"ping 1.5s cubic-bezier(0,0,.2,1) infinite" }}/>}
        {isDone && <span style={{ position:"absolute",bottom:"-6px",right:"-6px",backgroundColor:color,borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",border:"2px solid #0a0e1a" }}>✓</span>}
      </button>

      {isLeft && (
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:800, color:isAct?"#F9FAFB":"#6B7280", fontSize:"13px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</p>
          {item.sub && <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#374151", fontSize:"10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.sub}</p>}
        </div>
      )}
    </div>
  );
}

function Connector({ done, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", margin:"3px 0 3px 35px" }}>
      <div style={{ width:"4px", height:"26px", borderRadius:"9999px", backgroundColor:done?color+"50":"#1F2937" }}/>
    </div>
  );
}

function SectionHeader({ label, icon, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", margin:"22px 0 12px 6px" }}>
      <span style={{ fontSize:"18px" }}>{icon}</span>
      <span style={{ fontFamily:"'Press Start 2P',monospace", color, fontSize:"8px" }}>{label}</span>
      <div style={{ flex:1, height:"2px", backgroundColor:color+"25", borderRadius:"9999px" }}/>
    </div>
  );
}

export default function PathScreen() {
  const { subject, mode } = useParams();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();

  const decoded   = decodeURIComponent(subject);
  const m         = getSubjectMeta(decoded);
  const diff      = parseInt(searchParams.get("diff") ?? "0");
  const gameMode  = searchParams.get("gamemode") ?? "competitive"; // competitive | practice

  const completedTopics = useProgressStore(s => s.completedTopics);

  // ── Build path items STATICALLY ──────────────────────────────
  const buildItems = () => {
    const items = [];

    if (mode === "books") {
      const books = getStaticBooks(decoded);
      if (books.length === 0) {
        return [{ type:"empty", msg:`No textbook content found for ${m.label}. Try Exam Datasets.` }];
      }
      books.forEach(book => {
        items.push({ type:"section", label:book.name, icon:"📖" });
        const chapters = getStaticChapters(decoded, book.name);
        chapters.forEach(chapter => {
          items.push({
            type:"chapter", label:chapter, sub:book.name, nodeIcon:"📄",
            param:{ subject:decoded, book:book.name, chapter, name:chapter, useOffset:false, offset:0, modeKey:"books", gameMode, ...(diff>0?{filterDiff:diff}:{}) },
          });
        });
      });
    } else if (mode === "datasets") {
      const datasets = getStaticDatasets(decoded).filter(d => !["PATH_VQA","VQA_RAD","Flashcards"].includes(d.topic));
      if (datasets.length === 0) {
        return [{ type:"empty", msg:`No exam dataset content for ${m.label}.` }];
      }
      datasets.forEach(ds => {
        items.push({
          type:"chapter", label:ds.label, sub:"Exam Questions", nodeIcon:ds.icon,
          param:{ subject:decoded, book:ds.topic, chapter:null, name:ds.label, useOffset:false, offset:0, modeKey:"datasets", gameMode, ...(diff>0?{filterDiff:diff}:{}) },
        });
      });
    } else if (mode === "flashcards") {
      items.push({
        type:"chapter", label:"Medical Flashcards", sub:"Anki-style cards — topic: Flashcards", nodeIcon:"🃏",
        param:{ subject:decoded, book:"Flashcards", chapter:null, name:"Medical Flashcards", useOffset:false, offset:0, modeKey:"flashcards", gameMode, ...(diff>0?{filterDiff:diff}:{}) },
      });
    } else if (mode === "fill") {
      items.push({
        type:"chapter", label:"Fill-in-the-Blank", sub:"Complete the sentence — topic: Flashcards", nodeIcon:"✏️",
        param:{ subject:decoded, book:"Flashcards", chapter:null, name:"Fill-in-the-Blank", useOffset:false, offset:0, modeKey:"fill", gameMode, ...(diff>0?{filterDiff:diff}:{}) },
      });
    } else if (mode === "images") {
      const imgDatasets = getStaticDatasets(decoded).filter(d => ["PATH_VQA","VQA_RAD"].includes(d.topic));
      const toShow = imgDatasets.length > 0 ? imgDatasets : IMAGE_DATASETS;
      toShow.forEach(ds => {
        items.push({
          type:"chapter", label:ds.label, sub:"Image-based MCQ", nodeIcon:ds.icon,
          param:{ subject:decoded, book:ds.topic, chapter:null, name:ds.label, useOffset:false, offset:0, modeKey:"images", gameMode, ...(diff>0?{filterDiff:diff}:{}) },
        });
      });
    }

    return items;
  };

  const items = buildItems();
  const chapterItems = items.filter(i => i.type === "chapter");

  const cKey = item => item.param ? `${decoded}__${item.param.book}__${item.param.chapter??item.param.name}` : null;
  const getStatus = (item, chIdx) => {
    const key = cKey(item);
    if (!key) return "locked";
    if (completedTopics.includes(key)) return "completed";
    const lastDone = chapterItems.reduce((acc, ci, i) => completedTopics.includes(cKey(ci)??"")?i:acc, -1);
    if (chIdx === 0 && lastDone === -1) return "active";
    if (chIdx === lastDone + 1)        return "active";
    return "locked";
  };

  let chIdx = 0;
  const modeLabels = { books:"Textbooks", datasets:"Exam Datasets", flashcards:"Flashcards", fill:"Fill-in-Blank", images:"Image MCQ" };
  const modeColors = { books:"#FFC107", datasets:"#8B5CF6", flashcards:"#F97316", fill:"#22C55E", images:"#06B6D4" };
  const modeColor  = modeColors[mode] ?? "#FFC107";

  return (
    <PixelTransition id={`${decoded}-${mode}`}>
      <main style={{ maxWidth:"560px", margin:"0 auto", padding:"12px 14px 100px", width:"100%", boxSizing:"border-box" }}>

        {/* Back */}
        <button onClick={()=>navigate(`/subject/${encodeURIComponent(decoded)}`)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",color:"#6B7280",fontSize:"8px",marginBottom:"14px",padding:"4px 0",display:"flex",alignItems:"center",gap:"6px",WebkitTapHighlightColor:"transparent" }}>
          ← BACK
        </button>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#1a0a3b 0%,#111827 100%)`, border:`3px solid ${m.color}35`, borderRadius:"18px", padding:"16px", marginBottom:"20px", boxShadow:"0 5px 0 0 #0a0e1a", display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"48px",height:"48px",flexShrink:0,backgroundColor:"#0a0e1a",borderRadius:"14px",border:`3px solid ${m.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px" }}>{m.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#F9FAFB",fontSize:"8px",marginBottom:"4px" }}>{m.label}</p>
            <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:800,color:modeColor,fontSize:"14px",marginBottom:"3px" }}>{modeLabels[mode] ?? mode}</p>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {diff > 0 && <span style={{ fontFamily:"'Press Start 2P',monospace",color:["","#22C55E","#F59E0B","#EF4444"][diff],fontSize:"7px" }}>{["","BASIC","MID","ADVANCED"][diff]}</span>}
              <span style={{ fontFamily:"'Press Start 2P',monospace",color:gameMode==="practice"?"#22C55E":"#EF4444",fontSize:"7px" }}>
                {gameMode==="practice"?"🎯 PRACTICE":"⚔️ COMPETITIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {chapterItems.length > 0 && (
          <div style={{ backgroundColor:"#1F2937",borderRadius:"9999px",height:"6px",overflow:"hidden",marginBottom:"20px" }}>
            <div style={{ height:"100%",backgroundColor:m.color,borderRadius:"9999px",transition:"width 0.6s",
              width:`${Math.round((chapterItems.filter((_,i)=>getStatus(_,i)==="completed").length/chapterItems.length)*100)}%` }}/>
          </div>
        )}

        {/* Empty state */}
        {items[0]?.type === "empty" && (
          <div style={{ textAlign:"center",padding:"40px 20px",backgroundColor:"#111827",border:"3px solid #374151",borderRadius:"16px" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#EF4444",fontSize:"9px",marginBottom:"10px" }}>NO CONTENT FOUND</p>
            <p style={{ fontFamily:"Nunito,sans-serif",color:"#6B7280",fontSize:"13px",marginBottom:"16px" }}>{items[0].msg}</p>
            <button onClick={()=>navigate(`/subject/${encodeURIComponent(decoded)}`)} style={{ backgroundColor:"#6D28D9",border:"3px solid #111827",borderRadius:"12px",padding:"12px 20px",cursor:"pointer",boxShadow:"0 4px 0 0 #2E1065",fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#fff" }}
              onPointerDown={e=>{e.currentTarget.style.transform="translateY(4px)";e.currentTarget.style.boxShadow="none";}} onPointerUp={e=>{e.currentTarget.style.transform="";}}>
              ← CHANGE MODE
            </button>
          </div>
        )}

        {/* Path */}
        {items[0]?.type !== "empty" && items.map((item, idx) => {
          if (item.type === "section") return <SectionHeader key={`s${idx}`} label={item.label} icon={item.icon} color={m.color}/>;
          const ci     = chIdx++;
          const status = getStatus(item, ci);
          return (
            <div key={`c${idx}`}>
              {ci > 0 && mode === "books" && <Connector done={getStatus(chapterItems[ci-1],ci-1)==="completed"} color={m.color}/>}
              {ci > 0 && mode !== "books" && <div style={{ height:"12px" }}/>}
              <PathNode
                item={item} index={ci} status={status} color={m.color}
                onClick={e => {
                  firePixelBlast(e.clientX, e.clientY);
                  navigate(`/quiz/${encodeURIComponent(JSON.stringify(item.param))}`);
                }}
              />
            </div>
          );
        })}
      </main>

      <style>{`
        @keyframes bounce-slow{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes ping{75%,100%{transform:scale(1.5);opacity:0;}}
      `}</style>
    </PixelTransition>
  );
}
