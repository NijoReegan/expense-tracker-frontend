import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/useAuth';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Savings = lazy(() => import('./pages/Savings'));
const Budget = lazy(() => import('./pages/Budget'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Income = lazy(() => import('./pages/Income'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
      <Route
        path="/login"
        element={<Suspense fallback={<PageLoader />}><GuestOnly><Login /></GuestOnly></Suspense>}
      />
      <Route
        path="/register"
        element={<Suspense fallback={<PageLoader />}><GuestOnly><Register /></GuestOnly></Suspense>}
      />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/expenses" element={<Suspense fallback={<PageLoader />}><Expenses /></Suspense>} />
        <Route path="/income" element={<Suspense fallback={<PageLoader />}><Income /></Suspense>} />
        <Route path="/savings" element={<Suspense fallback={<PageLoader />}><Savings /></Suspense>} />
        <Route path="/budget" element={<Suspense fallback={<PageLoader />}><Budget /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;