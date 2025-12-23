import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { GameState } from "../types/GameState";

import casinoSound from "../assets/sounds/casino1.mp3";
import carSound from "../assets/sounds/car.mp3";
import won from "../assets/sounds/won.mp3";
import gameOver from "../assets/sounds/gameover.mp3";

import { GameTab } from "../types/tabs.types";
import { formatMoney } from "../utils/formatMoney";
import { parseBetAmount } from "../utils/parseBetAmount";

import Tabs from "../components/Tabs/Tabs";
import Car from "../components/Car/Car";
import Header from "../components/Header/Header";
import Bonus from "../components/Bonus/Bonus";
import Leaderboard from "../components/Leader/LeaderBoard";
import Cases from "../components/Cases/Cases";
import Mines from "../components/Mines/Mines";

import type { ActiveBet } from "../types/bet.types";
import { formatTime } from "../utils/formatTime";

import { useGameAudio } from "../components/hooks/useGameAudio";
import { useProfileManagement } from "../components/hooks/useProfileManagement";
import { useBonusSystem } from "../components/hooks/useBonusSystem";

import "./Dashboard.styles.css";

export default function Dashboard() {
  const { session: rawSession, signOut, updateUsername } = UserAuth();
  const session = rawSession ?? null;
  const navigate = useNavigate();

  const cashoutTimeoutRef = useRef<number | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { carAudioRef, winAudioRef, loseAudioRef } = useGameAudio({
    casinoSound,
    carSound,
    winSound: won,
    loseSound: gameOver,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const [betAmounts, setBetAmounts] = useState({
    car: "10",
    mines: "10",
  });

  const setBet = (tab: "car" | "mines", value: string) => {
    setBetAmounts((prev) => ({
      ...prev,
      [tab]: value,
    }));
  };

  const [crashValue, setCrashValue] = useState(0.0);
  const [showMoney, setShowMoney] = useState(false);
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);

  const gameStateRef = useRef<GameState>(GameState.Idle);
  const activeBetRef = useRef<ActiveBet | null>(null);
  const finalValueRef = useRef<number | null>(null);

  const carRef = useRef<HTMLImageElement | null>(null);
  const roadRef = useRef<HTMLDivElement | null>(null);

  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);

  const meta = session?.user?.user_metadata as Record<string, unknown> | null;
  const usernameMeta =
    typeof meta?.display_name === "string" ? meta.display_name : "";
  const email = session?.user?.email ?? "";

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    userId,
    profile,
    setProfile,
    loadingProfile,
    leaders,
    yourRank,
    usernameInput,
    setUsernameInput,
    message,
    messageType,
    setMessage,
    setMessageType,
    handleSave,
    applyBetResult,
  } = useProfileManagement({
    session,
    usernameMeta,
    email,
    updateUsername,
  });

 
  const { bonusCountdown, handleClaimBonus } = useBonusSystem({
    session,
    profile,
    setProfile,
  });

  const BONUS_AMOUNT = 10;

  const displayName = profile?.username || usernameMeta || email || "Player";

  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): GameTab => {
    const tab = searchParams.get("tab");

    if (tab === GameTab.Car) return GameTab.Car;
    if (tab === GameTab.Cases) return GameTab.Cases;
    if (tab === GameTab.Mines) return GameTab.Mines;

    return GameTab.Car;
  };

  const [activeTab, setActiveTab] = useState<GameTab>(getInitialTab);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    activeBetRef.current = activeBet;
  }, [activeBet]);

  const generateCrashPoint = () => {
    return +(Math.random() * 4.95 + 1.05).toFixed(2);
  };

  const generateSpeed = () => {
    return Math.random() * 0.06 + 0.06;
  };

  const handleStart = () => {
    if (gameState !== GameState.Idle || !profile) return;

    const amount = parseBetAmount(betAmounts.car, {
      min: 1,
      max: profile.balance,
    });

    if (amount === null) {
      setMessage("Invalid bet amount");
      setMessageType("error");
      return;
    }

    if (carRef.current) {
      carRef.current.style.transform = "translateX(0px)";
    }

    const bet: ActiveBet = {
      amount,
      hasCashedOut: false,
    };

    setActiveBet(bet);
    activeBetRef.current = bet;

    setCrashValue(0);
    setShowMoney(false);

    finalValueRef.current = generateCrashPoint();
    const speed = generateSpeed();

    setGameState(GameState.Cashable);
    setIsAnimating(true);

    carAudioRef.current?.play().catch(() => {});

    intervalRef.current = window.setInterval(() => {
      setCrashValue((prev) => +(prev + speed).toFixed(2));
    }, 50);
  };

  const handleCashOut = (cashoutAmount: number) => {
    if (!activeBet || gameState !== GameState.Cashable) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    activeBetRef.current = {
      ...activeBet,
      hasCashedOut: true,
    };
    setActiveBet(activeBetRef.current);

    carAudioRef.current?.pause();
    setIsAnimating(false);
    setGameState(GameState.Finished);

    void applyBetResult({
      amount: cashoutAmount,
      isCashOut: true,
      isWin: true,
      resultMultiplier: finalValueRef.current ?? crashValue,
    });

    if (winAudioRef.current) {
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play().catch(() => {});
    }

    setShowMoney(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowMoney(false);
    }, 1000);

    if (cashoutTimeoutRef.current) {
      clearTimeout(cashoutTimeoutRef.current);
    }

    cashoutTimeoutRef.current = window.setTimeout(() => {
      setCrashValue(0);
      setGameState(GameState.Idle);
      setActiveBet(null);
    }, 800);
  };

  const handleCrash = () => {
    if (gameState === GameState.Finished) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const bet = activeBetRef.current?.amount;
    if (!bet) return;

    activeBetRef.current = {
      amount: bet,
      hasCashedOut: false,
    };
    setActiveBet(activeBetRef.current);

    carAudioRef.current?.pause();
    setIsAnimating(false);
    setGameState(GameState.Finished);

    void applyBetResult({
      amount: bet,
      isCashOut: false,
      isWin: false,
      resultMultiplier: finalValueRef.current ?? crashValue,
    });

    loseAudioRef.current?.play().catch(() => {});

   if (cashoutTimeoutRef.current) {
     clearTimeout(cashoutTimeoutRef.current);
   }

   cashoutTimeoutRef.current = window.setTimeout(() => {
     setCrashValue(0);
     setGameState(GameState.Idle);
     setActiveBet(null);
   }, 800);
  };

  const balanceText =
    loadingProfile || !profile ? "$1000.00" : formatMoney(profile.balance);

  const liveCashout = activeBet
    ? +(activeBet.amount * crashValue * 0.9).toFixed(2)
    : 0;

  const handleTabChange = (tab: GameTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };


  useEffect(() => {
    return () => {
      if (cashoutTimeoutRef.current) {
        clearTimeout(cashoutTimeoutRef.current);
        cashoutTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="page-wrapper">
      <Header
        displayName={displayName}
        balanceText={balanceText}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        message={message}
        messageType={messageType}
        profile={profile}
        handleSave={handleSave}
        signOut={signOut}
        navigate={navigate}
      />
      <main className="container-game">
        <div className="container-display">
          <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />
          {activeTab === "car" && (
            <Car
              betAmount={betAmounts.car}
              setBetAmount={(v) => setBet("car", v)}
              gameState={gameState}
              handleStart={handleStart}
              handleCashOut={handleCashOut}
              crashValue={crashValue}
              liveCashout={liveCashout}
              finalValueRef={finalValueRef}
              hasCashedOut={activeBetRef.current?.hasCashedOut ?? false}
              showMoney={showMoney}
              carRef={carRef}
              roadRef={roadRef}
              isAnimating={isAnimating}
              handleCrash={handleCrash}
            />
          )}

          {activeTab === "cases" && (
            <Cases
              profile={profile}
              setProfile={setProfile}
              userId={userId}             
            />
          )}
          {activeTab === "mines" && (
            <Mines
              betAmount={betAmounts.mines}
              setBetAmount={(v) => setBet("mines", v)}
              onStartGame={(bet: number) => {
                void applyBetResult({
                  amount: bet,
                  isCashOut: false,
                  isWin: false,
                  resultMultiplier: finalValueRef.current ?? crashValue,
                });
              }}
              onCashOut={(amount: number) => {
                void applyBetResult({
                  amount,
                  isCashOut: true,
                  isWin: true,
                  resultMultiplier: finalValueRef.current ?? crashValue,
                });
              }}
            />
          )}
        </div>
        <div className="container-bonus-leaderboard">
          <Bonus
            bonusCountdown={bonusCountdown}
            bonusAmount={BONUS_AMOUNT}
            onClaim={handleClaimBonus}
            formatTime={formatTime}
          />
          <Leaderboard leaders={leaders} yourRank={yourRank} userId={userId} />
        </div>
      </main>
    </div>
  );
}
