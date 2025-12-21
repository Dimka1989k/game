import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import type { Session } from "@supabase/supabase-js";

import type { Profile } from "../../types/profile.types";
import type { BonusData } from "../../types/bonus.types";

import { normalizeBonus, normalizeProfile } from "../../utils/normalize";

interface Params {
  session: Session | null;
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
}

export function useBonusSystem({ session, profile, setProfile }: Params) {
  const userId = session?.user?.id ?? null;

  const [bonus, setBonus] = useState<BonusData | null>(null);
  const [bonusCountdown, setBonusCountdown] = useState(0);


  useEffect(() => {
    if (!userId) return;

    const loadBonus = async () => {
      const { data } = await supabase
        .from("bonuses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setBonus(normalizeBonus(data));
      } else {
        const now = new Date();
        const { data: inserted } = await supabase
          .from("bonuses")
          .insert({
            user_id: userId,
            streak: 0,
            next_bonus_at: now.toISOString(),
            amount: 10,
          })
          .select()
          .single();

        if (inserted) {
          setBonus(normalizeBonus(inserted));
        }
      }
    };

    void loadBonus();
  }, [userId]);


  useEffect(() => {
    if (!bonus?.next_bonus_at) return;

    const nextBonusAt = bonus.next_bonus_at;

    const interval = setInterval(() => {
      const diff = new Date(nextBonusAt).getTime() - Date.now();
      setBonusCountdown(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [bonus?.next_bonus_at]);


  const handleClaimBonus = useCallback(async () => {
    if (!session?.user || !profile || !bonus) return;
    if (bonusCountdown > 0) return;

    const amount = 10;
    const next = new Date(Date.now() + 60_000).toISOString();

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ balance: profile.balance + amount })
      .eq("id", session.user.id)
      .select()
      .single();

    if (updatedProfile) {
      setProfile(normalizeProfile(updatedProfile));
    }

    const { data: updatedBonus } = await supabase
      .from("bonuses")
      .update({ next_bonus_at: next })
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updatedBonus) {
      setBonus(normalizeBonus(updatedBonus));
    }
  }, [bonusCountdown, bonus, profile, session, setProfile]);

  return {
    bonusCountdown,
    handleClaimBonus,
  };
}
