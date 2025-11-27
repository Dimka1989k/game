import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import iconPrize from "../assets/icon-prize.svg";
import iconProfiles from "../assets/icon-profiles.svg";
import iconBalance from "../assets/Icon-balance.svg";
import entericon from "../assets/icon-gray-enter.svg";
import carIcon from "../assets/car.svg";
import iocnBonus from "../assets/icon-bonus.svg";
import clockIcon from "../assets/clock.svg";
import roadIcon from "../assets/road.svg";
import iconClose from "../assets/closeIcon.svg";
import userIcon from "../assets/userIcon.svg";

import "./Dashboard.styles.css";

export default function Dashboard() {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const username = session?.user?.user_metadata?.username;
  const email = session?.user?.email;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="header-dashboard">
          <img src={iconPrize} alt="iconPrize" width="40px" height="40px" />
          <div className="container-text">
            <p className="header-text">Rocket Casino</p>
            <p className="header-text-small">{username ?? email}</p>
          </div>
          <div className="container-all">
            <div className="container-balance">
              <img
                src={iconBalance}
                alt="iconBalance"
                width="20px"
                height="20px"
              />
              <p className="text-balance">$1000.00</p>
            </div>

            <div className="img-container">
              <img
                src={iconProfiles}
                alt="iconProfiles"
                width="16px"
                height="16px"
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
                      <img
                        src={iconClose}
                        alt="iconClose"
                        width="16px"
                        height="16px"
                      />
                    </button>

                    <h2 className="txt-profile">Profile Settings</h2>
                    <p className="modal-text">
                      Customize your profile and manage your account
                    </p>
                    <div className="container-label">
                      <img
                        src={userIcon}
                        alt="userIcon"
                        width="16px"
                        height="16px"
                      />
                      <label htmlFor="" className="txt-label">
                        Username
                      </label>
                    </div>
                    <input type="text" className="input-modal" />
                    <p className="text-char">4/20</p>
                    <p className="text-char">characters</p>
                    <div className="container-stat">
                      <p className="text-bal">Account Stats</p>
                      <div className="balance-container">
                        <div className="text-info">
                          <p className="text-bal">Balance</p>
                          <p className="text-stat">$1025.54</p>
                        </div>
                        <div className="text-info">
                          <p className="text-bal">Games Played</p>
                          <p className="text-stat">2</p>
                        </div>
                      </div>
                      <div className="balance-container">
                        <div className="text-info">
                          <p className="text-bal">Total Wagered</p>
                          <p className="text-stat">$20.00</p>
                        </div>
                        <div className="text-info">
                          <p className="text-bal">Total Won</p>
                          <p className="text-stat">$45.54</p>
                        </div>
                      </div>
                    </div>
                    <div className="btn-modal-container">
                      <button className="modal-button">Save Changes</button>
                      <button className="red-button">Reset Account</button>
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
              <img src={entericon} alt="entericon" width="16px" height="16px" />
              <p className="text-out">Logout</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container-game">
        <div className="container-display">
          <div className="container-btn">
            <div className="btn-car">
              <img src={carIcon} alt="carIcon" width="32px" height="14px" />
              <p className="text">Car</p>
            </div>
          </div>
          <div className="container-car">
            <div className="container-black">
              <p className="balance-win">1.00</p>
              <img
                src={carIcon}
                alt="carIcon"
                width="259px"
                height="116px"
                className="car"
              />
              <img src={roadIcon} alt="roadIcon" />
            </div>
            <div className="container-info">
              <p className="txt-info">Bet Amount</p>
              <div className="container-start">
                <input type="text" className="input-price" />
                <button className="btn-start">Start</button>
              </div>
              <div className="container-button">
                <button className="btn-betting">$10</button>
                <button className="btn-betting">$50</button>
                <button className="btn-betting">$100</button>
                <button className="btn-betting">$500</button>
              </div>
            </div>
          </div>
        </div>
        <div className="container-bonus">
          <div className="conatiner-logo">
            <img src={iocnBonus} alt="iocnBonus" width="40px" height="40px" />
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
                  <img
                    src={clockIcon}
                    alt="clockIcon"
                    width="16px"
                    height="16px"
                  />
                  <p className="time">0:53</p>
                </div>
              </div>

              <div className="container-clock">
                <p className="text-clock">Amount:</p>
                <p className="green-text">$10</p>
              </div>
            </div>
          </div>
          <button className="btn-claim">Claim Now!</button>
        </div>
      </main>
    </div>
  );
}
