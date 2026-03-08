import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FolderKanban, PlusCircle, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/initiatives', icon: FolderKanban, label: 'Initiatives' },
  { to: '/initiatives/new', icon: PlusCircle, label: 'New Initiative' },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/95 backdrop-blur-xl safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold text-foreground tracking-tight">GovernX</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/initiatives/new"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold touch-target"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2.5 rounded-lg hover:bg-secondary text-foreground transition-colors touch-target"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-40 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="p-4 space-y-1">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors touch-target',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
