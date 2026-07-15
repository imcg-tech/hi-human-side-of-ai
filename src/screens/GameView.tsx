import { useParams, Navigate } from "react-router-dom";
import { GAMES } from "../data/games";
import QuizGame from "./games/QuizGame";
import CommonGroundGame from "./games/CommonGroundGame";
import SignalNoiseGame from "./games/SignalNoiseGame";
import FailForwardGame from "./games/FailForwardGame";
import CrisisRoomGame from "./games/CrisisRoomGame";
import FeedbackTrainingGame from "./games/FeedbackTrainingGame";

export default function GameView() {
  const { key } = useParams();
  const g = key ? GAMES[key] : undefined;
  if (!g) return <Navigate to="/app/modules" replace />;

  switch (g.kind) {
    case "commonground": return <CommonGroundGame game={g} />;
    case "signalnoise": return <SignalNoiseGame game={g} />;
    case "failforward": return <FailForwardGame game={g} />;
    case "crisisroom": return <CrisisRoomGame game={g} />;
    case "feedbackclass": return <FeedbackTrainingGame game={g} />;
    default: return <QuizGame game={g} />;
  }
}
