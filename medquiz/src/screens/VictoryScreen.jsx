import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProgressStore from "../store/useProgressStore";
import { fireConfettiBlast } from "../components/PixelBlast";

const BONUS_XP = 50;

export default function VictoryScreen() {
  const { topic }  = useParams();
  const navigate   = useNavigate();

  let chapterObj;
  try   { chapterObj = JSON.parse(decodeURIComponent(topic)); }
  catch { chapterObj = { subject:null, book:decodeURIComponent(topic), chapter:null, name:decodeURIComponent(topic) }; }

  const displayName = chapterObj.chapter ?? chapterObj.name ?? chapterObj.book ?? "Chapter";
  const bookName    = chapterObj.book ?? "";

  const { xp, streak, addXp, markTopicComplete, gainHeart } = useProgressStore();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    const key = `${chapterObj.subject}__${chapterObj.book}__${chapterObj.chapter??chapterObj.name}`;
    addXp(BONUS_XP);
    markTopicComplete(key);
    gainHeart();
    setTimeout(fireConfettiBlast, 200);
    setTimeout(fireConfettiBlast, 800);
    setTimeout(fireConfettiBlast, 1400);
  }, []);

  const Btn = ({ onClick, bg, border, shadow, textColor="#111827", children }) => (
    <button onClick={onClick} style={{ width:"100%", backgroundColor:bg, border:`3px solid ${border}`, borderRadius:"14px", padding:"16px", cursor:"pointer", boxShadow:shadow, fontFamily:"'Press Start 2P',monospace", fontSize:"9px", color:textColor, marginBottom:"10px", minHeight:"56px" }}
      onMouseDown={e=>{e.currentTarget.style.transform="translateY(5px)";e.currentTarget.style.boxShadow="none";}}
      onMouseUp={e=>{e.currentTarget.style.transform="";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";}}
    >{children}</button>
  );

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#0a0e1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>

      {/* Background glow */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,193,7,0.08) 0%, transparent 70%)" }}/>

      {/* Floating emojis */}
      {[
        { em:"⭐", style:{ top:"6%",  left:"8%",  animationDelay:"0s"  }},
        { em:"🏆", style:{ top:"10%", right:"10%", animationDelay:"0.5s"}},
        { em:"✨", style:{ bottom:"25%", left:"5%", animationDelay:"1s" }},
        { em:"🎉", style:{ bottom:"28%", right:"6%", animationDelay:"1.5s"}},
        { em:"⚡", style:{ top:"35%", left:"4%",  animationDelay:"0.8s"}},
      ].map(({em,style},i)=>(
        <span key={i} style={{ position:"fixed", fontSize:"22px", pointerEvents:"none", animation:"float 3s ease-in-out infinite", ...style }}>{em}</span>
      ))}

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"420px", display:"flex", flexDirection:"column", alignItems:"center", gap:"20px" }}>

        {/* Trophy */}
        <div style={{ fontSize:"80px", animation:"victory-glow 2s ease-in-out infinite", lineHeight:1 }}>🏆</div>

        {/* Title */}
        <div style={{ textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"clamp(15px,4vw,20px)", lineHeight:1.8, marginBottom:"8px" }}>
            LESSON<br/>COMPLETE!
          </h1>
          {bookName && <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#374151", fontSize:"11px", marginBottom:"4px" }}>{bookName}</p>}
          <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#9CA3AF", fontSize:"13px" }}>{displayName}</p>
        </div>

        {/* Stats card */}
        <div style={{ width:"100%", backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", boxShadow:"0 6px 0 0 #0a0e1a", padding:"20px", animation:"pop-in 0.5s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", textAlign:"center", marginBottom:"16px" }}>
            {[
              { icon:"⚡", val:`+${BONUS_XP}`, label:"Bonus XP",  color:"#FFC107" },
              { icon:"🔥", val:streak,          label:"Streak",    color:"#F97316" },
              { icon:"❤️", val:"+1",            label:"Heart",     color:"#EF4444" },
            ].map(({ icon,val,label,color }) => (
              <div key={label} style={{ backgroundColor:"#0d1117", borderRadius:"12px", padding:"14px 8px", border:`2px solid ${color}20` }}>
                <div style={{ fontSize:"22px", marginBottom:"6px" }}>{icon}</div>
                <div style={{ fontFamily:"'Press Start 2P',monospace", color, fontSize:"12px", marginBottom:"4px" }}>{val}</div>
                <div style={{ fontFamily:"Nunito,sans-serif", color:"#6B7280", fontSize:"10px" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"2px solid #1F2937", paddingTop:"14px", textAlign:"center" }}>
            <p style={{ fontFamily:"Nunito,sans-serif", color:"#6B7280", fontSize:"11px", marginBottom:"4px" }}>TOTAL XP</p>
            <p style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"clamp(16px,4vw,22px)" }}>{xp.toLocaleString()}</p>
          </div>
        </div>

        {/* Crown badge */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", backgroundColor:"#4C1D95", border:"3px solid #FFC107", borderRadius:"14px", padding:"12px 24px", boxShadow:"0 5px 0 0 #92610A" }}>
          <span style={{ fontSize:"22px" }}>👑</span>
          <span style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"8px", lineHeight:1.7 }}>CHAPTER<br/>MASTERED</span>
        </div>

        {/* Buttons */}
        <div style={{ width:"100%" }}>
          <Btn onClick={()=>navigate("/")} bg="#FFC107" border="#111827" shadow="0 5px 0 0 #92610A">
            ← BACK TO MAP
          </Btn>
          <Btn onClick={()=>navigate(`/quiz/${encodeURIComponent(JSON.stringify(chapterObj))}`)} bg="#1a2235" border="#6D28D9" shadow="0 5px 0 0 #2E1065" textColor="#8B5CF6">
            ↺ REVIEW AGAIN
          </Btn>
        </div>
      </div>

      <style>{`
        @keyframes victory-glow{0%,100%{filter:drop-shadow(0 0 8px #FFC107);}50%{filter:drop-shadow(0 0 28px #FFC107);}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        @keyframes pop-in{0%{transform:scale(0.6);opacity:0;}70%{transform:scale(1.05);}100%{transform:scale(1);opacity:1;}}
        @keyframes confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
        @keyframes drawer-up{0%{transform:translateY(100%);}100%{transform:translateY(0);}}
      `}</style>
    </div>
  );
}
