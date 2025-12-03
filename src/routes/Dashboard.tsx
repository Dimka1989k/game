import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

import casinoSound from "../assets/sounds/casino1.mp3";
import carSound from "../assets/sounds/car.mp3"
import won from "../assets/sounds/won.mp3"
import gameOver from "../assets/sounds/gameover.mp3";


import Tabs from "../components/Tabs/Tabs";
import Car from "../components/Car/Car";
import Header from "../components/Header/Header";
import Bonus from "../components/Bonus/Bonus";
import Leaderboard from "../components/Leader/LeaderBoard";
import { useSearchParams } from "react-router";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import "./Dashboard.styles.css";
import Cases from "../components/Cases/Cases";

interface Profile {
  id: string;
  username: string | null;
  balance: number;
  total_wagered: number;
  total_won: number;
  games_played: number;
}

interface ProfileRow {
  id: string;
  username: string | null;
  balance: number | string | null;
  total_wagered: number | string | null;
  total_won: number | string | null;
  games_played: number | string | null;
}

interface Bonus {
  user_id: string;
  streak: number;
  next_bonus_at: string | null;
  amount: number;
}

interface BonusRow {
  user_id: string;
  streak: number | string | null;
  next_bonus_at: string | null;
  amount: number | string | null;
}

interface Leader {
  id: string;
  username: string | null;
  games_played: number;
  total_won: number;
}

type GameState = "idle" | "running" | "cashable" | "finished";

interface ActiveBet {
  amount: number;
  hasCashedOut: boolean;
}

function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username ?? null,
    balance: Number(row.balance ?? 0),
    total_wagered: Number(row.total_wagered ?? 0),
    total_won: Number(row.total_won ?? 0),
    games_played: Number(row.games_played ?? 0),
  };
}

function normalizeBonus(row: BonusRow): Bonus {
  return {
    user_id: row.user_id,
    streak: Number(row.streak ?? 0),
    next_bonus_at: row.next_bonus_at ?? null,
    amount: Number(row.amount ?? 10),
  };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Dashboard() {
  const { session, signOut, updateUsername } = UserAuth();
  const navigate = useNavigate();
  const userId = session?.user?.id ?? null;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const carAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [crashValue, setCrashValue] = useState(0.0);
  const [showMoney, setShowMoney] = useState(false);
  const [gameState, setGameState] = useState<GameState>("idle");

  const gameStateRef = useRef<GameState>("idle");
  const activeBetRef = useRef<ActiveBet | null>(null);
  const finalValueRef = useRef<number | null>(null);
  const carRef = useRef<HTMLImageElement | null>(null);
  const roadRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [bonus, setBonus] = useState<Bonus | null>(null);
  const [bonusCountdown, setBonusCountdown] = useState(0);

  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [yourRank, setYourRank] = useState<number | null>(null);

  const meta = session?.user?.user_metadata as Record<string, unknown> | null;
  const usernameMeta =
    typeof meta?.display_name === "string" ? meta.display_name : "";

  const email = session?.user?.email ?? "";
  const displayName = profile?.username || usernameMeta || email || "Player";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "cases" ? "cases" : "car";
  const [activeTab, setActiveTab] = useState<"car" | "cases">(initialTab);

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
      music.play().catch(() => {});
      window.removeEventListener("click", startMusic);
    };

    window.addEventListener("click", startMusic);

    return () => {
      music.pause();
      music.currentTime = 0;
      window.removeEventListener("click", startMusic);
    };
  }, []);

  useEffect(() => {
    winAudioRef.current = new Audio(won);
    winAudioRef.current.volume = 0.3;

    loseAudioRef.current = new Audio(gameOver);
    loseAudioRef.current.volume = 0.4;
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    activeBetRef.current = activeBet;
  }, [activeBet]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoadingProfile(true);
      const {
        data: profileRow,
        error: profileError,
      }: PostgrestSingleResponse<ProfileRow> = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        const { data: newRow } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            username: usernameMeta || email.split("@")[0],
            balance: 1000,
            total_wagered: 0,
            total_won: 0,
            games_played: 0,
          })
          .select()
          .single();

        if (newRow) setProfile(normalizeProfile(newRow));
      } else if (profileRow) {
        setProfile(normalizeProfile(profileRow));
      }

      const { data: bonusRows, error: bonusError } = await supabase
        .from("bonuses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (bonusError) {
        console.log("BONUS ERROR:", bonusError);
      }

      if (bonusRows) {
        setBonus(normalizeBonus(bonusRows));
      } else {
        const now = new Date();

        const { data: inserted, error: insertError } = await supabase
          .from("bonuses")
          .insert({
            user_id: userId,
            streak: 0,
            next_bonus_at: now.toISOString(),
            amount: 10,
          })
          .select()
          .single();

        if (insertError) {
          console.error("BONUS INSERT ERROR:", insertError);
        }

        if (inserted) {
          setBonus(normalizeBonus(inserted));
        }
      }
      setLoadingProfile(false);
    };

    void load();
  }, [userId, usernameMeta, email]);

  useEffect(() => {
    if (profile?.username) {
      setUsernameInput(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    if (!bonus) return;

    const i = setInterval(() => {
      if (!bonus.next_bonus_at) {
        setBonusCountdown(0);
        return;
      }

      const now = Date.now();
      const next = new Date(bonus.next_bonus_at).getTime();
      const diff = Math.max(0, Math.ceil((next - now) / 1000));

      setBonusCountdown(diff);
    }, 1000);

    return () => clearInterval(i);
  }, [bonus]);

  const handleSave = async () => {
    if (!session?.user || !profile) return;

    if (usernameInput.trim() === profile.username) {
      setMessage("You haven't changed your username");
      setMessageType("error");
      return;
    }

    if (usernameInput.trim().length === 0) {
      setMessage("Username cannot be empty");
      setMessageType("error");
      return;
    }

    if (usernameInput.trim().length > 20) {
      setMessage("Username must be 20 characters or less");
      setMessageType("error");
      return;
    }

    const result = await updateUsername(usernameInput.trim());
    if (!result.success) {
      setMessage(result.error || "Something went wrong");
      setMessageType("error");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .update({ username: usernameInput.trim() })
      .eq("id", session.user.id)
      .select()
      .single();

    if (data) setProfile(normalizeProfile(data));

    setMessage("Username updated!");
    setMessageType("success");
    setTimeout(() => setMessage(null), 2500);
  };

  const applyBetResult = async (params: {
    amount: number;
    isCashOut: boolean;
    isWin: boolean;
  }) => {
    if (!session?.user || !profile) return;

    let profit = 0;

    if (params.isCashOut) {
      profit = params.amount;
    } else {
      profit = params.isWin ? params.amount : -params.amount;
    }

    const updatedBalance = profile.balance + profit;

    await supabase.from("bets").insert({
      user_id: session.user.id,
      amount: params.amount,
      profit: profit,
      cashed_out_at: params.isCashOut ? Date.now() : 0,
      result_multiplier: finalValueRef.current ?? crashValue,
    });

    const { data } = await supabase
      .from("profiles")
      .update({
        balance: updatedBalance,
        total_wagered: profile.total_wagered + params.amount,
        total_won: profit > 0 ? profile.total_won + profit : profile.total_won,
        games_played: profile.games_played + 1,
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (data) setProfile(normalizeProfile(data));

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (!existingProfile) {
      console.error("Profile does not exist — cannot update leaderboard");
      return;
    }

    await supabase.from("leaderboard").upsert({
      user_id: session.user.id,
      username: profile.username,
      games_played: profile.games_played,
      total_won: profile.total_won,
      win_rate:
        profile.games_played > 0
          ? Math.round(
              (profile.total_won / (profile.games_played * 1000)) * 100
            )
          : 0,
    });

    const { data: leaderboardRows } = await supabase
      .from("profiles")
      .select("id, username, games_played, total_won")
      .order("total_won", { ascending: false })
      .limit(8);

    if (leaderboardRows) {
      setLeaders(leaderboardRows);

      const rank = leaderboardRows.findIndex((p) => p.id === userId);
      setYourRank(rank === -1 ? null : rank + 1);
    }
  };

  const handleStart = () => {
    if (gameState !== "idle" || !session?.user || !profile) return;

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > profile.balance) return;

    const finalCrash = +(Math.random() * (6.5 - 0.2) + 0.2).toFixed(2);
    finalValueRef.current = finalCrash;

    void supabase
      .from("crash_rounds")
      .insert({ result_multiplier: finalCrash });

    setActiveBet({ amount, hasCashedOut: false });
    setGameState("running");
    carAudioRef.current?.play().catch(() => {});

    setIsAnimating(true);
    if (carRef.current) {
      carRef.current.style.transform = "translateX(0px)";
      carRef.current.style.transition = "none";
    }
    setCrashValue(0);

    let cur = 0;
    const interval = setInterval(() => {
      cur = +(cur + 0.01).toFixed(2);
      setCrashValue(cur);

      if (cur >= 0.5 && gameStateRef.current === "running") {
        setGameState("cashable");
      }

      if (finalValueRef.current !== null && cur >= finalValueRef.current) {
        clearInterval(interval);
        carAudioRef.current?.pause();       
        setIsAnimating(false);
        if (carRef.current) {
          carRef.current.style.transition = "transform 0.3s ease-out";
        }
        setGameState("finished");

        if (activeBetRef.current && !activeBetRef.current.hasCashedOut) {
          const isWin = finalCrash >= 3.25;

          void applyBetResult({
            amount: activeBetRef.current.amount,
            isCashOut: false,
            isWin,
          });
        }

        if (cur >= 3.25) {
          const winSound = winAudioRef.current;
          if (winSound) {
            winSound.currentTime = 0;
            winSound.play().catch(() => {});
          }

          setShowMoney(true);
          setTimeout(() => setShowMoney(false), 1000);
        }
        // LOSE
        else {
          const loseSound = loseAudioRef.current;
          if (loseSound) {
            loseSound.currentTime = 0;
            loseSound.play().catch(() => {});
          }
        }

        setTimeout(() => {
          setCrashValue(0);
          setGameState("idle");
          setActiveBet(null);
          finalValueRef.current = null;
        }, 900);
      }
    }, 8);
    intervalRef.current = interval;
  };

  const handleCashOut = (cashoutAmount: number) => {
    if (!activeBet || gameState === "finished") return;

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
    setGameState("finished");

    void applyBetResult({
      amount: cashoutAmount,
      isCashOut: true,
      isWin: true,
    });

    setTimeout(() => {
      setCrashValue(0);
      setGameState("idle");
      setActiveBet(null);
    }, 800);
  };

const handleClaimBonus = async () => {
  if (!session?.user || !profile || !bonus) return;
  if (bonusCountdown > 0) return;

  const amount = 10; // 🔥 ФІКСОВАНИЙ БОНУС

  const now = new Date();
  const nextAt = new Date(now.getTime() + 60_000).toISOString();

  // 🔹 Оновлюємо баланс
  const { data: updatedProfile } = await supabase
    .from("profiles")
    .update({
      balance: profile.balance + amount,
      updated_at: now.toISOString(),
    })
    .eq("id", session.user.id)
    .select()
    .single();

  if (updatedProfile) setProfile(normalizeProfile(updatedProfile));

  // 🔹 Оновлюємо бонус
  const { data: updatedBonus } = await supabase
    .from("bonuses")
    .update({
      streak: bonus.streak + 1,
      amount: 10, 
      next_bonus_at: nextAt,
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (updatedBonus) setBonus(normalizeBonus(updatedBonus));
};


  const bonusAmount = 10;

  const balanceText =
    loadingProfile || !profile ? "$1000.00" : `$${profile.balance.toFixed(2)}`;

  const liveCashout = activeBet
    ? +(activeBet.amount * crashValue * 0.9).toFixed(2)
    : 0;

  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data: leaderboardRows } = await supabase
        .from("profiles")
        .select("id, username, games_played, total_won")
        .order("total_won", { ascending: false })
        .limit(8);

      if (leaderboardRows) {
        setLeaders(leaderboardRows);
        const rank = leaderboardRows.findIndex((p) => p.id === userId);
        setYourRank(rank === -1 ? null : rank + 1);
      }
    };

    loadLeaderboard();
  }, [userId]);

  const handleTabChange = (tab: "car" | "cases") => {
    setActiveTab(tab);
    setSearchParams({ tab }); // Оновлює URL
  };

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
              betAmount={betAmount}
              setBetAmount={setBetAmount}
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
            />
          )}
          {activeTab === "cases" && (
            <Cases profile={profile} setProfile={setProfile} userId={userId} />
          )}
        </div>
        <div className="container-bonus-leaderboard">
          <Bonus
            bonusCountdown={bonusCountdown}
            bonusAmount={bonusAmount}
            onClaim={handleClaimBonus}
            formatTime={formatTime}
          />
          <Leaderboard leaders={leaders} yourRank={yourRank} userId={userId} />
        </div>
      </main>
    </div>
  );
}
