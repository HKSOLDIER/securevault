import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Calendar, Key, LogOut, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, clearAuth, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(({ data }) => { setProfile(data); updateUser(data); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refresh_token');
      if (rt) await authApi.logout(rt);
    } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const data = profile || user;

  return (
    <div style={styles.root}>
      <div style={styles.bg}>
        <div style={styles.orb1} /><div style={styles.orb2} />
      </div>

      <div style={styles.container}>
        <div style={styles.topNav}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <ArrowLeft size={16} /><span>Back to Vault</span>
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loadingWrap}>
              <div style={styles.spinner} />
            </div>
          ) : (
            <>
              <div style={styles.avatarSection}>
                <div style={styles.avatar}>
                  {(data?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div style={styles.avatarInfo}>
                  <h1 style={styles.username}>{data?.username}</h1>
                  <div style={styles.roleBadge}>
                    <Shield size={12} />
                    <span>{data?.role || 'USER'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.infoGrid}>
                <InfoRow icon={<Mail size={16} />} label="Email" value={data?.email} />
                <InfoRow icon={<User size={16} />} label="Username" value={data?.username} />
                <InfoRow icon={<Key size={16} />} label="Role" value={data?.role || 'USER'} />
                <InfoRow
                  icon={<CheckCircle size={16} />}
                  label="Email Verified"
                  value={data?.emailVerified ? 'Verified' : 'Not verified'}
                  valueStyle={{ color: data?.emailVerified ? '#10b981' : '#f59e0b' }}
                />
                {data?.lastLoginAt && (
                  <InfoRow
                    icon={<Clock size={16} />}
                    label="Last Login"
                    value={new Date(data.lastLoginAt).toLocaleString()}
                  />
                )}
                {data?.createdAt && (
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Member Since"
                    value={new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                )}
              </div>

              <div style={styles.securityBox}>
                <div style={styles.securityTitle}>
                  <Shield size={16} color="#06b6d4" />
                  <span>Security</span>
                </div>
                <p style={styles.securityText}>
                  Your master password is hashed client-side using Argon2id (64MB, 3 iterations) before transmission. It never leaves your device in plaintext. The server applies an additional Argon2id pass with a server-side pepper for defense-in-depth.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, valueStyle }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ ...styles.infoValue, ...valueStyle }}>{value || '—'}</div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh', background: 'var(--bg)',
    position: 'relative', display: 'flex',
    alignItems: 'flex-start', justifyContent: 'center', padding: '32px 24px',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', right: '-5%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
  },
  container: { position: 'relative', width: '100%', maxWidth: '560px' },
  topNav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-dim)', fontSize: '14px', fontFamily: 'inherit',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px', padding: '7px 14px',
    cursor: 'pointer', color: '#fca5a5', fontSize: '13px', fontFamily: 'inherit',
  },
  card: {
    background: 'rgba(13,20,36,0.9)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '32px', backdropFilter: 'blur(20px)',
  },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: '40px' },
  spinner: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid var(--border)', borderTopColor: 'var(--cyan)',
    animation: 'spin 0.8s linear infinite',
  },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '800', color: '#fff', flexShrink: 0,
  },
  avatarInfo: {},
  username: { fontSize: '22px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
    color: 'var(--cyan)', fontSize: '12px', fontWeight: '500',
  },
  divider: { height: '1px', background: 'var(--border)', margin: '0 0 24px' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '0' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid rgba(30,45,71,0.6)',
  },
  infoLabel: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500',
  },
  infoValue: { fontSize: '14px', color: 'var(--text)', fontWeight: '500' },
  securityBox: {
    marginTop: '24px', padding: '16px',
    background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
    borderRadius: '12px',
  },
  securityTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', fontWeight: '600', color: 'var(--cyan)', marginBottom: '8px',
  },
  securityText: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' },
};
