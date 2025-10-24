import { Twitter, Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-primary bg-background/95 backdrop-blur-md py-6 mt-auto lg:ml-[280px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Branding */}
          <div>
            <h3 className="font-pixel text-xs text-primary mb-1">THE BASEMENT</h3>
            <p className="font-mono text-[0.65rem] text-muted-foreground">
              Retro Web3 arcade, IRC chat, and anonymous forum
            </p>
          </div>

          {/* Token Info */}
          <div>
            <h3 className="font-pixel text-xs text-primary mb-1">TOKENS</h3>
            <div className="space-y-2">
              <div>
                <a
                  href="https://dexscreener.com/base/0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[0.6rem] text-primary hover:text-primary/80 transition-colors break-all"
                >
                  ⟠ 0xfd73...bc7b
                </a>
              </div>
              <div>
                <a
                  href="https://dexscreener.com/solana/D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-[0.6rem] text-secondary hover:text-secondary/80 transition-colors break-all"
                >
                  ◎ D4MX...pump
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-pixel text-xs text-primary mb-1">CONNECT</h3>
            <div className="flex space-x-3">
              <a
                href="https://zora.co/@0xbasement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-all hover:scale-110"
                aria-label="Zora"
              >
                <Sparkles className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/joseph1133287"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-3 pt-3 border-t border-primary/20 text-center">
          <p className="font-mono text-[0.6rem] text-muted-foreground">
            © 2025 The Basement • 10% House Fee
          </p>
        </div>
      </div>
    </footer>
  );
};
