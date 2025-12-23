import Emoji from "../Emoji";
import { casesData } from "./casesData";
import iconGray from "../../assets/cases/iconGray.svg";
import whiteIcon from "../../assets/cases/whiteIcon.svg";
import {
  CASE_PRICES,
  PAYOUTS,
  CASE_ICONS,
  CASE_LABELS,
  type CaseType,
} from "./cases.config";
import { useCasesLogic, type Profile } from "../hooks/useCasesLogic";
import "./Cases.syles.css";

interface CasesProps {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  userId: string | null;
  onFinish?: (reward: number) => void;
}

export default function Cases({ profile, setProfile, userId, onFinish }: CasesProps) {
 const {
   selectedCase,
   setSelectedCase,
   isOpening,
   rolledItem,
   trackRef,
   openCase,
   getRarityByIndex,
   getRarityClass,
   resetRoll,
 } = useCasesLogic(profile, setProfile, userId, onFinish);

  function handleSelectCase(caseType: CaseType) {
    if (!isOpening) {
      setSelectedCase(caseType);
      if (rolledItem) resetRoll();
    }
  }

  const renderCarousel = () =>
    Array.from({ length: 120 }).map((_, i) => {
      const items = casesData[selectedCase];
      const idx = i % items.length;
      const item = items[idx];
      const rarity = getRarityByIndex(idx);
      const cssClass = getRarityClass(rarity);
      const isEmoji = item.icon.length <= 3;

      return (
        <div className={`carousel-item ${cssClass}`} key={i}>
          {isEmoji ? (
            <Emoji char={item.icon} size={40} />
          ) : (
            <img src={item.icon} width={40} height={40} />
          )}
          <p className="carousel-label">{item.label}</p>
        </div>
      );
    });

  return (
    <div className="container-cases">
      <p className="text-cases">Select a Case</p>
      <div className="container-cases-img">
        {(Object.keys(CASE_PRICES) as CaseType[]).map((caseType) => (
          <div
            key={caseType}
            className={`container-cases-wraper 
              ${selectedCase === caseType ? "active-case" : ""} 
              ${isOpening ? "disabled-case" : ""}`}
            onClick={() => handleSelectCase(caseType)}
          >
            <img src={CASE_ICONS[caseType]} width={48} height={48} />
            <p className="text-cases">{CASE_LABELS[caseType]}</p>
            <p className="price-cases">${CASE_PRICES[caseType]}</p>
          </div>
        ))}
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
        onClick={openCase}
      >
        <img src={isOpening ? iconGray : whiteIcon} width={16} height={16} />
        <span className="btn-text">
          {isOpening
            ? "Opening..."
            : `Open Case - $${CASE_PRICES[selectedCase]}`}
        </span>
      </button>     
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
                  PAYOUTS[
                    getRarityByIndex(
                      casesData[selectedCase].indexOf(rolledItem)
                    ) as keyof typeof PAYOUTS
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
    </div>
  );
}
