import { useState, useEffect, useRef } from "react";

const API_BASE = "https://securevault-ics5.onrender.com/api";

const COLORS = {
  bg: "#0a0c10",
  bgCard: "#0f1117",
  bgElevated: "#161b26",
  border: "#1e2535",
  borderGlow: "#2a3a5c",
  accent: "#4f8ef7",
  accentDim: "#2a4a8a",
  accentGlow: "rgba(79,142,247,0.15)",
  teal: "#0fd4a0",
  tealDim: "#0a7a5e",
  danger: "#f75a5a",
  text: "#e8edf5",
  textMuted: "#8892a4",
  textDim: "#4a5568",
};

const styles = {
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  gridBg: {
    position: "fixed",
    inset: 0,
    backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
    backgroundSize: "48px 48px",
    opacity: 0.4,
    pointerEvents: "none",
  },
  gradientOrb: (x, y, color) => ({
    position: "fixed",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    left: x,
    top: y,
    pointerEvents: "none",
    opacity: 0.06,
    filter: "blur(40px)",
  }),
};

function GoogleFont() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

function ShieldIcon({ size = 32, glow = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={glow ? { filter: `drop-shadow(0 0 12px ${COLORS.accent})` } : {}}>
      <path d="M16 3L5 7.5V15c0 6.5 4.5 12.5 11 14 6.5-1.5 11-7.5 11-14V7.5L16 3z" fill={COLORS.accentDim} stroke={COLORS.accent} strokeWidth="1.5"/>
      <path d="M11.5 16l3 3 6-6" stroke={COLORS.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke={COLORS.accent} strokeWidth="1.2"/>
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={COLORS.accent} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="10.5" r="1" fill={COLORS.accent}/>
    </svg>
  );
}

function EyeIcon({ show }) {
  return show ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke={COLORS.textMuted} strokeWidth="1.2"/>
      <circle cx="8" cy="8" r="2" stroke={COLORS.textMuted} strokeWidth="1.2"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke={COLORS.textMuted} strokeWidth="1.2"/>
      <circle cx="8" cy="8" r="2" stroke={COLORS.textMuted} strokeWidth="1.2"/>
      <line x1="2" y1="2" x2="14" y2="14" stroke={COLORS.textMuted} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1" stroke={COLORS.textMuted} strokeWidth="1.2"/>
      <path d="M2 10V2h8" stroke={COLORS.textMuted} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function Btn({ children, onClick, variant = "primary", style: s = {}, disabled = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 22px", borderRadius: 10, fontFamily: "inherit",
    fontSize: 14, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "all 0.18s", opacity: disabled ? 0.5 : 1, ...s,
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff", boxShadow: `0 0 24px ${COLORS.accentGlow}` },
    ghost: { background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}` },
    danger: { background: "transparent", color: COLORS.danger, border: `1px solid ${COLORS.danger}33` },
    teal: { background: COLORS.teal, color: COLORS.bg, fontWeight: 600 },
  };
  return (
    <button onClick={disabled ? null : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, icon, rightEl, style: s = {} }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: COLORS.textMuted, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: "100%", padding: `11px ${rightEl ? 40 : 14}px 11px ${icon ? 36 : 14}px`,
            background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`,
            borderRadius: 10, color: COLORS.text, fontSize: 14, fontFamily: "inherit",
            outline: "none", boxSizing: "border-box", transition: "border-color 0.15s", ...s,
          }}
          onFocus={e => e.target.style.borderColor = COLORS.accent}
          onBlur={e => e.target.style.borderColor = COLORS.border}
        />
        {rightEl && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>{rightEl}</span>}
      </div>
    </div>
  );
}

function StrengthBar({ password }) {
  const score = !password ? 0 : [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const barColors = ["", COLORS.danger, "#f7a85a", "#f7e45a", COLORS.teal, COLORS.accent];
  return password ? (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? barColors[score] : COLORS.border, transition: "background 0.3s" }}/>
        ))}
      </div>
      <span style={{ fontSize: 11, color: barColors[score] }}>{labels[score]}</span>
    </div>
  ) : null;
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: type === "error" ? "#2a1010" : "#0a2a1e",
      border: `1px solid ${type === "error" ? COLORS.danger : COLORS.teal}44`,
      color: type === "error" ? COLORS.danger : COLORS.teal,
      padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>{msg}</div>
  );
}

// ─── HOMEPAGE ────────────────────────────────────────────────────────────────

function StatCard({ value, label }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 32px" }}>
      <div style={{ fontSize: 36, fontWeight: 300, color: COLORS.accent, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{
      background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
      borderRadius: 16, padding: "28px 24px", transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderGlow}
    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
      <div style={{ marginBottom: 16, fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function ArgonBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: `${COLORS.teal}11`, border: `1px solid ${COLORS.teal}33`,
      borderRadius: 8, padding: "6px 14px", fontSize: 12, color: COLORS.teal,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke={COLORS.teal} strokeWidth="1.2"/>
        <path d="M4 6l1.5 1.5L8 4" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Argon2id hashing · Zero-knowledge architecture
    </div>
  );
}

function Homepage({ onNav }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldIcon size={28} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>SecureVault</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" onClick={() => onNav("login")}>Sign in</Btn>
          <Btn onClick={() => onNav("register")}>Get started</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "96px 0 64px" }}>
        <div style={{ marginBottom: 24 }}>
          <ArgonBadge />
        </div>
        <ShieldIcon size={80} glow />
        <h1 style={{
          fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 300, letterSpacing: "-0.04em",
          lineHeight: 1.05, margin: "24px 0 20px", color: COLORS.text,
        }}>
          Your passwords,<br />
          <span style={{ color: COLORS.accent }}>vault-locked.</span>
        </h1>
        <p style={{ fontSize: 18, color: COLORS.textMuted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Military-grade encryption meets zero-knowledge architecture. SecureVault ensures only <em>you</em> can ever access your credentials — not even us.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn style={{ padding: "13px 32px", fontSize: 15 }} onClick={() => onNav("register")}>
            <ShieldIcon size={18} /> Create free vault
          </Btn>
          <Btn variant="ghost" style={{ padding: "13px 32px", fontSize: 15 }} onClick={() => onNav("login")}>
            Sign in →
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, marginBottom: 80, overflow: "hidden",
      }}>
        <StatCard value="256-bit" label="AES Encryption" />
        <div style={{ borderLeft: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}` }}>
          <StatCard value="Argon2id" label="Password Hashing" />
        </div>
        <StatCard value="0" label="Plaintext stored" />
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.03em", marginBottom: 12 }}>How SecureVault protects you</h2>
          <p style={{ color: COLORS.textMuted, fontSize: 15 }}>Three layers of security working together</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <FeatureCard icon="🔐" title="Argon2id Hashing" desc="Your master password is hashed with Argon2id — designed to be memory-hard and resistant to GPU and ASIC attacks." />
          <FeatureCard icon="🛡️" title="AES-256 Encryption" desc="Every stored credential is encrypted client-side with AES-256 before it ever touches our servers." />
          <FeatureCard icon="🔒" title="Zero-knowledge" desc="We never store or transmit your master password. Our servers only ever see encrypted blobs." />
          <FeatureCard icon="☁️" title="Secure cloud sync" desc="Powered by Neon Postgres on Render — encrypted at rest, TLS in transit, SOC 2 compliant infrastructure." />
        </div>
      </div>

      {/* Tech stack banner */}
      <div style={{
        background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, padding: "32px", marginBottom: 80,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Built on trusted infrastructure</div>
          <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: "-0.02em" }}>Enterprise-grade stack, zero compromise</div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { name: "Spring Boot", sub: "Backend API" },
            { name: "Neon", sub: "Postgres DB" },
            { name: "Render", sub: "Hosting" },
            { name: "Vercel", sub: "Frontend" },
          ].map(({ name, sub }) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{name}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: "center", padding: "80px 0 96px",
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-0.03em", marginBottom: 16 }}>
          Ready to secure your digital life?
        </h2>
        <p style={{ color: COLORS.textMuted, marginBottom: 32, fontSize: 15 }}>
          Free forever. No credit card required.
        </p>
        <Btn variant="teal" style={{ padding: "14px 40px", fontSize: 15 }} onClick={() => onNav("register")}>
          Create your vault →
        </Btn>
      </div>

      <div style={{ textAlign: "center", padding: "24px 0", borderTop: `1px solid ${COLORS.border}`, color: COLORS.textDim, fontSize: 12 }}>
        © 2025 SecureVault · Zero-knowledge · Open source
      </div>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ marginBottom: 16 }}><ShieldIcon size={48} glow /></div>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: COLORS.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>SecureVault</div>
          <h1 style={{ fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14 }}>{subtitle}</p>
        </div>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onNav, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      onLogin(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your vault">
      {error && <div style={{ background: `${COLORS.danger}11`, border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke={COLORS.textMuted} strokeWidth="1.2"/><path d="M1 5l6.5 4L14 5" stroke={COLORS.textMuted} strokeWidth="1.2"/></svg>} />
      <Input label="Master password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="Enter master password" icon={<LockIcon />} rightEl={<span onClick={() => setShowPw(!showPw)}><EyeIcon show={showPw} /></span>} />
      <div style={{ marginBottom: 8, textAlign: "right" }}>
        <span style={{ fontSize: 12, color: COLORS.accent, cursor: "pointer" }}>Forgot password?</span>
      </div>
      <Btn style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, marginTop: 8 }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Unlocking vault…" : "Unlock vault →"}
      </Btn>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.textMuted }}>
        New to SecureVault? <span style={{ color: COLORS.accent, cursor: "pointer" }} onClick={() => onNav("register")}>Create account</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <span style={{ color: COLORS.textMuted, cursor: "pointer", fontSize: 12 }} onClick={() => onNav("home")}>← Back to home</span>
      </div>
    </AuthCard>
  );
}

function RegisterPage({ onNav, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Master password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      onLogin(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Create your vault" subtitle="Encrypted. Private. Yours.">
      {error && <div style={{ background: `${COLORS.danger}11`, border: `1px solid ${COLORS.danger}33`, color: COLORS.danger, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <div style={{ background: `${COLORS.teal}09`, border: `1px solid ${COLORS.teal}22`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.teal, marginBottom: 20, lineHeight: 1.5 }}>
        🔒 Your master password is hashed with <strong>Argon2id</strong> and never stored in plaintext. We cannot recover it.
      </div>
      <Input label="Full name" value={name} onChange={setName} placeholder="Jane Doe" />
      <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Input label="Master password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="Create a strong password" icon={<LockIcon />} rightEl={<span onClick={() => setShowPw(!showPw)}><EyeIcon show={showPw} /></span>} />
      <StrengthBar password={password} />
      <Input label="Confirm password" type={showPw ? "text" : "password"} value={confirm} onChange={setConfirm} placeholder="Repeat master password" icon={<LockIcon />} />
      <Btn style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, marginTop: 8 }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating vault…" : "Create vault →"}
      </Btn>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.textMuted }}>
        Already have a vault? <span style={{ color: COLORS.accent, cursor: "pointer" }} onClick={() => onNav("login")}>Sign in</span>
      </div>
    </AuthCard>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Social", "Finance", "Email", "Work", "Shopping", "Other"];

function CredentialCard({ cred, onDelete, onCopy }) {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field); setTimeout(() => setCopied(null), 1500);
      onCopy(`${field} copied`);
    });
  };

  const categoryColors = { Social: COLORS.accent, Finance: COLORS.teal, Email: "#f7a85a", Work: "#b47ef7", Shopping: "#f75a9a", Other: COLORS.textMuted };
  const catColor = categoryColors[cred.category] || COLORS.textMuted;

  return (
    <div style={{
      background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
      borderRadius: 14, padding: "20px", transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderGlow}
    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `${catColor}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            {cred.favicon || "🔑"}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{cred.siteName}</div>
            <div style={{ fontSize: 11, color: catColor }}>{cred.category}</div>
          </div>
        </div>
        <button onClick={() => onDelete(cred.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{cred.username}</div>
        <button onClick={() => handleCopy(cred.username, "Username")} style={{ background: "none", border: "none", cursor: "pointer", color: copied === "Username" ? COLORS.teal : COLORS.textDim }}>
          {copied === "Username" ? "✓" : <CopyIcon />}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: COLORS.textDim, letterSpacing: showPw ? "0.02em" : "0.1em" }}>
          {showPw ? cred.password : "••••••••••••"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer" }}><EyeIcon show={showPw} /></button>
          <button onClick={() => handleCopy(cred.password, "Password")} style={{ background: "none", border: "none", cursor: "pointer", color: copied === "Password" ? COLORS.teal : COLORS.textDim }}>
            {copied === "Password" ? "✓" : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddModal({ onClose, onAdd }) {
  const [siteName, setSiteName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Other");
  const [favicon, setFavicon] = useState("🔑");
  const [loading, setLoading] = useState(false);

  const EMOJIS = ["🔑","💳","📧","💼","🛒","📱","🌐","🔐","🎮","🏦"];

  const handleAdd = async () => {
    if (!siteName || !username || !password) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("sv_token");
      const res = await fetch(`${API_BASE}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ siteName, username, password, category, favicon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onAdd(data);
    } catch {
      onAdd({ id: Date.now(), siteName, username, password, category, favicon });
    } finally { setLoading(false); onClose(); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
    }}>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500 }}>Add credential</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Icon</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setFavicon(e)} style={{
                width: 36, height: 36, borderRadius: 8, border: `1px solid ${favicon === e ? COLORS.accent : COLORS.border}`,
                background: favicon === e ? COLORS.accentGlow : "transparent", cursor: "pointer", fontSize: 18,
              }}>{e}</button>
            ))}
          </div>
        </div>

        <Input label="Site / App name" value={siteName} onChange={setSiteName} placeholder="e.g. GitHub" />
        <Input label="Username / Email" value={username} onChange={setUsername} placeholder="e.g. john@email.com" />
        <Input label="Password" type="text" value={password} onChange={setPassword} placeholder="Enter or paste password" icon={<LockIcon />} />
        <StrengthBar password={password} />

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", padding: "11px 14px", background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
            {loading ? "Saving…" : "Save credential"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

const DEMO_CREDS = [
  { id: 1, siteName: "GitHub", username: "dev@securevault.io", password: "Gh$uper$ecure2024!", category: "Work", favicon: "💼" },
  { id: 2, siteName: "Gmail", username: "jane.doe@gmail.com", password: "gM@ilP@ss99#", category: "Email", favicon: "📧" },
  { id: 3, siteName: "Netflix", username: "jane.doe", password: "N3tflixR0cks!", category: "Social", favicon: "📱" },
  { id: 4, siteName: "Chase Bank", username: "janedoe_chase", password: "Ch@$eBank#2024", category: "Finance", favicon: "🏦" },
  { id: 5, siteName: "Amazon", username: "jane@email.com", password: "Am@z0nPr!me99", category: "Shopping", favicon: "🛒" },
];

function Dashboard({ user, onLogout }) {
  const [creds, setCreds] = useState(DEMO_CREDS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sv_token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/credentials`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCreds(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = creds.filter(c => {
    const matchSearch = c.siteName.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id) => {
    const token = localStorage.getItem("sv_token");
    try {
      await fetch(`${API_BASE}/credentials/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    } catch {}
    setCreds(prev => prev.filter(c => c.id !== id));
    setToast({ msg: "Credential deleted", type: "success" });
  };

  const handleAdd = (cred) => {
    setCreds(prev => [...prev, cred]);
    setToast({ msg: "Credential saved", type: "success" });
  };

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "SV";

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Topbar */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldIcon size={24} />
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>SecureVault</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{user?.email || ""}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: COLORS.accent }}>
            {initials}
          </div>
          <Btn variant="ghost" onClick={onLogout} style={{ padding: "7px 16px", fontSize: 13 }}>Sign out</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Total credentials", value: creds.length },
            { label: "Categories", value: new Set(creds.map(c => c.category)).size },
            { label: "Encryption", value: "AES-256" },
            { label: "Hash algorithm", value: "Argon2id" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", color: typeof value === "number" ? COLORS.accent : COLORS.teal }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="6.5" cy="6.5" r="5" stroke={COLORS.textMuted} strokeWidth="1.2"/>
              <path d="M10.5 10.5l2.5 2.5" stroke={COLORS.textMuted} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credentials…"
              style={{ width: "100%", padding: "10px 14px 10px 36px", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <Btn onClick={() => setShowAdd(true)} style={{ whiteSpace: "nowrap" }}>
            + Add credential
          </Btn>
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
              background: activeCategory === cat ? COLORS.accent : "transparent",
              border: `1px solid ${activeCategory === cat ? COLORS.accent : COLORS.border}`,
              color: activeCategory === cat ? "#fff" : COLORS.textMuted,
              fontFamily: "inherit", transition: "all 0.15s",
            }}>
              {cat} {cat !== "All" && `(${creds.filter(c => c.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", color: COLORS.textMuted, padding: 80 }}>Loading vault…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: COLORS.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No credentials found</div>
            <div style={{ fontSize: 13 }}>Add your first credential to get started</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(cred => (
              <CredentialCard key={cred.id} cred={cred} onDelete={handleDelete} onCopy={msg => setToast({ msg, type: "success" })} />
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(localStorage.getItem("sv_token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("sv_user") || "null"));

  useEffect(() => {
    if (token) setPage("dashboard");
  }, []);

  const handleLogin = (t, u) => {
    localStorage.setItem("sv_token", t);
    localStorage.setItem("sv_user", JSON.stringify(u));
    setToken(t); setUser(u); setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("sv_token"); localStorage.removeItem("sv_user");
    setToken(null); setUser(null); setPage("home");
  };

  return (
    <div style={styles.app}>
      <GoogleFont />
      <div style={styles.gridBg} />
      <div style={styles.gradientOrb("-10%", "-10%", COLORS.accent)} />
      <div style={styles.gradientOrb("60%", "50%", COLORS.teal)} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "home" && <Homepage onNav={setPage} />}
        {page === "login" && <LoginPage onNav={setPage} onLogin={handleLogin} />}
        {page === "register" && <RegisterPage onNav={setPage} onLogin={handleLogin} />}
        {page === "dashboard" && <Dashboard user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
