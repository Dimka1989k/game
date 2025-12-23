import { useEffect, useRef } from "react";

interface Params {
  casinoSound: string;
  carSound: string;
  winSound: string;
  loseSound: string;
}

export function useGameAudio({
  casinoSound,
  carSound,
  winSound,
  loseSound,
}: Params) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const carAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(casinoSound);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
    }

    if (!carAudioRef.current) {
      carAudioRef.current = new Audio(carSound);
      carAudioRef.current.loop = true;
      carAudioRef.current.volume = 0.5;
    }

    const music = audioRef.current;

    const startMusic = () => {
      music?.play().catch(() => {});
      window.removeEventListener("click", startMusic);
    };

    window.addEventListener("click", startMusic);

    return () => {
      music?.pause();
      if (music) music.currentTime = 0;
      window.removeEventListener("click", startMusic);
    };
  }, [casinoSound, carSound]);

  useEffect(() => {
    winAudioRef.current = new Audio(winSound);
    winAudioRef.current.volume = 0.3;

    loseAudioRef.current = new Audio(loseSound);
    loseAudioRef.current.volume = 0.4;
  }, [winSound, loseSound]);

  return {
   
    carAudioRef,
    winAudioRef,
    loseAudioRef,
  };
}
