import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useProgressStore from "../store/useProgressStore";
import { useAuth } from "../hooks/useAuth";

/* ── Dev + Account Panel ─────────────────────────────────────── */
function AccountPanel({ onClose }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { hearts, xp, streak } = useProgressStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [tab, setTab] = useState("account"); // "account" | "dev"

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      useProgressStore.getState().resetProgress();
      onClose();
      navigate("/auth", { replace: true });
    } catch (e) {
      console.error("Logout error:", e);
      setLoggingOut(false);
    }
  };

  const devBtn = (label, onClick, color = "#6D28D9", shadow = "#2E1065") => (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "14px 8px",
        backgroundColor: color, border: "3px solid #0a0e1a",
        borderRadius: "12px", boxShadow: `0 4px 0 0 ${shadow}`,
        fontFamily: "'Press Start 2P', monospace", fontSize: "7px",
        color: "#fff", cursor: "pointer", minHeight: "48px",
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerDown={e => { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = "none"; }}
      onPointerUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 0 0 ${shadow}`; }}
      onPointerLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 0 0 ${shadow}`; }}
    >{label}</button>
  );

  const isGuest = user?.email?.includes("@mq.local") || user?.is_anonymous;

  return (
    /* Backdrop */
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "12px" }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "440px",
          backgroundColor: "#0d1117",
          border: "3px solid #2D3748",
          borderRadius: "20px",
          padding: "0 0 calc(16px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.5)",
          animation: "sheet-up 0.3s cubic-bezier(0.34,1.2,0.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", backgroundColor: "#374151", borderRadius: "9999px" }}/>
        </div>

        {/* Tab strip */}
        <div style={{ display: "flex", gap: "0", margin: "8px 16px 0", backgroundColor: "#111827", borderRadius: "12px", padding: "4px" }}>
          {[{k:"account",l:"👤 ACCOUNT"},{k:"dev",l:"🛠️ DEV"}].map(({k,l}) => (
            <button key={k} onClick={()=>setTab(k)} style={{ flex:1, padding:"10px 6px", borderRadius:"9px", border:"none", cursor:"pointer", backgroundColor:tab===k?"#6D28D9":"transparent", color:tab===k?"#F9FAFB":"#6B7280", fontFamily:"'Press Start 2P',monospace", fontSize:"7px", transition:"all 0.2s", minHeight:"40px", boxShadow:tab===k?"0 3px 0 0 #2E1065":"none" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 16px 0" }}>

          {/* ── ACCOUNT TAB ── */}
          {tab === "account" && (
            <div>
              {/* User info */}
              <div style={{ backgroundColor: "#111827", border: "2px solid #2D3748", borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", backgroundColor: "#6D28D9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                    {isGuest ? "👤" : "🧬"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "Nunito,sans-serif", fontWeight: 800, color: "#F9FAFB", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isGuest ? "Guest User" : (user?.user_metadata?.username || user?.email?.split("@")[0] || "Medic")}
                    </p>
                    <p style={{ fontFamily: "Nunito,sans-serif", fontWeight: 700, color: "#6B7280", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isGuest ? "Progress not saved" : user?.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { icon: "⚡", val: xp >= 1000 ? `${(xp/1000).toFixed(1)}K` : xp, label: "XP", color: "#FFC107" },
                    { icon: "🔥", val: streak, label: "Streak", color: "#F97316" },
                    { icon: "❤️", val: `${hearts}/5`, label: "Hearts", color: "#EF4444" },
                  ].map(({ icon, val, label, color }) => (
                    <div key={label} style={{ backgroundColor: "#0d1117", borderRadius: "10px", padding: "10px 6px", textAlign: "center", border: `2px solid ${color}20` }}>
                      <p style={{ fontSize: "18px", marginBottom: "3px" }}>{icon}</p>
                      <p style={{ fontFamily: "'Press Start 2P',monospace", color, fontSize: "9px", marginBottom: "2px" }}>{val}</p>
                      <p style={{ fontFamily: "Nunito,sans-serif", color: "#6B7280", fontSize: "9px" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress link */}
              <button
                onClick={() => { onClose(); navigate("/progress"); }}
                style={{ width: "100%", backgroundColor: "#111827", border: "3px solid #374151", borderRadius: "14px", padding: "14px 16px", cursor: "pointer", boxShadow: "0 4px 0 0 #0a0e1a", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", minHeight: "52px", WebkitTapHighlightColor: "transparent" }}
                onPointerDown={e=>{e.currentTarget.style.transform="translateY(4px)";e.currentTarget.style.boxShadow="none";}}
                onPointerUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 0 0 #0a0e1a";}}
                onPointerLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 0 0 #0a0e1a";}}
              >
                <span style={{ fontFamily: "'Press Start 2P',monospace", color: "#F9FAFB", fontSize: "8px" }}>📊 VIEW FULL STATS</span>
                <span style={{ color: "#6B7280", fontSize: "14px" }}>→</span>
              </button>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{ width: "100%", backgroundColor: loggingOut ? "#1F2937" : "#450a0a", border: "3px solid #EF4444", borderRadius: "14px", padding: "15px 16px", cursor: loggingOut ? "not-allowed" : "pointer", boxShadow: loggingOut ? "none" : "0 4px 0 0 #7F1D1D", fontFamily: "'Press Start 2P',monospace", fontSize: "9px", color: "#EF4444", minHeight: "52px", WebkitTapHighlightColor: "transparent" }}
                onPointerDown={e=>{if(!loggingOut){e.currentTarget.style.transform="translateY(4px)";e.currentTarget.style.boxShadow="none";}}}
                onPointerUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 0 0 #7F1D1D";}}
                onPointerLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 0 0 #7F1D1D";}}
              >
                {loggingOut ? "SIGNING OUT..." : "🚪 SIGN OUT"}
              </button>
            </div>
          )}

          {/* ── DEV TAB ── */}
          {tab === "dev" && (
            <div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", color: "#F97316", fontSize: "7px", marginBottom: "14px", textAlign: "center" }}>REMOVE IN PRODUCTION</p>

              <p style={{ fontFamily: "'Press Start 2P',monospace", color: "#EF4444", fontSize: "7px", marginBottom: "8px" }}>HEARTS</p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {devBtn("+1 ❤️", () => useProgressStore.getState().gainHeart(), "#EF4444", "#7F1D1D")}
                {devBtn("+5 ❤️", () => { for(let i=0;i<5;i++) useProgressStore.getState().gainHeart(); }, "#EF4444", "#7F1D1D")}
                {devBtn("FULL ❤️", () => useProgressStore.setState({ hearts: 5 }), "#22C55E", "#14532D")}
              </div>

              <p style={{ fontFamily: "'Press Start 2P',monospace", color: "#FFC107", fontSize: "7px", marginBottom: "8px" }}>XP</p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {devBtn("+100", () => useProgressStore.getState().addXp(100), "#F59E0B", "#92610A")}
                {devBtn("+1K",  () => useProgressStore.getState().addXp(1000), "#F59E0B", "#92610A")}
                {devBtn("+10K", () => useProgressStore.getState().addXp(10000), "#F59E0B", "#92610A")}
              </div>

              <p style={{ fontFamily: "'Press Start 2P',monospace", color: "#F97316", fontSize: "7px", marginBottom: "8px" }}>STREAK</p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {devBtn("+1 🔥", () => useProgressStore.getState().incrementStreak(), "#F97316", "#7C2D12")}
                {devBtn("30 🔥", () => useProgressStore.setState({ streak: 30 }), "#F97316", "#7C2D12")}
                {devBtn("RESET", () => useProgressStore.setState({ streak: 0 }), "#374151", "#111827")}
              </div>

              <button
                onClick={() => { if (confirm("Reset ALL progress? This cannot be undone.")) { useProgressStore.getState().resetProgress(); onClose(); }}}
                style={{ width: "100%", padding: "14px", backgroundColor: "#1F2937", border: "3px solid #EF4444", borderRadius: "12px", fontFamily: "'Press Start 2P',monospace", fontSize: "7px", color: "#EF4444", cursor: "pointer", minHeight: "48px" }}
              >⚠️ RESET ALL PROGRESS</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Logo button (tap 3x to open panel) ─────────────────────── */
function LogoButton({ onOpen }) {
  const [taps,  setTaps]  = useState(0);
  const [flash, setFlash] = useState(false);

  const handleTap = () => {
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) {
      setTaps(0);
      setFlash(true);
      setTimeout(() => setFlash(false), 350);
      onOpen();
    }
    // Reset tap count after 1.5s of inactivity
    clearTimeout(window._logoTapTimer);
    window._logoTapTimer = setTimeout(() => setTaps(0), 1500);
  };

  return (
    <button
      onClick={handleTap}
      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "8px 4px", WebkitTapHighlightColor: "transparent", minHeight: "44px" }}
    >
      <div style={{ width: "34px", height: "34px", backgroundColor: flash ? "#FFC107" : "#6D28D9", borderRadius: "10px", border: `3px solid ${flash ? "#FFC107" : "#8B5CF6"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", transition: "all 0.2s", boxShadow: `0 3px 0 0 ${flash ? "#92610A" : "#2E1065"}`, flexShrink: 0 }}>🧬</div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontFamily: "'Press Start 2P',monospace", color: "#FFC107", fontSize: "6px" }}>MED</span>
        <span style={{ fontFamily: "'Press Start 2P',monospace", color: "#FFC107", fontSize: "6px" }}>QUEST</span>
      </div>
    </button>
  );
}

/* ── Main HeaderHUD ──────────────────────────────────────────── */
export default function HeaderHUD() {
  const navigate    = useNavigate();
  const xp          = useProgressStore(s => s.xp);
  const hearts      = useProgressStore(s => s.hearts);
  const streak      = useProgressStore(s => s.streak);
  const { signOut } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        width: "100%",
        backgroundColor: "rgba(10,14,26,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "2px solid #1F2937",
        padding: "0 12px",
        height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxSizing: "border-box",
        /* Safe area for notches */
        paddingLeft: "max(12px, env(safe-area-inset-left))",
        paddingRight: "max(12px, env(safe-area-inset-right))",
      }}>
        {/* Logo — tap 3x opens panel */}
        <LogoButton onOpen={() => setPanelOpen(true)} />

        {/* Right stats + account button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

          {/* Streak */}
          {streak >= 2 && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px", backgroundColor: "#1a1000", border: "2px solid #F9731625", borderRadius: "8px", padding: "4px 8px", minHeight: "32px" }}>
              <span style={{ fontSize: "12px" }}>🔥</span>
              <span style={{ fontFamily: "'Press Start 2P',monospace", color: "#F97316", fontSize: "7px" }}>{streak}</span>
            </div>
          )}

          {/* Hearts */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "#1a0505", border: "2px solid #EF444425", borderRadius: "8px", padding: "5px 8px", minHeight: "32px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: "11px", opacity: i < hearts ? 1 : 0.15, transition: "opacity 0.3s" }}>❤️</span>
            ))}
          </div>

          {/* XP — tapping goes to progress */}
          <button
            onClick={() => navigate("/progress")}
            style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#050514", border: "2px solid #FFC10725", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", minHeight: "32px", WebkitTapHighlightColor: "transparent" }}
          >
            <span style={{ fontSize: "11px" }}>⚡</span>
            <span style={{ fontFamily: "'Press Start 2P',monospace", color: "#FFC107", fontSize: "7px" }}>
              {xp >= 1000 ? `${(xp/1000).toFixed(1)}K` : xp}
            </span>
          </button>

          {/* Account avatar button */}
          <button
            onClick={() => setPanelOpen(true)}
            style={{ width: "36px", height: "36px", backgroundColor: "#1a2235", border: "2px solid #374151", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
            aria-label="Account"
          >
            👤
          </button>
        </div>
      </header>

      {panelOpen && <AccountPanel onClose={() => setPanelOpen(false)} />}

      <style>{`
        @keyframes sheet-up {
          0%   { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
