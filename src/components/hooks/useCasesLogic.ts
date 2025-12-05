import { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { casesData } from "../Cases/casesData";
import { CASE_PRICES, PAYOUTS, type CaseType } from "../Cases/cases.config";
import carouselSounds from "../../assets/sounds/carousel1.mp3";

export interface Profile {
  id: string;
  username: string | null;
  balance: number;
  total_wagered: number;
  total_won: number;
  games_played: number;
}

export function useCasesLogic(
  profile: Profile | null,
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>,
  userId: string | null
) {
  const [selectedCase, setSelectedCase] = useState<CaseType>("animal");
  const [isOpening, setIsOpening] = useState(false);
  const [rolledItem, setRolledItem] = useState<any>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentXRef = useRef(0);
  const carouselSoundRef = useRef<HTMLAudioElement | null>(null);

  const resetRoll = () => {
    setRolledItem(null);
  };

  useEffect(() => {
    carouselSoundRef.current = new Audio(carouselSounds);
    carouselSoundRef.current.volume = 0.4;
  }, []);

  function getRarityByIndex(index: number) {
    if (index < 5) return "common";
    if (index < 8) return "uncommon";
    if (index < 10) return "rare";
    if (index < 12) return "epic";
    if (index < 13) return "legendary";
    return "gold";
  }

  function getRarityClass(rarity: string) {
    return {
      common: "container-emodji-dark",
      uncommon: "container-emodji-green",
      rare: "container-emodji-blue",
      epic: "container-emodji-violet",
      legendary: "container-emodji-red",
      gold: "container-emodji-gold",
    }[rarity];
  }

  function getCenteredItemIndex() {
    if (!trackRef.current) return 0;

    const x = currentXRef.current;
    const itemWidth = 130 + 16;
    const centerOffset = 603 / 2 - 130 / 2;
    const absoluteX = -(x - centerOffset);
    const index = Math.round(absoluteX / itemWidth);

    return index % casesData[selectedCase].length;
  }

  function animateSlider(startX: number, endX: number, callback: () => void) {
    const fastDuration = 4500;
    const slowDuration = 1500;
    const startTime = performance.now();

    function fast(time: number) {
      const progress = Math.min((time - startTime) / fastDuration, 1);
      const breakPoint = startX + (endX - startX) * 0.75;
      const x = startX + (breakPoint - startX) * progress;

      currentXRef.current = x;
      if (trackRef.current)
        trackRef.current.style.transform = `translateY(-50%) translateX(${x}px)`;

      if (progress < 1) requestAnimationFrame(fast);
      else slow();
    }

    function slow() {
      const slowStart = currentXRef.current;
      const slowStartTime = performance.now();

      function easeOut(t: number) {
        return 1 - (1 - t) * (1 - t);
      }

      function step(time: number) {
        const progress = Math.min((time - slowStartTime) / slowDuration, 1);
        const eased = easeOut(progress);

        const x = slowStart + (endX - slowStart) * eased;
        currentXRef.current = x;

        if (trackRef.current)
          trackRef.current.style.transform = `translateY(-50%) translateX(${x}px)`;

        if (progress < 1) requestAnimationFrame(step);
        else callback();
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(fast);
  }

  async function openCase() {
    if (!profile || !userId) return;
    if (isOpening) return;

    const price = CASE_PRICES[selectedCase];

    if (profile.balance < price) {
      alert("Not enough balance!");
      return;
    }

    setIsOpening(true);
    setRolledItem(null);

    const snd = carouselSoundRef.current;
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }

    const updatedBalance = profile.balance - price;

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ balance: updatedBalance })
      .eq("id", userId)
      .select()
      .single();

    if (updatedProfile) setProfile(updatedProfile);

    // ---- SPIN ----
    const items = casesData[selectedCase];
    const randomIndex = Math.floor(Math.random() * items.length);

    const itemWidth = 146;
    const centerOffset = 603 / 2 - 130 / 2;

    const startX = 0;
    const endX = -(25 * itemWidth + randomIndex * itemWidth) + centerOffset;

    animateSlider(startX, endX, async () => {
      const sndStop = carouselSoundRef.current;
      if (sndStop) {
        sndStop.pause();
        sndStop.currentTime = 0;
      }

      const finalIndex = getCenteredItemIndex();
      const item = items[finalIndex];

      setRolledItem(item);

      const rarity = getRarityByIndex(finalIndex);
      const reward = PAYOUTS[rarity];

      const newBalance = updatedBalance + reward;

      const { data: profAfterWin } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId)
        .select()
        .single();

      if (profAfterWin) setProfile(profAfterWin);

      setIsOpening(false);
    });
  }

  return {
    selectedCase,
    setSelectedCase,
    isOpening,
    rolledItem,
    trackRef,
    resetRoll,
    openCase,
    getRarityByIndex,
    getRarityClass,
  };
}
