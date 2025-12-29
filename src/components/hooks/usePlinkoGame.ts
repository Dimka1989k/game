import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Matter from "matter-js";

import type {
  PlinkoBallResult,
  PlinkoDropHistoryItem,
  PlinkoFinishPayload,
  RiskLevel,
} from "../../types/plinko.types";

import {
  loadPlinkoHistory,
  savePlinkoHistory,
  generateHistoryId,
} from "../Plinko/plinko.history";

import { BALLS_OPTIONS, HISTORY_LIMIT } from "../Plinko/plinko.constants";
import { getUIMultipliers } from "../Plinko/plinko.multipliers";

type UsePlinkoGameArgs = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  lines: number;
  balls: number;
  risk: RiskLevel;
  onFinish: (payload: PlinkoFinishPayload) => void;
};

type SlotGeom = {
  x: number;
  yTop: number;
  width: number;
  height: number;
};

function safeUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `drop_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function usePlinkoGame({
  containerRef,
  lines,
  balls,
  risk,
  onFinish,
}: UsePlinkoGameArgs) {
  const [isDropping, setIsDropping] = useState(false);
  const [history, setHistory] =
    useState<PlinkoDropHistoryItem[]>(loadPlinkoHistory);
  const [highlightSlot, setHighlightSlot] = useState<number[]>([]);

  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const slotGeomsRef = useRef<SlotGeom[]>([]);
  const activeBallsRef = useRef<Matter.Body[]>([]);
  const lockedRef = useRef(false);

  const uiMultipliers = useMemo(
    () => getUIMultipliers(risk, lines),
    [risk, lines]
  );

  useEffect(() => {
    savePlinkoHistory(history);
  }, [history]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
      renderRef.current.textures = {};
      renderRef.current = null;
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
      runnerRef.current = null;
    }
    engineRef.current = null;
    activeBallsRef.current = [];
    slotGeomsRef.current = [];

    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Matter.Engine.create();
    engine.gravity.y = 1.25;

    const render = Matter.Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
      },
    });

    const runner = Matter.Runner.create();

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    const PEG_RADIUS = 4.5;
    const PEG_SPACING_X = 24;
    const PEG_SPACING_Y = 24;
    const TOP_PADDING = 40;

    const SLOT_STOPPER_H = 30;
    const SLOT_WALL_H = 70;
    const SLOT_WALL_W = 6;

    const pegs: Matter.Body[] = [];
    const rows = lines;
    const centerX = width / 2;

    for (let r = 0; r < rows; r++) {
      const cols = r + 1;
      const rowY = TOP_PADDING + r * PEG_SPACING_Y;
      const rowWidth = (cols - 1) * PEG_SPACING_X;
      const startX = centerX - rowWidth / 2;

      for (let c = 0; c < cols; c++) {
        const x = startX + c * PEG_SPACING_X;
        const peg = Matter.Bodies.circle(x, rowY, PEG_RADIUS, {
          isStatic: true,
          label: "peg",
          render: { fillStyle: "rgba(255,255,255,0.55)" },
        });
        pegs.push(peg);
      }
    }

    const slotCount = lines + 1;
    const slotsY = height - 60 + 59;

    const slotW = PEG_SPACING_X;
    const totalSlotsW = slotCount * slotW;
    const slotsStartX = centerX - totalSlotsW / 2 + slotW / 2;

    const slotBodies: Matter.Body[] = [];
    const slotGeoms: SlotGeom[] = [];

    for (let i = 0; i < slotCount; i++) {
      const xCenter = slotsStartX + i * slotW;

      const stopper = Matter.Bodies.rectangle(
        xCenter,
        slotsY,
        slotW,
        SLOT_STOPPER_H,
        {
          isStatic: true,
          restitution: 0,
          friction: 0.8,
          slop: 0,
          label: `slot-stopper-${i}`,
          render: { fillStyle: "rgba(0,0,0,0)" },
        }
      );

      slotBodies.push(stopper);

      slotGeoms.push({
        x: xCenter,
        yTop: slotsY - SLOT_STOPPER_H / 2,
        width: slotW,
        height: SLOT_STOPPER_H,
      });

      if (i < slotCount - 1) {
        const wallX = xCenter + slotW / 2;
        const wall = Matter.Bodies.rectangle(
          wallX,
          slotsY - SLOT_WALL_H / 2,
          SLOT_WALL_W,
          SLOT_WALL_H,
          {
            isStatic: true,
            label: `slot-wall-${i}`,
            render: { fillStyle: "rgba(0,0,0,0)" },
          }
        );
        slotBodies.push(wall);
      }
    }

    slotGeomsRef.current = slotGeoms;

    const bounds = [
      Matter.Bodies.rectangle(width / 2, -10, width, 20, {
        isStatic: true,
        render: { visible: false },
      }),

      Matter.Bodies.rectangle(-10, height / 2, 20, height, {
        isStatic: true,
        render: { visible: false },
      }),
      Matter.Bodies.rectangle(width + 10, height / 2, 20, height, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    Matter.World.add(engine.world, [...bounds, ...pegs, ...slotBodies]);

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    function clearRenderTextures(render: Matter.Render) {
      if ("textures" in render) {
        render.textures = {};
      }
    }

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);

        if (renderRef.current.canvas?.parentNode) {
          renderRef.current.canvas.remove();
        }

        clearRenderTextures(renderRef.current);
        renderRef.current = null;
      }

      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }

      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }

      activeBallsRef.current = [];
      slotGeomsRef.current = [];
    };
  }, [containerRef, lines]);

  const drop = useCallback(() => {
    const engine = engineRef.current;
    const render = renderRef.current;
    const container = containerRef.current;

    if (!engine || !render || !container) return;
    if (lockedRef.current) return;
    if (balls <= 0) return;

    lockedRef.current = true;
    setIsDropping(true);
    setHighlightSlot([]);

    const betOption = BALLS_OPTIONS.find((b) => b.balls === balls);
    const price = betOption?.price ?? balls * 2;

    for (const ball of activeBallsRef.current) {
      if (engine.world.bodies.includes(ball)) {
        Matter.World.remove(engine.world, ball);
      }
    }
    activeBallsRef.current = [];

    const totalBet = price;

    const BALL_RADIUS = 5;
    const BALL_COLOR = "#22c55e";
    const width = render.options.width ?? container.clientWidth;
    const startX = width / 2;
    const xJitter = 6;

    activeBallsRef.current = [];

    const restitution =
      risk === "High" ? 0.15 : risk === "Medium" ? 0.22 : 0.28;

    for (let b = 0; b < balls; b++) {
      const ball = Matter.Bodies.circle(
        startX + (Math.random() * 2 - 1) * xJitter,
        20,
        BALL_RADIUS,
        {
          restitution,
          friction: 0.001,
          frictionAir: 0.01,
          density: 0.001,
          label: "plinko-ball",
          render: { fillStyle: BALL_COLOR },
        }
      );
      activeBallsRef.current.push(ball);
      Matter.World.add(engine.world, ball);
    }

    const results: PlinkoBallResult[] = [];
    const settled = new Set<number>();
    const EXPECTED_RESULTS = balls;

    const settleCheck = () => {
      const ballsArr = activeBallsRef.current;
      if (ballsArr.length === 0) return;

      const slots = slotGeomsRef.current;
      if (slots.length === 0) return;

      const yThreshold = slots[0].yTop - 40;
      for (const ball of ballsArr) {
        if (settled.has(ball.id)) continue;

        const speed = ball.speed;
        if (ball.speed < 0.04 && ball.position.y < yThreshold - 20) {
          Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.0008,
            y: 0.0015,
          });
        }
        const isLow = speed < 0.25;
        const isLowEnough = ball.position.y > yThreshold;

        if (isLow && isLowEnough) {
          const slotIndex = slots.findIndex(
            (s) =>
              ball.position.x >= s.x - s.width / 2 &&
              ball.position.x <= s.x + s.width / 2
          );

          if (slotIndex === -1) {
            settled.add(ball.id);

            results.push({
              slotIndex: -1,
              multiplier: 0,
              payout: 0,
            });

            Matter.World.remove(engine.world, ball);
            continue;
          }
          const slot = slots[slotIndex];

          Matter.Body.setVelocity(ball, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(ball, 0);
          Matter.Body.setPosition(ball, {
            x: slot.x,
            y: slot.yTop - BALL_RADIUS - 2,
          });
          Matter.Body.setStatic(ball, true);

          Matter.Sleeping.set(ball, true);

          settled.add(ball.id);

          const multiplier = uiMultipliers[slotIndex]?.value ?? 0;
          const payout = +(price * multiplier).toFixed(2);

          results.push({ slotIndex, multiplier, payout });
          setHighlightSlot((prev) => {
            if (prev.includes(slotIndex)) return prev;
            return [...prev, slotIndex];
          });
        }
      }

      if (results.length === EXPECTED_RESULTS) {
        Matter.Events.off(engine, "afterUpdate", settleCheck);

        const totalPayout = +results
          .reduce((s, r) => s + r.payout, 0)
          .toFixed(2);

        const hasLoseBall = results.some(
          (r) => r.slotIndex === -1 || r.multiplier < 1
        );

        const netProfit = hasLoseBall ? -totalBet : +totalPayout;

        const historyItem: PlinkoDropHistoryItem = {
          id: generateHistoryId(),
          timestamp: new Date().toISOString(),
          bet: totalBet,
          balls,
          risk,
          lines,
          results,
          netProfit,
        };

        setHistory((prev) => [...prev, historyItem].slice(-HISTORY_LIMIT));

        onFinish({
          netProfit,
          totalBet,
          totalPayout,
          results,
          risk,
          lines,
          balls,
        });

        window.setTimeout(() => {
          lockedRef.current = false;
          setIsDropping(false);
        }, 400);
      }
    };

    Matter.Events.on(engine, "afterUpdate", settleCheck);
    const SAFETY_FINISH_MS = 5000;

    window.setTimeout(() => {
      if (results.length < EXPECTED_RESULTS) {
        const missing = EXPECTED_RESULTS - results.length;

        for (let i = 0; i < missing; i++) {
          results.push({
            slotIndex: -1,
            multiplier: 0,
            payout: 0,
          });
        }

        Matter.Events.off(engine, "afterUpdate", settleCheck);

        const totalPayout = +results
          .reduce((s, r) => s + r.payout, 0)
          .toFixed(2);

        const hasLoseBall = results.some(
          (r) => r.slotIndex !== -1 && r.multiplier < 1
        );

        const netProfit = hasLoseBall ? -totalBet : +totalPayout;

        const historyItem: PlinkoDropHistoryItem = {
          id: safeUUID(),
          timestamp: new Date().toISOString(),
          bet: totalBet,
          balls,
          risk,
          lines,
          results,
          netProfit,
        };

        setHistory((prev) => [...prev, historyItem].slice(-HISTORY_LIMIT));

        onFinish({
          netProfit,
          totalBet,
          totalPayout,
          results,
          risk,
          lines,
          balls,
        });

        lockedRef.current = false;
        setIsDropping(false);
      }
    }, SAFETY_FINISH_MS);
  }, [balls, risk, lines, containerRef, uiMultipliers, onFinish]);

  return { drop, isDropping, history, highlightSlot };
}
