import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "./WalletButton";
import { supabase } from "@/integrations/supabase/client";
import logoIcon from "@/assets/logo-icon.svg";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [stats, setStats] = useState({
    total_wagers_placed: 0,
    total_volume: 0,
    solana_online: 0,
    base_online: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('global_stats')
        .select('*')
        .single();
      
      if (data) {
        setStats(data);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('navbar-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_stats',
        },
        (payload: any) => {
          setStats(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navLinks = [
    { to: "/games/cointoss", label: "Coinflip" },
    { to: "/games/luckyblock", label: "Jackpot" },
    { to: "/games/war", label: "War" },
    { to: "/games/chess", label: "Chess" },
    { to: "/games/connect4", label: "Connect4" },
    { to: "/forum", label: "Forum" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-primary bg-background/95 backdrop-blur-md shadow-glow-cyan" role="navigation" aria-label="Main navigation">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          {/* Logo - Responsive */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-all duration-200 ml-0 lg:ml-[280px]" aria-label="Home">
            <img src={logoIcon} alt="" className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-primary font-pixel text-sm sm:text-base lg:text-lg animate-glow-pulse hidden xs:block">
              THE BASEMENT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 xl:px-4 py-2 font-pixel text-xs rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  isActive(link.to)
                    ? "text-primary shadow-glow-cyan bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
                aria-current={isActive(link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Stats - Desktop */}
          <div className="hidden xl:flex items-center gap-4 font-mono text-[0.65rem] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-primary">Bets:</span>
              <span>{stats.total_wagers_placed.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-accent">Vol:</span>
              <span>${stats.total_volume.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-secondary">◎</span>
              <span>{stats.solana_online}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">⟠</span>
              <span>{stats.base_online}</span>
            </div>
          </div>

          {/* Wallet Button - Desktop */}
          <div className="hidden md:block shrink-0">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Mobile Menu - Improved Accessibility */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 space-y-1 border-t border-primary/30 animate-slide-in-bottom"
            role="menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
                className={`block px-4 py-3 font-pixel text-xs rounded-lg transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-primary bg-primary/10 shadow-glow-cyan"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
                aria-current={isActive(link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <WalletButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
