import { useState, useRef, useEffect } from "react";
import "./Cases.syles.css";

import Emoji from "../Emoji";
import { casesData } from "./casesData";
import { supabase } from "../../supabaseClient";

import ballIcon from "../../assets/cases/ballIcon.png";
import lionIcon from "../../assets/cases/lionIcon.png";
import rocketIcon from "../../assets/cases/rocketIcon.png";
import pizzaIcon from "../../assets/cases/pizzaIcon.png";
import iconGray from "../../assets/cases/iconGray.svg";
import whiteicon from "../../assets/cases/whiteIcon.svg";

import carouselSounds from "../../assets/sounds/carousel1.mp3"

interface CaseItem {
  icon: string;
  label: string;
}

interface CasesProps {
  profile: {
    id: string;
    username: string | null;
    balance: number;
    total_wagered: number;
    total_won: number;
    games_played: number;
  } | null;

  setProfile: React.Dispatch<
    React.SetStateAction<{
      id: string;
      username: string | null;
      balance: number;
      total_wagered: number;
      total_won: number;
      games_played: number;
    } | null>
  >;

  userId: string | null;
}

export default function Cases({ profile, setProfile, userId }: CasesProps) {
  const [selectedCase, setSelectedCase] = useState<
    "animal" | "space" | "food" | "sport"
  >("animal");

  const [isOpening, setIsOpening] = useState(false);
  const [rolledItem, setRolledItem] = useState<CaseItem | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentXRef = useRef(0);

  const carouselSoundRef = useRef<HTMLAudioElement | null>(null);

  const casePrices = {
    animal: 50,
    space: 75,
    food: 40,
    sport: 60,
  };

  const payouts = {
    common: 10,
    uncommon: 20,
    rare: 50,
    epic: 100,
    legendary: 200,
    gold: 500,
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

  async function handleOpenCase() {
    if (!profile || !userId) return;
    if (isOpening) return;

    const price = casePrices[selectedCase];
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
      const reward = payouts[rarity];

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

  const renderCarousel = () => {
    const items = casesData[selectedCase];

    return Array.from({ length: 120 }).map((_, i) => {
      const idx = i % items.length;
      const { icon, label } = items[idx];
      const rarity = getRarityByIndex(idx);
      const css = getRarityClass(rarity);

      const isEmoji = icon.length <= 3;

      return (
        <div className={`carousel-item ${css}`} key={i}>
          {isEmoji ? (
            <Emoji char={icon} size={40} />
          ) : (
            <img src={icon} width={40} height={40} />
          )}
          <p className="carousel-label">{label}</p>
        </div>
      );
    });
  };

  return (
    <div className="container-cases">
      <p className="text-cases">Select a Case</p>
      <div className="container-cases-img">
        {(["animal", "space", "food", "sport"] as const).map((c) => {
          const labelMap = {
            animal: "Animal Case",
            space: "Space Case",
            food: "Food Case",
            sport: "Sports Case",
          };
          const iconMap = {
            animal: lionIcon,
            space: rocketIcon,
            food: pizzaIcon,
            sport: ballIcon,
          };

          return (
            <div
              key={c}
              className={`container-cases-wraper 
              ${selectedCase === c ? "active-case" : ""} 
              ${isOpening ? "disabled-case" : ""}`}
              onClick={() => {
                setSelectedCase(c);
                setRolledItem(null);
              }}
            >
              <img src={iconMap[c]} width={48} height={48} />
              <p className="text-cases">{labelMap[c]}</p>
              <p className="price-cases">${casePrices[c]}</p>
            </div>
          );
        })}
      </div>
      <div className="container-carousel">
        <div className="container-line">
          <div className="line-white" />
          <div className="line-yellow" />
        </div>

        {!isOpening && !rolledItem && (
          <div className="container-back">
            <img src={iconGray} width={64} height={64} />
            <p className="text-gray">Select a case and click Open to start</p>
          </div>
        )}

        {(isOpening || rolledItem) && (
          <div className="carousel-track" ref={trackRef}>
            {renderCarousel()}
          </div>
        )}
      </div>
      <button
        className={`btn-cases ${isOpening ? "opening" : ""}`}
        disabled={isOpening}
        onClick={handleOpenCase}
      >
        <img src={isOpening ? iconGray : whiteicon} width={16} height={16} />
        <span className="btn-text">
          {isOpening
            ? "Opening..."
            : `Open Case - $${casePrices[selectedCase]}`}
        </span>
      </button>
      {!rolledItem && <p className="text-cases">Case Contents</p>}
      <div className="container-emodji">
        {rolledItem ? (
          <div
            className={`win-banner ${getRarityClass(
              getRarityByIndex(casesData[selectedCase].indexOf(rolledItem))
            )?.replace("container-emodji", "win-bg")}`}
          >
            <div className="win-item">
              {rolledItem.icon.length <= 3 ? (
                <Emoji char={rolledItem.icon} size={60} />
              ) : (
                <img src={rolledItem.icon} width={60} height={60} />
              )}

              <p className="win-amount">
                You won: $
                {
                  payouts[
                    getRarityByIndex(
                      casesData[selectedCase].indexOf(rolledItem)
                    )
                  ]
                }
              </p>
            </div>
          </div>
        ) : (
          casesData[selectedCase].map(({ icon }, index) => {
            const rarity = getRarityByIndex(index);
            const isEmoji = icon.length <= 3;

            return (
              <div key={index} className={getRarityClass(rarity)}>
                {isEmoji ? (
                  <Emoji char={icon} size={30} />
                ) : (
                  <img src={icon} width={30} height={30} />
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="container-rarity">
        <p className="text-rarity">Rarity Guide</p>
        <div className="container-pocent-all">
          <div className="container-procent">
            <div className="container-procent-info">
              <div className="circle-gray"></div>
              <p className="txt">Common</p>
              <p className="txt-procent">(55%)</p>
            </div>

            <div className="container-procent-info">
              <div className="circle-violet"></div>
              <p className="txt">Epic</p>
              <p className="txt-procent">(5%)</p>
            </div>
          </div>

          <div className="container-procent">
            <div className="container-procent-info">
              <div className="circle-green"></div>
              <p className="txt">Uncommon</p>
              <p className="txt-procent">(25%)</p>
            </div>

            <div className="container-procent-info">
              <div className="circle-red"></div>
              <p className="txt">Legendary</p>
              <p className="txt-procent">(2.5%)</p>
            </div>
          </div>

          <div className="container-procent">
            <div className="container-procent-info">
              <div className="circle-blue"></div>
              <p className="txt">Rare</p>
              <p className="txt-procent">(12%)</p>
            </div>

            <div className="container-procent-info">
              <div className="circle-gold"></div>
              <p className="txt">Gold</p>
              <p className="txt-procent">(0.5%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
