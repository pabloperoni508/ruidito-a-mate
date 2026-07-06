import { Outlet } from "react-router-dom";
import { ActiveRaffleProvider } from "../context/RaffleContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RafflePopup from "../components/RafflePopup";

function MainLayout() {
  return (
    <ActiveRaffleProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
        <RafflePopup />
      </div>
    </ActiveRaffleProvider>
  );
}

export default MainLayout;