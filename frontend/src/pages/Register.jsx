import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { hashPasswordForTransmission, validatePasswordStrength, passwordStrengthScore } from '../services/crypto';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const score = passwordStrengthScore(form.password);
  const pwErrors = form.password ? validatePasswordStrength(form.password) : [];

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (pwErrors.length > 0) {
      setError('Password does not meet requirements');
      return;
    }
    setLoading(true);
    try {
      const clientPasswordHash = await hashPasswordForTransmission(form.password, form.email);
      const { data } = await authApi.register({
        username: form.username,
        email: form.email,
        clientPasswordHash,
      });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Vault created! Welcome to SecureVault.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.grid} />
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Shield size={28} color="#06b6d4" /></div>
          <span style={styles.logoText}>SecureVault</span>
        </div>

        <h1 style={styles.title}>Create your vault</h1>
        <p style={styles.subtitle}>Your passwords, protected by zero-knowledge encryption</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={15} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <Field label="Username" name="username" value={form.username} onChange={handleChange}
              placeholder="yourname" icon={<User size={16} style={styles.icon} />} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" icon={<Mail size={16} style={styles.icon} />} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Master Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.icon} />
              <input
                name="password" type={showPw ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="Create a strong password"
                style={{ ...styles.input, paddingRight: '44px' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {form.password && (
              <div style={styles.strength}>
                <div style={styles.bars}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{
                      ...styles.bar,
                      background: i < score ? STRENGTH_COLORS[score] : 'var(--border)',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: STRENGTH_COLORS[score] }}>
                  {STRENGTH_LABELS[score]}
                </span>
              </div>
            )}

            {pwErrors.length > 0 && (
              <ul style={styles.reqList}>
                {pwErrors.map(e => (
                  <li key={e} style={styles.reqItem}>
                    <AlertCircle size={11} color="#f59e0b" />{e}
                  </li>
                ))}
              </ul>
            )}
            {form.password && pwErrors.length === 0 && (
              <div style={styles.reqOk}>
                <CheckCircle size={12} color="#10b981" />
                <span>Password meets all requirements</span>
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.icon} />
              <input
                name="confirm" type="password"
                value={form.confirm} onChange={handleChange}
                placeholder="Repeat your password"
                style={{
                  ...styles.input,
                  borderColor: form.confirm && form.confirm !== form.password
                    ? 'rgba(239,68,68,0.5)' : undefined,
                }}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <span style={styles.spinner} /> : 'Create Vault'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have a vault?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

        <div style={styles.zeroKnowledge}>
          <Lock size={12} color="#64748b" />
          <span>Your master password never leaves your device</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, icon }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrap}>
        {icon}
        <input name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} style={styles.input} autoComplete="off" />
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px',
    position: 'relative', overflow: 'hidden', background: 'var(--bg)',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb1: {
    position: 'absolute', top: '-10%', right: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', left: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(30,45,71,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,71,0.3) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  },
  card: {
    position: 'relative', width: '100%', maxWidth: '500px',
    background: 'rgba(13,20,36,0.9)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '40px', backdropFilter: 'blur(20px)',
    boxShadow: '0 0 0 1px rgba(139,92,246,0.05), 0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  logoIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: '20px', fontWeight: '700',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  title: { fontSize: '26px', fontWeight: '700', color: 'var(--text)', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '10px 14px',
    color: '#fca5a5', fontSize: '13px', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-dim)' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '14px', color: 'var(--text-muted)', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 14px 11px 40px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: '12px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  strength: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  bars: { display: 'flex', gap: '4px', flex: 1 },
  bar: { height: '4px', flex: 1, borderRadius: '2px', transition: 'background 0.3s' },
  reqList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' },
  reqItem: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#fbbf24',
  },
  reqOk: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#10b981',
  },
  submitBtn: {
    marginTop: '4px', padding: '13px',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '46px',
  },
  spinner: {
    width: '18px', height: '18px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
  switchText: { marginTop: '20px', fontSize: '14px', color: 'var(--text-dim)', textAlign: 'center' },
  link: { color: 'var(--cyan)', textDecoration: 'none', fontWeight: '500' },
  zeroKnowledge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)',
  },
};
