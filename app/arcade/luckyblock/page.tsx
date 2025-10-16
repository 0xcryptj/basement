import { LuckyBlockGame } from '@/components/arcade/LuckyBlockGame';

export const metadata = {
  title: 'Lucky Block Jackpot - The Basement Arcade',
  description: 'Multi-player jackpot game on Base Network',
};

export default function LuckyBlockPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      paddingTop: '80px',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <LuckyBlockGame />
    </main>
  );
}

