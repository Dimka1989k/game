import "../Plinko/Plinko.styles.css";
import { useMemo, useRef, useState } from "react";

import piramidBg from "../../assets/bg-paramid.svg";
import deerImg from "../../assets/img-deer.svg";

import { RISK_LEVELS, BALLS_OPTIONS, LINES } from "./plinko.constants";
import { getUIMultipliers } from "./plinko.multipliers";
import type { RiskLevel, PlinkoFinishPayload } from "../../types/plinko.types";
import { usePlinkoGame } from "../hooks/usePlinkoGame";

export interface PlinkoProps {
  onFinish: (payload: PlinkoFinishPayload) => void;
}

export default function Plinko({ onFinish }: PlinkoProps) {
  const [riskLevelIndex, setRiskLevelIndex] = useState(1);
  const [ballsCount, setBallsCount] = useState<number>(1);
  const [linesCount, setLinesCount] = useState<number>(8);

  const riskLevel = RISK_LEVELS[riskLevelIndex] as RiskLevel;
  const pyramidContainerRef = useRef<HTMLDivElement | null>(null);

  const totalBetFromUI = useMemo(() => {
    const ballsOption = BALLS_OPTIONS.find(
      (option) => option.balls === ballsCount
    );
    return ballsOption ? ballsOption.price : 0;
  }, [ballsCount]);

  const uiMultipliers = useMemo(
    () => getUIMultipliers(riskLevel, linesCount),
    [riskLevel, linesCount]
  );

  const { drop, isDropping, history, highlightSlot } = usePlinkoGame({
    containerRef: pyramidContainerRef,
    lines: linesCount,
    balls: ballsCount,
    risk: riskLevel,
    onFinish,
  });

  return (
    <div className="container-plinko">
      <div className="container-plinko-first">
        <p className="heading-plinko">PLINKO+</p>
        <div className="container-risk">
          <p className="heading">RISK</p>
          <div className="container-button">
            <button
              className="btn-plus-mines"
              onClick={() =>
                setRiskLevelIndex((index) => Math.max(0, index - 1))
              }
              disabled={isDropping}
            >
              -
            </button>
            <div className="btn-plus-mines">
              <p className="btn-plus-mines">{riskLevel}</p>
            </div>
            <button
              className="btn-plus-mines"
              onClick={() =>
                setRiskLevelIndex((index) =>
                  Math.min(RISK_LEVELS.length - 1, index + 1)
                )
              }
              disabled={isDropping}
            >
              +
            </button>
          </div>
        </div>
        <div className="container-balls">
          <p className="heading">BALLS</p>
          <div className="container-balls-btn">
            {Array.from({ length: 2 }).map((_, rowIndex) => (
              <div key={rowIndex} className="container-balls-btn-small">
                {BALLS_OPTIONS.slice(rowIndex * 2, rowIndex * 2 + 2).map(
                  ({ balls, price }) => (
                    <button
                      key={balls}
                      className={`btn-balls ${
                        ballsCount === balls ? "is-active" : ""
                      }`}
                      onClick={() => setBallsCount(balls)}
                      disabled={isDropping}
                    >
                      <p className="number-balls">{balls}</p>
                      <p className="price-balls">${price}.00</p>
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="container-lines">
          <p className="heading">LINES</p>
          <div className="container-button">
            {LINES.map((row) => (
              <div key={row.join("-")} className="container-btn-lines">
                {row.map((lineValue) => (
                  <button
                    key={lineValue}
                    className={`btn-lines ${
                      linesCount === lineValue ? "is-active" : ""
                    }`}
                    onClick={() => setLinesCount(lineValue)}
                    disabled={isDropping}
                  >
                    {lineValue}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button className="btn-drop" onClick={drop} disabled={isDropping}>
          Drop <span>{ballsCount}</span> ball <span>(${totalBetFromUI})</span>
        </button>
      </div>
      <div className="container-plinko-piramid" ref={pyramidContainerRef}>
        <img className="img-piramid" src={piramidBg} alt="piramid" />
        <img className="deer" src={deerImg} alt="deer" />

        <div className="container-btn-piramid">
          {uiMultipliers.map(({ value, className }, multiplierIndex) => (
            <div
              key={multiplierIndex}
              className={`${className} ${
                highlightSlot.includes(multiplierIndex) ? "is-highlighted" : ""
              }`}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="container-plinko-drops">
        <p className="heading-plinko">Recent Drops</p>
        <div className="container-drops">
          {history.length === 0 ? (
            <p className="text-drops">No drops yet</p>
          ) : (
            [...history]
              .slice(-12)
              .reverse()
              .map((drop) => {
                const maxMultiplier = drop.results.reduce(
                  (max, result) => Math.max(max, result.multiplier),
                  0
                );

                return (
                  <div key={drop.id} className="drop-row">
                    <div className="drop-left">
                      <span className="drop-mult">x{maxMultiplier}</span>
                      <span className="drop-risk">{drop.risk}</span>
                      <span className="drop-lines">{drop.lines}L</span>
                    </div>
                    <div className="drop-right">
                      <span
                        className={`drop-payout ${
                          drop.netProfit < 0 ? "is-lose" : "is-win"
                        }`}
                      >
                        {drop.netProfit < 0
                          ? `-$${Math.abs(drop.netProfit).toFixed(2)}`
                          : `+$${drop.netProfit.toFixed(2)}`}
                      </span>
                      <span className="drop-time">
                        {new Date(drop.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
