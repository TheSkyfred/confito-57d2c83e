
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
import AdminJams from './pages/AdminJams';
import AdminJamEdit from './pages/AdminJamEdit';
import AdminBattles from './pages/AdminBattles';
import AdminBattleCreate from './pages/AdminBattleCreate';
import AdminBattleEdit from './pages/AdminBattleEdit';
import AdminBattleManage from './pages/AdminBattleManage';
import JamBattles from './pages/JamBattles';
import BattleDetails from './pages/BattleDetails';
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
import AdminSeasonalFruits from './pages/AdminSeasonalFruits';
import AdminSeasonalFruitEdit from './pages/AdminSeasonalFruitEdit';
import FruitDetail from './pages/FruitDetail';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import AdminConseils from './pages/AdminConseils';
import AdminConseilEdit from './pages/AdminConseilEdit';
import Conseils from './pages/Conseils';
import ConseilDetail from './pages/ConseilDetail'; 
import ConseilEdit from './pages/ConseilEdit';
import ConseilCreate from './pages/ConseilCreate';
import AdminProAccessories from './pages/AdminProAccessories';
import News from './pages/News';

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
                  <Route path="/profile/:id" element={<UserProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/jam/:id" element={<JamDetails />} />
                  <Route path="/jam/create" element={<JamEditor />} />
                  <Route path="/jam/edit/:id" element={<JamEditor />} />
                  <Route path="/battles" element={<BattlesList />} />
                  <Route path="/battles/jam" element={<JamBattles />} />
                  <Route path="/battles/:id" element={<BattleDetails />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/jams" element={<AdminJams />} />
                  <Route path="/admin/jams/edit/:id" element={<AdminJamEdit />} />
                  <Route path="/admin/battles" element={<AdminBattles />} />
                  <Route path="/admin/battles/create" element={<AdminBattleCreate />} />
                  <Route path="/admin/battles/edit/:id" element={<AdminBattleEdit />} />
                  <Route path="/admin/battles/manage/:id" element={<AdminBattleManage />} />
                  <Route path="/admin/recipes" element={<AdminRecipes />} />
                  <Route path="/admin/ads" element={<AdminAds />} />
                  <Route path="/admin/ads/new" element={<AdminAds action="new" />} />
                  <Route path="/admin/ads/edit/:id" element={<AdminAds action="edit" />} />
                  <Route path="/admin/ads/view/:id" element={<AdminAds action="view" />} />
                  <Route path="/admin/campaigns/:id" element={<AdminCampaigns />} />
                  <Route path="/admin/fruits" element={<AdminFruits />} />
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
                  <Route path="/admin/conseils" element={<AdminConseils />} />
                  <Route path="/admin/conseils/edit/:id" element={<AdminConseilEdit />} />
                  <Route path="/conseils" element={<Conseils />} />
                  <Route path="/conseils/create" element={<ConseilCreate />} />
                  <Route path="/conseils/edit/:id" element={<ConseilEdit />} />
                  <Route path="/conseils/:id" element={<ConseilDetail />} />
                  <Route path="/admin/pro-accessories" element={<AdminProAccessories />} />
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
