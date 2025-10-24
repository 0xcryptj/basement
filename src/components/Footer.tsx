import { Twitter, Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t-2 border-primary bg-card/50 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <h3 className="font-pixel text-sm text-primary mb-3">THE BASEMENT</h3>
            <p className="font-mono text-xs text-muted-foreground">
              Retro Web3 arcade, IRC chat, and anonymous forum
            </p>
          </div>

          {/* Token Info */}
          <div>
            <h3 className="font-pixel text-sm text-primary mb-3">TOKENS</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary font-bold text-base">⟠</span>
                  <span className="font-mono text-xs text-muted-foreground">Base (ETH):</span>
                </div>
                <a
                  href="https://dexscreener.com/base/0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[0.65rem] text-primary hover:text-primary/80 transition-colors break-all pl-6"
                >
                  0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b
                </a>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-secondary font-bold text-base">◎</span>
                  <span className="font-mono text-xs text-muted-foreground">Solana (SOL):</span>
                </div>
                <a
                  href="https://dexscreener.com/solana/D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[0.65rem] text-secondary hover:text-secondary/80 transition-colors break-all pl-6"
                >
                  D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-pixel text-sm text-primary mb-3">CONNECT</h3>
            <div className="flex space-x-4">
              <a
                href="https://zora.co/@0xbasement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-all hover:scale-110"
                aria-label="Zora"
              >
                <Sparkles className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/joseph1133287"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-primary/30 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            © 2025 The Basement • 10% House Fee on All Transactions
          </p>
        </div>
      </div>
    </footer>
  );
};
