import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toasts } from '../ui/Toast';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toasts />
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Super Coach Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 