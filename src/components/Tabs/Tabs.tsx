import carIcon from "../../assets/car.svg";
import "./Tabs.styles.css";
import Emoji from "../Emoji";

interface TabsProps {
  activeTab: "car" | "cases";
  setActiveTab: (tab: "car" | "cases") => void;
}


export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="container-btn">
      <button
        className={`btn-tab ${activeTab === "car" ? "active" : ""}`}
        onClick={() => setActiveTab("car")}
      >
        <img src={carIcon} alt="car" width="32" height="14" />
        <p className="text">Car</p>
      </button>
      <button
        className={`btn-tab ${activeTab === "cases" ? "active" : ""}`}
        onClick={() => setActiveTab("cases")}
      >
        <p className="text">
          <Emoji char="📦" size={22} /> Cases
        </p>
      </button>
    </div>
  );
}
