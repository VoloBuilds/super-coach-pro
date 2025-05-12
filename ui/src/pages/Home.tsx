import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check if we were redirected here from a protected route
  useEffect(() => {
    const from = location.state?.from;
    if (from && !user) {
      setIsAuthModalOpen(true);
    }
  }, [location.state, user]);

  // If user becomes authenticated, redirect them to their intended destination
  useEffect(() => {
    if (user && location.state?.from) {
      navigate(location.state.from.pathname);
    }
  }, [user, location.state, navigate]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Welcome to Super Coach Pro</h1>
      <p className="text-xl text-muted-foreground">
        Your AI-powered fitness companion for workouts and meal planning.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/workouts')}
        >
          <h2 className="text-xl font-semibold mb-2">Workout Planner</h2>
          <p className="text-muted-foreground">Create and manage your workout routines</p>
        </div>
        <div 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/diet')}
        >
          <h2 className="text-xl font-semibold mb-2">Diet Planner</h2>
          <p className="text-muted-foreground">Plan your meals and track nutrition</p>
        </div>
        <div 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/calendar')}
        >
          <h2 className="text-xl font-semibold mb-2">Calendar</h2>
          <p className="text-muted-foreground">Schedule workouts and meal plans</p>
        </div>
        <div 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/chat')}
        >
          <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
          <p className="text-muted-foreground">Get personalized recommendations</p>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
} 