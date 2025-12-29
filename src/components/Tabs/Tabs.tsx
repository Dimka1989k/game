import { GameTab } from "../../types/tabs.types";
import carIcon from "../../assets/car.svg";
import "./Tabs.styles.css";
import Emoji from "../Emoji";

interface TabsProps {
  activeTab: GameTab;
  setActiveTab: (tab: GameTab) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="container-btn">
      <button
        className={`btn-tab ${activeTab === GameTab.Car ? "active" : ""}`}
        onClick={() => setActiveTab(GameTab.Car)}
      >
        <img src={carIcon} alt="car" width="32" height="14" />
        <p className="text">Car</p>
      </button>
      <button
        className={`btn-tab ${activeTab === GameTab.Cases ? "active" : ""}`}
        onClick={() => setActiveTab(GameTab.Cases)}
      >
        <p className="text">
          <Emoji char="📦" size={22} /> Cases
        </p>
      </button>
      <button
        className={`btn-tab ${activeTab === GameTab.Mines ? "active" : ""}`}
        onClick={() => setActiveTab(GameTab.Mines)}
      >
        <p className="text">
          <Emoji char="💣" size={22} /> Mines
        </p>
      </button>
      <button
        className={`btn-tab ${activeTab === GameTab.Plinko ? "active" : ""}`}
        onClick={() => setActiveTab(GameTab.Plinko)}
      >
        <p className="text">
          <Emoji char="🕹️" size={22} /> Plinko
        </p>
      </button>
    </div>
  );
}
