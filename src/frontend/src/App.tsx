import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AdminGate } from './components/auth/AdminGate';
import { ProfileSetupDialog } from './components/auth/ProfileSetupDialog';
import { AdminLayout } from './components/layout/AdminLayout';
import ThreadsPage from './pages/ThreadsPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import TelegramPanelPage from './pages/TelegramPanelPage';
import SecurityGuidancePage from './pages/SecurityGuidancePage';
import { AccessDeniedScreen } from './components/screens/AccessDeniedScreen';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ProfileSetupDialog />
      <Outlet />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AdminGate fallback={<AccessDeniedScreen />}>
      <AdminLayout>
        <ThreadsPage />
      </AdminLayout>
    </AdminGate>
  ),
});

const threadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threads',
  component: () => (
    <AdminGate fallback={<AccessDeniedScreen />}>
      <AdminLayout>
        <ThreadsPage />
      </AdminLayout>
    </AdminGate>
  ),
});

const threadDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threads/$threadId',
  component: () => (
    <AdminGate fallback={<AccessDeniedScreen />}>
      <AdminLayout>
        <ThreadDetailPage />
      </AdminLayout>
    </AdminGate>
  ),
});

const telegramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/telegram',
  component: () => (
    <AdminGate fallback={<AccessDeniedScreen />}>
      <AdminLayout>
        <TelegramPanelPage />
      </AdminLayout>
    </AdminGate>
  ),
});

const guidanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guidance',
  component: () => (
    <AdminGate fallback={<AccessDeniedScreen />}>
      <AdminLayout>
        <SecurityGuidancePage />
      </AdminLayout>
    </AdminGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  threadsRoute,
  threadDetailRoute,
  telegramRoute,
  guidanceRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
