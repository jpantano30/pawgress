import { useUser, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRole } from './hooks/useRole';
import Onboarding from './pages/Onboarding';

import TrainerDashboard from './pages/TrainerDashboard';
import DogProfile from './pages/DogProfile';
import NewSession from './pages/NewSession';
import ReportBuilder from './pages/ReportBuilder';
import TrainerIntakePage from './pages/TrainerIntakePage';
import ClientDashboard from './pages/ClientDashboard';
import ClientDogView from './pages/ClientDogView';
import ClientIntakePage from './pages/ClientIntakePage';
import Layout from './components/shared/Layout';

function AppRoutes() {
  const { role, loading, refetch } = useRole();
  if (loading) return <div className="loading-screen">Loading Pawgress...</div>;
  if (!role) return <Onboarding onComplete={refetch} />;

  if (role === 'trainer') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TrainerDashboard />} />
          <Route path="dogs/:dogId" element={<DogProfile />} />
          <Route path="dogs/:dogId/sessions/new" element={<NewSession />} />
          <Route path="dogs/:dogId/reports/:reportId" element={<ReportBuilder />} />
          <Route path="dogs/:dogId/intake" element={<TrainerIntakePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ClientDashboard />} />
        <Route path="dogs/:dogId" element={<ClientDogView />} />
        <Route path="dogs/:dogId/intake" element={<ClientIntakePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div className="auth-screen">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <AppRoutes />
      </SignedIn>
    </>
  );
}
