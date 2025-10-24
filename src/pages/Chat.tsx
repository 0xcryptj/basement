import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";

const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalStats />

      {/* Main content with left margin for sidebar */}
      <div className="ml-[280px] pt-20 pb-12 pr-4">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-pixel text-3xl md:text-4xl text-primary mb-3 animate-glow-pulse">
              /CHAT/
            </h1>
            <p className="font-mono text-xs text-muted-foreground max-w-2xl mx-auto">
              Connect with other players • Join the conversation • Real-time messaging
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-primary/30 p-6 rounded-lg animate-scale-in">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="font-pixel text-primary text-sm">→</span>
                <div>
                  <h3 className="font-pixel text-xs text-primary mb-2">Use the Sidebar</h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    All chat functionality is now in the left sidebar. Switch between channels and chat with other players in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-pixel text-primary text-sm">→</span>
                <div>
                  <h3 className="font-pixel text-xs text-primary mb-2">Available Channels</h3>
                  <div className="font-mono text-xs text-muted-foreground space-y-1">
                    <div>#luckyblock - Discuss game strategies</div>
                    <div>#basement - General chat</div>
                    <div>#arcade - Game discussions</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-pixel text-primary text-sm">→</span>
                <div>
                  <h3 className="font-pixel text-xs text-primary mb-2">Connect Your Wallet</h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    Connect your wallet to start chatting and participate in the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chat;
