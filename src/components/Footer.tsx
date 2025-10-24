import { Twitter, Github, Send } from "lucide-react";

export const Footer = () => {
  const socialLinks = [
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      url: "https://twitter.com/thebasement",
      color: "primary",
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      url: "https://t.me/thebasement",
      color: "secondary",
    },
    {
      name: "GitHub",
      icon: <Github className="w-5 h-5" />,
      url: "https://github.com/0xcryptj/basement",
      color: "accent",
    },
  ];

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
            <div className="space-y-2">
              <a
                href="https://dexscreener.com/base/0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-xs text-foreground hover:text-primary transition-colors"
              >
                <span className="text-muted-foreground">Base:</span> 0xfd73...bc7b
              </a>
              <a
                href="https://dexscreener.com/solana/D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-xs text-foreground hover:text-secondary transition-colors"
              >
                <span className="text-muted-foreground">Solana:</span> D4MX...pump
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-pixel text-sm text-primary mb-3">CONNECT</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-all hover:scale-110 ${
                    link.color === "primary"
                      ? "text-primary hover:shadow-glow-cyan"
                      : link.color === "secondary"
                      ? "text-secondary hover:shadow-glow-purple"
                      : "text-accent hover:shadow-glow-magenta"
                  }`}
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
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
