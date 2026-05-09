import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Theme State (Default to Light for AirForShare vibe)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? true : false;
  });

  useEffect(() => { 
    fetchData();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL, { timeout: 5000 });
      if (res.data.text !== undefined && text === "") {
        setText(res.data.text);
      }
      setIsConnected(true);
    } catch (err) { 
      setIsConnected(false);
      console.error("Backend unreachable:", err.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.post(`${API_URL}/save`, { text }, { timeout: 8000 });
      setMessage("Saved successfully");
      setIsConnected(true);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { 
      setIsConnected(false);
      setMessage("Sync failed. Check connection.");
    }
    setLoading(false);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bg }}>
      {/* Background Pattern */}
      <div style={{ ...styles.grid, backgroundImage: theme.gridImage }}></div>

      <div style={{ ...styles.wrapper }}>
        <header style={styles.header}>
          <div style={styles.logoGroup}>
            <div style={{ ...styles.iconWrap, backgroundColor: theme.iconBg }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h1 style={{ ...styles.title, color: theme.titleColor }}>QuickShare</h1>
          </div>

          <div style={styles.navActions}>
            <button onClick={() => setIsDark(!isDark)} style={{ ...styles.toggleBtn, backgroundColor: theme.toggleBg, color: theme.text }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <div style={styles.status(isConnected, theme)}>
              <div style={styles.dot(isConnected)}></div>
              {isConnected ? "Live" : "Offline"}
            </div>
          </div>
        </header>

        <main style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div style={styles.mainHeader}>
            <h2 style={{ ...styles.heading, color: theme.titleColor }}>Share Text Instantly</h2>
            <p style={{ ...styles.subHeading, color: theme.subText }}>No login. No apps. Just paste and grab from any device on your Wi-Fi.</p>
          </div>

          <div style={styles.editorBox(isFocused, theme)}>
            <textarea 
              style={{ ...styles.textarea, color: theme.text }} 
              value={text} 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your link or text here..."
            />
            <div style={{ ...styles.editorInfo, borderTopColor: theme.cardBorder }}>
              <span style={{ color: theme.subText }}>{text.length} characters</span>
              {loading && <span style={{ color: theme.accent, fontWeight: 'bold' }}>Syncing...</span>}
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading || !isConnected} 
            style={styles.saveBtn(isConnected, loading)}
          >
            {loading ? "Please wait..." : "Save Content"}
          </button>

          {message && (
            <div style={styles.toast(message.includes("success"), theme)}>
              {message}
            </div>
          )}
        </main>

        <footer style={styles.footer}>
          <div style={{ ...styles.footerInfo, color: theme.subText }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Content expires in 30 mins</span>
          </div>
        </footer>
      </div>

      <style>{`
        body { margin: 0; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: ${theme.scrollThumb}; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const lightTheme = {
  bg: '#F9FAFB',
  cardBg: '#FFFFFF',
  cardBorder: '#F1F5F9',
  titleColor: '#0F172A',
  text: '#334155',
  subText: '#64748B',
  accent: '#4F46E5',
  iconBg: '#EEF2FF',
  toggleBg: '#F1F5F9',
  gridImage: 'radial-gradient(#E2E8F0 0.8px, transparent 0.8px)',
  scrollThumb: '#E2E8F0',
  toastSuccessBg: '#F0FDF4',
  toastSuccessText: '#166534',
  toastErrorBg: '#FEF2F2',
  toastErrorText: '#991B1B'
};

const darkTheme = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  cardBorder: '#334155',
  titleColor: '#F8FAFC',
  text: '#E2E8F0',
  subText: '#94A3B8',
  accent: '#818CF8',
  iconBg: '#312E81',
  toggleBg: '#334155',
  gridImage: 'radial-gradient(#334155 0.8px, transparent 0.8px)',
  scrollThumb: '#475569',
  toastSuccessBg: 'rgba(34, 197, 94, 0.1)',
  toastSuccessText: '#4ADE80',
  toastErrorBg: 'rgba(239, 68, 68, 0.1)',
  toastErrorText: '#F87171'
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", system-ui, sans-serif',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundSize: '30px 30px',
    zIndex: 0,
    opacity: 0.6
  },
  wrapper: {
    width: '90%',
    maxWidth: '560px',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconWrap: {
    padding: '10px',
    borderRadius: '12px',
    display: 'flex'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.02em'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  toggleBtn: {
    border: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'transform 0.2s ease'
  },
  status: (connected, theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: connected ? theme.iconBg : '#FEF2F2',
    color: connected ? theme.accent : '#DC2626'
  }),
  dot: (connected) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: connected ? '#10B981' : '#EF4444'
  }),
  card: {
    padding: '40px',
    borderRadius: '28px',
    boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
    border: '1px solid',
    transition: 'all 0.4s ease'
  },
  mainHeader: {
    marginBottom: '32px'
  },
  heading: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.03em'
  },
  subHeading: {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.5'
  },
  editorBox: (focused, theme) => ({
    backgroundColor: focused ? theme.cardBg : theme.bg,
    borderRadius: '20px',
    border: `2px solid ${focused ? theme.accent : theme.cardBorder}`,
    transition: 'all 0.2s ease',
    overflow: 'hidden'
  }),
  textarea: {
    width: '100%',
    height: '220px',
    padding: '20px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    backgroundColor: 'transparent',
    lineHeight: '1.6',
    resize: 'none',
    boxSizing: 'border-box'
  },
  editorInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderTop: '1px solid',
    fontSize: '12px',
    fontWeight: '600'
  },
  saveBtn: (connected, loading) => ({
    width: '100%',
    marginTop: '24px',
    padding: '18px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: connected ? '#4F46E5' : '#94A3B8',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: connected && !loading ? 'pointer' : 'not-allowed',
    boxShadow: connected ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
    transition: 'all 0.2s ease'
  }),
  toast: (isSuccess, theme) => ({
    marginTop: '20px',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: isSuccess ? theme.toastSuccessBg : theme.toastErrorBg,
    color: isSuccess ? theme.toastSuccessText : theme.toastErrorText
  }),
  footer: {
    display: 'flex',
    justifyContent: 'center'
  },
  footerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500'
  }
};

export default App
