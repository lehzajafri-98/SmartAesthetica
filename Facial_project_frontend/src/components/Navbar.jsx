// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full py-4 fixed top-0 left-0 z-50 bg-white/70 backdrop-blur-xl shadow-md border-b border-white/40"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg relative overflow-hidden flex items-center justify-center border border-purple-400/30">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 9h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:brightness-110 transition-all tracking-tight">
              Smart<span className="font-light">Aesthetica</span>
            </h3>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="relative group overflow-hidden px-1">
            <span className="hover:text-purple-600 transition-colors">Home</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/about" className="relative group overflow-hidden px-1 whitespace-nowrap">
            <span className="hover:text-purple-600 transition-colors">About</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/features" className="relative group overflow-hidden px-1 whitespace-nowrap">
            <span className="hover:text-purple-600 transition-colors">Features</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/how-it-works" className="relative group overflow-hidden px-1 whitespace-nowrap">
            <span className="hover:text-purple-600 transition-colors">How It Works</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/reviews" className="relative group overflow-hidden px-1 whitespace-nowrap">
            <span className="hover:text-purple-600 transition-colors">Reviews</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/pricing" className="relative group overflow-hidden px-1 whitespace-nowrap">
            <span className="hover:text-purple-600 transition-colors">Pricing</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>


          {user ? (
            /* Logged in — show user avatar + logout */
            <div className="flex items-center gap-3 ml-2">
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-all cursor-pointer group/name whitespace-nowrap">
                <div className="w-7 h-7 rounded-full bg-accent-gradient flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover/name:scale-110 transition-transform shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-purple-700 max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 transition-all duration-200 whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          ) : (
            /* Not logged in — show Login + Get Started */
            <>
              <Link to="/login" className="relative group overflow-hidden px-1 hover:text-purple-600 transition-colors">
                Login
              </Link>

              <Link to="/signup">
                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} perspective={1000} transitionSpeed={400} glareEnable={true} glareMaxOpacity={0.4} glareColor="white" glarePosition="all" className="rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transition-shadow">
                  <button className="px-6 py-2.5 bg-accent-gradient text-white font-bold relative group">
                    <span className="relative z-10">Get Started</span>
                  </button>
                </Tilt>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
