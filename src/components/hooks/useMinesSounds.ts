import { useEffect, useRef } from "react";

export function useMinesSounds(winSound: string, loseSound: string) {
  const winAudio = useRef<HTMLAudioElement | null>(null);
  const loseAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    winAudio.current = new Audio(winSound);
    loseAudio.current = new Audio(loseSound);

    winAudio.current.volume = 0.2;
    loseAudio.current.volume = 0.2;
  }, [winSound, loseSound]);

  const playWin = () => {
    winAudio.current?.play().catch(() => {});
  };

  const playLose = () => {
    loseAudio.current?.play().catch(() => {});
  };

  return { playWin, playLose };
}
