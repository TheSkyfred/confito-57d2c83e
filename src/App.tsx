import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminSeeder from "./pages/AdminSeeder";
import AdminDashboard from "./pages/AdminDashboard";
import JamEditor from "./pages/JamEditor";
import SeedUsersButton from "./components/SeedUsersButton";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container my-4">
            <SeedUsersButton />
          </div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/seeder" element={<AdminSeeder />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/jam/new" element={<JamEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
