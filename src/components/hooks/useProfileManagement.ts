import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import type { Session, PostgrestSingleResponse } from "@supabase/supabase-js";

import type { Profile, ProfileRow } from "../../types/profile.types";
import type { Leader } from "../../types/leader.types";
import { normalizeProfile } from "../../utils/normalize";

type MessageType = "success" | "error" | null;

export interface ApplyBetParams {
  amount: number;
  isCashOut: boolean;
  isWin: boolean;
  resultMultiplier: number;
}

interface Params {
  session: Session | null | undefined;
  usernameMeta: string;
  email: string;
  updateUsername: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function useProfileManagement({
  session,
  usernameMeta,
  email,
  updateUsername,
}: Params) {
  const userId = session?.user?.id ?? null;
const messageTimeoutRef = useRef<number | null>(null);
  const leaderboardTimeoutRef = useRef<number | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [yourRank, setYourRank] = useState<number | null>(null);

  const [usernameInput, setUsernameInput] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);

  const loadLeaderboard = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, username, games_played, total_won")
      .order("total_won", { ascending: false })
      .limit(8);

    if (!data) return;

    setLeaders(data);
    const rank = data.findIndex((p) => p.id === userId);
    setYourRank(rank === -1 ? null : rank + 1);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setLoadingProfile(true);

      const { data, error }: PostgrestSingleResponse<ProfileRow> =
        await supabase.from("profiles").select("*").eq("id", userId).single();

      let resolved: Profile | null = null;

      if (error && error.code === "PGRST116") {
        const { data: created } = await supabase
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

        if (created) resolved = normalizeProfile(created);
      } else if (data) {
        resolved = normalizeProfile(data);
      }

      if (resolved) {
        setProfile(resolved);
        setUsernameInput(resolved.username ?? "");
      }

      setLoadingProfile(false);
    
      if (leaderboardTimeoutRef.current) {
        clearTimeout(leaderboardTimeoutRef.current);
      }

      leaderboardTimeoutRef.current = window.setTimeout(() => {
        void loadLeaderboard();
      }, 0);
    };

    void loadProfile();
  }, [userId, usernameMeta, email, loadLeaderboard]);


  const handleSave = useCallback(async () => {
    if (!session?.user || !profile) return;

    const trimmed = usernameInput.trim();

    if (trimmed === profile.username) {
      setMessage("You haven't changed your username");
      setMessageType("error");
      return;
    }

    if (trimmed.length === 0) {
      setMessage("Username cannot be empty");
      setMessageType("error");
      return;
    }

    if (trimmed.length > 20) {
      setMessage("Username must be 20 characters or less");
      setMessageType("error");
      return;
    }

    const result = await updateUsername(trimmed);
    if (!result.success) {
      setMessage(result.error || "Something went wrong");
      setMessageType("error");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", session.user.id)
      .select()
      .single();

    if (data) {
      const updated = normalizeProfile(data);
      setProfile(updated);
      setUsernameInput(updated.username ?? "");
    }

    setMessage("Username updated!");
    setMessageType("success");
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage(null);
    }, 2500);
  }, [session, profile, usernameInput, updateUsername]);

  const applyBetResult = useCallback(
    async ({ amount, isCashOut, isWin, resultMultiplier }: ApplyBetParams) => {
      if (!session?.user || !profile) return;

      let profit = 0;

      if (isCashOut) {
        profit = amount;
      } else {
        profit = isWin ? amount : -amount;
      }

      const updatedBalance = profile.balance + profit;

      await supabase.from("bets").insert({
        user_id: session.user.id,
        amount,
        profit,
        cashed_out_at: isCashOut ? Date.now() : 0,
        result_multiplier: resultMultiplier,
      });

      const { data } = await supabase
        .from("profiles")
        .update({
          balance: updatedBalance,
          total_wagered: profile.total_wagered + amount,
          total_won:
            profit > 0 ? profile.total_won + profit : profile.total_won,
          games_played: profile.games_played + 1,
        })
        .eq("id", session.user.id)
        .select()
        .single();

      if (data) setProfile(normalizeProfile(data));
 
      await loadLeaderboard();
    },
    [session, profile, loadLeaderboard]
  );



  useEffect(() => {
    return () => {
      if (leaderboardTimeoutRef.current) {
        clearTimeout(leaderboardTimeoutRef.current);
        leaderboardTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, []);


  return {
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
    loadLeaderboard,
  };
}
