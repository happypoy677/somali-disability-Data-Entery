import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogout } from '@workspace/api-client-react';
import { toast } from 'sonner';
import {
  Activity,
  ArrowRight,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/register', label: 'Register person', icon: Users },
  { href: '/people', label: 'People records', icon: Database },
  { href: '/import-export', label: 'Import & export', icon: FileSpreadsheet },
  { href: '/backup', label: 'Backups', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading, isError } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && (isError || !user) && location !== '/login' && location !== '/setup') setLocation('/login');
  }, [isError, isLoading, location, setLocation, user]);

  if (isLoading) {
    return <div className="grid min-h-[100dvh] place-items-center bg-background"><div className="text-center"><div className="mx-auto size-8 animate-pulse rounded-lg bg-accent" /><p className="mt-3 text-sm text-muted-foreground">Checking administrator session…</p></div></div>;
  }

  if (isError || !user) return null;

  const initials = useMemo(() => user?.username?.slice(0, 2).toUpperCase() ?? 'AD', [user?.username]);
  const activeLabel = navItems.find((item) => item.href === location)?.label ?? 'People record';

  const signOut = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success('You have been signed out');
        setLocation('/login');
      },
      onError: () => toast.error('Sign out failed. Please try again.'),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary font-display text-xl font-bold text-sidebar-primary-foreground">S</span>
            <span>
              <span className="block font-display text-[17px] font-semibold tracking-tight">Somali Disability</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/55">Data entry</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 text-sidebar-foreground/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-12 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/40">Workspace</div>
        <nav className="mt-3 space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                <Icon className={`size-[18px] ${active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-primary'}`} strokeWidth={active ? 2.5 : 2} />
                <span className="font-medium">{item.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">◎</div>
            <div>
              <p className="text-xs font-semibold">Registry is protected</p>
              <p className="mt-0.5 text-[11px] text-sidebar-foreground/50">Local session encryption on</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-sidebar-foreground/55">
            <span className="size-1.5 rounded-full bg-emerald-400" /> System operational
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-dismiss-menu" />}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu className="size-5" /></button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Somali Disability Data Entry</p>
              <p className="font-display text-lg font-semibold">{activeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold" data-testid="text-username">{user?.username ?? 'Administrator'}</p>
              <p className="text-[11px] text-muted-foreground">Administrator</p>
            </div>
            <Avatar className="size-9 border-2 border-background ring-1 ring-border">
              <AvatarFallback className="bg-accent text-xs font-bold text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
            <button onClick={signOut} className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:block" aria-label="Sign out" data-testid="button-signout"><LogOut className="size-4" /></button>
          </div>
        </header>
        <main className="mx-auto max-w-[1540px] px-5 py-7 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[38px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading registry data' }: { label?: string }) {
  return <div className="rounded-2xl border border-border bg-card p-10 text-center" data-testid="status-loading"><div className="mx-auto mb-3 size-7 animate-pulse rounded-lg bg-accent" /><p className="text-sm text-muted-foreground">{label}</p></div>;
}

export function ErrorBlock({ label = 'Unable to load this section', onRetry }: { label?: string; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-8 text-center" data-testid="status-error"><p className="font-semibold text-destructive">{label}</p>{onRetry && <Button variant="outline" className="mt-4" onClick={onRetry} data-testid="button-retry">Try again <ArrowRight className="ml-2 size-4" /></Button>}</div>;
}

export function SelectField({ label, value, onChange, options, placeholder = 'Select one', testId }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder?: string; testId: string }) {
  return <label className="block space-y-2"><span className="text-xs font-semibold text-foreground">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid={testId}><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}