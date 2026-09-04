import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import DynamicBackground from "./components/DynamicBackground";
import IntroScreen from "./components/IntroScreen";

import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Reviews from "./pages/Reviews";
import Pricing from "./pages/Pricing";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrivacyProtocol from "./pages/PrivacyProtocol";
import TermsOfOperation from "./pages/TermsOfOperation";
import HIPAAStandards from "./pages/HIPAAStandards";

export default function App() {
  /* Show intro only once per session */
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem("introSeen")
  );

  const handleIntroDone = () => {
    sessionStorage.setItem("introSeen", "1");
    setShowIntro(false);
  };

  return (
    <AuthProvider>
      {showIntro ? (
        <IntroScreen onDone={handleIntroDone} />
      ) : (
        <>
          <DynamicBackground />
          <div className="min-h-screen text-gray-800">
            <Navbar />
            <div className="pt-28 px-4 md:px-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/reviews" element={<Reviews />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/privacy" element={<PrivacyProtocol />} />
                <Route path="/terms" element={<TermsOfOperation />} />
                <Route path="/hipaa" element={<HIPAAStandards />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </AuthProvider>
  );
}
