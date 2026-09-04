import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import Simulation from "../components/Simulation";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Lock, Sparkles, User, ChevronDown, Activity, ShieldCheck,
  Syringe, Droplets, Zap, Waves, FlaskConical, Scissors, Minimize2, Frame, TestTube, Crosshair, Grip
} from "lucide-react";
import Tilt from "react-parallax-tilt";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/* ================= SURGICAL PROCEDURES ================= */
const SURGICAL = [
  { name: "Rhinoplasty", icon: <Scissors className="w-6 h-6" /> },
  { name: "Lip Augmentation", icon: <Minimize2 className="w-6 h-6" /> },
  { name: "Chin Augmentation", icon: <Frame className="w-6 h-6" /> },
  { name: "Jawline Surgery", icon: <Crosshair className="w-6 h-6" /> },
  { name: "Buccal Fat Removal", icon: <Activity className="w-6 h-6" /> },
  { name: "Scar Revision Surgery", icon: <Zap className="w-6 h-6" /> }
];

const NON_SURGICAL = [
  { name: "Botox", icon: <Syringe className="w-6 h-6" /> },
  { name: "Dermal Fillers", icon: <Droplets className="w-6 h-6" /> },
  { name: "Lip Fillers", icon: <Syringe className="w-6 h-6" /> },
  { name: "Jawline Fillers", icon: <Crosshair className="w-6 h-6" /> },
  { name: "Microneedling", icon: <Grip className="w-6 h-6" /> },
  { name: "Chemical Peels", icon: <Droplets className="w-6 h-6" /> },
  { name: "Laser Skin Resurfacing", icon: <Zap className="w-6 h-6" /> },
  { name: "HydraFacial", icon: <Waves className="w-6 h-6" /> },
  { name: "PRP Therapy", icon: <TestTube className="w-6 h-6" /> }
];

const categories = [
  {
    title: "Non-Surgical",
    desc: "Injectables, laser & skin rejuvenation treatments"
  },
  {
    title: "Surgical",
    desc: "Advanced facial analysis (Pro/Clinic Plan Required)"
  }
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [procedure, setProcedure] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const resetAll = () => {
    setStep(1);
    setCategory(null);
    setProcedure(null);
    setFinalImage(null);
    setSelectedPatient("");
  };

  const [loading, setLoading] = useState(false);

  // Fetch patients if user is Clinic
  useEffect(() => {
    if (user && user.plan === "Clinic" && token) {
      fetch("http://localhost:8000/patients", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.patients) setPatients(data.patients);
        })
        .catch(err => console.error("Failed to fetch patients", err));
    }
  }, [user, token]);

  const handleAnalyze = async ({ image, currentIntensity = 50 }) => {
    setLoading(true);
    try {
      // 1. Convert Base64 key to Blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append("file", file);
      if (procedure) {
        formData.append("feature", procedure);
      }
      formData.append("intensity", String(currentIntensity || intensity));

      // 3. Send to Backend for Simulation
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      // No face detected — backend returns the original image untouched
      if (!data.landmarks_detected) {
        throw new Error("No face detected. Please upload a clear, front-facing photo.");
      }

      // 3.5 Get AI Recommendations
      let recommendations = [];
      try {
        const recRes = await fetch("http://localhost:8000/recommend", {
          method: "POST",
          body: formData,
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          recommendations = recData.recommendations || [];
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }

      // 4. Set Result Combine original, simulation, and recommendations
      setFinalImage({
        original: image,
        processed: data.result,
        recommendations: recommendations
      });

      // 5. Save Simulation to User History
      if (token && image && data.result && procedure) {
        try {
          await fetch("http://localhost:8000/history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              procedure: procedure,
              original_image: image,
              processed_image: data.result,
              patient_id: selectedPatient ? parseInt(selectedPatient) : null
            })
          });
          // Silently succeed
        } catch (err) {
          console.error("Failed to save history:", err);
        }
      }

      setTimeout(() => {
        document.getElementById("simulation")?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (error) {
      console.error("Error analyzing image:", error);
      if (error.message.includes("fetch")) {
          alert("Network Error: Could not reach the AI server. Check your connection or the massive photo size.");
      } else {
          alert(`Analysis Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (selectedCat) => {
    if (selectedCat === "Surgical") {
      // Check if user has Pro or Clinic plan
      if (!user || user.plan === "Free") {
        setShowUpgradeModal(true);
        return; // Block proceeding
      }
    }

    setCategory(selectedCat);
    setStep(2);
  };

  return (
    <>
      <div className="min-h-screen pt-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* ================= HERO ================= */}
          <div className="-mt-16">
            <Hero onTrySimulation={() => { document.getElementById("steps-section")?.scrollIntoView({ behavior: "smooth" }); }} />
          </div>

          {/* ================= STEPS ================= */}
          <div id="steps-section" className="mt-16 flex justify-center gap-6 text-sm font-medium">
            <Step active={step >= 1}>1. Category</Step>
            <Step active={step >= 2}>2. Procedure</Step>
            <Step active={step >= 3}>3. Upload</Step>
            <Step active={step >= 4}>4. Simulation</Step>
          </div>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="mt-24 grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {categories.map((cat, i) => {
                const lockThis = user?.plan === 'Free' && cat.title.toLowerCase().includes("surgical") && !cat.title.toLowerCase().includes("non");
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <CategoryCard
                      title={cat.title}
                      desc={cat.desc}
                      onClick={() => handleCategoryClick(cat.title)}
                      isLocked={lockThis}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ================= UPGRADE MODAL ================= */}
          <AnimatePresence>
            {showUpgradeModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                onClick={() => setShowUpgradeModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)] border border-purple-100 relative overflow-hidden text-center"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Sparkles className="w-10 h-10 text-purple-600" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Pro Feature Locked</h3>
                  <p className="text-gray-600 mb-8">
                    Surgical procedure simulations require the advanced analysis engine available on the <span className="font-bold text-purple-600">Pro</span> or <span className="font-bold text-purple-600">Clinic</span> plans.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate("/pricing")}
                      className="w-full py-3.5 rounded-xl bg-accent-gradient text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      View Pricing Plans
                    </button>
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Back to Categories
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <SectionWrapper onBack={() => setStep(1)}>
              <h2 className="section-title">Select {category} Procedure</h2>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
                {(category === "Non-Surgical" ? NON_SURGICAL : SURGICAL).map((item, idx) => {
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.3 }}
                    >
                      <Tilt
                        tiltMaxAngleX={5}
                        tiltMaxAngleY={5}
                        perspective={1000}
                        scale={1.02}
                        transitionSpeed={400}
                        glareEnable={false}
                        className="rounded-3xl border border-purple-100 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_-4px_rgba(168,85,247,0.08)] h-full cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_-5px_rgba(168,85,247,0.3)] hover:border-purple-300 group relative overflow-hidden"
                        style={{ willChange: "transform" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

                        <div
                          onClick={() => {
                            setProcedure(item.name);
                            setStep(3);
                          }}
                          className="p-6 h-full flex flex-col items-center justify-center text-center gap-4 relative z-10"
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${category === "Surgical" ? "bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600" : "bg-gradient-to-br from-pink-100 to-purple-50 text-pink-500"}`}>
                            {item.icon}
                          </div>

                          <h4 className="font-bold text-gray-800 group-hover:bg-accent-gradient group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            {item.name}
                          </h4>

                          <div className="w-12 h-1 bg-purple-200/50 rounded-full scale-x-50 group-hover:scale-x-100 group-hover:bg-purple-500 transition-all duration-300 ease-out origin-center mt-2"></div>
                        </div>
                      </Tilt>
                    </motion.div>
                  );
                })}
              </div>
            </SectionWrapper>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <SectionWrapper onBack={() => setStep(2)}>
              {user ? (
                <>
                  {user.plan === "Clinic" && patients && patients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-12 max-w-2xl mx-auto"
                    >
                      <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1500} className="w-full">
                        <div className="relative p-6 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_-10px_rgba(168,85,247,0.1)] flex flex-col sm:flex-row items-center gap-6 overflow-hidden group">
                          {/* Inner glow */}
                          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-200/40 transition-colors" />

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-0.5">Patient Assignment</label>
                              <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Clinical Metadata</span>
                            </div>
                          </div>

                          <div className="relative flex-grow w-full">
                            <select
                              value={selectedPatient}
                              onChange={(e) => setSelectedPatient(e.target.value)}
                              className="w-full appearance-none bg-gray-50/50 border border-purple-100/50 rounded-2xl px-6 py-4 text-gray-800 font-black uppercase tracking-widest text-xs outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all cursor-pointer pr-12"
                            >
                              <option value="">-- Personal Sandbox Mode --</option>
                              {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} • {p.status}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
                              <ChevronDown size={18} />
                            </div>
                          </div>

                          {/* Decorative Activity Pulse */}
                          <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-l border-purple-100/50 h-10">
                            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Link</span>
                          </div>
                        </div>
                      </Tilt>
                    </motion.div>
                  )}
                  <UploadBox
                    selectedTreatment={procedure}
                    onAnalyze={(data) => {
                      handleAnalyze(data);
                      setStep(4);
                    }}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-8 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-purple-100 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.1)] text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                    <Lock className="w-12 h-12 text-purple-600" />
                  </div>

                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Authentication Required</h3>
                  <p className="text-lg text-gray-600 mb-10 max-w-lg">
                    You must be logged in to securely upload photos and access the advanced AI Simulation Engine.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-8 py-3.5 rounded-xl bg-accent-gradient text-white font-bold shadow-md hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                    >
                      Log In to Continue
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-8 py-3.5 rounded-xl bg-white text-purple-600 font-bold border border-purple-200 shadow-sm hover:bg-purple-50 hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                    >
                      Create Account
                    </button>
                  </div>
                </motion.div>
              )}
            </SectionWrapper>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <SectionWrapper onBack={() => setStep(3)}>
              {/* RECOMMENDATIONS SECTION */}
              {finalImage?.recommendations && finalImage.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="mb-16 rounded-[3.5rem] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_30px_80px_-20px_rgba(168,85,247,0.15)] overflow-hidden"
                >
                  <div className="p-10 md:p-14">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                          <Activity className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                            Diagnostic <span className="text-purple-600 italic">Findings</span>
                          </h3>
                          <p className="text-xs font-black text-purple-400 uppercase tracking-widest mt-1">AI-Powered Aesthetic Intelligence</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100/50 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Verified Analysis</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {finalImage.recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} className="h-full">
                            <div className="group h-full p-8 rounded-[2.5rem] bg-white border border-purple-50 shadow-soft hover:shadow-xl hover:border-purple-200 transition-all duration-500">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                <Sparkles size={20} />
                              </div>
                              <h4 className="font-black text-lg text-gray-900 mb-3 tracking-tight uppercase group-hover:text-purple-600 transition-colors">
                                {rec.procedure}
                              </h4>
                              <p className="text-gray-500 text-sm font-bold leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                                {rec.reason}
                              </p>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Priority</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3].map(s => (
                                    <div key={s} className={`w-3 h-1 rounded-full ${s <= 2 ? 'bg-purple-500' : 'bg-gray-100'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Tilt>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  {/* Decorative Scan Line */}
                  <div className="h-1 w-1/3 bg-accent-gradient blur-sm opacity-20 absolute top-0 pointer-events-none animate-scanLine" />
                </motion.div>
              )}

              {/* LOADING STATE */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <div className="relative w-32 h-32 mb-10">
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-pink-500 border-b-indigo-500 border-l-transparent blur-[2px] animate-loadingRotate" />
                    <div className="absolute inset-4 rounded-full border-4 border-t-emerald-400 border-l-purple-400 border-r-transparent border-b-transparent animate-loadingRotate" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Analyzing <span className="text-purple-600">Facial Data</span></h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Running Neural Simulation Engine</p>
                </motion.div>
              )}

              <div id="simulation">
                {finalImage && !loading && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-100 shadow-soft">
                    <h3 className="text-2xl font-bold mb-6 text-center">Simulation Result: {procedure}</h3>
                    <Simulation
                      image={finalImage.original}
                      processedImage={finalImage.processed}
                      treatment={procedure}
                      recommendations={finalImage.recommendations}
                      intensity={intensity}
                      setIntensity={setIntensity}
                      onIntensityChange={(val) => {
                        setIntensity(val);
                        handleAnalyze({ image: finalImage.original, currentIntensity: val });
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={resetAll}
                  disabled={loading}
                  className={`px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${loading ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-100 text-gray-900 shadow-sm hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-600'}`}
                >
                  Start New Simulation
                </button>
              </div>
            </SectionWrapper>
          )}

          <div className="mt-32">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= SMALL COMPONENTS ================= */
function Step({ active, children }) {
  return (
    <div className="inline-block relative">
      <div
        className={`px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500 ${active
          ? "bg-accent-gradient text-white shadow-[0_15px_30px_-5px_rgba(168,85,247,0.4)] border border-white/20"
          : "bg-white/70 backdrop-blur-2xl border border-purple-100/50 text-gray-400 shadow-soft hover:text-purple-600 hover:border-purple-200"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${active ? 'border-white bg-white/20' : 'border-gray-200'}`}>
            {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, desc, onClick, isLocked }) {
  const isSurgical = title.toLowerCase().includes("surgical") && !title.toLowerCase().includes("non");
  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      perspective={1200}
      scale={1.02}
      transitionSpeed={400}
      glareEnable={false}
      className={`rounded-[3rem] border ${isLocked ? 'border-gray-200 bg-gray-50/80 grayscale-[40%] opacity-90' : 'border-purple-100 bg-white/70 backdrop-blur-2xl'} shadow-[0_20px_60px_-15px_rgba(168,85,247,0.15)] h-full cursor-pointer transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(168,85,247,0.35)] hover:border-purple-300 group relative overflow-hidden flex flex-col min-h-[450px]`}
      style={{ willChange: "transform" }}
    >
      {isLocked && (
        <div className="absolute top-8 right-8 w-14 h-14 bg-white/95 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center border border-gray-100 z-20 transition-transform group-hover:scale-110">
          <Lock className="w-6 h-6 text-gray-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-pink-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

      <div onClick={onClick} className="p-12 sm:p-16 flex-grow flex flex-col justify-center relative z-10 w-full">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${isSurgical ? "bg-gradient-to-br from-indigo-600 to-purple-500 text-white" : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"}`}>
          {isSurgical ? (
            <Scissors className="w-10 h-10 drop-shadow-md" />
          ) : (
            <Syringe className="w-10 h-10 drop-shadow-md" />
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-4xl sm:text-5xl font-black mb-5 text-gray-900 group-hover:bg-accent-gradient group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 tracking-tight">
            {title}
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-semibold max-w-[450px] group-hover:text-gray-700 transition-colors duration-300">
            {desc}
          </p>
        </div>

        {/* Animated Bottom Indicator */}
        <div className="mt-10 flex items-center gap-4 group-hover:gap-6 transition-all duration-500">
          <div className="w-16 h-1.5 bg-purple-100 rounded-full group-hover:bg-purple-500 group-hover:w-24 transition-all duration-500"></div>
          <span className="text-sm font-black uppercase tracking-widest text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-500">Explore Mode</span>
        </div>
      </div>

      {/* Animated Bottom Line */}
      <div className="absolute bottom-0 left-0 h-2 w-full bg-accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
    </Tilt>
  );
}

function SectionWrapper({ children, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-24 max-w-6xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple-600 mb-8"
      >
        <ArrowLeft size={18} /> Back
      </button>
      {children}
    </motion.div>
  );
}

