import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "./WalletButton";
import logoIcon from "@/assets/logo-icon.svg";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/games/cointoss", label: "Coinflip" },
    { to: "/games/luckyblock", label: "Lucky Block" },
    { to: "/games/war", label: "War" },
    { to: "/games/chess", label: "Chess" },
    { to: "/games/connect4", label: "Connect4" },
    { to: "/forum", label: "Forum" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-primary bg-background/95 backdrop-blur-sm shadow-glow-cyan">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src={logoIcon} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
            <div className="text-primary font-pixel text-lg sm:text-xl animate-glow-pulse">
              THE BASEMENT
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 font-pixel text-xs transition-all duration-300 ${
                  isActive(link.to)
                    ? "text-primary shadow-glow-cyan"
                    : "text-muted-foreground hover:text-primary hover:shadow-glow-cyan"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary p-2 hover:shadow-glow-cyan transition-all"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-primary/30 animate-slide-in-bottom">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 font-pixel text-xs transition-all duration-300 ${
                  isActive(link.to)
                    ? "text-primary shadow-glow-cyan"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <WalletButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
