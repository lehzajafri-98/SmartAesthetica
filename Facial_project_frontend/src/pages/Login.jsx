import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Tilt from "react-parallax-tilt";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pt-32 pb-24 flex justify-center items-center px-6 min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 -z-10"></div>

        <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} perspective={1000} scale={1.02} transitionSpeed={1500} className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-10 rounded-3xl w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full blur-[80px] opacity-20 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 rounded-full blur-[80px] opacity-20 -z-10"></div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent-gradient shadow-md mb-1"></div>
              <span>Login to <span className="bg-accent-gradient bg-clip-text text-transparent">SmartAesthetica</span></span>
            </h1>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                className="w-full p-4 rounded-xl bg-white/60 border border-purple-100 text-gray-800 placeholder-gray-400
                          focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white
                          hover:bg-white/90 transition-all mb-8 outline-none shadow-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl bg-accent-gradient text-white font-bold 
                           shadow-md hover:shadow-lg hover:scale-[1.03] hover:-translate-y-0.5 
                           transition-all duration-300 relative group overflow-hidden ${loading ? "opacity-70 cursor-wait" : ""}`}
              >
                <span className="relative z-10">{loading ? "Logging in..." : "Login"}</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6 font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </Tilt>
      </div>
    </>
  );
}
