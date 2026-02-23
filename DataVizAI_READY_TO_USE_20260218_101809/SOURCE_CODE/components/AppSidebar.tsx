import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Upload, 
  TrendingUp, 
  Lightbulb, 
  BookOpen, 
  Home,
  Menu,
  X,
  Volume2,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  description?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    description: 'Back to main page'
  },
  {
    icon: Upload,
    label: 'Upload',
    href: '/upload',
    description: 'Upload your data files'
  },
  {
    icon: TrendingUp,
    label: 'Analysis',
    href: '/analysis',
    description: 'Configure data analysis'
  },
  {
    icon: BarChart3,
    label: 'Dashboard',
    href: '/dashboard',
    description: 'View charts and KPIs'
  },
  {
    icon: Lightbulb,
    label: 'Insights',
    href: '/insights',
    description: 'AI-generated insights'
  },
  {
    icon: BookOpen,
    label: 'Storytelling',
    href: '/storytelling',
    description: 'Data narratives'
  },
  {
    icon: Volume2,
    label: 'Voice Demo',
    href: '/voice-demo',
    description: 'Voice analytics demo'
  },
  {
    icon: Settings,
    label: 'Voice Settings',
    href: '/voice-management',
    description: 'Manage voice features'
  }
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Emit custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('sidebar-toggle', {
      detail: { expanded: newExpanded }
    }));
  };
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border border-border/50"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 280 : 80,
          x: isMobileOpen ? 0 : -100
        }}
        className={cn(
          "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 z-40 flex flex-col",
          "md:translate-x-0 transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-3 min-w-0"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-bold truncate"
                  >
                    DataViz AI
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Desktop Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex shrink-0"
              onClick={toggleExpanded}
            >
              {isExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="min-w-0 flex-1"
                    >
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">M</span>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="min-w-0 flex-1"
                >
                  <div className="text-sm font-medium truncate">Moeketsi Mashigo</div>
                  <div className="text-xs text-muted-foreground truncate">AI Engineer</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}