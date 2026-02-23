import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for sidebar expansion changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        sidebarExpanded ? "ml-0 md:ml-[280px]" : "ml-0 md:ml-20"
      )}>
        {children}
      </main>
    </div>
  );
}