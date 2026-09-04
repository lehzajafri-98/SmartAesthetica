import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  Camera, ScanFace, Wand2, Sparkles, ArrowRight, Brain,
  Layers, Cpu, Activity, Eye,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const GlowOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
);

const CornerAccent = () => (
  <>
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400/30 rounded-tl-xl" />
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/30 rounded-br-xl" />
  </>
);

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Upload Your Photo",
      subtitle: "Image Acquisition Module",
      text: "Add a clear front-face image to begin your analysis.",
      icon: <Camera size={26} />,
      color: "from-violet-500 to-purple-600",
      bgTint: "from-violet-50 to-purple-50",
      glow: "shadow-[0_8px_30px_rgba(139,92,246,0.12)]",
      specs: ["JPEG/PNG up to 20MB", "Auto-orientation correction", "EXIF metadata analysis"],
      image: "/hiw_capture.png"
    },
    {
      num: "02",
      title: "Face Analysis",
      subtitle: "468-Point Facial Mesh Engine",
      text: "Our system detects facial areas like skin, lips, nose, and cheeks.",
      icon: <ScanFace size={26} />,
      color: "from-blue-500 to-cyan-500",
      bgTint: "from-blue-50 to-cyan-50",
      glow: "shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
      specs: ["99.2% landmark accuracy", "468+ 3D coordinates", "Sub-pixel precision"],
      image: "/feature_landmark.png"
    },
    {
      num: "03",
      title: "Choose a Procedure",
      subtitle: "U-Net Segmentation + Neural Enhancement",
      text: "Select the cosmetic enhancement you want to preview.",
      icon: <Brain size={26} />,
      color: "from-fuchsia-500 to-pink-500",
      bgTint: "from-fuchsia-50 to-pink-50",
      glow: "shadow-[0_8px_30px_rgba(217,70,239,0.12)]",
      specs: ["94.71% IoU accuracy", "Single-pass ~50ms", "Residual learning architecture"],
      image: "/feature_botox.png"
    },
    {
      num: "04",
      title: "View Your Results",
      subtitle: "Real-Time Preview Engine",
      text: "See realistic before-and-after previews instantly.",
      icon: <Wand2 size={26} />,
      color: "from-orange-500 to-amber-500",
      bgTint: "from-orange-50 to-amber-50",
      glow: "shadow-[0_8px_30px_rgba(249,115,22,0.12)]",
      specs: ["Instant preview", "Photorealistic output", "Adjustable intensity"],
      image: "/hiw_export.png"
    },
    {
      num: "05",
      title: "Compare & Save",
      subtitle: "Clinical-Grade Output Pipeline",
      text: "Compare your original and edited image and save the result.",
      icon: <Sparkles size={26} />,
      color: "from-emerald-500 to-teal-500",
      bgTint: "from-emerald-50 to-teal-50",
      glow: "shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
      specs: ["HD JPEG export", "Medical PDF reports", "Side-by-side comparison"],
      image: "/hiw_export.png"
    },
  ];

  const pipeline = [
    { icon: <Camera size={18} />, label: "Input", detail: "Image Upload" },
    { icon: <Eye size={18} />, label: "Detection", detail: "MediaPipe Pro" },
    { icon: <Layers size={18} />, label: "Segmentation", detail: "U-Net CNN" },
    { icon: <Wand2 size={18} />, label: "Simulation", detail: "Neural Warp" },
    { icon: <Cpu size={18} />, label: "Enhancement", detail: "Enhancement Net" },
    { icon: <Sparkles size={18} />, label: "Output", detail: "HD Result" },
  ];



  return (
    <div className="pt-24 min-h-screen relative overflow-hidden">
      {/* Background Effects */}


      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* === HERO SECTION === */}
      <div className="relative z-10 text-center px-4 sm:px-6 pb-16">
        <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
          How{" "}
          <span className="bg-gradient-to-r from-[#6C47FF] via-fuchsia-500 to-pink-500 text-transparent bg-clip-text">
            It Works
          </span>
        </motion.h1>
        <motion.p {...fadeUp(0.2)} className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Just upload your photo and preview cosmetic enhancements in a few easy steps.
        </motion.p>
      </div>

      {/* === STEPS BOXES === */}
      <motion.div {...fadeUp(0.3)} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { emoji: "📷", label: "Upload Photo", num: "1" },
            { emoji: "😊", label: "Face Scan", num: "2" },
            { emoji: "✨", label: "Choose Procedure", num: "3" },
            { emoji: "🪞", label: "Preview Result", num: "4" },
            { emoji: "💾", label: "Save & Compare", num: "5" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl bg-white/70 border border-purple-100 backdrop-blur-xl hover:border-purple-300 hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)] transition-all duration-300 group cursor-default text-center">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">Step {item.num}</span>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* === STEP CARDS WITH TIMELINE === */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Vertical Glowing Timeline */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-[3px] h-full">
          <div className="w-full h-full bg-gradient-to-b from-purple-400/60 via-fuchsia-400/40 to-transparent rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[8px] h-full bg-gradient-to-b from-purple-300/20 via-fuchsia-300/10 to-transparent blur-sm rounded-full" />
        </div>

        <div className="space-y-16 lg:space-y-24 relative z-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className={`flex flex-col lg:items-center gap-6 lg:gap-12 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
            >
              {/* Step Card */}
              <Tilt
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                perspective={1400}
                scale={1.02}
                transitionSpeed={400}
                glareEnable={true}
                glareMaxOpacity={0.15}
                glareColor="white"
                glarePosition="all"
                className="w-full lg:w-[48%]"
              >
                <div className={`relative p-6 sm:p-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-purple-100 hover:border-purple-300 transition-all duration-500 group overflow-hidden ${step.glow} hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)]`}>
                  <CornerAccent />

                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.bgTint} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                  {/* Step Number Badge */}
                  <div className="flex items-center gap-4 mb-5 relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {step.icon}
                    </div>
                    <div>
                      <span className={`text-3xl font-black bg-gradient-to-r ${step.color} text-transparent bg-clip-text`}>
                        {step.num}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{step.subtitle}</p>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 relative z-10 tracking-tight group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 relative z-10 group-hover:text-gray-600 transition-colors">
                    {step.text}
                  </p>

                  {/* Tech Specs Pills */}
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {step.specs.map((spec, j) => (
                      <span key={j} className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[11px] font-semibold text-gray-500 group-hover:text-purple-600 group-hover:border-purple-200 group-hover:bg-purple-50/80 transition-all duration-300">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Animated bottom line */}
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${step.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left`} />
                </div>
              </Tilt>

              {/* Timeline Node */}
              <div className="hidden lg:flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${step.color} shadow-lg ring-4 ring-[#faf7ff] ring-offset-0`}>
                  <div className="w-full h-full rounded-full animate-ping opacity-20 bg-purple-400" />
                </div>
              </div>

              {/* Spacer for alternating layout -> Now Image */}
              <div className="hidden lg:block w-[48%] relative">
                 <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                   <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500 bg-gray-100">
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-gradient-to-tr ${step.color} opacity-10 pointer-events-none mix-blend-overlay`} />
                   </div>
                 </Tilt>
              </div>
            </motion.div>
          ))}
        </div>
      </div>



      {/* === CTA === */}
      <motion.div {...fadeUp(0.3)} className="relative z-10 text-center pb-24 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#6C47FF] to-fuchsia-500 text-white text-base sm:text-lg font-bold shadow-[0_8px_30px_rgba(108,71,255,0.3)] hover:shadow-[0_12px_40px_rgba(108,71,255,0.45)] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
        >
          Start Simulation <ArrowRight size={20} />
        </Link>
        <p className="text-gray-400 text-sm mt-4">No signup required for basic analysis</p>
      </motion.div>
    </div>
  );
}