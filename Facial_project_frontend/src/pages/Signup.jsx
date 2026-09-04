import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Tilt from "react-parallax-tilt";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";

export default function Signup() {
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [waitingVerify, setWaitingVerify] = useState(false);
  const { signup, login }                 = useAuth();
  const navigate                          = useNavigate();

  // Google signup
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      // Open Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user   = result.user;

      // Send to backend
      const res  = await fetch("http://localhost:8000/google-signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:  user.displayName || user.email,
          email: user.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");

      // Save token AND update AuthContext user state properly
      localStorage.setItem("token", data.token);

      // Verify token with backend to set user in AuthContext
      const meRes  = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const meData = await meRes.json();
      if (meRes.ok && meData.user) {
        // Force page reload so AuthContext re-reads localStorage token
        window.location.href = "/";
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Email signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);
      setWaitingVerify(true);
      setLoading(false);

      // Check every 4 seconds if email verified
      const interval = setInterval(async () => {
        await userCred.user.reload();
        if (userCred.user.emailVerified) {
          clearInterval(interval);
          const res  = await fetch("http://localhost:8000/signup", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Signup failed");
          localStorage.setItem("token", data.token);
          // Force reload so AuthContext picks up new token
          window.location.href = "/";
        }
      }, 4000);

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  // Verification waiting screen
  if (waitingVerify) {
    return (
      <div className="pt-32 pb-24 flex justify-center items-center px-6 min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 -z-10"></div>
        <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} perspective={1000} scale={1.02} transitionSpeed={1500} className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-10 rounded-3xl w-full relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full blur-[80px] opacity-20 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 rounded-full blur-[80px] opacity-20 -z-10"></div>
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Check Your Email</h2>
            <p className="text-gray-500 mb-2 text-sm">We sent a verification link to:</p>
            <p className="font-bold bg-accent-gradient bg-clip-text text-transparent mb-4">{email}</p>
            <p className="text-gray-400 text-sm mb-2">Check <strong>Inbox</strong> and <strong>Spam</strong> folder.</p>
            <p className="text-gray-400 text-sm mb-6">Click the link — this page will continue automatically.</p>
            <div className="flex items-center justify-center gap-2 text-purple-500">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Waiting for verification...</span>
            </div>
          </div>
        </Tilt>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="pt-32 pb-24 flex justify-center items-center px-6 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10"></div>
      <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} perspective={1000} scale={1.02} transitionSpeed={1500} className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-10 rounded-3xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full blur-[80px] opacity-20 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 rounded-full blur-[80px] opacity-20 -z-10"></div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-gradient shadow-md mb-1"></div>
            <span>Create account for <span className="bg-accent-gradient bg-clip-text text-transparent">SmartAesthetica</span></span>
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/60 border border-purple-100 text-gray-800 placeholder-gray-400
                        focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white
                        hover:bg-white/90 transition-all mb-4 outline-none shadow-sm"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/60 border border-purple-100 text-gray-800 placeholder-gray-400
                        focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white
                        hover:bg-white/90 transition-all mb-4 outline-none shadow-sm"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-4 rounded-xl bg-white/60 border border-purple-100 text-gray-800 placeholder-gray-400
                        focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white
                        hover:bg-white/90 transition-all mb-6 outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl bg-accent-gradient text-white font-bold 
                         shadow-md hover:shadow-lg hover:scale-[1.03] hover:-translate-y-0.5 
                         transition-all duration-300 relative group overflow-hidden ${loading ? "opacity-70 cursor-wait" : ""}`}
            >
              <span className="relative z-10">{loading ? "Creating account..." : "Signup"}</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-purple-100"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-purple-100"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className={`w-full py-4 rounded-xl bg-white/60 border border-purple-100 text-gray-700 font-bold
                       flex items-center justify-center gap-3
                       hover:bg-white hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5
                       transition-all duration-300 ${loading ? "opacity-70 cursor-wait" : ""}`}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <p className="text-center text-gray-600 mt-6 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </Tilt>
    </div>
  );
}