import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { AppSidebar } from "@/components/layout/app-sidebar";

// Pages (to be created)
import Dashboard from "@/pages/dashboard";
import MatchScout from "@/pages/match-scout";
import TeamView from "@/pages/team-view";
import Comparison from "@/pages/comparison";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/scout" component={MatchScout} />
      <Route path="/teams" component={TeamView} />
      <Route path="/compare" component={Comparison} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <AppSidebar />
            <main className="lg:pl-64 min-h-screen transition-all duration-300">
              <div className="container mx-auto p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl animate-in fade-in duration-500">
                <Router />
              </div>
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AppProvider>
  );
}

export default App;
