import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import prize1 from "../assets/prize-yellow.svg";
import prize2 from "../assets/prize-gray.svg";
import prize3 from "../assets/prize-orange.svg";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import iconPrize from "../assets/icon-prize.svg";
import iconProfiles from "../assets/Icon-profiles.svg";
import iconBalance from "../assets/Icon-balance.svg";
import entericon from "../assets/icon-gray-enter.svg";
import carIcon from "../assets/car.svg";
import iocnBonus from "../assets/icon-bonus.svg";
import clockIcon from "../assets/clock.svg";
import roadIcon from "../assets/road.svg";
import iconClose from "../assets/closeIcon.svg";
import userIcon from "../assets/userIcon.svg";
import prize from "../assets/prize-blue.svg";
import imageMoney from "../assets/truck-money.svg";

import "./Dashboard.styles.css";

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
      }
  
      else {
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
          setShowMoney(true);
          setTimeout(() => setShowMoney(false), 1000);
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

    const base = parseFloat(betAmount || "0");
    const amount =
      !isNaN(base) && base > 0 ? base : bonus.amount ? bonus.amount : 10;

    const now = new Date();
    const nextAt = new Date(now.getTime() + 60_000).toISOString();

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

    const { data: updatedBonus } = await supabase
      .from("bonuses")
      .update({
        streak: bonus.streak + 1,
        amount,
        next_bonus_at: nextAt,
      })
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updatedBonus) setBonus(normalizeBonus(updatedBonus));
  };

  const bonusAmount = bonus?.amount ?? 10;

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

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="header-dashboard">
          <img src={iconPrize} alt="iconPrize" width="40" height="40" />
          <div className="container-text">
            <p className="header-text">Rocket Casino</p>
            <p className="header-text-small">{displayName}</p>
          </div>
          <div className="container-all">
            <div className="container-balance">
              <img src={iconBalance} alt="" width="20" height="20" />
              <p className="text-balance">{balanceText}</p>
            </div>
            <div className="img-container">
              <img
                src={iconProfiles}
                alt="settings"
                width="16"
                height="16"
                className="settings"
                onClick={() => setIsSettingsOpen(true)}
              />
              {isSettingsOpen && (
                <div
                  className="modal-backdrop"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <div
                    className="modal-window"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="modal-close"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      <img src={iconClose} alt="close" width="16" height="16" />
                    </button>

                    <h2 className="txt-profile">Profile Settings</h2>
                    <p className="modal-text">
                      Customize your profile and manage your account
                    </p>
                    <div className="container-label">
                      <img src={userIcon} alt="" width="16" height="16" />
                      <label className="txt-label">Username</label>
                    </div>

                    <input
                      type="text"
                      value={usernameInput}
                      className="input-modal"
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                    {message && (
                      <p
                        className={`message-text ${
                          messageType === "error"
                            ? "error-text"
                            : "success-text"
                        }`}
                      >
                        {message}
                      </p>
                    )}
                    <p className="text-char">{usernameInput.length}/20</p>
                    <p className="text-char">characters</p>
                    <div className="container-stat">
                      <p className="text-bal">Account Stats</p>
                      <div className="balance-container">
                        <div className="text-info">
                          <p className="text-bal">Balance</p>
                          <p className="text-stat">
                            {profile
                              ? `$${profile.balance.toFixed(2)}`
                              : "$1025.54"}
                          </p>
                        </div>
                        <div className="text-info">
                          <p className="text-bal">Games Played</p>
                          <p className="text-stat">
                            {profile ? profile.games_played : 0}
                          </p>
                        </div>
                      </div>
                      <div className="balance-container">
                        <div className="text-info">
                          <p className="text-bal">Total Wagered</p>
                          <p className="text-stat">
                            {profile
                              ? `$${profile.total_wagered.toFixed(2)}`
                              : "$0.00"}
                          </p>
                        </div>
                        <div className="text-info">
                          <p className="text-bal">Total Won</p>
                          <p className="text-stat">
                            {profile
                              ? `$${profile.total_won.toFixed(2)}`
                              : "$0.00"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="btn-modal-container">
                      <button className="modal-button" onClick={handleSave}>
                        Save Changes
                      </button>
                      <button
                        className="red-button"
                        onClick={() => setUsernameInput("")}
                      >
                        Reset Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              className="container-logout"
              onClick={async (e) => {
                e.preventDefault();
                await signOut();
                navigate("/");
              }}
            >
              <img src={entericon} alt="logout" width="16" height="16" />
              <p className="text-out">Logout</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container-game">
        <div className="container-display">
          <div className="container-btn">
            <div className="btn-car">
              <img src={carIcon} alt="car" width="32" height="14" />
              <p className="text">Car</p>
            </div>
          </div>
          <div className="container-car">
            <div
              className="container-black"
              style={{ position: "relative" }}
              ref={roadRef}
            >
              <div className="container-balance-win">
                <p
                  className="balance-win"
                  style={{
                    color:
                      crashValue === 0.0 || isAnimating
                        ? "#fff"
                        : activeBetRef.current?.hasCashedOut
                        ? "#19DD57"
                        : crashValue >= 3.25
                        ? "#19DD57"
                        : "#D4183D",
                  }}
                >
                  {crashValue.toFixed(2)}
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
              <div className="container-balance-win">
                {showMoney && (
                  <img
                    src={imageMoney}
                    alt="money"
                    width="300"
                    height="200"
                    className="money-fly"
                  />
                )}
              </div>
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
                  onClick={() => {
                    if (gameState === "idle") handleStart();
                    if (gameState === "cashable") handleCashOut(liveCashout);
                  }}
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
        </div>
        <div className="container-bonus-leaderboard">
          <div className="container-bonus">
            <div className="conatiner-logo">
              <img src={iocnBonus} alt="" width="40" height="40" />
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
              onClick={handleClaimBonus}
              style={{
                opacity: bonusCountdown > 0 ? 0.6 : 1,
                cursor: bonusCountdown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {bonusCountdown > 0 ? "Wait..." : "Claim Now!"}
            </button>
          </div>
          <div className="container-leaderboard">
            <div className="container-img">
              <img src={prize} alt="" width="40" height="40" />
              <div className="container-text-leaderboard">
                <p className="txt-heading">Leaderboard</p>
                <p className="txt-heading-small">Top players</p>
              </div>
            </div>
            {leaders.map((p, index) => {
              const icon =
                index === 0
                  ? prize1
                  : index === 1
                  ? prize2
                  : index === 2
                  ? prize3
                  : null;
              return (
                <div
                  key={p.id}
                  className="container-players"
                  style={{
                    background:
                      p.id === userId
                        ? "linear-gradient(90deg, rgba(43, 127, 255, 0.2) 0%, rgba(173, 70, 255, 0.2) 100%)"
                        : "",
                    border: p.id === userId ? "1px solid #2B7FFF80" : "",
                  }}
                >
                  {icon ? (
                    <img src={icon} />
                  ) : (
                    <p className="rank-index">#{index + 1}</p>
                  )}
                  <div className="conatiner-players-name">
                    <p className="name-players">{p.username}</p>
                    <p className="games">{p.games_played} games</p>
                  </div>
                  <div className="conatiner-players-win">
                    <p className="balance">${Math.floor(p.total_won)}</p>
                    <p className="win">
                      {p.games_played > 0
                        ? Math.round(
                            (p.total_won / (p.games_played * 1000)) * 100
                          )
                        : 0}
                      % win
                    </p>
                  </div>
                </div>
              );
            })}
            <p className="rank">Your rank: {yourRank ? `#${yourRank}` : "—"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
