import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Star, Quote, FileText, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:8000/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        setComment("");
        setRating(5);
        fetchReviews(); // Refresh the list
      } else {
        const errText = await res.text();
        console.error("Review Error:", errText);
        alert(`Failed to submit review: ${errText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-28 relative min-h-screen overflow-hidden flex flex-col">


        <div className="max-w-7xl mx-auto px-6 relative z-[2] pb-32 flex-grow w-full">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold text-center text-gray-900"
          >
            User <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">Reviews</span>
          </motion.h1>

          <p className="text-center text-gray-600 mt-4 mb-14 text-lg max-w-2xl mx-auto">
            See what our users are saying about their experience with realistic cosmetic enhancement previews.
          </p>

          {/* WRITE REVIEW SECTION */}
          <div className="max-w-3xl mx-auto mb-16">
            {!user ? (
              <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tried our preview tool?</h3>
                <p className="text-gray-600 mb-6">Log in to share your experience with the community.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 rounded-xl bg-accent-gradient text-white font-bold shadow hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  Log In to Write a Review
                </button>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-3xl p-8 shadow-soft relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 bg-accent-gradient h-full"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pl-4">Write a Review</h3>

                <form onSubmit={handleSubmit} className="pl-4">
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Rate your experience</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${star <= rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300 fill-none"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience — was it easy to use? Did the previews look realistic?..."
                      className="w-full bg-white/50 border border-purple-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="px-8 py-3 rounded-xl bg-accent-gradient text-white font-bold shadow hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              { emoji: "⚡", label: "Fast Results" },
              { emoji: "🪞", label: "Realistic Previews" },
              { emoji: "😊", label: "Beginner Friendly" },
              { emoji: "🔒", label: "Privacy Focused" },
              { emoji: "✅", label: "Easy to Use" },
            ].map((badge, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 shadow-sm text-sm font-semibold text-gray-700">
                <span>{badge.emoji}</span>
                {badge.label}
              </div>
            ))}
          </div>

          {/* REVIEWS LIST */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {reviews.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 text-xl font-medium">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <Tilt
                      tiltMaxAngleX={12}
                      tiltMaxAngleY={12}
                      perspective={1200}
                      scale={1.05}
                      transitionSpeed={400}
                      glareEnable={true}
                      glareMaxOpacity={0.25}
                      glareColor="white"
                      glarePosition="all"
                      className="h-full bg-white/70 backdrop-blur-2xl border border-purple-100 
                      rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(168,85,247,0.1)]
                      p-10 transition-all duration-500 cursor-pointer group relative overflow-hidden
                      hover:shadow-[0_25px_60px_-10px_rgba(168,85,247,0.3)] hover:border-purple-300 flex flex-col"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <Quote className="w-10 h-10 text-purple-200 group-hover:text-purple-400 transition-colors duration-500" />
                        <div className="flex gap-1">
                          {Array.from({ length: r.rating }).map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-5 h-5 text-yellow-500 fill-yellow-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="italic text-gray-700 font-medium leading-relaxed flex-grow relative z-10 group-hover:text-gray-900 transition-colors text-lg">
                        "{r.comment}"
                      </p>

                      <div className="mt-8 pt-6 relative z-10 border-t border-purple-100/50 flex flex-col gap-1">
                        <h3 className="text-xl font-black text-gray-900 group-hover:bg-accent-gradient group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 tracking-tight">
                          {r.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-full ${r.user_id === 0 ? "text-purple-700 border-purple-200 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white" : "text-pink-600 border-pink-200 bg-pink-50 group-hover:bg-pink-500 group-hover:text-white"} transition-all duration-500`}>
                            {r.user_id === 0 ? "Trusted User" : "Community User"}
                          </span>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Animated Bottom Line */}
                      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                    </Tilt>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}