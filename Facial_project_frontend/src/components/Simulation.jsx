import { useEffect, useState, useRef } from "react";
import Tilt from "react-parallax-tilt";
import { jsPDF } from "jspdf";
import { FileText, Download, Lock, Microscope, Activity, ShieldCheck, Sparkles, SlidersHorizontal, Maximize2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Simulation({ image, processedImage, treatment, recommendations, intensity, onIntensityChange }) {
  const { user } = useAuth();
  const isFreePlan = user?.plan === "Free";
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [localIntensity, setLocalIntensity] = useState(intensity ?? 50);
  const debounceRef = useRef(null);

  const downloadPDFReport = async () => {
    if (!processedImage || !image || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    
    try {
      // Create the request payload
      const reportData = {
        before_image: image,
        after_image: processedImage,
        recommendations: recommendations || [],
        patient_name: user?.name || "Valued Patient"
      };

      const response = await fetch("http://localhost:8000/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const safeName = treatment ? treatment.toLowerCase().replace(/\s+/g, "-") : "simulation";
      link.download = `SmartAesthetica-${safeName}-Report.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report Download Error:", error);
      alert("Failed to generate clinical report. Please try again later.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadResult = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `SmartAesthetica-${treatment || "Result"}.jpg`;
    link.click();
  };

  return (
    <section className="max-w-6xl mx-auto mt-20 px-6 pb-20">
      <Tilt tiltMaxAngleX={2} tiltMaxAngleY={2} perspective={2000} className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-10 md:p-14 rounded-[4rem] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_40px_120px_-20px_rgba(168,85,247,0.25)] overflow-hidden"
        >
          {/* Ambient Corner Accents */}
          <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-purple-100 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-purple-100 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-purple-100 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-purple-100 rounded-br-3xl pointer-events-none" />

          {/* Diagnostic Badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm animate-pulse-slow">
              <Microscope className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Advanced Diagnostic Preview</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 tracking-tighter text-gray-900 leading-none">
            {treatment ? <span>{treatment} <span className="text-purple-500 italic">Analysis</span></span> : "Simulation Preview"}
          </h2>

          <div className="relative group">
            {/* Legend Labels */}
            <div className="absolute -top-6 left-12 z-30">
              <span className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">Pre-Treatment</span>
            </div>
            <div className="absolute -top-6 right-12 z-30">
              <span className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">AI-Simulated Post</span>
            </div>

            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] flex bg-gray-900 border-4 border-white">
              {/* Before View */}
              <div className="w-1/2 h-full overflow-hidden relative">
                {image && (
                  <img src={image} alt="before" className="w-full h-full object-cover grayscale-[0.2]" />
                )}
                {/* Internal Before Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* After View */}
              <div className="w-1/2 h-full overflow-hidden relative">
                {processedImage && (
                  <img src={processedImage} alt="after" className="w-full h-full object-cover shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
              </div>

              {/* Center Glowing Divider */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute left-1/2 top-0 h-full w-[4px] bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent shadow-[0_0_25px_rgba(192,38,211,0.9)] z-20"
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 z-30 flex items-center justify-center text-white shadow-2xl">
                <Activity size={18} className="animate-pulse" />
              </div>
            </div>
          </div>

          {/* Enhancement Controls */}
          <div className="max-w-2xl mx-auto mt-20 p-8 rounded-[2.5rem] bg-white border border-purple-50 shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Simulation Density</label>
                  <span className="text-sm font-black text-gray-900 uppercase">Treatment Intensity</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-purple-600">{localIntensity}%</span>
                <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest">{localIntensity < 30 ? 'Subtle' : localIntensity < 60 ? 'Natural' : localIntensity < 85 ? 'Enhanced' : 'Maximum'}</span>
              </div>
            </div>

            <div className="relative h-12 flex items-center">
              <div className="absolute w-full h-2 bg-gray-100 rounded-full" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${localIntensity}%` }}
                className="absolute h-2 bg-accent-gradient rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={localIntensity}
                onMouseUp={(e) => { const val = Number(e.target.value); setLocalIntensity(val); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => onIntensityChange(val), 600); }}
                onChange={(e) => { const val = Number(e.target.value); setLocalIntensity(val); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => onIntensityChange(val), 600); }}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              {/* Custom Thumb */}
              <motion.div
                animate={{ left: `${localIntensity}%` }}
                className="absolute w-6 h-6 bg-white border-4 border-purple-600 rounded-full shadow-xl pointer-events-none -ml-3 z-20 flex items-center justify-center"
              >
                <div className="w-1 h-1 bg-purple-600 rounded-full animate-ping" />
              </motion.div>
            </div>

            <div className="flex justify-between mt-4">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Minimal</span>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Maximal</span>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
            <button
              onClick={downloadResult}
              className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-black uppercase tracking-widest text-xs shadow-sm shadow-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-600 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              Save Digital Preview
            </button>

            <button
              onClick={isFreePlan ? () => alert("Downloading Medical PDF Reports is a premium feature! Please upgrade to the Pro plan on the Pricing page to unlock it.") : downloadPDFReport}
              disabled={isGeneratingPDF}
              className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all duration-300 hover:scale-[1.02] ${isFreePlan ? 'bg-gray-100 text-gray-400 border border-gray-100' : 'bg-gray-900 text-white hover:shadow-gray-900/20'} ${isGeneratingPDF ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isFreePlan ? <Lock className="w-5 h-5" /> : (isGeneratingPDF ? <Activity className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 animate-bounce-slow" />)}
              {isGeneratingPDF ? "Generating..." : "Generate Clinical Report"}
            </button>
          </div>

          <div className="mt-12 flex justify-center items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Encrypted Cloud Analysis Active</span>
          </div>
        </motion.div>
      </Tilt>
    </section>
  );
}