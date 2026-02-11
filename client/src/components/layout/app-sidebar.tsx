import { Link, useLocation } from "wouter";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Search,
  GitCompare,
  Settings,
  Database,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "儀表板", icon: LayoutDashboard, href: "/" },
  { label: "比賽紀錄", icon: ClipboardList, href: "/scout" },
  { label: "隊伍查詢", icon: Search, href: "/teams" },
  { label: "隊伍比較", icon: GitCompare, href: "/compare" },
  { label: "設定", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    dispatch({
      type: "SET_THEME",
      payload: state.theme === "dark" ? "light" : "dark",
    });
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border/50">
        <h1 className="text-2xl font-display font-bold text-primary tracking-widest flex items-center gap-2">
          <Database className="w-6 h-6" />
          SCOUT<span className="text-foreground">MASTER</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">FRC DATA SYSTEM V1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer border border-transparent",
                location === item.href
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  location === item.href && "animate-pulse"
                )}
              />
              <span className="font-medium tracking-wide">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <Button
          variant="outline"
          className="w-full justify-between border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
          onClick={toggleTheme}
        >
          <span className="group-hover:text-primary transition-colors">切換模式</span>
          {state.theme === "dark" ? (
            <Moon className="w-4 h-4 text-primary" />
          ) : (
            <Sun className="w-4 h-4 text-orange-500" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur border-primary/50">
              <Menu className="w-5 h-5 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r-primary/20 bg-background/95">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-40">
        <NavContent />
      </div>
    </>
  );
}
