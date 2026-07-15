import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./lib/auth";
import { SyncProvider } from "./lib/sync";
import Aura from "./three/Aura";
import Login from "./screens/Login";
import Onboarding, { OnboardingGate } from "./screens/Onboarding";
import AppLayout from "./app/AppLayout";
import Dashboard from "./screens/Dashboard";
import TeamView from "./screens/TeamView";
import CultureView from "./screens/CultureView";
import SignalView from "./screens/SignalView";
import ModulesView from "./screens/ModulesView";
import ProfileView from "./screens/ProfileView";
import AssessmentView from "./screens/AssessmentView";
import ModuleDetailView from "./screens/ModuleDetailView";
import GameView from "./screens/GameView";
import CommonGroundLive from "./screens/games/CommonGroundLive";
import FailForwardLive from "./screens/games/FailForwardLive";
import CrisisRoomLive from "./screens/games/CrisisRoomLive";
import DefuseLive from "./screens/games/DefuseLive";
import HeistLive from "./screens/games/HeistLive";
import BalanceHub from "./screens/BalanceHub";
import ResetRitual from "./screens/games/ResetRitual";
import GratitudeDrop from "./screens/games/GratitudeDrop";
import ReachOut from "./screens/games/ReachOut";
import CoffeeRoulette from "./screens/games/CoffeeRoulette";
import SoundBath from "./screens/games/SoundBath";
import PressureValve from "./screens/games/PressureValve";
import BoundaryBuilder from "./screens/games/BoundaryBuilder";
import RecoveryWins from "./screens/games/RecoveryWins";
import SetbackStories from "./screens/games/SetbackStories";
import StrengthSpotting from "./screens/games/StrengthSpotting";
import TheComeback from "./screens/games/TheComeback";
import CheckOnAColleague from "./screens/games/CheckOnAColleague";
import NotAlone from "./screens/games/NotAlone";
import ConflictStyles from "./screens/games/ConflictStyles";
import CoolDown from "./screens/games/CoolDown";
import RepairKit from "./screens/games/RepairKit";
import ClearTheAir from "./screens/games/ClearTheAir";
import FirstWeekQuest from "./screens/games/FirstWeekQuest";
import GoalcraftSolo from "./screens/games/GoalcraftSolo";
import GoalcraftLive from "./screens/games/GoalcraftLive";
import OneClearAsk from "./screens/games/OneClearAsk";
import OneOnOneCompanion from "./screens/games/OneOnOneCompanion";
import TrustView from "./screens/TrustView";
import TranslateThisLive from "./screens/games/TranslateThisLive";
import OwnershipCards from "./screens/games/OwnershipCards";
import OwnershipCardsLive from "./screens/games/OwnershipCardsLive";
import TheTradeoff from "./screens/games/TheTradeoffLive";
import MeditationView from "./screens/MeditationView";
import Network from "./screens/Network";

// warm "Reflexion & Mood" aura on meditation / mood / profile / assessment / balance screens
const WARM = ["/meditation", "/app/signal", "/app/profile", "/app/assessment", "/app/balance"];

function Shell() {
  const { pathname } = useLocation();
  const variant = WARM.some((p) => pathname === p || pathname.startsWith(p + "/")) ? "warm" : "signature";
  const intensity = pathname === "/" || pathname === "/meditation" ? 0.95 : 0.72;

  return (
    <>
      <Aura intensity={intensity} variant={variant} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/app" element={<RequireAuth><OnboardingGate><AppLayout /></OnboardingGate></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<TeamView />} />
          <Route path="culture" element={<CultureView />} />
          <Route path="signal" element={<SignalView />} />
          <Route path="modules" element={<ModulesView />} />
          <Route path="module/:id" element={<ModuleDetailView />} />
          <Route path="game/:key" element={<GameView />} />
          <Route path="live/commonground" element={<CommonGroundLive />} />
          <Route path="live/failforward" element={<FailForwardLive />} />
          <Route path="live/crisisroom" element={<CrisisRoomLive />} />
          <Route path="live/defuse" element={<DefuseLive />} />
          <Route path="live/heist" element={<HeistLive />} />
          <Route path="live/goalcraft" element={<GoalcraftLive />} />
          <Route path="live/translatethis" element={<TranslateThisLive />} />
          <Route path="live/ownershipcards" element={<OwnershipCardsLive />} />
          <Route path="live/thetradeoff" element={<TheTradeoff />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="privacy" element={<TrustView />} />
          <Route path="assessment" element={<AssessmentView />} />
          <Route path="balance" element={<BalanceHub />} />
          <Route path="balance/reset" element={<ResetRitual />} />
          <Route path="balance/gratitude" element={<GratitudeDrop />} />
          <Route path="balance/reachout" element={<ReachOut />} />
          <Route path="balance/coffee" element={<CoffeeRoulette />} />
          <Route path="balance/soundbath" element={<SoundBath />} />
          <Route path="balance/valve" element={<PressureValve />} />
          <Route path="balance/boundary" element={<BoundaryBuilder />} />
          <Route path="balance/recovery" element={<RecoveryWins />} />
          <Route path="balance/setback" element={<SetbackStories />} />
          <Route path="balance/strength" element={<StrengthSpotting />} />
          <Route path="balance/comeback" element={<TheComeback />} />
          <Route path="balance/checkon" element={<CheckOnAColleague />} />
          <Route path="balance/notalone" element={<NotAlone />} />
          <Route path="conflict/cleartheair" element={<ClearTheAir />} />
          <Route path="conflict/styles" element={<ConflictStyles />} />
          <Route path="conflict/cooldown" element={<CoolDown />} />
          <Route path="conflict/repair" element={<RepairKit />} />
          <Route path="onboarding/firstweek" element={<FirstWeekQuest />} />
          <Route path="performance/goalcraft" element={<GoalcraftSolo />} />
          <Route path="communication/oneclearask" element={<OneClearAsk />} />
          <Route path="performance/ownershipcards" element={<OwnershipCards />} />
          <Route path="leadership/oneonone" element={<OneOnOneCompanion />} />
        </Route>
        <Route path="/meditation" element={<RequireAuth><OnboardingGate><MeditationView /></OnboardingGate></RequireAuth>} />
        <Route path="/network" element={<RequireAuth><OnboardingGate><Network /></OnboardingGate></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </SyncProvider>
    </AuthProvider>
  );
}
