import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonQuestions } from "../api/supabaseService";
import useProgressStore from "../store/useProgressStore";
import { fireConfettiBlast } from "../components/PixelBlast";

// NO HeaderHUD import — we render our own minimal header to avoid duplicate

const TOTAL   = 10;
const XP_EACH = 10;
const LABELS  = ["A","B","C","D"];

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ flex:1, backgroundColor:"#1F2937", border:"3px solid #2D3748", borderRadius:"9999px", height:"20px", overflow:"hidden", boxShadow:"0 3px 0 0 #0a0e1a" }}>
      <div style={{ height:"100%", backgroundColor:"#FFC107", borderRadius:"9999px", width:`${pct}%`, transition:"width 0.5s cubic-bezier(.4,0,.2,1)", backgroundImage:"linear-gradient(90deg,#FFC107,#FFD54F)" }}/>
    </div>
  );
}

function QuestionCard({ q, cardKey, answered, isCorrect }) {
  const border = answered ? (isCorrect ? "#22C55E" : "#EF4444") : "#2D3748";
  const bg = answered ? (isCorrect ? "#052e16" : "#450a0a") : "#111827";

  return (
    <div
      key={cardKey}
      style={{
        position: "relative",
        backgroundColor: bg,
        border: `3px solid ${border}`,
        borderRadius: "20px",
        boxShadow: "0 6px 0 0 #0a0e1a",
        padding: "20px",
        transition: "background-color 0.3s, border-color 0.3s",
        animation: "blur-snap 0.4s ease-out forwards",
      }}
    >
      {/* 8-bit Corner Accents */}
      {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
        <span key={i} style={{ position: "absolute", ...pos, width: "10px", height: "10px", backgroundColor: "#0a0e1a" }} />
      ))}

      {/* Image Badge */}
      {q.image && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#1a2235", border: "2px solid #8B5CF6", borderRadius: "8px", padding: "4px 10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px" }}>🩻</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#8B5CF6", fontSize: "7px" }}>IMAGE ANALYSIS</span>
        </div>
      )}

      {/* FIXED IMAGE CONTAINER */}
      {q.image && (
        <div 
          style={{ 
            marginBottom: "14px", 
            borderRadius: "12px", 
            overflow: "hidden", 
            border: "2px solid #2D3748", 
            backgroundColor: "#000",
            position: "relative",
            width: "100%",
            // This ensures a consistent box regardless of image height
            aspectRatio: "16 / 9", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <img
            src={q.image}
            alt="clinical"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain", // This prevents the "squashing"
              display: "block",
            }}
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
          <div style={{ position: "absolute", bottom: 0, width: "100%", padding: "5px 12px", backgroundColor: "rgba(10, 14, 26, 0.8)" }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFC107", fontSize: "6px" }}>EXAMINE DETAILS</span>
          </div>
        </div>
      )}

      <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#F9FAFB", fontSize: "clamp(14px, 3.5vw, 17px)", lineHeight: 1.65, textAlign: "center", position: "relative", zIndex: 1 }}>
        {q.question}
      </p>
      
      {q.chapter_name && (
        <p style={{ fontFamily: "Nunito, sans-serif", color: "#374151", fontSize: "10px", textAlign: "center", marginTop: "10px" }}>
          {q.book_name ? `${q.book_name} · ` : ""}{q.chapter_name}
        </p>
      )}
    </div>
  );
}

function OptionBtn({ label, text, state, onClick, disabled }) {
  const S = {
    default:{ bg:"#1a2235",border:"#374151",color:"#F9FAFB",shadow:"0 5px 0 0 #0a0e1a",lc:"#6B7280" },
    correct:{ bg:"#052e16",border:"#22C55E",color:"#F9FAFB",shadow:"0 5px 0 0 #14532D",lc:"#22C55E" },
    wrong:  { bg:"#450a0a",border:"#EF4444",color:"#F9FAFB",shadow:"0 5px 0 0 #7F1D1D",lc:"#EF4444" },
    dim:    { bg:"#0d1117",border:"#1F2937",color:"#374151",shadow:"0 5px 0 0 #0a0e1a",lc:"#2D3748" },
  }[state] ?? { bg:"#1a2235",border:"#374151",color:"#F9FAFB",shadow:"0 5px 0 0 #0a0e1a",lc:"#6B7280" };

  return (
    <button onClick={disabled?undefined:onClick} style={{ width:"100%",display:"flex",alignItems:"center",gap:"12px",backgroundColor:S.bg,border:`3px solid ${S.border}`,borderRadius:"14px",padding:"14px 16px",cursor:disabled?"default":"pointer",boxShadow:S.shadow,transition:"transform 0.07s, box-shadow 0.07s",boxSizing:"border-box",animation:state==="wrong"?"shake 0.45s ease-in-out":"none",minHeight:"54px",WebkitTapHighlightColor:"transparent" }}
      onPointerDown={e=>{if(!disabled){e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}}}
      onPointerUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=S.shadow;}}
      onPointerLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=S.shadow;}}
    >
      <div style={{ width:"32px",height:"32px",flexShrink:0,borderRadius:"8px",backgroundColor:`${S.lc}18`,border:`2px solid ${S.lc}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:S.lc }}>{label}</span>
      </div>
      <span style={{ fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"clamp(13px,3vw,15px)",color:S.color,textAlign:"left",lineHeight:1.35,flex:1 }}>{text}</span>
      {state==="correct"&&<span style={{ fontSize:"18px",flexShrink:0 }}>✅</span>}
      {state==="wrong"  &&<span style={{ fontSize:"18px",flexShrink:0 }}>❌</span>}
    </button>
  );
}

function FillInput({ onSubmit, disabled }) {
  const [val,setVal]=useState("");
  return (
    <div style={{ display:"flex",gap:"10px" }}>
      <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&val.trim())onSubmit(val.trim());}} disabled={disabled} placeholder="Type your answer…"
        style={{ flex:1,backgroundColor:"#111827",border:"3px solid #374151",borderRadius:"14px",padding:"14px 16px",color:"#F9FAFB",fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:"15px",outline:"none",boxSizing:"border-box",minHeight:"52px" }}/>
      <button onClick={()=>{if(val.trim())onSubmit(val.trim());}} disabled={disabled||!val.trim()}
        style={{ backgroundColor:"#FFC107",border:"3px solid #111827",borderRadius:"14px",padding:"0 18px",cursor:"pointer",boxShadow:"0 5px 0 0 #92610A",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#111827",flexShrink:0,minHeight:"52px",WebkitTapHighlightColor:"transparent" }}
        onPointerDown={e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}} onPointerUp={e=>{e.currentTarget.style.transform="";}}>
        GO
      </button>
    </div>
  );
}

function FlashcardReveal({ answer, onContinue }) {
  const [shown,setShown]=useState(false);
  const dn=e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";};
  const up=e=>{e.currentTarget.style.transform="";};
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
      {!shown
        ? <button onClick={()=>setShown(true)} style={{ width:"100%",backgroundColor:"#4C1D95",border:"3px solid #8B5CF6",borderRadius:"14px",padding:"18px",cursor:"pointer",boxShadow:"0 5px 0 0 #2E1065",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#F9FAFB",minHeight:"54px",WebkitTapHighlightColor:"transparent" }} onPointerDown={dn} onPointerUp={up}>REVEAL ANSWER 👁️</button>
        : <>
            <div style={{ backgroundColor:"#052e16",border:"3px solid #22C55E",borderRadius:"14px",padding:"18px",textAlign:"center",animation:"pop-in 0.35s cubic-bezier(.34,1.56,.64,1)" }}>
              <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:900,color:"#22C55E",fontSize:"clamp(14px,4vw,18px)",lineHeight:1.5 }}>{answer}</p>
            </div>
            <div style={{ display:"flex",gap:"10px" }}>
              <button onClick={()=>onContinue(false)} style={{ flex:1,backgroundColor:"#450a0a",border:"3px solid #EF4444",borderRadius:"14px",padding:"14px",cursor:"pointer",boxShadow:"0 5px 0 0 #7F1D1D",fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#EF4444",minHeight:"52px",WebkitTapHighlightColor:"transparent" }} onPointerDown={dn} onPointerUp={up}>💔 MISSED</button>
              <button onClick={()=>onContinue(true)}  style={{ flex:1,backgroundColor:"#052e16",border:"3px solid #22C55E",borderRadius:"14px",padding:"14px",cursor:"pointer",boxShadow:"0 5px 0 0 #14532D",fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#22C55E",minHeight:"52px",WebkitTapHighlightColor:"transparent" }} onPointerDown={dn} onPointerUp={up}>✅ GOT IT</button>
            </div>
          </>
      }
    </div>
  );
}

function FeedbackDrawer({ correct, explanation, correctAnswer, onContinue, isPractice }) {
  const dn=e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";};
  const up=e=>{e.currentTarget.style.transform="";};
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:200,backgroundColor:correct?"#052e16":"#450a0a",borderTop:`4px solid ${correct?"#22C55E":"#EF4444"}`,padding:`18px 16px calc(18px + env(safe-area-inset-bottom))`,animation:"drawer-up 0.3s cubic-bezier(.34,1.2,.64,1)",boxShadow:"0 -4px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ maxWidth:"600px",margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px" }}>
          <span style={{ fontSize:"30px" }}>{correct?"🎉":isPractice?"💡":"💔"}</span>
          <div>
            <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"11px",color:correct?"#22C55E":"#EF4444" }}>{correct?"CORRECT!":"INCORRECT"}</p>
            {!correct && correctAnswer && <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:800,color:"#F9FAFB",fontSize:"13px",marginTop:"3px" }}>Answer: <span style={{ color:"#FFC107" }}>{correctAnswer}</span></p>}
            {isPractice && !correct && <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#9CA3AF",fontSize:"11px",marginTop:"2px" }}>Practice mode — no hearts lost</p>}
          </div>
        </div>
        {explanation && (
          <div style={{ backgroundColor:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"12px 14px",marginBottom:"14px",borderLeft:`4px solid ${correct?"#22C55E":"#EF4444"}` }}>
            <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:"13px",color:"rgba(255,255,255,0.85)",lineHeight:1.65 }}>{explanation}</p>
          </div>
        )}
        <button onClick={onContinue} style={{ width:"100%",backgroundColor:correct?"#FFC107":"#F9FAFB",border:"3px solid #111827",borderRadius:"14px",padding:"16px",cursor:"pointer",boxShadow:correct?"0 5px 0 0 #92610A":"0 5px 0 0 #374151",fontFamily:"'Press Start 2P',monospace",fontSize:"11px",color:"#111827",minHeight:"54px",WebkitTapHighlightColor:"transparent" }}
          onPointerDown={dn} onPointerUp={up} onPointerLeave={up}>
          CONTINUE →
        </button>
      </div>
    </div>
  );
}

export default function QuizScreen() {
  const { topic } = useParams();
  const navigate  = useNavigate();

  let chapterObj;
  try   { chapterObj = JSON.parse(decodeURIComponent(topic)); }
  catch { chapterObj = { subject:null,book:decodeURIComponent(topic),chapter:null,name:decodeURIComponent(topic) }; }

  const isPractice  = chapterObj.gameMode === "practice";
  const displayName = chapterObj.chapter ?? chapterObj.name ?? chapterObj.book ?? "Quiz";
  const bookName    = chapterObj.book ?? "";

  const { hearts, cards, loseHeart, addXp, reviewCard, incrementStreak } = useProgressStore();

  const [questions,setQuestions] = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [idx,      setIdx]       = useState(0);
  const [selected, setSelected]  = useState(null);
  const [drawer,   setDrawer]    = useState(false);
  const [correct,  setCorrect]   = useState(false);
  const [xpFlash,  setXpFlash]   = useState(false);
  const [cardKey,  setCardKey]   = useState(0);
  const going = useRef(false);

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const qs = await getLessonQuestions(chapterObj, cards);
      setQuestions(qs);
      setLoading(false);
    })();
  }, [topic]);

  const q = questions[idx];

  const resolve = useCallback((isOk) => {
    setCorrect(isOk); setDrawer(true);
    if (isOk) {
      addXp(XP_EACH); reviewCard(q.id,5); incrementStreak();
      setXpFlash(true); fireConfettiBlast();
      setTimeout(()=>setXpFlash(false),1100);
    } else {
      reviewCard(q.id,1);
      // Only lose heart in competitive mode
      if (!isPractice) loseHeart();
    }
  }, [q, addXp, loseHeart, reviewCard, incrementStreak, isPractice]);

  const handleMCQ = useCallback(i => {
    if(drawer||selected!==null) return;
    setSelected(i); resolve(i===q.correct_index);
  }, [drawer,selected,q,resolve]);

  const handleFill = useCallback(ans => {
    if(drawer) return;
    const clean=s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
    const exp=typeof q.answer==="string"?q.answer:String(q.answer??"");
    resolve(clean(ans)===clean(exp));
  }, [drawer,q,resolve]);

  const handleContinue = useCallback(()=>{
    if(going.current) return;
    going.current=true;
    setDrawer(false); setSelected(null); setCorrect(false);
    setTimeout(()=>{
      const next=idx+1;
      if(next>=TOTAL||next>=questions.length){
        navigate(`/victory/${encodeURIComponent(JSON.stringify(chapterObj))}`);
      } else {
        setIdx(next); setCardKey(k=>k+1); going.current=false;
      }
    },220);
  },[idx,questions.length,chapterObj,navigate]);

  // ── Guards ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px" }}>
      <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#FFC107",fontSize:"10px",animation:"pulse 1s ease-in-out infinite" }}>LOADING...</p>
      <div style={{ display:"flex",gap:"8px" }}>{[0,1,2].map(i=><div key={i} style={{ width:"14px",height:"14px",backgroundColor:"#6D28D9",borderRadius:"3px",animation:`bounce-anim 0.6s ${i*0.15}s ease-in-out infinite` }}/>)}</div>
      <style>{`@keyframes bounce-anim{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}`}</style>
    </div>
  );

  // Out of hearts only in competitive mode
  if (!isPractice && hearts <= 0) return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center" }}>
      <div style={{ fontSize:"70px",marginBottom:"20px",animation:"bounce-anim 1.5s ease-in-out infinite" }}>💔</div>
      <h2 style={{ fontFamily:"'Press Start 2P',monospace",color:"#EF4444",fontSize:"13px",lineHeight:1.8,marginBottom:"14px" }}>OUT OF<br/>HEARTS!</h2>
      <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#6B7280",fontSize:"13px",marginBottom:"8px",maxWidth:"280px" }}>Tap the 🧬 logo to open Dev Panel and restore hearts.</p>
      <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#4B5563",fontSize:"12px",marginBottom:"28px",maxWidth:"280px" }}>Or try Practice Zone — no heart loss!</p>
      <button onClick={()=>navigate(-1)} style={{ backgroundColor:"#6D28D9",border:"3px solid #111827",borderRadius:"14px",padding:"14px 24px",cursor:"pointer",boxShadow:"0 5px 0 0 #2E1065",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#fff",WebkitTapHighlightColor:"transparent" }}
        onPointerDown={e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}} onPointerUp={e=>{e.currentTarget.style.transform="";}}>
        ← GO BACK
      </button>
    </div>
  );

  if (!q) return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",padding:"24px" }}>
      <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#EF4444",fontSize:"9px",textAlign:"center" }}>NO QUESTIONS FOUND</p>
      <p style={{ fontFamily:"Nunito,sans-serif",color:"#6B7280",fontSize:"13px",textAlign:"center" }}>Try removing filters or a different chapter.</p>
      <button onClick={()=>navigate(-1)} style={{ backgroundColor:"#6D28D9",border:"3px solid #111827",borderRadius:"14px",padding:"12px 22px",cursor:"pointer",boxShadow:"0 5px 0 0 #2E1065",fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#fff",WebkitTapHighlightColor:"transparent" }}
        onPointerDown={e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}} onPointerUp={e=>{e.currentTarget.style.transform="";}}>
        ← BACK
      </button>
    </div>
  );

  const qType    = q.type ?? "mcq";
  const getState = i => { if(selected===null) return "default"; if(i===q.correct_index) return "correct"; if(i===selected) return "wrong"; return "dim"; };

  return (
    /* Full-screen, no HeaderHUD to avoid duplicate header */
    <div style={{ minHeight:"100vh",width:"100%",display:"flex",flexDirection:"column",backgroundColor:"#0a0e1a" }}>

      {/* ── Compact quiz header (replaces HeaderHUD in this screen) ── */}
      <div style={{ position:"sticky",top:0,zIndex:50,backgroundColor:"rgba(10,14,26,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"2px solid #1F2937",padding:`8px 14px`,boxSizing:"border-box",paddingLeft:"max(14px,env(safe-area-inset-left))",paddingRight:"max(14px,env(safe-area-inset-right))" }}>
        <div style={{ maxWidth:"600px",margin:"0 auto",display:"flex",alignItems:"center",gap:"10px" }}>
          <button onClick={()=>navigate(-1)} style={{ background:"none",border:"none",cursor:"pointer",color:"#4B5563",fontSize:"18px",flexShrink:0,padding:"4px",lineHeight:1,minHeight:"36px",minWidth:"36px",WebkitTapHighlightColor:"transparent" }}>✕</button>
          <ProgressBar current={idx} total={TOTAL}/>
          <span style={{ fontFamily:"'Press Start 2P',monospace",color:"#FFC107",fontSize:"8px",flexShrink:0,whiteSpace:"nowrap" }}>{idx+1}/{TOTAL}</span>
          {/* Mode badge */}
          <div style={{ flexShrink:0,backgroundColor:isPractice?"#052e16":"#450a0a",border:`2px solid ${isPractice?"#22C55E":"#EF4444"}`,borderRadius:"8px",padding:"3px 8px",display:"flex",alignItems:"center",gap:"3px" }}>
            <span style={{ fontSize:"10px" }}>{isPractice?"🎯":"⚔️"}</span>
            {/* Hearts — only show in competitive */}
            {!isPractice && (
              <span style={{ fontFamily:"Nunito,sans-serif",fontWeight:800,color:"#EF4444",fontSize:"10px" }}>
                {"❤️".repeat(Math.max(0,hearts))}{"🖤".repeat(Math.max(0,5-hearts))}
              </span>
            )}
          </div>
        </div>
        {/* Breadcrumb */}
        <div style={{ maxWidth:"600px",margin:"2px auto 0",textAlign:"center" }}>
          {bookName && <p style={{ fontFamily:"Nunito,sans-serif",fontWeight:700,color:"#2D3748",fontSize:"9px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{bookName}</p>}
          <p style={{ fontFamily:"'Press Start 2P',monospace",color:"#4C1D95",fontSize:"7px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{displayName}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth:"600px",margin:"0 auto",width:"100%",padding:"14px 14px calc(180px + env(safe-area-inset-bottom))",boxSizing:"border-box",display:"flex",flexDirection:"column",gap:"14px",flex:1 }}>

        <QuestionCard q={q} cardKey={cardKey} answered={drawer} isCorrect={correct}/>

        {(qType==="mcq"||qType==="image_mcq") && (
          <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
            {(q.options??[]).map((opt,i)=><OptionBtn key={i} label={LABELS[i]} text={opt} state={getState(i)} onClick={()=>handleMCQ(i)} disabled={drawer}/>)}
          </div>
        )}
        {qType==="fill"      && !drawer && <FillInput onSubmit={handleFill} disabled={drawer}/>}
        {qType==="flashcard" && !drawer && <FlashcardReveal answer={typeof q.answer==="string"?q.answer:(q.options?.[q.correct_index]??"")} onContinue={resolve}/>}
      </main>

      {xpFlash && (
        <div style={{ position:"fixed",top:"25%",left:"50%",transform:"translateX(-50%)",zIndex:9999,pointerEvents:"none",fontFamily:"'Press Start 2P',monospace",color:"#FFC107",fontSize:"clamp(16px,5vw,22px)",animation:"xp-fly 1s ease-out forwards",whiteSpace:"nowrap",textShadow:"0 0 20px #FFC107" }}>
          +{XP_EACH} XP ⚡
        </div>
      )}

      {drawer && (
        <FeedbackDrawer
          correct={correct}
          explanation={q.explanation}
          correctAnswer={(qType==="mcq"||qType==="image_mcq")?`${LABELS[q.correct_index]}. ${q.options?.[q.correct_index]??""}`:typeof q.answer==="string"?q.answer:null}
          onContinue={handleContinue}
          isPractice={isPractice}
        />
      )}

      <style>{`
        @keyframes blur-snap{0%{filter:blur(8px);opacity:.4;}100%{filter:blur(0);opacity:1;}}
        @keyframes drawer-up{0%{transform:translateY(100%);}100%{transform:translateY(0);}}
        @keyframes xp-fly{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}100%{opacity:0;transform:translateX(-50%) translateY(-50px) scale(1.5);}}
        @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-5px);}80%{transform:translateX(5px);}}
        @keyframes pop-in{0%{transform:scale(0.5);opacity:0;}70%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;}}
        @keyframes bounce-anim{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
      `}</style>
    </div>
  );
}
