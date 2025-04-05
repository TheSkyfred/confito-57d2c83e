import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Explore from '@/pages/Explore';
import JamDetails from '@/pages/JamDetails';
import JamEditor from '@/pages/JamEditor';
import JamBattles from '@/pages/JamBattles';
import UserProfile from '@/pages/UserProfile';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Credits from '@/pages/Credits';
import SeasonalCalendar from '@/pages/SeasonalCalendar';
import Rankings from '@/pages/Rankings';
import NotFound from '@/pages/NotFound';
import AdminSeeder from '@/pages/AdminSeeder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/jam/:jamId" element={<JamDetails />} />
        <Route path="/jam-editor" element={<JamEditor />} />
        <Route path="/jam-battles" element={<JamBattles />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/seasonal-calendar" element={<SeasonalCalendar />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/admin/seeder" element={<AdminSeeder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
