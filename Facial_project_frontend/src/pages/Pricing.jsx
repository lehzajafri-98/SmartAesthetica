import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Lock, Check, Sparkles, Crown, Building2, User, ArrowRight, Zap, Shield, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const unifiedFeatures = [
  { name: "Non-Surgical Simulations", desc: "Botox, fillers, lip enhancement" },
  { name: "Personal Dashboard History", desc: "Track all past simulations" },
  { name: "Surgical Face Simulations", desc: "Rhinoplasty, jawline, chin" },
  { name: "Download Medical PDF Reports", desc: "Professional AI reports" },
  { name: "Unlimited Patient Profiles", desc: "Multi-patient management" },
  { name: "Doctor & Staff Roles", desc: "Role-based clinic access" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "For Students & Individuals",
    desc: "Explore non-surgical simulations with basic AI analysis. Perfect for learning and personal use.",
    icon: <User size={22} />,
    color: "from-gray-500 to-gray-600",
    accentBg: "bg-gray-50",
    accentBorder: "border-gray-200",
    accentText: "text-gray-600",
    features: [true, true, false, false, false, false],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    tagline: "Most Popular",
    popular: true,
    desc: "Full surgical + non-surgical simulations with downloadable medical-grade PDF reports.",
    icon: <Crown size={22} />,
    color: "from-purple-500 to-fuchsia-500",
    accentBg: "bg-purple-50",
    accentBorder: "border-purple-200",
    accentText: "text-purple-600",
    features: [true, true, true, true, false, false],
  },
  {
    name: "Clinic",
    price: "$99",
    period: "/ month",
    tagline: "Enterprise",
    desc: "Full platform access with multi-user clinic management, doctor roles, and unlimited patient profiles.",
    icon: <Building2 size={22} />,
    color: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    accentText: "text-emerald-600",
    features: [true, true, true, true, true, true],
  },
];

export default function Pricing() {
  const { user, upgrade } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleAction = async (planName) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (planName === "Free") {
      if (user.plan === "Free") {
        alert("You are already on the Free plan!");
      } else {
        alert(`You are currently on a premium ${user.plan} plan which includes all Free features. No downgrade is necessary!`);
      }
      return;
    }

    if (user.plan === planName) {
      alert(`You are already subscribed to the ${planName} plan.`);
      return;
    }

    setLoadingPlan(planName);
    try {
      await upgrade(planName);
      alert(`Successfully upgraded to the ${planName} plan! Extra features are now unlocked.`);
    } catch (error) {
      alert(error.message || "Failed to upgrade plan.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="relative pt-36 pb-28 min-h-screen">


      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-purple-200 backdrop-blur-md mb-6 shadow-sm">
            <Sparkles size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-purple-600 tracking-widest uppercase">Pricing Plans</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-[#6C47FF] via-fuchsia-500 to-pink-500 text-transparent bg-clip-text">
              Plan
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            From personal use to full clinic deployment — unlock the power of AI-driven surgical simulation.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {plans.map((plan, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)}>
              <Tilt
                tiltMaxAngleX={3}
                tiltMaxAngleY={3}
                perspective={1000}
                scale={1.01}
                transitionSpeed={400}
                glareEnable={false}
              >
                <div className={`relative h-full rounded-[2rem] p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-purple-100 transition-all duration-500 group overflow-hidden flex flex-col shadow-[0_8px_30px_-10px_rgba(168,85,247,0.08)] hover:border-purple-300 hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.2)]`}
                  style={{ willChange: "transform" }}
                >
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400/20 rounded-tl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/20 rounded-br-xl" />

                  {/* Hover BG */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-b-xl bg-gradient-to-r from-[#6C47FF] to-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg z-20">
                      ★ Most Popular
                    </div>
                  )}

                  {/* Plan Icon + Name */}
                  <div className="flex items-center gap-3 mb-4 relative z-10 mt-2">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${plan.accentText}`}>{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4 relative z-10">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900 group-hover:scale-105 transition-transform inline-block origin-left">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-sm font-semibold ml-1">{plan.period}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 relative z-10 min-h-[40px]">
                    {plan.desc}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent mb-6 relative z-10" />

                  {/* Features */}
                  <ul className="space-y-3 mb-8 relative z-10 flex-grow">
                    {unifiedFeatures.map((feat, idx) => {
                      const isIncluded = plan.features[idx];
                      return (
                        <li key={idx} className={`flex items-start gap-3 text-sm font-medium transition-colors duration-300 ${isIncluded ? "text-gray-700 group-hover:text-gray-800" : "text-gray-300"}`}>
                          {isIncluded ? (
                            <div className={`w-5 h-5 rounded-full ${plan.accentBg} ${plan.accentBorder} border flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                              <Check size={12} className={plan.accentText} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lock size={10} className="text-gray-300" />
                            </div>
                          )}
                          <div>
                            <span className="block">{feat.name}</span>
                            {isIncluded && (
                              <span className="text-[11px] text-gray-400 font-normal">{feat.desc}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleAction(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 flex items-center justify-center gap-2 group/btn disabled:opacity-60 disabled:hover:translate-y-0 bg-white border border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-[#6C47FF] hover:to-fuchsia-500 hover:text-white hover:border-transparent hover:shadow-[0_8px_25px_-5px_rgba(108,71,255,0.4)] hover:-translate-y-0.5"
                  >
                    {loadingPlan === plan.name ? "Processing..." : (user?.plan === plan.name ? "Current Plan" : "Get Started")}
                    {loadingPlan !== plan.name && user?.plan !== plan.name && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                  </button>

                  {/* Animated bottom line */}
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${plan.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left`} />
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>

        {/* Trust Bar */}
        <motion.div {...fadeUp(0.3)} className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white/60 border border-purple-100 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Shield size={18} className="text-purple-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">HIPAA Compliant</p>
                <p className="text-xs text-gray-400">Medical-grade data protection</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Zap size={18} className="text-purple-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">Instant Results</p>
                <p className="text-xs text-gray-400">AI simulation in under 2 seconds</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Star size={18} className="text-purple-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">Cancel Anytime</p>
                <p className="text-xs text-gray-400">No long-term commitments</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
