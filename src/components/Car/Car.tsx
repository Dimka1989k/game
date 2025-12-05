import { useEffect } from "react";
import carIcon from "../../assets/car.svg";
import roadIcon from "../../assets/road.svg";
import imageMoney from "../../assets/truck-money.svg";

import { GameState } from "../../types/GameState";

import { formatMoney } from "../../utils/formatMoney";


import "./Car.styles.css";

interface Props {
  betAmount: string;
  setBetAmount: (v: string) => void;
  gameState: GameState;
  handleStart: () => void;
  handleCashOut: (val: number) => void;
  crashValue: number;
  liveCashout: number;
  finalValueRef: React.RefObject<number | null>;
  hasCashedOut: boolean;
  showMoney: boolean;
  carRef: React.RefObject<HTMLImageElement | null>;
  roadRef: React.RefObject<HTMLDivElement | null>;
  isAnimating: boolean;
}

export default function Car({
  betAmount,
  setBetAmount,
  gameState,
  handleStart,
  handleCashOut,
  crashValue,
  liveCashout,
  finalValueRef,
  hasCashedOut,
  showMoney,
  carRef,
  roadRef,
  isAnimating,
}: Props) {
  
  useEffect(() => {
    if (!carRef.current || !roadRef.current || !isAnimating) return;
    const roadWidth = roadRef.current.clientWidth;
    const carWidth = carRef.current.clientWidth;
    const maxDistance = roadWidth - carWidth - 20;
    const target = finalValueRef.current || 1;
    const progress = Math.min(crashValue / target, 1);
    carRef.current.style.transform = `translateX(${progress * maxDistance}px)`;
    carRef.current.style.transition = "transform 0.05s linear";
 
  }, [crashValue, isAnimating]);


  const valueColor = (() => {
  if (crashValue === 0.0 || isAnimating) return "#fff";
  if (hasCashedOut) return "#19DD57";
  if (crashValue >= 3.25) return "#19DD57";
  return "#D4183D";
})();


const handleButtonClick = () => {
  if (gameState === GameState.Idle) {
    handleStart();
    return;
  }

  if (gameState === GameState.Cashable) {
    handleCashOut(liveCashout);
    return;
  }
};

  return (
    <div className="container-car">
      <div
        className="container-black"
        ref={roadRef}
        style={{ position: "relative" }}
      >
        <div className="container-balance-win">
          <p
            className="balance-win"
           style={{ color: valueColor }}
          >
            {formatMoney(crashValue)}
          </p>
        </div>
        <img
          src={carIcon}
          alt="car"
          width="259"
          height="116"
          className="car"
          ref={carRef}
        />
        {showMoney && (
          <img
            src={imageMoney}
            alt="money"
            width="300"
            height="200"
            className="money-fly"
          />
        )}

        <img src={roadIcon} alt="road" />
      </div>

      <div className="container-info">
        <p className="txt-info">Bet Amount</p>

        <div className="container-start">
          <input
            type="text"
            className="input-price"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />

          <button
            className="btn-start"
            style={{
              background:
                gameState === "cashable"
                  ? "linear-gradient(90deg, #00A63E 0%, #009966 100%)"
                  : "var(--bg-btn-start)",
            }}
            onClick={handleButtonClick}
          >
            {gameState === "cashable" ? "Cash Out" : "Start"}
          </button>
        </div>

        <div className="container-button">
          {["10", "50", "100", "500"].map((v) => (
            <button
              key={v}
              className="btn-betting"
              onClick={() => setBetAmount(v)}
            >
              ${v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
