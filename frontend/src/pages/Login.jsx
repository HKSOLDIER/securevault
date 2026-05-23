import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { hashPasswordForTransmission } from '../services/crypto';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const clientPasswordHash = await hashPasswordForTransmission(form.password, form.identifier);
      const { data } = await authApi.login({ identifier: form.identifier, clientPasswordHash });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
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
          <div style={styles.logoIcon}>
            <Shield size={28} color="#06b6d4" />
          </div>
          <span style={styles.logoText}>SecureVault</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to access your vault</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username or Email</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="username"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Master Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={styles.eyeBtn}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          No account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        <div style={styles.zeroKnowledge}>
          <Lock size={12} color="#64748b" />
          <span>End-to-end encrypted · Zero-knowledge · Your data, only yours</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', right: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(30,45,71,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,71,0.3) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  },
  card: {
    position: 'relative',
    width: '100%', maxWidth: '440px',
    background: 'rgba(13,20,36,0.9)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 0 1px rgba(6,182,212,0.05), 0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '28px',
  },
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
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-dim)' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute', left: '14px', color: 'var(--text-muted)', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '11px 14px 11px 40px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: '12px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    marginTop: '4px',
    padding: '13px',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s, transform 0.1s',
    minHeight: '46px',
  },
  spinner: {
    width: '18px', height: '18px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  switchText: { marginTop: '20px', fontSize: '14px', color: 'var(--text-dim)', textAlign: 'center' },
  link: { color: 'var(--cyan)', textDecoration: 'none', fontWeight: '500' },
  zeroKnowledge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)',
  },
};
