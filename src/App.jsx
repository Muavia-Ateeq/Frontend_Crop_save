import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import SplashPage    from './pages/SplashPage';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import ForgotPage    from './pages/ForgotPage';

import AppLayout     from './pages/app/AppLayout';
import HomePage      from './pages/app/HomePage';
import PredictPage   from './pages/app/PredictPage';
import AnalyticsPage from './pages/app/AnalyticsPage';
import VarietiesPage from './pages/app/VarietiesPage';
import ProfilePage   from './pages/app/ProfilePage';

const CropSaveFeature = lazy(() => import('./features/crop-save/CropSaveFeature'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot" element={<ForgotPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="/app/home" replace />} />
            <Route path="home"          element={<HomePage />} />
            <Route path="predict"       element={<PredictPage />} />
            <Route path="analytics"     element={<AnalyticsPage />} />
            <Route path="varieties"     element={<VarietiesPage />} />
            <Route path="profile"       element={<ProfilePage />} />
            <Route
              path="crop-save"
              element={(
                <Suspense fallback={<div className="p-6 text-sm text-muted" role="status">Loading CropSave…</div>}>
                  <CropSaveFeature />
                </Suspense>
              )}
            />
          </Route>

          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
