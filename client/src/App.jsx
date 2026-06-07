import { useState } from 'react';
import { useUser, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRole } from './hooks/useRole';
import Onboarding from './pages/Onboarding';

import TrainerDashboard from './pages/TrainerDashboard';
import DogProfile from './pages/DogProfile';
import NewSession from './pages/NewSession';
import ClientDashboard from './pages/ClientDashboard';
import ClientDogView from './pages/ClientDogView';
import Layout from './components/shared/Layout';

function AppRoutes() {
  const { role, loading, refetch } = useRole();

  if (loading) return <div className="loading-screen">Loading Pawgress...</div>;

  // New user — needs to pick trainer or client
  if (!role) return <Onboarding onComplete={refetch} />;

  if (role === 'trainer') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TrainerDashboard />} />
          <Route path="dogs/:dogId" element={<DogProfile />} />
          <Route path="dogs/:dogId/sessions/new" element={<NewSession />} />
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
