import { useRef, useCallback } from 'react';

// Sound effect URLs (placeholder - replace with actual assets when available)
const SOUNDS = {
  click: '/sounds/click.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  coinFlip: '/sounds/coin-flip.mp3',
  join: '/sounds/join.mp3',
  countdown: '/sounds/countdown.mp3',
  jackpot: '/sounds/jackpot.mp3',
};

export const useSound = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const play = useCallback((soundName: keyof typeof SOUNDS, volume: number = 0.5) => {
    try {
      if (!audioRefs.current[soundName]) {
        audioRefs.current[soundName] = new Audio(SOUNDS[soundName]);
      }
      
      const audio = audioRefs.current[soundName];
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Sound error:', error);
    }
  }, []);

  return { play };
};