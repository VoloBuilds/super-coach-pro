import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/layout/Layout';

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
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <Suspense fallback={<div>Loading...</div>}>
                <Home />
              </Suspense>
            } />
            <Route path="workouts" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Workouts />
              </Suspense>
            } />
            <Route path="diet" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Diet />
              </Suspense>
            } />
            <Route path="calendar" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Calendar />
              </Suspense>
            } />
            <Route path="chat" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Chat />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
