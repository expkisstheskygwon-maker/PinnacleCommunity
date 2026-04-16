"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Trophy, Activity, TrendingUp, ShieldAlert, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [isProMode, setIsProMode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Layer */}
      <header className="border-b border-muted bg-secondary/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl tracking-tight">Pinnacle Community</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-muted/50">
              <span className={cn("text-sm font-medium transition-colors", !isProMode ? "text-primary" : "text-muted-foreground")}>
                Beginner
              </span>
              <Switch checked={isProMode} onCheckedChange={setIsProMode} />
              <span className={cn("text-sm font-medium transition-colors", isProMode ? "text-primary" : "text-muted-foreground")}>
                Pro
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
              <a href="#" className="text-foreground hover:text-primary transition">Live Odds</a>
              <a href="#" className="hover:text-primary transition">Match Analysis</a>
              <a href="#" className="hover:text-primary transition">Community</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Banner Section */}
        <section className="mb-10 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {isProMode ? "Advanced Markets & Analytics" : "Smart Betting Made Simple"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isProMode 
              ? "Deep dive into Asian Handicap movements, over/under disparities, and real-time Pinnacle API streams."
              : "AI-powered match summaries and visual insights for your favorite sports."}
          </p>
        </section>

        {/* Content Toggle Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {!isProMode ? (
              <BeginnerView />
            ) : (
              <ProView />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-muted bg-secondary/20 p-6 flex flex-col gap-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Active Community
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-muted pb-4 last:border-0 hover:bg-secondary/10 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      U{i}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">User{i * 102} shared a prediction</p>
                      <p className="text-xs text-muted-foreground mt-1">"Arsenal looks strong on standard lines given the current odds dropping before kickoff."</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BeginnerView() {
  return (
    <div className="rounded-xl border border-muted bg-gradient-to-br from-secondary/40 to-background p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary w-6 h-6" />
        <h3 className="text-xl font-bold">AI Match Summary</h3>
      </div>
      
      <div className="space-y-4">
        {/* Mock Match Card */}
        <div className="bg-background rounded-lg border border-muted overflow-hidden transition hover:border-primary/50 relative">
          <div className="p-4 border-b border-muted bg-secondary/20 flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Premier League</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live Now
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 text-center font-bold text-xl">Arsenal</div>
              <div className="px-4 text-xl font-black text-primary bg-primary/10 rounded-full py-1">VS</div>
              <div className="flex-1 text-center font-bold text-xl">Chelsea</div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 text-sm border-l-4 border-primary shadow-inner">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
              <div>
                <strong className="block mb-1 text-foreground">AI Verdict:</strong>
                <p className="text-muted-foreground leading-relaxed">Arsenal has a 65% win probability based on current momentum and historical stats. Considering Pinnacle's line movement, they are strongly favored to score first.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProView() {
  return (
    <div className="rounded-xl border border-muted bg-background shadow-lg overflow-hidden">
      <div className="p-6 border-b border-muted flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary w-6 h-6" />
          <h3 className="text-xl font-bold">Real-time Odds Flow</h3>
        </div>
        <div className="flex items-center gap-2 text-xs bg-background px-3 py-1 rounded-full border border-muted">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-mono">Lat: 42ms</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b border-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Match</th>
              <th className="px-6 py-4 font-medium">Moneyline (1X2)</th>
              <th className="px-6 py-4 font-medium text-center">Asian Handicap</th>
              <th className="px-6 py-4 font-medium text-center">Over/Under</th>
              <th className="px-6 py-4 font-medium text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-muted/50 hover:bg-secondary/10 transition group">
              <td className="px-6 py-4 font-medium">
                ARS vs CHE <br/>
                <span className="text-xs text-muted-foreground font-mono">EPL • 23:00</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <span className="bg-secondary/50 px-2 py-1 rounded text-primary border border-primary/20 shadow-sm font-mono font-semibold">1.85</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded font-mono">3.65</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded text-red-400 font-mono">4.10</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center p-1 rounded hover:bg-background">
                  <span className="font-semibold text-primary font-mono">-0.5</span>
                  <span className="text-xs text-muted-foreground font-mono">@ 1.88</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center p-1 rounded hover:bg-background">
                  <span className="font-semibold font-mono">O 2.5</span>
                  <span className="text-xs text-muted-foreground font-mono">@ 1.95</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-xs font-medium text-primary flex items-center justify-end gap-1 bg-primary/10 px-2 py-1 rounded-full border border-primary/20 inline-flex">
                  <TrendingUp className="w-3 h-3" /> ARS dropping
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
