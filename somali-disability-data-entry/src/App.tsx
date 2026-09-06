import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { AppShell } from '@/components/app-shell';
import { LoginPage, SetupPage } from '@/pages/auth';
import { DashboardPage, PeoplePage, PersonDetailPage, RegisterPage } from '@/pages/registry';
import { BackupPage, ImportExportPage, SettingsPage } from '@/pages/admin';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/setup" component={SetupPage} />
        <Route path="/" component={() => <AppShell><DashboardPage /></AppShell>} />
        <Route path="/register" component={() => <AppShell><RegisterPage /></AppShell>} />
        <Route path="/people" component={() => <AppShell><PeoplePage /></AppShell>} />
        <Route path="/people/:id" component={() => <AppShell><PersonDetailPage /></AppShell>} />
        <Route path="/import-export" component={() => <AppShell><ImportExportPage /></AppShell>} />
        <Route path="/backup" component={() => <AppShell><BackupPage /></AppShell>} />
        <Route path="/settings" component={() => <AppShell><SettingsPage /></AppShell>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('somali-disability-data-entry-theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
