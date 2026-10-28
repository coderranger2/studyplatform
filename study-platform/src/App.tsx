import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from './components/layout/Layout.tsx';
import { CommunitiesPage } from './pages/CommunitiesPage.tsx';
import { DiscoverPage } from './pages/DiscoverPage.tsx';
import { StudyToolsPage } from './pages/StudyToolsPage.tsx';
import { StudyBuddyPage } from './pages/StudyBuddyPage.tsx';
import { CompetencyLabPage } from './pages/CompetencyLabPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { FocusRoomPage } from './pages/FocusRoomPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

// Preserved Competency Evaluation Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AssessmentPage } from './pages/AssessmentPage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import { RoadmapPage } from './pages/RoadmapPage.tsx';
import { ProgressPage } from './pages/ProgressPage.tsx';

import { resetUserProgress } from './utilities/storage.ts';
import { showToast } from './components/common/Toast.tsx';
import './index.css';

export const App: React.FC = () => {
  const [resetTick, setResetTick] = useState(0);

  const handleGlobalReset = () => {
    resetUserProgress();
    setResetTick((t) => t + 1);
    showToast('✓ Demo progress successfully reset! Restored all default communities, mock chat, and quiz data.', 'success');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout key={resetTick} onResetDemo={handleGlobalReset} />}>
          {/* Primary EdTech Learning Dashboard Landing */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Social Study Communities (Discord Workspace) */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="community" element={<Navigate to="/communities" replace />} />

          {/* Core Vision Features */}
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="tools" element={<StudyToolsPage />} />
          <Route path="study-buddy" element={<StudyBuddyPage />} />
          <Route path="competency" element={<CompetencyLabPage />} />
          <Route path="teachers" element={<Navigate to="/study-buddy" replace />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="focus" element={<FocusRoomPage />} />
          <Route path="pomodoro" element={<Navigate to="/focus" replace />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Preserved Competency Engine & Assessment Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="progress" element={<ProgressPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;