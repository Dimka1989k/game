import iconPrize from "../../assets/icon-prize.svg";
import iconProfiles from "../../assets/Icon-profiles.svg";
import iconBalance from "../../assets/Icon-balance.svg";
import entericon from "../../assets/icon-gray-enter.svg";
import iconClose from "../../assets/closeIcon.svg";
import userIcon from "../../assets/userIcon.svg";

import "./Header.styles.css";

interface HeaderProps {
  displayName: string;
  balanceText: string;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  message: string | null;
  messageType: "success" | "error" | null;
  profile: {
    balance: number;
    games_played: number;
    total_wagered: number;
    total_won: number;
    username: string | null;
  } | null;

  handleSave: () => void;
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
}

export default function Header({
  displayName,
  balanceText,
  isSettingsOpen,
  setIsSettingsOpen,
  usernameInput,
  setUsernameInput,
  message,
  messageType,
  profile,
  handleSave,
  signOut,
  navigate,
}: HeaderProps) {
  return (
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
                        messageType === "error" ? "error-text" : "success-text"
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
  );
}
