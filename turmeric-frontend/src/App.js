import React, { useState } from 'react';
import { User, LogOut, Sprout, Factory, Truck, Package, Store, ShieldCheck, Search, ArrowRight, Leaf } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StageAuthProvider, useStageAuth } from './context/StageAuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrackingPage from './components/TrackingPage';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import StageLogin from './components/StageLogin';
import StageDashboard from './components/StageDashboard';
import ChatbotWidget from './components/ChatbotWidget';

/* ---------- Reusable loading screen ---------- */
function LoadingScreen({ accent = 'saffron' }) {
  const ringColor = accent === 'leaf' ? 'border-t-leaf' : 'border-t-saffron';
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <div className={`animate-spin rounded-full h-12 w-12 border-2 border-cream ${ringColor} mx-auto`}></div>
        <p className="mt-4 text-muted font-medium">Loading…</p>
      </div>
    </div>
  );
}

/* ---------- Auth guards ---------- */
function RequireAdminAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen accent="leaf" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function RequireStageAuth({ children }) {
  const { isAuthenticated, isLoading } = useStageAuth();
  if (isLoading) return <LoadingScreen accent="saffron" />;
  if (!isAuthenticated) return <Navigate to="/stage/login" replace />;
  return children;
}

/* ---------- Stage Login Page (wrapped with hero background) ---------- */
function StageLoginPage() {
  const { login, isAuthenticated, isLoading } = useStageAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setIsAuthLoading(true);
    try {
      await login(credentials);
      navigate('/stage/dashboard', { replace: true });
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (!isLoading && isAuthenticated) return <Navigate to="/stage/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-leaf font-medium mb-6 hover:opacity-80">
          <Leaf size={18} /> HaldiChain
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="hidden lg:flex lg:col-span-5 rounded-3xl border border-cream bg-cream/70 shadow-soft p-8 flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-3">Stage Access</p>
              <h1 className="font-display text-4xl leading-tight font-semibold text-cream-foreground mb-4">
                Access your role dashboard and update the chain in real-time.
              </h1>
              <p className="text-muted text-base">
                Sign in as farmer, processor, distributor, supplier, or shopkeeper to record stage-specific details with secure access.
              </p>
            </div>
            <div className="mt-6 text-sm text-muted">
              End-to-end traceability for every packet.
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-cream rounded-3xl shadow-elevated border border-cream p-2">
              <StageLogin onLogin={handleLogin} isLoading={isAuthLoading} showBackButton={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stage Dashboard ---------- */
function StageDashboardPage() {
  const { stageUser, logout } = useStageAuth();
  const stageName = stageUser?.stage
    ? stageUser.stage.charAt(0).toUpperCase() + stageUser.stage.slice(1)
    : 'Stage';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-cream/80 backdrop-blur border-b border-cream sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-leaf p-2.5 rounded-xl shadow-soft">
              <Leaf className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-cream-foreground">
                {stageName} Dashboard
              </h1>
              <p className="text-sm text-muted">Welcome back, {stageUser?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-cream px-4 py-2 rounded-xl border border-cream hover:shadow-soft transition-all"
          >
            <LogOut className="text-paprika" size={18} />
            <span className="text-sm font-medium text-paprika">Logout</span>
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <StageDashboard />
      </main>
    </div>
  );
}

/* ---------- Home Page (full redesign) ---------- */
function HomePage() {
  const stages = [
    { icon: Sprout, label: 'Farmer', tone: 'leaf' },
    { icon: Factory, label: 'Processor', tone: 'saffron' },
    { icon: Truck, label: 'Distributor', tone: 'leaf' },
    { icon: Package, label: 'Supplier', tone: 'saffron' },
    { icon: Store, label: 'Shopkeeper', tone: 'leaf' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-saffron p-2 rounded-xl shadow-soft">
            <Leaf className="text-white" size={20} />
          </div>
          <span className="font-display text-xl font-semibold">HaldiChain</span>
        </div>
        <Link
          to="/admin/login"
          className="text-sm font-medium text-leaf hover:text-saffron transition-colors"
        >
          Admin sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 bg-cream border border-cream rounded-full px-3 py-1 text-xs font-medium text-leaf shadow-soft">
            <ShieldCheck size={14} /> Verified farm-to-shelf traceability
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-semibold mt-5 leading-[1.05] text-balance">
            Trace every <span className="text-gradient-saffron">turmeric root</span> from farm to shelf.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-xl">
            A premium supply chain ledger for India's golden spice. Track every packet across farmer, processor, distributor, supplier and shopkeeper.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tracking"
              className="inline-flex items-center gap-2 bg-gradient-saffron text-white font-semibold px-6 py-3 rounded-2xl shadow-glow hover:opacity-95 transition-all"
            >
              <Search size={18} /> Track a packet
            </Link>
            <Link
              to="/stage/login"
              className="inline-flex items-center gap-2 bg-cream text-leaf font-semibold px-6 py-3 rounded-2xl border border-cream shadow-soft hover:shadow-elevated transition-all"
            >
              Stage login <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Floating verified card */}
        <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="absolute -inset-6 bg-gradient-saffron opacity-20 blur-3xl rounded-full" />
          <div className="relative bg-cream rounded-3xl shadow-elevated border border-cream p-6 animate-float">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Batch</p>
                <p className="font-display text-2xl font-semibold">#TRM-2104-A</p>
              </div>
              <span className="bg-leaf text-white text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Farmer · Erode', pct: 100 },
                { label: 'Processor · Salem', pct: 100 },
                { label: 'Distributor · Chennai', pct: 75 },
                { label: 'Supplier · Mumbai', pct: 30 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{s.label}</span><span>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-cream border border-cream rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-saffron rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action portals */}
      <section className="relative max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          <Link
            to="/tracking"
            className="group bg-cream rounded-3xl border border-cream p-6 shadow-soft hover:shadow-elevated transition-all"
          >
            <div className="bg-gradient-saffron w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft mb-4">
              <Search className="text-white" size={22} />
            </div>
            <h3 className="font-display text-xl font-semibold mb-1">Track Packet History</h3>
            <p className="text-sm text-muted">Scan or enter a packet ID to view its full journey.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-saffron font-medium text-sm group-hover:gap-2 transition-all">
              Open tracker <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/stage/login"
            className="group bg-gradient-leaf text-white rounded-3xl p-6 shadow-elevated hover:shadow-glow transition-all"
          >
            <div className="bg-white/15 backdrop-blur w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Sprout className="text-white" size={22} />
            </div>
            <h3 className="font-display text-xl font-semibold mb-1">Stage Login</h3>
            <p className="text-sm text-white/80">Farmer · Processor · Distributor · Supplier · Shopkeeper</p>
            <span className="mt-4 inline-flex items-center gap-1 font-medium text-sm group-hover:gap-2 transition-all">
              Continue <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/admin/login"
            className="group bg-cream rounded-3xl border border-cream p-6 shadow-soft hover:shadow-elevated transition-all"
          >
            <div className="bg-foreground w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft mb-4">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <h3 className="font-display text-xl font-semibold mb-1">Admin</h3>
            <p className="text-sm text-muted">Authenticated access to the control panel.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-leaf font-medium text-sm group-hover:gap-2 transition-all">
              Sign in <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Stage chain */}
      <section className="relative max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-cream rounded-3xl border border-cream p-8 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted text-center mb-6">The chain</p>
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {stages.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center min-w-[88px]">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft ${s.tone === 'leaf' ? 'bg-gradient-leaf' : 'bg-gradient-saffron'
                    }`}>
                    <s.icon className="text-white" size={24} />
                  </div>
                  <span className="mt-2 text-sm font-medium">{s.label}</span>
                  <span className="text-xs text-muted">Step {i + 1}</span>
                </div>
                {i < stages.length - 1 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-saffron/40 to-leaf/40 min-w-[20px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} HaldiChain · Crafted for India's turmeric supply chain.
      </footer>
    </div>
  );
}

/* ---------- Admin Login Page ---------- */
function AdminLoginPage() {
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setIsAuthLoading(true);
    try { await login(credentials); navigate('/admin/panel', { replace: true }); }
    finally { setIsAuthLoading(false); }
  };
  const handleRegister = async (credentials) => {
    setIsAuthLoading(true);
    try { await register(credentials); navigate('/admin/panel', { replace: true }); }
    finally { setIsAuthLoading(false); }
  };

  if (isLoading) return <LoadingScreen accent="leaf" />;
  if (isAuthenticated) return <Navigate to="/admin/panel" replace />;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto pt-10 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-leaf font-medium mb-6 hover:opacity-80">
          <Leaf size={18} /> HaldiChain
        </Link>
        <div className="bg-cream rounded-3xl shadow-elevated border border-cream p-2">
          <AdminLogin onLogin={handleLogin} onRegister={handleRegister} isLoading={isAuthLoading} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin Panel ---------- */
function AdminPanelPage() {
  const [userRole, setUserRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tracking': return <TrackingPage />;
      case 'admin-panel': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="flex">
        <Sidebar
          userRole={userRole}
          setUserRole={setUserRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showStageLogin={false}
          setShowStageLogin={() => { }}
        />
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
}

/* ---------- App root ---------- */
function App() {
  return (
    <AuthProvider>
      <StageAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/panel" element={<RequireAdminAuth><AdminPanelPage /></RequireAdminAuth>} />
            <Route path="/stage/login" element={<StageLoginPage />} />
            <Route path="/stage/dashboard" element={<RequireStageAuth><StageDashboardPage /></RequireStageAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </StageAuthProvider>
    </AuthProvider>
  );
}

export default App;
