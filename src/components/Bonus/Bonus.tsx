import "./Bonus.styles.css";
import { useEffect, useRef } from "react";
import iconBonus from "../../assets/icon-bonus.svg";
import clockIcon from "../../assets/clock.svg";

import buttonSounds from "../../assets/sounds/button.mp3"

interface BonusProps {
  bonusCountdown: number;
  bonusAmount: number;
  onClaim: () => void;
  formatTime: (seconds: number) => string;
}

export default function Bonus({
  bonusCountdown,
  bonusAmount,
  onClaim,
  formatTime,
}: BonusProps) {


  const buttonSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    buttonSoundRef.current = new Audio(buttonSounds);
    buttonSoundRef.current.volume = 0.5;
  }, []);


  const playButtonSound = () => {
    const snd = buttonSoundRef.current;
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  };


  return (
    <div className="container-bonus">
      <div className="conatiner-logo">
        <img src={iconBonus} alt="iconBonus" width="40" height="40" />
        <div className="container-text">
          <p className="header-text">Claim Bonus</p>
          <p className="text-out">Free money every minute</p>
        </div>
      </div>
      <div className="container-amount">
        <div className="container-claim">
          <div className="container-clock">
            <p className="text-clock">Next claim:</p>
            <div className="clock">
              <img src={clockIcon} alt="" width="16" height="16" />
              <p className="time">{formatTime(bonusCountdown)}</p>
            </div>
          </div>
          <div className="container-clock">
            <p className="text-clock">Amount:</p>
            <p className="green-text">${bonusAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <button
        className="btn-claim"
        disabled={bonusCountdown > 0}
        onClick={() => {
          if (bonusCountdown <= 0) {
            playButtonSound(); 
            onClaim();
          }
        }}
        style={{
          opacity: bonusCountdown > 0 ? 0.6 : 1,
          cursor: bonusCountdown > 0 ? "not-allowed" : "pointer",
        }}
      >
        {bonusCountdown > 0 ? "Wait..." : "Claim Now!"}
      </button>
    </div>
  );
}
