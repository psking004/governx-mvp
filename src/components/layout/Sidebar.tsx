import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusCircle, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/initiatives', icon: FolderKanban, label: 'Initiatives' },
  { to: '/initiatives/new', icon: PlusCircle, label: 'New Initiative' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'shrink-0 border-r border-border bg-sidebar flex flex-col transition-all duration-300 relative',
      collapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Brand */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-base font-bold text-foreground tracking-tight">GovernX</h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Governance Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to === '/initiatives' && location.pathname === '/initiatives');
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                active
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-transform duration-200', !active && 'group-hover:scale-110')} />
              {!collapsed && <span className="animate-fade-in">{label}</span>}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
