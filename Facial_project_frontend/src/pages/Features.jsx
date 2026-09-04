import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { ScanFace, Stars, ShieldCheck, ArrowRight, Activity, CheckCircle2, Sparkles } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Smart Face Scanning",
      subtitle: "Precision Mapping",
      text: "Our proprietary neural network scans over 500 distinct facial landmarks in milliseconds. Trained on diverse, medical-grade datasets, it identifies precise anatomical structures to ensure simulations are morphologically accurate.",
      bullets: ["Millimeter accuracy", "Real-time processing", "Multi-ethnic dataset trained"],
      icon: <ScanFace size={24} className="text-purple-600" />,
      image: "/feature_landmark.png",
      reverse: false
    },
    {
      title: "Realistic Beauty Preview",
      subtitle: "Botox & Fillers",
      text: "Visualize aesthetic enhancements before they happen. Our simulation engine understands tissue density, muscle movement, and lighting, generating photorealistic projections of Botox, fillers, and surgical procedures.",
      bullets: ["Volume adjustments", "Wrinkle reduction", "Natural light rendering"],
      icon: <Stars size={24} className="text-pink-500" />,
      image: "/feature_botox.png",
      reverse: true
    },
    {
      title: "Clear & Natural Results",
      subtitle: "Photorealistic Output",
      text: "Our GAN-powered rendering engine upscales simulations to 4K resolution, capturing intricate skin textures, light reflections, and micro-expressions for unparalleled realism.",
      bullets: ["4K Resolution", "Texture refinement", "Real-time upscaling"],
      icon: <Sparkles size={24} className="text-blue-500" />,
      image: "/feature_render.png",
      reverse: false
    }
  ];

  return (
    <>
      <Navbar />

      <div className="pt-28 pb-32 min-h-screen relative overflow-hidden bg-gray-50/30">
        <div className="absolute w-96 h-96 bg-purple-200/40 rounded-full blur-[120px] top-10 left-10 animate-float-slow -z-10"></div>
        <div className="absolute w-80 h-80 bg-pink-200/40 rounded-full blur-[110px] bottom-10 right-10 animate-float-slow -z-10" style={{ animationDelay: '2s' }}></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24 px-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-white border border-purple-100 shadow-sm text-sm font-bold text-purple-600 uppercase tracking-widest">
            <Activity className="w-4 h-4" />
            Smart Beauty Technology
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-gray-900 tracking-tighter">
            Designed for <span className="bg-accent-gradient bg-clip-text text-transparent">Easy Cosmetic Preview</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
            Preview different facial enhancement options before making decisions.
          </p>
        </motion.div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 space-y-32">
          {features.map((feature, idx) => (
            <div key={idx} className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
              
              {/* IMAGE SIDE */}
              <motion.div 
                initial={{ opacity: 0, x: feature.reverse ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 w-full"
              >
                <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} perspective={2000} className="w-full">
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-square sm:aspect-[4/3] lg:aspect-square bg-white">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    {/* Decorative Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-6 right-6">
                       <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                {feature.icon}
                             </div>
                             <div>
                               <p className="text-sm font-black text-gray-900">{feature.subtitle}</p>
                               <div className="flex gap-1 mt-1">
                                 <div className="w-2 h-1 rounded-full bg-purple-500" />
                                 <div className="w-2 h-1 rounded-full bg-purple-400" />
                                 <div className="w-2 h-1 rounded-full bg-purple-300" />
                               </div>
                             </div>
                          </div>
                          <Activity className="text-purple-400 w-5 h-5 animate-pulse" />
                       </div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>

              {/* TEXT SIDE */}
              <motion.div 
                initial={{ opacity: 0, x: feature.reverse ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1"
              >
                <div className="inline-block px-4 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest mb-6">
                   {feature.subtitle}
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                  {feature.title}
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  {feature.text}
                </p>
                
                <ul className="space-y-4 mb-10">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center gap-3 text-purple-600 font-bold hover:text-purple-800 transition-colors group">
                  Explore Capabilities 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

            </div>
          ))}
        </div>
      </div>
    </>
  );
}