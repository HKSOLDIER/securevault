import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowLeft, Users, Key, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Search, RefreshCw, Lock
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');

  // Guard: only ADMIN can access
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied: Admin only');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes] = await Promise.all([
        api.get('/admin/users'),
      ]);
      setUsers(usersRes.data || []);
      // Compute stats from user list
      const u = usersRes.data || [];
      setStats({
        total: u.length,
        active: u.filter(x => x.isActive).length,
        locked: u.filter(x => x.lockedUntil && new Date(x.lockedUntil) > new Date()).length,
        admins: u.filter(x => x.role === 'ADMIN').length,
      });
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access denied');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading admin panel…</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.bg}><div style={styles.orb1} /><div style={styles.orb2} /></div>

      <div style={styles.container}>
        <div style={styles.topNav}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <ArrowLeft size={16} /><span>Back to Vault</span>
          </button>
          <div style={styles.adminBadge}>
            <Shield size={14} color="#8b5cf6" /><span>Admin Panel</span>
          </div>
        </div>

        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage users and monitor vault activity</p>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <StatCard icon={<Users size={20} />} label="Total Users" value={stats.total} color="#06b6d4" />
            <StatCard icon={<CheckCircle size={20} />} label="Active" value={stats.active} color="#10b981" />
            <StatCard icon={<Lock size={20} />} label="Locked Out" value={stats.locked} color="#ef4444" />
            <StatCard icon={<Shield size={20} />} label="Admins" value={stats.admins} color="#8b5cf6" />
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {['users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t === 'users' ? <><Users size={15} /><span>Users</span></> : null}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={styles.searchWrap}>
            <Search size={14} style={styles.searchIcon} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users…" style={styles.searchInput} />
          </div>
          <button onClick={fetchData} style={styles.refreshBtn}>
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Users Table */}
        <div style={styles.tableCard}>
          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={36} color="var(--border2)" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No users found</p>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Email Verified', 'Last Login', 'Joined'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => {
                    const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                    return (
                      <tr key={u.id} style={{ ...styles.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.mini_avatar}>{(u.username?.[0] || 'U').toUpperCase()}</div>
                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>{u.username}</span>
                          </div>
                        </td>
                        <td style={styles.td}><span style={{ color: 'var(--text-dim)' }}>{u.email}</span></td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.role === 'ADMIN' ? 'rgba(139,92,246,0.1)' : 'rgba(6,182,212,0.1)',
                            color: u.role === 'ADMIN' ? '#a78bfa' : '#06b6d4',
                            border: u.role === 'ADMIN' ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(6,182,212,0.2)',
                          }}>{u.role}</span>
                        </td>
                        <td style={styles.td}>
                          {isLocked ? (
                            <span style={{ ...styles.badge, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <Lock size={11} /> Locked
                            </span>
                          ) : u.isActive ? (
                            <span style={{ ...styles.badge, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                              <CheckCircle size={11} /> Active
                            </span>
                          ) : (
                            <span style={{ ...styles.badge, background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}>
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {u.emailVerified
                            ? <CheckCircle size={16} color="#10b981" />
                            : <AlertTriangle size={16} color="#f59e0b" />}
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: `${color}15`, border: `1px solid ${color}30`, color }}>
        {icon}
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh', background: 'var(--bg)',
    position: 'relative', padding: '32px 24px',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb1: {
    position: 'absolute', top: '-10%', right: '-5%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', left: '-5%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
  },
  container: { position: 'relative', maxWidth: '1100px', margin: '0 auto' },
  topNav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-dim)', fontSize: '14px', fontFamily: 'inherit',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px', borderRadius: '20px',
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
    color: '#a78bfa', fontSize: '13px', fontWeight: '500',
  },
  title: { fontSize: '26px', fontWeight: '700', color: 'var(--text)', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px', marginBottom: '28px',
  },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
  },
  statIcon: {
    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: '24px', fontWeight: '800', color: 'var(--text)' },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  tabs: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'none', cursor: 'pointer', color: 'var(--text-dim)',
    fontSize: '13px', fontFamily: 'inherit', fontWeight: '500',
  },
  tabActive: {
    background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)',
    borderColor: 'rgba(6,182,212,0.3)',
  },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '10px', color: 'var(--text-muted)', pointerEvents: 'none' },
  searchInput: {
    padding: '8px 12px 8px 32px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
  },
  refreshBtn: {
    padding: '8px 10px', background: 'none', border: '1px solid var(--border)',
    borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center',
  },
  tableCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '16px', overflow: 'hidden',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
  },
  tr: { borderBottom: '1px solid rgba(30,45,71,0.5)' },
  td: { padding: '12px 16px', fontSize: '14px', color: 'var(--text-dim)' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  mini_avatar: {
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', color: '#fff',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '60px 24px', textAlign: 'center',
  },
  centered: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh',
  },
  spinner: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid var(--border)', borderTopColor: 'var(--cyan)',
    animation: 'spin 0.8s linear infinite',
  },
};
