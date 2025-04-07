
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import JamDetails from "./pages/JamDetails";
import Rankings from "./pages/Rankings";
import JamBattles from "./pages/JamBattles";
import SeasonalCalendar from "./pages/SeasonalCalendar";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import Credits from "./pages/Credits";
import AdminDashboard from "./pages/AdminDashboard";
import JamEditor from "./pages/JamEditor";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/jam/:id" element={<JamDetails />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/battles" element={<JamBattles />} />
                <Route path="/seasonal" element={<SeasonalCalendar />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/credits" element={<Credits />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/jam/create" element={<JamEditor />} />
                <Route path="/jam/edit/:id" element={<JamEditor />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
