import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import JamDetails from './pages/JamDetails';
import Explore from './pages/Explore';
import JamEditor from './pages/JamEditor';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Credits from './pages/Credits';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import JamBattles from './pages/JamBattles';
import BattleDetails from './pages/BattleDetails';
import BattleAdmin from './pages/BattleAdmin';
import BattlesList from './pages/BattlesList';
import Rankings from './pages/Rankings';
import ProDashboard from './pages/ProDashboard';
import ProRegistration from './pages/ProRegistration';
import AdminRecipes from './pages/AdminRecipes';
import SeasonalCalendar from './pages/SeasonalCalendar';
import UserRecipes from './pages/UserRecipes';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeCreate from './pages/RecipeCreate';
import RecipeEdit from './pages/RecipeEdit';
import AdminAds from './pages/AdminAds';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminFruits from './pages/AdminFruits';
// Nouvelles pages pour les fruits saisonniers
import AdminSeasonalFruits from './pages/AdminSeasonalFruits';
import AdminSeasonalFruitEdit from './pages/AdminSeasonalFruitEdit';
import FruitDetail from './pages/FruitDetail';
import AdminUsers from './pages/AdminUsers';

// Nouvelles pages pour les conseils
import Conseils from './pages/Conseils';
import ConseilDetail from './pages/ConseilDetail';
import ConseilCreate from './pages/ConseilCreate';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/credits" element={<Credits />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/jam/:id" element={<JamDetails />} />
                  <Route path="/jam/create" element={<JamEditor />} />
                  <Route path="/jam/edit/:id" element={<JamEditor />} />
                  <Route path="/battles" element={<BattlesList />} />
                  <Route path="/battles/jam" element={<JamBattles />} />
                  <Route path="/battles/:id" element={<BattleDetails />} />
                  <Route path="/battles/admin" element={<BattleAdmin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/recipes" element={<AdminRecipes />} />
                  <Route path="/admin/ads" element={<AdminAds />} />
                  <Route path="/admin/ads/new" element={<AdminAds action="new" />} />
                  <Route path="/admin/ads/edit/:id" element={<AdminAds action="edit" />} />
                  <Route path="/admin/ads/view/:id" element={<AdminAds action="view" />} />
                  <Route path="/admin/campaigns/:id" element={<AdminCampaigns />} />
                  
                  {/* Page de redirection pour l'ancienne interface */}
                  <Route path="/admin/fruits" element={<AdminSeasonalFruits />} />
                  
                  {/* Routes pour les fruits saisonniers */}
                  <Route path="/admin/seasonal-fruits" element={<AdminSeasonalFruits />} />
                  <Route path="/admin/seasonal-fruits/edit/:id" element={<AdminSeasonalFruitEdit />} />
                  <Route path="/admin/seasonal-fruits/create" element={<AdminSeasonalFruitEdit />} />
                  <Route path="/fruits/:id" element={<FruitDetail />} />
                  
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/seasonal" element={<SeasonalCalendar />} />
                  <Route path="/user/recipes" element={<UserRecipes />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/recipes/create" element={<RecipeCreate />} />
                  <Route path="/recipes/edit/:id" element={<RecipeEdit />} />
                  
                  {/* Routes pour les conseils */}
                  <Route path="/conseils" element={<Conseils />} />
                  <Route path="/conseils/:id" element={<ConseilDetail />} />
                  <Route path="/conseils/create" element={<ConseilCreate />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
