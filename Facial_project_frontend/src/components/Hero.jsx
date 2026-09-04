import { motion } from "framer-motion";
import { Sparkles, CloudUpload, ArrowRight, Lock, ShieldCheck, Activity } from "lucide-react";
import Tilt from "react-parallax-tilt";

export default function Hero({ onTrySimulation }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 min-h-[90vh] flex items-center">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-100/30 rounded-full blur-[150px] -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-100/30 rounded-full blur-[120px] -z-10" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Text Content */}
          <div className="flex-1 lg:max-w-[600px] relative z-20 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 font-bold text-sm mb-8 shadow-sm">
                <span className="uppercase tracking-widest text-xs">AI-Powered Facial Analysis</span>
                <Sparkles className="w-4 h-4" />
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#111827] leading-[1.1] tracking-tight mb-6">
                See Your Beauty
                <span className="block text-purple-600">Enhancements</span>
                Before Treatment
              </h1>

              <p className="text-[#4B5563] text-lg sm:text-xl leading-relaxed mb-10 max-w-[500px]">
                Upload your photo, choose a cosmetic procedure, and view realistic before-and-after results in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <button
                  onClick={onTrySimulation}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
                >
                  Start Skin Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>


              </div>

            </motion.div>
          </div>

          {/* RIGHT COLUMN: Image & Widgets */}
          <div className="flex-1 relative w-full mt-10 lg:mt-0">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative"
            >
              {/* Main Image */}
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-[4/5] shadow-2xl">
                 <img 
                    src="/hero-image.png" 
                    alt="AI Facial Analysis" 
                    className="w-full h-full object-cover object-center"
                 />
                 {/* Inner Gradient Overlay for text readability if needed */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Widget 1: Skin Health Score */}
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} className="absolute -top-6 -right-6 sm:-right-12 z-30">
                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white w-56">
                  <p className="text-sm font-bold text-gray-800 mb-4">Skin Health Score</p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-purple-500"
                            strokeDasharray="87, 100"
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                       </svg>
                       <span className="absolute text-lg font-black text-purple-600">87</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400">/100</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-semibold text-gray-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>

              {/* Floating Widget 2: Detected Concerns */}
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} className="absolute top-1/2 -right-4 sm:-right-10 transform -translate-y-1/2 z-30">
                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white w-56">
                  <p className="text-sm font-bold text-gray-800 mb-3">Detected Concerns</p>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-orange-400" /> Fine Lines
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-purple-400" /> Uneven Texture
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-red-400" /> Dark Spots
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" /> Redness
                    </li>
                  </ul>
                </div>
              </Tilt>

              {/* Floating Widget 3: Facial Symmetry */}
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} className="absolute -bottom-8 -right-2 sm:-right-8 z-30">
                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white w-56 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-bold text-gray-800 mb-1">Facial Symmetry</p>
                     <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black text-purple-600">92</span>
                       <span className="text-sm font-bold text-purple-400">%</span>
                     </div>
                     <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">High Symmetry</p>
                   </div>
                   <div className="w-10 h-10 text-purple-300">
                      <Activity className="w-full h-full" />
                   </div>
                </div>
              </Tilt>

            </motion.div>
          </div>

        </div>

        {/* BOTTOM INFO BAR */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 md:mt-32 w-full"
        >
           <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white shadow-lg">
              
              <div className="flex items-start gap-4 flex-1">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">AI-Powered Analysis</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">Advanced deep learning models for accurate facial analysis</p>
                 </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-gray-200" />

              <div className="flex items-start gap-4 flex-1">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Lock className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Privacy First</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">On-device processing ensures your data stays private</p>
                 </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-gray-200" />

              <div className="flex items-start gap-4 flex-1">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Clinically Inspired</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">Backed by dermatological knowledge and research</p>
                 </div>
              </div>

           </div>

           <div className="mt-8 flex justify-center pb-8">
              <button className="flex items-center gap-2 text-purple-500 text-sm font-bold hover:text-purple-700 transition-colors">
                <span className="w-4 h-6 border-2 border-current rounded-full flex justify-center pt-1">
                   <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                </span>
                Scroll Down to Explore
              </button>
           </div>
        </motion.div>

      </div>
    </section>
  );
}