import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Super Coach Pro
        </Link>
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
      </div>
    </header>
  );
} 