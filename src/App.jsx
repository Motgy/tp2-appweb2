// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from 'firebase/firestore';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/protectedRoute';
import FormBuilder from './pages/FormBuilder';
import FillPlan from './pages/FillPlan';
import EditPlan from './pages/EditPlan';
import AdminPlanList from './pages/AdminPlanList';
import AdminValidatePlan from './pages/AdminValidatePlan';

function Navbar({ user, role, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'has-text-primary has-background-primary-light' : '';

  return (
    <nav className="navbar modern-navbar is-fixed-top" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
             <div className="is-flex is-align-items-center">
                <div className="has-background-primary has-text-white is-flex-centered rounded mr-2" style={{width: 32, height: 32, borderRadius: 8}}>
                    <i className="fas fa-graduation-cap"></i>
                </div>
                <span className="is-size-5 has-text-weight-bold has-text-dark">TP2</span>
             </div>
          </Link>
        </div>

        <div className="navbar-menu">
          <div className="navbar-start ml-4">
            {user && role === "enseignant" && (
              <Link to="/home" className={`navbar-item ${isActive('/home')}`}>Mes Plans</Link>
            )}
            {user && role === "admin" && (
              <>
                <Link to="/admin" className={`navbar-item ${isActive('/admin')}`}>Dashboard</Link>
                <Link to="/admin/plans" className={`navbar-item ${isActive('/admin/plans')}`}>Validations</Link>
              </>
            )}
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              {user ? (
                <div className="buttons">
                    <Link to="/profile" className="button is-white is-small">
                        <span className="icon"><i className="fas fa-user"></i></span>
                        <span>Profil</span>
                    </Link>
                    <button className="button is-danger is-light is-small" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
              ) : (
                <div className="buttons">
                  <Link to="/" className="button is-primary is-small"><strong>Connexion</strong></Link>
                  <Link to="/signup" className="button is-light is-small">Inscription</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function RootRedirect({ user, role, loading }) {
    if (loading) return <div className="hero is-fullheight"><div className="hero-body is-justify-content-center"><div className="loader is-loading is-size-1"></div></div></div>;
    if (!user) return <Login />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
}

// Composant qui gère le layout selon la page
const AppLayout = ({ children }) => {
  const location = useLocation();
  // Pages qui doivent prendre tout l'écran sans marge blanche
  const isFullScreenPage = ["/", "/signup"].includes(location.pathname);

  if (isFullScreenPage) {
    return <div style={{ paddingTop: '50px' }}>{children}</div>; // Juste un petit padding pour la navbar
  }

  // Layout standard pour le dashboard (fond gris, marges)
  return (
    <div style={{paddingTop: '90px', minHeight: '100vh', paddingBottom: '50px'}} className="has-background-light">
      {children}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        try {
            const snap = await getDoc(doc(db, "users", u.uid));
            if (snap.exists()) setRole(snap.data().role);
        } catch (e) { console.error(e) }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Router>
      <Navbar user={user} role={role} onLogout={() => auth.signOut()} />
      <AppLayout>
        <Routes>
          <Route path="/" element={<RootRedirect user={user} role={role} loading={loading} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="/home" element={<ProtectedRoute requiredRole="enseignant"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/create-plan" element={<ProtectedRoute requiredRole="enseignant"><FillPlan /></ProtectedRoute>} />
          <Route path="/plan/edit/:planId" element={<ProtectedRoute requiredRole="enseignant"><EditPlan /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-form" element={<ProtectedRoute requiredRole="admin"><FormBuilder /></ProtectedRoute>} />
          <Route path="/admin/edit-form/:formId" element={<ProtectedRoute requiredRole="admin"><FormBuilder /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute requiredRole="admin"><AdminPlanList /></ProtectedRoute>} />
          <Route path="/admin/validate/:planId" element={<ProtectedRoute requiredRole="admin"><AdminValidatePlan /></ProtectedRoute>} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App;