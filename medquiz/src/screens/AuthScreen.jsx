import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, useAuth } from "../hooks/useAuth";

export default function AuthScreen() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [mode,    setMode]    = useState("login");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user]);

  const handleSubmit = async () => {
    setError(""); setMsg("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: pass,
          options: { data: { username: name || email.split("@")[0] } },
        });
        if (error) throw error;
        if (data.session) {
          navigate("/", { replace: true });
        } else {
          setMsg("Account created! Check your email to confirm, then sign in.");
          setMode("login"); setPass("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(), password: pass,
        });
        if (error) throw error;
        if (data.session) navigate("/", { replace: true });
      }
    } catch (e) {
      const m = e.message ?? "";
      if      (m.includes("Email not confirmed"))       setError("Confirm your email first (check spam too).");
      else if (m.includes("Invalid login credentials")) setError("Wrong email or password.");
      else if (m.includes("User already registered"))   { setError("Already registered — sign in instead."); setMode("login"); }
      else                                              setError(m || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await supabase.auth.signInAnonymously();
      if (data?.session) { navigate("/", { replace: true }); return; }
    } catch {}

    try {
      const stored = localStorage.getItem("mq_guest");
      if (stored) {
        const { e, p } = JSON.parse(stored);
        const { data } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (data?.session) { navigate("/", { replace: true }); setLoading(false); return; }
      }
      const e = `guest_${Date.now()}@mq.local`;
      const p = `Gg${Math.random().toString(36).slice(2)}1!`;
      localStorage.setItem("mq_guest", JSON.stringify({ e, p }));
      const { data, error } = await supabase.auth.signUp({ email: e, password: p, options:{ data:{ username:"Guest" } } });
      if (error) throw error;
      if (data?.session) { navigate("/", { replace: true }); return; }
    } catch (err) {
      setError("Guest failed: " + (err.message ?? "unknown"));
    } finally { setLoading(false); }
  };

  const inp = {
    width:"100%", backgroundColor:"#0d1117", border:"3px solid #2D3748",
    borderRadius:"14px", padding:"15px 16px", color:"#F9FAFB",
    fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:"15px",
    outline:"none", boxSizing:"border-box", boxShadow:"0 4px 0 0 #0a0e1a",
  };
  const dn = e => { e.currentTarget.style.transform="translateY(5px)"; e.currentTarget.style.boxShadow="none"; };
  const up = e => { e.currentTarget.style.transform=""; };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#0a0e1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 30% 40%, rgba(109,40,217,0.3) 0%, transparent 60%), #0a0e1a" }}/>
      
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"400px" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ width:"64px", height:"64px", backgroundColor:"#6D28D9", border:"4px solid #FFC107", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", margin:"0 auto 14px", boxShadow:"0 6px 0 0 #2E1065" }}>🧬</div>
          <h1 style={{ fontFamily:"'Press Start 2P',monospace", color:"#FFC107", fontSize:"clamp(13px,4vw,17px)", lineHeight:1.7 }}>MED QUEST</h1>
          <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#6B7280", fontSize:"13px", marginTop:"6px" }}>Master medicine. One question at a time.</p>
        </div>

        {/* Main card */}
        <div style={{ backgroundColor:"#111827", border:"3px solid #2D3748", borderRadius:"20px", padding:"24px 20px", boxShadow:"0 8px 0 0 #0a0e1a" }}>
          
          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:"22px", backgroundColor:"#0d1117", borderRadius:"12px", padding:"4px", gap:"4px" }}>
            {[{k:"login",l:"SIGN IN"},{k:"signup",l:"SIGN UP"}].map(({k,l})=>(
              <button key={k} onClick={()=>{setMode(k);setError("");setMsg("");}}
                style={{ flex:1, padding:"10px 8px", borderRadius:"9px", border:"none", cursor:"pointer", backgroundColor:mode===k?"#6D28D9":"transparent", color:mode===k?"#F9FAFB":"#6B7280", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", boxShadow:mode===k?"0 3px 0 0 #2E1065":"none" }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {mode==="signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Display name (optional)" style={inp}/>}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" style={inp} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}}/>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password (min 6 chars)" style={inp} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}}/>
          </div>

          {error && <div style={{ marginTop:"12px", backgroundColor:"#450a0a", border:"2px solid #EF4444", borderRadius:"10px", padding:"10px 14px" }}><p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#EF4444", fontSize:"13px" }}>⚠️ {error}</p></div>}
          {msg   && <div style={{ marginTop:"12px", backgroundColor:"#052e16", border:"2px solid #22C55E", borderRadius:"10px", padding:"10px 14px" }}><p style={{ fontFamily:"Nunito,sans-serif", fontWeight:700, color:"#22C55E", fontSize:"13px" }}>{msg}</p></div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:"100%", marginTop:"18px", backgroundColor:loading?"#374151":"#FFC107", border:"3px solid #111827", borderRadius:"14px", padding:"16px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 5px 0 0 #92610A", fontFamily:"'Press Start 2P',monospace", fontSize:"10px", color:"#111827", minHeight:"56px" }}
            onMouseDown={dn} onMouseUp={up} onTouchStart={dn} onTouchEnd={up}>
            {loading ? "..." : mode==="login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
          </button>

          <button onClick={handleGuest} disabled={loading}
            style={{ width:"100%", marginTop:"8px", backgroundColor:"transparent", border:"2px solid #2D3748", borderRadius:"14px", padding:"13px", cursor:"pointer", fontFamily:"Nunito,sans-serif", fontWeight:800, fontSize:"13px", color:"#6B7280", minHeight:"48px" }}>
            Continue as Guest (no save)
          </button>
        </div>
      </div>
    </div>
  );
}