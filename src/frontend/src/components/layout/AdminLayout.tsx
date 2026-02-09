import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Settings, ShieldCheck, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/threads', label: 'Threads', icon: MessageSquare },
    { path: '/telegram', label: 'Telegram', icon: Settings },
    { path: '/guidance', label: 'Security', icon: ShieldCheck },
  ];

  const NavContent = () => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/threads' && currentPath === '/');
          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                navigate({ to: item.path });
                setMobileMenuOpen(false);
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium truncate">{userProfile?.name || 'Admin'}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">AI Memory Console</h2>
                </div>
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-lg font-semibold md:text-xl">AI Memory Console</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {userProfile?.name || 'Admin'}
            </span>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-card md:block">
          <div className="flex h-full flex-col p-4">
            <NavContent />
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
      <footer className="border-t bg-card py-4">
        <div className="container text-center text-xs text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
