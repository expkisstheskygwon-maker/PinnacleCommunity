"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, ChevronDown, ChevronRight, 
  Trophy, Globe, Activity, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface League {
  id: number;
  name: string;
  logo: string;
}

interface Country {
  name: string;
  flag: string;
  leagues: League[];
}

interface SportsSidebarProps {
  currentSport: string;
  onSportChange: (sport: string) => void;
  onLeagueSelect: (leagueId: number | null) => void;
  selectedLeagueId: number | null;
}

export default function SportsSidebar({
  currentSport,
  onSportChange,
  onLeagueSelect,
  selectedLeagueId
}: SportsSidebarProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeagues();
  }, [currentSport]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sports/leagues?sport=${currentSport}&t=${Date.now()}`);
      const data = await res.json();
      if (data.countries) {
        setCountries(data.countries);
      }
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryName: string) => {
    setExpandedCountries(prev => 
      prev.includes(countryName) 
        ? prev.filter(c => c !== countryName)
        : [...prev, countryName]
    );
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.leagues.some(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sports = [
    { id: 'all', label: '전체', icon: '🌐' },
    { id: 'soccer', label: '축구', icon: '⚽' },
    { id: 'baseball', label: '야구', icon: '⚾' },
    { id: 'basketball', label: '농구', icon: '🏀' },
  ];

  return (
    <div className="w-64 flex flex-col gap-4 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Sport Selector */}
      <div className="glass-card p-1 flex gap-1 rounded-xl">
        {sports.map(sport => (
          <button
            key={sport.id}
            onClick={() => onSportChange(sport.id)}
            className={cn(
              "flex-1 flex flex-col items-center py-2 rounded-lg transition-all",
              currentSport === sport.id 
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" 
                : "hover:bg-white/5 text-muted-foreground"
            )}
          >
            <span className="text-lg">{sport.icon}</span>
            <span className="text-[10px] font-bold mt-0.5">{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Search Leagues */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="리그/국가 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-primary/50 transition-all shadow-inner"
        />
      </div>

      {/* Leagues List */}
      <div className="glass-card flex-1 overflow-y-auto custom-scrollbar rounded-2xl p-2">
        <button
          onClick={() => onLeagueSelect(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors mb-1",
            selectedLeagueId === null ? "bg-primary/20 text-primary border border-primary/20" : "hover:bg-white/5 text-muted-foreground"
          )}
        >
          <Activity className="w-4 h-4" /> 전체 경기 보기
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-[10px] font-bold">리그 불러오는 중...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCountries.map((country, idx) => (
              <div key={`${country.name}-${idx}`} className="overflow-hidden">
                <button
                  onClick={() => toggleCountry(country.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {country.flag ? (
                      <img src={country.flag} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground/40" />
                    )}
                    <span className="text-[11px] font-bold text-foreground/80 group-hover:text-foreground transition-colors">{country.name}</span>
                  </div>
                  {expandedCountries.includes(country.name) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                
                {expandedCountries.includes(country.name) && (
                  <div className="pl-6 pr-2 py-1 space-y-1 animate-fade-in">
                    {country.leagues.map(league => (
                      <button
                        key={league.id}
                        onClick={() => onLeagueSelect(league.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] transition-all text-left",
                          selectedLeagueId === league.id 
                            ? "bg-primary/10 text-primary border-l-2 border-primary font-bold" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <span className="truncate">{league.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
