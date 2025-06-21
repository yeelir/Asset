import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  MapPin, 
  Users, 
  FileText,
  Shield,
  Menu,
  X,
  CalendarDays,
  Sun,
  Moon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Assets", url: createPageUrl("Assets"), icon: Package },
  { title: "Events", url: createPageUrl("Events"), icon: CalendarDays },
  { title: "Categories", url: createPageUrl("Categories"), icon: FolderOpen },
  { title: "Locations", url: createPageUrl("Locations"), icon: MapPin },
  { title: "Users", url: createPageUrl("Users"), icon: Users },
  { title: "Roles", url: createPageUrl("Roles"), icon: Shield },
  { title: "Reports", url: createPageUrl("Reports"), icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>
        {`
          :root.dark {
            --background: 24 26 31;
            --foreground: 222 225 229;
            --card: 40 44 52;
            --card-foreground: 222 225 229;
            --popover: 24 26 31;
            --popover-foreground: 222 225 229;
            --primary: 51 153 255;
            --primary-foreground: 255 255 255;
            --secondary: 50 56 68;
            --secondary-foreground: 222 225 229;
            --muted: 50 56 68;
            --muted-foreground: 173 181 189;
            --accent: 51 153 255;
            --accent-foreground: 255 255 255;
            --destructive: 220 53 69;
            --destructive-foreground: 255 255 255;
            --border: 60 67 79;
            --input: 60 67 79;
            --ring: 51 153 255;
          }
          
          :root.light {
            --background: 235 238 241;
            --foreground: 41 47 55;
            --card: 255 255 255;
            --card-foreground: 41 47 55;
            --popover: 255 255 255;
            --popover-foreground: 41 47 55;
            --primary: 51 153 255;
            --primary-foreground: 255 255 255;
            --secondary: 228 231 235;
            --secondary-foreground: 41 47 55;
            --muted: 228 231 235;
            --muted-foreground: 84 94 108;
            --accent: 51 153 255;
            --accent-foreground: 255 255 255;
            --destructive: 220 53 69;
            --destructive-foreground: 255 255 255;
            --border: 211 216 221;
            --input: 211 216 221;
            --ring: 51 153 255;
          }
          
          body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }
        `}
      </style>
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden md:flex flex-col border-r bg-card shadow-lg">
            <SidebarHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-foreground">AssetFlow</h2>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-2 flex-1">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`
                            w-full justify-start text-left px-3 py-2 rounded-md transition-all duration-200 text-base
                            ${location.pathname.startsWith(item.url)
                              ? 'bg-primary/20 text-primary-foreground font-semibold' 
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }
                          `}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="p-4 border-t">
              <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </Button>
            </SidebarFooter>
          </Sidebar>

          {/* Mobile Menu */}
          <div className={`md:hidden fixed inset-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-72 bg-card text-foreground shadow-2xl flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h2 className="font-bold text-xl">AssetFlow</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-2 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.title}
                      to={item.url} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-base
                        ${location.pathname.startsWith(item.url)
                          ? 'bg-primary/20 text-primary-foreground font-semibold' 
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t">
                 <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {/* Mobile Header */}
            <header className="md:hidden bg-card/80 backdrop-blur-md border-b px-4 py-2 sticky top-0 z-40">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="hover:bg-secondary"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold text-foreground">AssetFlow</h1>
                <div className="w-10" />
              </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}