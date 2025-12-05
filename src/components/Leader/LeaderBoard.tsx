import "./LeaderBoard.styles.css"

import prizeBlue from "../../assets/prize-blue.svg";
import prize1 from "../../assets/prize-yellow.svg";
import prize2 from "../../assets/prize-gray.svg";
import prize3 from "../../assets/prize-orange.svg";

interface Leader {
  id: string;
  username: string | null;
  games_played: number;
  total_won: number;
}

interface LeaderboardProps {
  leaders: Leader[];
  yourRank: number | null;
  userId: string | null;
}

export default function LeaderBoard({
  leaders,
  yourRank,
  userId,
}: LeaderboardProps) { 
  const rankIcons = [prize1, prize2, prize3];

  return (
    <div className="container-leaderboard">
      <div className="container-img">
        <img src={prizeBlue} alt="prize" width={40} height={40} />
        <div className="container-text-leaderboard">
          <p className="txt-heading">Leaderboard</p>
          <p className="txt-heading-small">Top players</p>
        </div>
      </div>

      {leaders.map((leader, index) => {
        const icon = rankIcons[index] ?? null;

        const isCurrentUser = leader.id === userId;

        return (
          <div
            key={leader.id}
            className="container-players"
            style={{
              background: isCurrentUser
                ? "linear-gradient(90deg, rgba(43, 127, 255, 0.2) 0%, rgba(173, 70, 255, 0.2) 100%)"
                : "",
              border: isCurrentUser ? "1px solid #2B7FFF80" : "",
            }}
          >
            {icon ? (
              <img src={icon} alt="rank-icon" />
            ) : (
              <p className="rank-index">#{index + 1}</p>
            )}

            <div className="container-players-name">
              <p className="name-players">{leader.username}</p>
              <p className="games">{leader.games_played} games</p>
            </div>

            <div className="container-players-win">
              <p className="balance">${Math.floor(leader.total_won)}</p>
              <p className="win">
                {leader.games_played > 0
                  ? Math.round(
                      (leader.total_won / (leader.games_played * 1000)) * 100
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
  );
}
