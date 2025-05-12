import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load pages
import { lazy, Suspense } from 'react';
const Home = lazy(() => import('./pages/Home'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Diet = lazy(() => import('./pages/Diet'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <Suspense fallback={<div>Loading...</div>}>
                  <Home />
                </Suspense>
              } />
              <Route path="workouts" element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Workouts />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="diet" element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Diet />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="calendar" element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Calendar />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="chat" element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Chat />
                  </Suspense>
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
