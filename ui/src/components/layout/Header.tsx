import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Super Coach Pro
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/workouts">Workouts</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/diet">Diet</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/calendar">Calendar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/chat">AI Chat</Link>
            </Button>
          </nav>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Sign In
            </Button>
          )}
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
} 