import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, Search, Trash2, Eye, EyeOff, Copy, ExternalLink,
  Star, LogOut, User, ChevronDown, Globe, Key, LayoutDashboard, Settings,
  Lock, Unlock, RefreshCw, Tag, X
} from 'lucide-react';
import { vaultApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Social', 'Work', 'Finance', 'Shopping', 'Entertainment', 'Other'];

function encryptData(text) {
  return btoa(unescape(encodeURIComponent(text)));
}
function decryptData(b64) {
  try { return decodeURIComponent(escape(atob(b64))); }
  catch { return '••••••••'; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showFav, setShowFav] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [revealedPw, setRevealedPw] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchEntries = useCallback(async () => {
    try {
      const { data } = await vaultApi.getEntries();
      setEntries(data);
    } catch {
      toast.error('Failed to load vault entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refresh_token');
      if (rt) await authApi.logout(rt);
    } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await vaultApi.deleteEntry(id);
      setEntries(es => es.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`, { icon: '📋' });
    });
  };

  const toggleReveal = (id) => {
    setRevealedPw(r => ({ ...r, [id]: !r[id] }));
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search ||
      e.siteName.toLowerCase().includes(search.toLowerCase()) ||
      (e.siteUrl || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || e.category === category;
    const matchFav = !showFav || e.isFavorite;
    return matchSearch && matchCat && matchFav;
  });

  const stats = {
    total: entries.length,
    favorites: entries.filter(e => e.isFavorite).length,
    categories: [...new Set(entries.map(e => e.category).filter(Boolean))].length,
  };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><Shield size={22} color="#06b6d4" /></div>
          <span style={styles.logoText}>SecureVault</span>
        </div>

        <nav style={styles.nav}>
          {[
            { icon: <LayoutDashboard size={18} />, label: 'Vault', active: true },
            { icon: <User size={18} />, label: 'Profile', action: () => navigate('/profile') },
            { icon: <Settings size={18} />, label: 'Admin', action: () => navigate('/admin'), adminOnly: true },
          ].map(item => (
            (!item.adminOnly || user?.role === 'ADMIN') && (
              <button key={item.label}
                onClick={item.action}
                style={{ ...styles.navItem, ...(item.active ? styles.navItemActive : {}) }}>
                {item.icon}<span>{item.label}</span>
              </button>
            )
          ))}
        </nav>

        <div style={styles.sidebarStats}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{stats.total}</span>
            <span style={styles.statLabel}>Passwords</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{stats.favorites}</span>
            <span style={styles.statLabel}>Favorites</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{stats.categories}</span>
            <span style={styles.statLabel}>Categories</span>
          </div>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{(user?.username?.[0] || 'U').toUpperCase()}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.username}</div>
            <div style={styles.userRole}>{user?.role || 'USER'}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Password Vault</h1>
            <p style={styles.pageSubtitle}>
              {filtered.length} of {entries.length} entries
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} style={styles.addBtn}>
            <Plus size={18} /><span>Add Password</span>
          </button>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by site or URL…"
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} style={styles.clearBtn}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={styles.categoryTabs}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ ...styles.catTab, ...(category === c ? styles.catTabActive : {}) }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFav(v => !v)}
            style={{ ...styles.favBtn, ...(showFav ? styles.favBtnActive : {}) }}>
            <Star size={15} fill={showFav ? '#f59e0b' : 'none'} />
          </button>
          <button onClick={fetchEntries} style={styles.refreshBtn} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.loadingSpinner} />
            <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading vault…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <Lock size={48} color="var(--border2)" />
            <p style={{ color: 'var(--text-dim)', marginTop: '12px', fontSize: '15px' }}>
              {entries.length === 0 ? 'Your vault is empty' : 'No entries match your search'}
            </p>
            {entries.length === 0 && (
              <button onClick={() => setShowAdd(true)} style={{ ...styles.addBtn, marginTop: '16px' }}>
                <Plus size={16} /><span>Add your first password</span>
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(entry => (
              <VaultCard
                key={entry.id}
                entry={entry}
                revealed={revealedPw[entry.id]}
                onReveal={() => toggleReveal(entry.id)}
                onDelete={() => handleDelete(entry.id)}
                onCopyUsername={() => copyToClipboard(decryptData(entry.encryptedUsername), 'Username')}
                onCopyPassword={() => copyToClipboard(decryptData(entry.encryptedPassword), 'Password')}
                deleting={deleting === entry.id}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchEntries(); }}
        />
      )}
    </div>
  );
}

function VaultCard({ entry, revealed, onReveal, onDelete, onCopyUsername, onCopyPassword, deleting }) {
  const decryptedPw = decryptData(entry.encryptedPassword);
  const decryptedUser = decryptData(entry.encryptedUsername);
  const domain = entry.siteUrl ? (() => { try { return new URL(entry.siteUrl).hostname; } catch { return entry.siteUrl; } })() : null;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIcon}>
          {domain
            ? <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                style={{ width: 20, height: 20 }} alt="" onError={e => e.target.style.display='none'} />
            : <Globe size={18} color="var(--cyan)" />
          }
        </div>
        <div style={styles.cardTitle}>
          <div style={styles.siteName}>{entry.siteName}</div>
          {domain && <div style={styles.siteUrl}>{domain}</div>}
        </div>
        <div style={styles.cardActions}>
          {entry.isFavorite && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
          {entry.category && (
            <span style={styles.categoryBadge}>{entry.category}</span>
          )}
          {entry.siteUrl && (
            <a href={entry.siteUrl} target="_blank" rel="noopener noreferrer" style={styles.iconBtn}>
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={onDelete} disabled={deleting} style={{ ...styles.iconBtn, ...styles.deleteBtn }}>
            {deleting ? <div style={styles.miniSpinner} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.credRow}>
          <span style={styles.credLabel}>Username</span>
          <span style={styles.credValue}>{decryptedUser}</span>
          <button onClick={onCopyUsername} style={styles.copyBtn}>
            <Copy size={13} />
          </button>
        </div>
        <div style={styles.credRow}>
          <span style={styles.credLabel}>Password</span>
          <span style={{ ...styles.credValue, fontFamily: revealed ? 'JetBrains Mono, monospace' : 'inherit', letterSpacing: revealed ? '0.05em' : 0 }}>
            {revealed ? decryptedPw : '••••••••••••'}
          </span>
          <button onClick={onReveal} style={styles.copyBtn}>
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={onCopyPassword} style={styles.copyBtn}>
            <Copy size={13} />
          </button>
        </div>
        {entry.notes && (
          <div style={styles.notes}>{entry.notes}</div>
        )}
      </div>
    </div>
  );
}

function AddModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    siteName: '', siteUrl: '', username: '', password: '',
    notes: '', category: '', isFavorite: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.siteName || !form.username || !form.password) {
      toast.error('Site name, username, and password are required');
      return;
    }
    setLoading(true);
    try {
      const iv = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(12))));
      await vaultApi.createEntry({
        siteName: form.siteName,
        siteUrl: form.siteUrl,
        encryptedUsername: encryptData(form.username),
        encryptedPassword: encryptData(form.password),
        iv,
        notes: form.notes,
        category: form.category,
        isFavorite: form.isFavorite,
      });
      toast.success('Password saved to vault!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Add New Password</h2>
            <p style={styles.modalSub}>All data is encrypted before saving</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.modalRow}>
            <ModalField label="Site Name *" name="siteName" value={form.siteName} onChange={handleChange} placeholder="Google, GitHub…" />
            <ModalField label="Site URL" name="siteUrl" value={form.siteUrl} onChange={handleChange} placeholder="https://example.com" />
          </div>
          <div style={styles.modalRow}>
            <ModalField label="Username / Email *" name="username" value={form.username} onChange={handleChange} placeholder="your@email.com" />
            <div style={styles.mField}>
              <label style={styles.mLabel}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Enter password"
                  style={{ ...styles.mInput, paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={styles.mEye}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={styles.modalRow}>
            <div style={styles.mField}>
              <label style={styles.mLabel}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={styles.mSelect}>
                <option value="">None</option>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.mField}>
              <label style={styles.mLabel}>Notes</label>
              <input name="notes" value={form.notes} onChange={handleChange}
                placeholder="Optional notes…" style={styles.mInput} />
            </div>
          </div>
          <label style={styles.checkRow}>
            <input type="checkbox" name="isFavorite" checked={form.isFavorite} onChange={handleChange}
              style={{ accentColor: '#f59e0b' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
              <Star size={14} fill={form.isFavorite ? '#f59e0b' : 'none'} color="#f59e0b" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Mark as favorite
            </span>
          </label>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? <span style={styles.miniSpinner} /> : <><Lock size={15} /><span>Save to Vault</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({ label, name, value, onChange, placeholder }) {
  return (
    <div style={styles.mField}>
      <label style={styles.mLabel}>{label}</label>
      <input name={name} value={value} onChange={onChange}
        placeholder={placeholder} style={styles.mInput} />
    </div>
  );
}

const styles = {
  root: {
    display: 'flex', minHeight: '100vh', background: 'var(--bg)',
  },
  sidebar: {
    width: '240px', flexShrink: 0,
    background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: '16px', fontWeight: '700',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px', border: 'none',
    background: 'none', cursor: 'pointer', color: 'var(--text-dim)',
    fontSize: '14px', fontFamily: 'inherit', fontWeight: '500',
    transition: 'all 0.15s', width: '100%', textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)',
    border: '1px solid rgba(6,182,212,0.15)',
  },
  sidebarStats: {
    margin: '24px 0', padding: '16px',
    background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
    border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  statItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statNum: { fontSize: '18px', fontWeight: '700', color: 'var(--text)' },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)' },
  sidebarUser: {
    marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px', background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px', border: '1px solid var(--border)',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', color: '#fff',
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: '13px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '11px', color: 'var(--text-muted)' },
  logoutBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    padding: '4px',
  },
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text)' },
  pageSubtitle: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
  },
  filters: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  searchWrap: {
    position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '200px',
  },
  searchIcon: { position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '9px 36px 9px 36px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
  },
  clearBtn: {
    position: 'absolute', right: '10px',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center',
  },
  categoryTabs: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  catTab: {
    padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'none', color: 'var(--text-dim)', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  catTabActive: {
    background: 'rgba(6,182,212,0.1)', color: 'var(--cyan)',
    borderColor: 'rgba(6,182,212,0.3)',
  },
  favBtn: {
    padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    color: 'var(--text-muted)',
  },
  favBtnActive: {
    background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b',
  },
  refreshBtn: {
    padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px', textAlign: 'center',
  },
  loadingSpinner: {
    width: '40px', height: '40px', borderRadius: '50%',
    border: '3px solid var(--border)', borderTopColor: 'var(--cyan)',
    animation: 'spin 0.8s linear infinite',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '14px', overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 16px', borderBottom: '1px solid var(--border)',
  },
  cardIcon: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'rgba(6,182,212,0.08)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { flex: 1, overflow: 'hidden' },
  siteName: { fontSize: '14px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  siteUrl: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' },
  cardActions: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  categoryBadge: {
    padding: '2px 8px', borderRadius: '20px', fontSize: '11px',
    background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.2)',
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px',
    textDecoration: 'none',
  },
  deleteBtn: { color: 'rgba(239,68,68,0.6)' },
  cardBody: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  credRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  credLabel: { fontSize: '12px', color: 'var(--text-muted)', width: '70px', flexShrink: 0 },
  credValue: {
    flex: 1, fontSize: '13px', color: 'var(--text)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  copyBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    padding: '3px', borderRadius: '4px',
  },
  notes: {
    fontSize: '12px', color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '8px',
    borderLeft: '2px solid var(--border2)',
  },
  miniSpinner: {
    width: '14px', height: '14px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '24px',
  },
  modal: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '20px', width: '100%', maxWidth: '600px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px 24px 0',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text)' },
  modalSub: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  modalForm: { padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  modalRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  mField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  mLabel: { fontSize: '12px', fontWeight: '500', color: 'var(--text-dim)' },
  mInput: {
    padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)', borderRadius: '10px',
    color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', width: '100%',
  },
  mSelect: {
    padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)', borderRadius: '10px',
    color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
  },
  mEye: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  checkRow: {
    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
  },
  modalFooter: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', background: 'none',
    border: '1px solid var(--border)', borderRadius: '10px',
    cursor: 'pointer', color: 'var(--text-dim)', fontSize: '14px', fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
    minWidth: '140px', justifyContent: 'center',
  },
};
