import "./Mines.styles.css";

import { useState } from "react";

import iconMines from "../../assets/mines/dolar.svg";
import iconMin from "../../assets/mines/Icon-mines.svg";
import iconDiamant from "../../assets/mines/diamant.svg";
import iconMine from "../../assets/mines/mine.svg";

import loseSound from "../../assets/sounds/lose_mines.mp3";
import winSound from "../../assets/sounds/win-mines.mp3";

import Emoji from "../Emoji";
import { formatMoney } from "../../utils/formatMoney";

import { useMinesGame } from "../hooks/useMinesGame";
import { useMinesSounds } from "../hooks/useMinesSounds";
import { calculateCashOut, calculateMultiplier } from "../../utils/minesMath";
import { parseBetAmount } from "../../utils/parseBetAmount";

interface Props {
  betAmount: string;
  setBetAmount: (v: string) => void;
  onStartGame: (bet: number) => void;
  onCashOut: (amount: number) => void;
}

export default function Mines({
  betAmount,
  setBetAmount,
  onStartGame,
  onCashOut,
}: Props) {
  const bet = parseBetAmount(betAmount, { min: 1 });

  const [minesCount, setMinesCount] = useState(3);

  const {
    tiles,
    status,
    outcome,
    revealedCount,
    multiplier,
    start,
    revealTile,
    cashOut,
    reset,
  } = useMinesGame(minesCount);

  const { playWin, playLose } = useMinesSounds(winSound, loseSound);

  const cashOutValue = bet !== null ? calculateCashOut(bet, multiplier) : 0;

  const MINES_OPTIONS = [1, 3, 5, 10, 24];
  const BET_PRESETS = ["10", "50", "100", "500"];

  const isIdle = status === "idle";
  const isRunning = status === "running";
  const isFinished = status === "finished";

  const nextMultiplier =
    status === "running"
      ? calculateMultiplier(minesCount, revealedCount + 1)
      : 1;

  const isStartDisabled = isFinished;
  const isStartLocked = isFinished;

  function handleStartGame() {
    if (bet === null) return;
    onStartGame(bet);
    start();
  }

  function handleReveal(index: number) {
    const result = revealTile(index);
    if (result === "lose") playLose();
  }

  function handleCashOut() {
    cashOut();
    onCashOut(cashOutValue);
    playWin();
  }

  function handleMainActionClick() {
    if (status === "running") {
      handleCashOut();
      return;
    }

    if (isIdle) {
      handleStartGame();
    }
  }

  return (
    <div className="container-mines">
      <div className="container-mines-field">
        <div className="container-mines-text">
          <p className="text-mines">Mines</p>
          {!isIdle && (
            <div className="container-reveald">
              <p className="paragraph-text">
                Revealed: <span className="text-container">{revealedCount}</span>
              </p>
              <p className="paragraph-text">
                Multiplier: <span className="text-container-multiplier">
                  {formatMoney(multiplier)}x
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="mines-field">
          {isIdle ? (
            <div className="container-start-game-mines">
              <img src={iconMin} width={64} height={64} />
              <p className="text-start">Place a bet to start</p>
            </div>
          ) : (
            <div className="container-field-tapeworm">
              {tiles.map((state, tileIndex) => (
                <div
                  key={tileIndex}
                  className={`container-size ${state}`}
                  onClick={() => handleReveal(tileIndex)}
                >
                  {state === "safe" && (
                    <img
                      src={iconDiamant}
                      alt="diamond"
                      className="tile-icon"
                    />
                  )}
                  {state === "mine" && (
                    <img src={iconMine} alt="mine" className="tile-icon" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {isFinished && outcome === "lose" && (
          <div className="container-game-over">
            <p className="text-game-over">
              <Emoji char="💣" size={24} /> You hit a mine!
            </p>
            <button className="btn-new-game" onClick={reset}>
              New Game
            </button>
          </div>
        )}
        {isFinished && outcome === "win" && (
          <div className="container-game-win">
            <p className="text-game-win">
              <Emoji char="🎉" size={24} /> Cashed out successfully!
            </p>
            <p className="paragraph-text">
              Won:{" "}
              <span className="text-container">
                {formatMoney(cashOutValue)}
              </span>
            </p>
            <button className="btn-new-game" onClick={reset}>
              New Game
            </button>
          </div>
        )}
      </div>
      <div className="container-game-mines">
        <p className="txt">Game Settings</p>
        <div className="container-settings">
          <div className="container-amount-settings">
            <p className="text-settings">Bet Amount</p>
            <input
              type="text"
              className="input-mines"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={!isIdle}
            />
          </div>
          <div className="button-betting-mines">
            {BET_PRESETS.map((betPreset) => (
              <button
                key={betPreset}
                className="btn-betting-mines"
                onClick={() => setBetAmount(betPreset)}
                disabled={!isIdle}
              >
                ${betPreset}
              </button>
            ))}
          </div>
          <p className="text-settings">
            Mines: <span>{minesCount}</span>
          </p>
          <div className="container-mines-quantity">
            {MINES_OPTIONS.map((minesOption) => (
              <button
                key={minesOption}
                className={`btn-mines-quantity ${
                  minesCount === minesOption ? "active" : ""
                }`}
                disabled={!isIdle}
                onClick={() => setMinesCount(minesOption)}
              >
                {minesOption}
              </button>
            ))}
          </div>
          <button
            className={`btn-mines
                       ${isRunning ? "cashout-pulse" : ""}
                      ${isStartLocked ? "btn-mines-disabled" : ""}`}
            disabled={isStartDisabled}
            style={
              isRunning
                ? { background: "linear-gradient(90deg, #D08700 0%, #F54900 100%)",}
                : {}
            }
            onClick={handleMainActionClick}
          >
            <img src={iconMines} />
            {isRunning
              ? `Cash Out ${formatMoney(cashOutValue)}`
              : "Start Game"}
          </button>
        </div>
        <div className="container-current">
          <p className="txt-current-head">Current Game</p>
          <div className="container-current-mines">
            <div className="container-current-text">
              <p className="text-current">Bet Amount:</p>
              <p className="text-bet">{formatMoney(bet)}</p>
            </div>
            <div className="container-current-text">
              <p className="text-current">Current Value:</p>
              <p className="text-value">{formatMoney(cashOutValue)}</p>
            </div>
            <div className="container-current-text">
              <p className="text-current">Next Tile:</p>
              <p className="text-container-multiplier">
                {nextMultiplier.toFixed(2)}x
              </p>
            </div>
            <div className="line"></div>
            <div className="container-current-text">
              <p className="text-current">Safe Tiles Left:</p>
              <p className="text-safe">{25 - minesCount - revealedCount}</p>
            </div>
          </div>
        </div>
        <div className="container-tips">
          <p className="tips-heading">
            <Emoji char="💡" size={20} /> Tips
          </p>
          <ul className="tips-item">
            <li>• More mines = higher multiplier</li>
            <li>• Cash out anytime to secure wins</li>
            <li>• Each safe tile increases payout</li>
            <li>• One mine ends the game</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
